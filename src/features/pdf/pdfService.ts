import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
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
  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted) return false;
  const targetUri = await StorageAccessFramework.createFileAsync(
    permissions.directoryUri,
    fileName,
    'application/pdf',
  );
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  await FileSystem.writeAsStringAsync(targetUri, base64, { encoding: 'base64' });
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
