import { useCallback, useEffect, useMemo, useState } from 'react';
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

export default function PdfPreviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const reportId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [layout, setLayout] = useState<PdfLayout>('standard');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [loading, setLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
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
    setLoading(false);
  }, [reportId, layout, paperSize, isPro, lang, labelMap, weatherLabelMap, t.errorLoadFailed]);

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

    } catch {
      Alert.alert(t.pdfExportFailed);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.subtle}>{t.pdfGenerating}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.pdfPreviewTitle}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => setLayout('standard')}
          style={[styles.tab, layout === 'standard' && styles.tabActive]}>
          <Text>{t.pdfLayoutStandard}</Text>
        </Pressable>
        <Pressable
          onPress={() => setLayout('large')}
          style={[styles.tab, layout === 'large' && styles.tabActive]}>
          <Text>{t.pdfLayoutLarge}</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable
          onPress={() => setPaperSize('A4')}
          style={[styles.tab, paperSize === 'A4' && styles.tabActive]}>
          <Text>{t.pdfPaperA4}</Text>
        </Pressable>
        <Pressable
          onPress={() => setPaperSize('Letter')}
          style={[styles.tab, paperSize === 'Letter' && styles.tabActive]}>
          <Text>{t.pdfPaperLetter}</Text>
        </Pressable>
      </View>
      {pdfUri && (
        <Pdf
          source={{ uri: pdfUri }}
          style={styles.pdf}
          trustAllCerts={false}
        />
      )}
      <Pressable style={styles.exportButton} onPress={handleExport} disabled={exporting}>
        {exporting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.exportText}>{t.pdfExport}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f6f6',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f6f6f6',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
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
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tabActive: {
    borderColor: '#111',
    backgroundColor: '#f0f0f0',
  },
  pdf: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  exportButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  exportText: {
    color: '#fff',
    fontWeight: '600',
  },
  subtle: {
    fontSize: 12,
    color: '#666',
  },
});
