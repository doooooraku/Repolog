import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { Image as ExpoImage } from 'expo-image';

import * as LegacyFileSystem from 'expo-file-system/legacy';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslation } from '@/src/core/i18n/i18n';
import { getReportById } from '@/src/db/reportRepository';
import { listPhotosByReport } from '@/src/db/photoRepository';
import { recordExport, countExportsSince, countAllExports } from '@/src/db/exportRepository';
import { useProStore } from '@/src/stores/proStore';
import {
  exportPdfFile,
  generatePdfFile,
  PdfStorageLowError,
} from '@/src/features/pdf/pdfService';
import { maybeRequestReview } from '@/src/services/reviewPromptService';
import { buildPdfHtml } from '@/src/features/pdf/pdfTemplate';
import {
  buildPdfExportFileName,
  calculatePageCount,
  type PdfLayout,
  type PaperSize,
} from '@/src/features/pdf/pdfUtils';

import type { Photo, Report } from '@/src/types/models';

const PHOTO_WARNING_THRESHOLD = 50;
const FREE_MONTHLY_EXPORT_LIMIT = 5;
const TOUCH_HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 } as const;
const ICON_STROKE_WIDTH = 1.85;
const PREVIEW_ZOOM_SCRIPT = `
  (function() {
    function applyFit() {
      var page = document.querySelector('.page');
      if (!page) return;
      document.body.style.zoom = '1';
      document.body.style.margin = '0';
      document.body.style.padding = '8px 0 16px';
      var pageWidth = page.getBoundingClientRect().width;
      var viewportWidth = document.documentElement.clientWidth;
      if (!pageWidth || !viewportWidth) return;
      var availableWidth = Math.max(220, viewportWidth - 16);
      var scale = Math.min(1, availableWidth / pageWidth);
      document.body.style.zoom = String(scale);
    }
    window.addEventListener('load', applyFit);
    window.addEventListener('resize', applyFit);
    setTimeout(applyFit, 0);
    setTimeout(applyFit, 120);
  })();
  true;
`;

