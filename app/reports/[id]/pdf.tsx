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
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from '@tamagui/lucide-icons';

import * as LegacyFileSystem from 'expo-file-system/legacy';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslation } from '@/src/core/i18n/i18n';
import { getReportById } from '@/src/db/reportRepository';
import { listPhotosByReport } from '@/src/db/photoRepository';
import { recordExport, countExportsSince } from '@/src/db/exportRepository';
import { useProStore } from '@/src/stores/proStore';
import { exportPdfFile, generatePdfFile } from '@/src/features/pdf/pdfService';
import {
  buildPdfExportFileName,
  calculatePageCount,
  type PdfLayout,
  type PaperSize,
} from '@/src/features/pdf/pdfUtils';

const PHOTO_WARNING_THRESHOLD = 50;
const FREE_MONTHLY_EXPORT_LIMIT = 5;
const TOUCH_HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 } as const;
const ICON_STROKE_WIDTH = 1.85;

export default function PdfPreviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const reportId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t, lang } = useTranslation();
  const [layout, setLayout] = useState<PdfLayout>('standard');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [loading, setLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const prevPdfUriRef = useRef<string | null>(null);
  const isPro = useProStore((s) => s.isPro);
  const initPro = useProStore((s) => s.init);
  const [exporting, setExporting] = useState(false);

  const labelMap = useMemo(
    () => ({
      createdAt: t.pdfCreatedAt,
      reportName: t.pdfReportName,
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

  const loadPdf = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    const oldUri = prevPdfUriRef.current;
    setPdfUri(null);
    if (oldUri) {
      LegacyFileSystem.deleteAsync(oldUri, { idempotent: true }).catch(() => {});
    }
    try {
      const report = await getReportById(reportId);
      if (!report) {
        Alert.alert(t.errorLoadFailed);
        setLoading(false);
        return;
      }
      const photos = await listPhotosByReport(reportId);
      const uri = await generatePdfFile({
        report,
        photos,
        layout,
        paperSize,
        isPro,
        localeHint: lang,
        appName: 'Repolog',
        weatherLabel: weatherLabelMap[report.weather],
        labels: labelMap,
      });
      setPdfUri(uri);
      prevPdfUriRef.current = uri;
    } catch (e) {
      console.error('[PDF] Generation failed:', e);
      Alert.alert(t.pdfExportFailed);
    } finally {
      setLoading(false);
    }
  }, [reportId, layout, paperSize, isPro, lang, labelMap, weatherLabelMap, t.errorLoadFailed, t.pdfExportFailed]);

  useEffect(() => {
    void initPro();
  }, [initPro]);

  useEffect(() => {
    void loadPdf();
  }, [loadPdf]);

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

  const confirmLargeLayout = () =>
    new Promise<boolean>((resolve) => {
      Alert.alert(
        t.pdfLargeProTitle,
        t.pdfLargeProBody,
        [
          {
            text: t.pdfLargeUseStandard,
            onPress: () => {
              setLayout('standard');
              resolve(false);
            },
          },
          {
            text: t.pdfLargeUpgrade,
            style: 'cancel',
            onPress: () => {
              router.push('/pro');
              resolve(false);
            },
          },
        ],
      );
    });

  const handleExport = async () => {
    if (!reportId || !pdfUri) return;
    if (exporting) return;
    setExporting(true);
    try {
      const report = await getReportById(reportId);
      if (!report) {
        Alert.alert(t.errorLoadFailed);
        return;
      }
      const photos = await listPhotosByReport(reportId);

      if (!isPro && layout === 'large') {
        await confirmLargeLayout();
        return;
      }

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

      const fileName = buildPdfExportFileName({
        createdAt: report.createdAt,
        reportName: report.reportName,
        appName: 'Repolog',
      });
      const success = await exportPdfFile(pdfUri, fileName);
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

    } catch (e) {
      console.error('[PDF] Export failed:', e);
      Alert.alert(t.pdfExportFailed);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
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
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={[styles.subtle, { color: colors.textMuted }]}>{t.pdfGenerating}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={{ color: colors.textPrimary }}>{t.pdfLayoutLarge}</Text>
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
        {pdfUri && (
          <Pdf
            key={pdfUri}
            source={{ uri: pdfUri }}
            style={[styles.pdf, { backgroundColor: colors.surfaceBg }]}
            trustAllCerts={false}
          />
        )}
        <Pressable testID="e2e_pdf_export" style={[styles.exportButton, { backgroundColor: colors.primaryBg }]} onPress={handleExport} disabled={exporting}>
          {exporting ? (
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
  pdf: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exportButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportText: {
    fontWeight: '600',
  },
  subtle: {
    fontSize: 12,
  },
});
