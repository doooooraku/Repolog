import { Platform } from 'react-native';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Photo, Report } from '@/src/types/models';
import { clearFontCache } from './pdfFonts';
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
const MIN_REASONABLE_PDF_BYTES = 1024;

class BlankPdfError extends Error {
  constructor(sizeBytes: number) {
    super(`[PDF] Generated blank or truncated PDF (${sizeBytes} bytes).`);
    this.name = 'BlankPdfError';
  }
}

function isOomError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('OutOfMemoryError');
  }
  return String(error).includes('OutOfMemoryError');
}

function isBlankPdfError(error: unknown): boolean {
  return error instanceof BlankPdfError;
}

function isRecoverablePdfError(error: unknown): boolean {
  return isOomError(error) || isBlankPdfError(error);
}

async function assertPdfLooksValid(uri: string) {
  const info = await LegacyFileSystem.getInfoAsync(uri);
  const sizeBytes = info.exists && typeof info.size === 'number' ? info.size : 0;
  if (sizeBytes >= MIN_REASONABLE_PDF_BYTES) return;
  throw new BlankPdfError(sizeBytes);
}

async function printHtml(html: string, paperSize: PaperSize) {
  const size = PAPER_SIZES[paperSize];
  const file = await Print.printToFileAsync({
    html,
    width: Math.round(size.widthMm * MM_TO_POINTS),
    height: Math.round(size.heightMm * MM_TO_POINTS),
  });
  try {
    await assertPdfLooksValid(file.uri);
  } catch (error) {
    await LegacyFileSystem.deleteAsync(file.uri, { idempotent: true }).catch(() => {});
    throw error;
  }
  return file.uri;
}

export async function generatePdfFile(input: PdfGenerateInput) {
  const attempts: {
    label: string;
    options: Parameters<typeof buildPdfHtml>[0];
  }[] = [
    {
      label: 'full quality',
      options: { ...input },
    },
    {
      label: 'reduced images + no custom fonts',
      options: { ...input, skipFontEmbedding: true, imagePreset: 'reduced' },
    },
    {
      label: 'tiny images + no custom fonts',
      options: { ...input, skipFontEmbedding: true, imagePreset: 'tiny' },
    },
  ];

  let lastError: unknown = null;

  for (let index = 0; index < attempts.length; index += 1) {
    const attemptNumber = index + 1;
    const attempt = attempts[index];
    try {
      const html = await buildPdfHtml(attempt.options);
      return await printHtml(html, input.paperSize);
    } catch (error) {
      lastError = error;
      const recoverable = isRecoverablePdfError(error);
      const hasNext = attemptNumber < attempts.length;
      if (!recoverable || !hasNext) {
        throw error;
      }
      const reason = isOomError(error) ? 'OOM' : 'blank PDF';
      console.warn(`[PDF] ${reason} on attempt ${attemptNumber} (${attempt.label}), retrying...`);
    } finally {
      clearFontCache();
    }
  }

  throw lastError instanceof Error ? lastError : new Error('PDF generation failed.');
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
