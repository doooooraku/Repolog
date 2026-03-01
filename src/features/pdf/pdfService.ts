import { Platform } from 'react-native';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Photo, Report } from '@/src/types/models';
import { buildPdfHtml } from './pdfTemplate';
import { PAPER_SIZES, type PaperSize, type PdfLayout } from './pdfUtils';

export type PdfGenerateInput = {
  report: Report;
  photos: Photo[];
  paperSize: PaperSize;
  layout: PdfLayout;
  isPro: boolean;
  localeHint?: string;
  appName?: string;
  weatherLabel?: string;
  labels?: {
    createdAt?: string;
    reportName?: string;
    address?: string;
    location?: string;
    weather?: string;
    photoCount?: string;
    pageCount?: string;
    photos?: string;
    pages?: string;
    comment?: string;
  };
};

// 1mm = 72/25.4 points (PDF standard: 72 points per inch)
const MM_TO_POINTS = 72 / 25.4;

export async function generatePdfFile(input: PdfGenerateInput) {
  const html = await buildPdfHtml(input);
  const size = PAPER_SIZES[input.paperSize];
  const file = await Print.printToFileAsync({
    html,
    width: Math.round(size.widthMm * MM_TO_POINTS),
    height: Math.round(size.heightMm * MM_TO_POINTS),
  });
  return file.uri;
}

async function savePdfAndroid(uri: string, fileName: string) {
  const permissions = await LegacyFileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted) return false;
  const targetUri = await LegacyFileSystem.StorageAccessFramework.createFileAsync(
    permissions.directoryUri,
    fileName,
    'application/pdf',
  );
  const base64 = await LegacyFileSystem.readAsStringAsync(uri, {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });
  await LegacyFileSystem.writeAsStringAsync(targetUri, base64, {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });
  return true;
}

export async function exportPdfFile(uri: string, fileName: string) {
  if (Platform.OS === 'android') {
    return savePdfAndroid(uri, fileName);
  }
  const available = await Sharing.isAvailableAsync();
  if (!available) return false;
  await Sharing.shareAsync(uri, {
    UTI: 'com.adobe.pdf',
    mimeType: 'application/pdf',
  });
  return true;
}