export default function PdfPreviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const reportId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t, lang } = useTranslation();
  const [layout, setLayout] = useState<PdfLayout>('standard');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const isPro = useProStore((s) => s.isPro);
  const initPro = useProStore((s) => s.init);
  const [exporting, setExporting] = useState(false);
  // 0–100 の単一プログレスバー。null = 非表示。
  // 0–80% は写真処理ループの実進捗、80–95% は印刷フェーズの擬似進捗、
  // 100% は exportPdfFile 完了時にスナップする。
  // 詳細: docs/adr/ADR-0013-pdf-export-resilience-and-progress.md
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  // Cache report + photos so we don't re-fetch for export
  const reportRef = useRef<Report | null>(null);
  const photosRef = useRef<Photo[]>([]);

  const labelMap = useMemo(
    () => ({
      createdAt: t.pdfCreatedAt,
      reportName: t.pdfReportName,
      author: t.pdfAuthor,
      address: t.pdfAddress,
      location: t.pdfLocation,
      weather: t.pdfWeather,
      photoCount: t.pdfPhotoCount,
      pageCount: t.pdfPageCount,
      photos: t.pdfPhotos,
      pages: t.pdfPages,
      comment: t.pdfComment,
    }),
    [t],
  );

  const weatherLabelMap = useMemo(
    () => ({
      sunny: t.weatherSunny,
      cloudy: t.weatherCloudy,
      rainy: t.weatherRainy,
      snowy: t.weatherSnowy,
      none: t.weatherNone,
    }),
    [t],
  );

  // Build lightweight HTML preview (small thumbnails, no font embedding)
  const loadPreview = useCallback(async () => {
    if (!reportId) return;
    setPreviewLoading(true);
    try {
      const report = await getReportById(reportId);
      if (!report) {
        Alert.alert(t.errorLoadFailed);
        setPreviewLoading(false);
        return;
      }
      const photos = await listPhotosByReport(reportId);
      reportRef.current = report;
      photosRef.current = photos;

      const html = await buildPdfHtml({
        report,
        photos,
        layout,
        paperSize,
        isPro,
        localeHint: lang,
        appName: 'Repolog',
        weatherLabel: weatherLabelMap[report.weather],
        labels: labelMap,
        preview: true,
      });
      setPreviewHtml(html);
    } catch (e) {
      console.error('[PDF] Preview build failed:', e);
      Alert.alert(t.pdfExportFailed);
    } finally {
      setPreviewLoading(false);
    }
  }, [reportId, layout, paperSize, isPro, lang, labelMap, weatherLabelMap, t.errorLoadFailed, t.pdfExportFailed]);

  useEffect(() => {
    void initPro();
  }, [initPro]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const confirmPhotoWarning = () =>
    new Promise<boolean>((resolve) => {
      Alert.alert(
        t.pdfPhotoWarningTitle,
        t.pdfPhotoWarningBody.replace('{count}', String(PHOTO_WARNING_THRESHOLD)),
        [
          { text: t.pdfPhotoWarningCancel, style: 'cancel', onPress: () => resolve(false) },
          { text: t.pdfPhotoWarningContinue, onPress: () => resolve(true) },
        ],
      );
    });

  // Generate PDF on-demand and export immediately
  const handleExport = async () => {
    if (!reportId) return;
    if (exporting) return;
    setExporting(true);
    setExportProgress(0);
    // 印刷フェーズ用の擬似進捗タイマー。80% → 95% を滑らかに進める。
    // 写真数に比例して間隔を長くすることで「写真が多いほど印刷が長引く」体感に合わせる。
    let printPhaseTimer: ReturnType<typeof setInterval> | undefined;
    const stopPrintPhaseTimer = () => {
      if (printPhaseTimer) {
        clearInterval(printPhaseTimer);
        printPhaseTimer = undefined;
      }
    };

    try {
      const report = reportRef.current ?? await getReportById(reportId);
      if (!report) {
        Alert.alert(t.errorLoadFailed);
        return;
      }
      const photos = photosRef.current.length > 0
        ? photosRef.current
        : await listPhotosByReport(reportId);

      if (!isPro) {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const count = await countExportsSince(monthStart.toISOString());
        if (count >= FREE_MONTHLY_EXPORT_LIMIT) {
          Alert.alert(t.pdfExportLimitTitle, t.pdfExportLimitBody, [
            { text: t.cancel, style: 'cancel' },
            { text: t.openPro, onPress: () => router.push('/pro') },
          ]);
          return;
        }
      }

      if (photos.length > PHOTO_WARNING_THRESHOLD) {
        const proceed = await confirmPhotoWarning();
        if (!proceed) return;
      }

      // メモリを徹底的に空ける:
      // (1) プレビュー WebView の参照を null にして React に unmount を予約
      // (2) expo-image のメモリキャッシュを解放（編集画面が抱えていた写真ビットマップ）
      // (3) 350ms 待って native の compositor surface 解放を待つ
      // 100ms では Android WebView の解放に間に合わないことがあった。
      // 詳細: docs/adr/ADR-0013-pdf-export-resilience-and-progress.md
      setPreviewHtml(null);
      await ExpoImage.clearMemoryCache().catch(() => undefined);
      await new Promise((r) => setTimeout(r, 350));

      // Generate full-resolution PDF (on-demand, not during preview)
      const photoCount = photos.length;
      const uri = await generatePdfFile(
        {
          report,
          photos,
          layout,
          paperSize,
          isPro,
          localeHint: lang,
          appName: 'Repolog',
          weatherLabel: weatherLabelMap[report.weather],
          labels: labelMap,
        },
        (processed, total) => {
          // 写真処理フェーズ: 0% → 80%
          const denom = Math.max(total, 1);
          const ratio = Math.min(1, processed / denom);
          setExportProgress(Math.round(ratio * 80));
        },
      );

      // 写真処理が終わったら 80% で固定し、印刷フェーズの擬似進捗タイマーを起動する。
      setExportProgress(80);
      const tickIntervalMs = Math.max(200, photoCount * 5);
      printPhaseTimer = setInterval(() => {
        setExportProgress((prev) => {
          if (prev == null || prev >= 95) return prev;
          return prev + 1;
        });
      }, tickIntervalMs);

      const fileName = buildPdfExportFileName({
        createdAt: report.createdAt,
        reportName: report.reportName,
        appName: 'Repolog',
      });
      const success = await exportPdfFile(uri, fileName);

      stopPrintPhaseTimer();
      setExportProgress(100);

      // Cleanup generated PDF file
      LegacyFileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});

      if (!success) {
        Alert.alert(t.pdfExportFailed);
        return;
      }

      const pageCount = calculatePageCount(report.comment ?? '', photos.length, layout);
      await recordExport({
        reportId,
        exportedAt: new Date().toISOString(),
        layoutMode: layout,
        pageCount,
        photoCount: photos.length,
        paperSize,
        planAtExport: isPro ? 'pro' : 'free',
      });

      // PDF 出力成功というハッピーモーメントでアプリ内レビュー依頼を試みる（fire-and-forget、ADR-0012）
      const cumulativeCount = await countAllExports();
      void maybeRequestReview({ isPro, cumulativeCount });

      // 出力成功後はナビゲーションスタックを丸ごとリセットしてホーム画面に戻る。
      // 編集画面 + プレビュー画面の両方を unmount することで、次回の出力時に
      // メモリが確実にクリーンな状態から始まる（70 枚 hang シナリオの恒久対策）。
      // 詳細: docs/adr/ADR-0013-pdf-export-resilience-and-progress.md
      try {
        router.dismissAll();
      } catch {
        router.replace('/(tabs)');
      }

    } catch (e) {
      stopPrintPhaseTimer();
      if (e instanceof PdfStorageLowError) {
        Alert.alert(t.pdfStorageLowTitle, t.pdfStorageLowBody);
      } else {
        console.error('[PDF] Export failed:', e);
        Alert.alert(t.pdfExportFailed);
      }
    } finally {
      stopPrintPhaseTimer();
      setExporting(false);
      setExportProgress(null);
      // 出力後のプレビュー自動再生成は廃止。
      // 連続出力時にメモリが累積して 3 回目に hang する原因になっていた。
      // ホーム遷移するため、ここで再描画する必要もない。
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.screenBgAlt }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderDefault, backgroundColor: colors.surfaceBg }]}>
        <View style={styles.headerLeft}>
          <Pressable testID="e2e_pdf_back" accessibilityLabel={t.a11yGoBack} accessibilityRole="button" onPress={() => router.back()} style={styles.backButton} hitSlop={TOUCH_HIT_SLOP}>
            <ArrowLeft size={18} color={colors.textPrimary} strokeWidth={ICON_STROKE_WIDTH} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{t.pdfPreviewTitle}</Text>
        </View>
      </View>
      <View testID="e2e_pdf_preview_screen" style={styles.container}>
        <View style={styles.row}>
          <Pressable
            onPress={() => setLayout('standard')}
            style={[styles.tab, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }, layout === 'standard' && { borderColor: colors.tabActive, backgroundColor: colors.surfaceHighlight }]}>
            <Text style={{ color: colors.textPrimary }}>{t.pdfLayoutStandard}</Text>
          </Pressable>
          <Pressable
            onPress={() => setLayout('large')}
            style={[styles.tab, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }, layout === 'large' && { borderColor: colors.tabActive, backgroundColor: colors.surfaceHighlight }]}>
            <Text style={{ color: colors.textPrimary }}>{t.pdfLayoutComment}</Text>
          </Pressable>
        </View>
        <View style={styles.row}>
          <Pressable
            onPress={() => setPaperSize('A4')}
            style={[styles.tab, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }, paperSize === 'A4' && { borderColor: colors.tabActive, backgroundColor: colors.surfaceHighlight }]}>
            <Text style={{ color: colors.textPrimary }}>{t.pdfPaperA4}</Text>
          </Pressable>
          <Pressable
            onPress={() => setPaperSize('Letter')}
            style={[styles.tab, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }, paperSize === 'Letter' && { borderColor: colors.tabActive, backgroundColor: colors.surfaceHighlight }]}>
            <Text style={{ color: colors.textPrimary }}>{t.pdfPaperLetter}</Text>
          </Pressable>
        </View>
        {previewLoading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={[styles.subtle, { color: colors.textMuted }]}>{t.pdfGenerating}</Text>
          </View>
        ) : previewHtml ? (
          <View style={[styles.previewFrame, { backgroundColor: colors.surfaceBg }]}>
            <WebView
              originWhitelist={['*']}
              source={{ html: previewHtml }}
              style={styles.previewWebView}
              injectedJavaScriptBeforeContentLoaded={PREVIEW_ZOOM_SCRIPT}
              injectedJavaScript={PREVIEW_ZOOM_SCRIPT}
              scalesPageToFit={false}
              setBuiltInZoomControls
              setDisplayZoomControls={false}
              nestedScrollEnabled
              textZoom={100}
              showsVerticalScrollIndicator
            />
          </View>
        ) : null}
        <Pressable testID="e2e_pdf_export" style={[styles.exportButton, { backgroundColor: colors.primaryBg }]} onPress={handleExport} disabled={exporting}>
          {exporting && exportProgress != null ? (
            <View style={styles.progressContent}>
              <Text style={[styles.progressText, { color: colors.primaryText }]} numberOfLines={1}>
                {t.pdfGeneratingProgress.replace('{percent}', String(exportProgress))}
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${exportProgress}%`, backgroundColor: colors.primaryText },
                  ]}
                />
              </View>
            </View>
          ) : exporting ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.exportText, { color: colors.primaryText }]}>{t.pdfExport}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  header: {
    height: 60,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  previewFrame: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  exportButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  exportText: {
    fontWeight: '600',
  },
  progressContent: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontWeight: '700',
    fontSize: 14,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  subtle: {
    fontSize: 12,
  },
});
