import { Platform } from 'react-native';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Photo, Report } from '@/src/types/models';
import { buildPdfHtml } from './pdfTemplate';
import type { PaperSize, PdfLayout } from './pdfUtils';

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

export async function generatePdfFile(input: PdfGenerateInput) {
  const html = await buildPdfHtml(input);
  const file = await Print.printToFileAsync({ html });
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
