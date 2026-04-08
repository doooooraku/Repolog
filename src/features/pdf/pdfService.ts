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
    author?: string;
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

// 動的タイムアウト: 30 秒の固定オーバーヘッド + 写真 1 枚あたり 1 秒。
// 動的にする理由は ADR-0013-pdf-export-resilience-and-progress.md を参照。
const PRINT_TIMEOUT_BASE_MS = 30_000;
const PRINT_TIMEOUT_PER_PHOTO_MS = 1_000;

// PDF 生成に最低限必要と想定するディスク空き容量。
// expo-image-manipulator の temp JPEG (写真数 × ~500KB) と
// expo-print の temp PDF (~50MB) を合わせた安全側マージン。
const MIN_FREE_DISK_BYTES = 100 * 1024 * 1024;

// フォールバック切替の前に少し待って native heap を解放させる。
const FALLBACK_COOLDOWN_MS = 300;

const calculatePrintTimeoutMs = (photoCount: number): number =>
  PRINT_TIMEOUT_BASE_MS + PRINT_TIMEOUT_PER_PHOTO_MS * Math.max(photoCount, 0);

class BlankPdfError extends Error {
  constructor(sizeBytes: number) {
    super(`[PDF] Generated blank or truncated PDF (${sizeBytes} bytes).`);
    this.name = 'BlankPdfError';
  }
}

/**
 * Print.printToFileAsync が指定タイムアウト内に応答しなかったときに throw される。
 * フォールバックチェーン（reduced → tiny）でリトライ可能。
 */
export class PdfHangError extends Error {
  constructor(timeoutMs: number) {
    super(`[PDF] printToFileAsync did not respond within ${timeoutMs}ms.`);
    this.name = 'PdfHangError';
  }
}

/**
 * 端末のディスク空き容量が PDF 生成に必要な最小値を下回っているときに throw される。
 * リトライしても改善しないため、フォールバックチェーンには載せず即座にユーザーへ通知する。
 */
export class PdfStorageLowError extends Error {
  constructor(freeBytes: number, requiredBytes: number) {
    super(
      `[PDF] Insufficient free disk storage. Free=${freeBytes}, Required=${requiredBytes}.`,
    );
    this.name = 'PdfStorageLowError';
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

function isHangError(error: unknown): boolean {
  return error instanceof PdfHangError;
}

function isRecoverablePdfError(error: unknown): boolean {
  return isOomError(error) || isBlankPdfError(error) || isHangError(error);
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function assertPdfLooksValid(uri: string) {
  const info = await LegacyFileSystem.getInfoAsync(uri);
  const sizeBytes = info.exists && typeof info.size === 'number' ? info.size : 0;
  if (sizeBytes >= MIN_REASONABLE_PDF_BYTES) {
    // [Issue #292] 成功時もサイズを記録し「正常な PDF のバイト幅」を把握する。
    // 将来 MIN_REASONABLE_PDF_BYTES の妥当性評価や PDF 品質回帰検知の基準値に使う。
    console.warn(`[PDF] assertPdfLooksValid: sizeBytes=${sizeBytes} status=valid`);
    return;
  }
  // [Issue #292] 失敗時は閾値も一緒に出してどの程度 blank か判別できるようにする。
  console.warn(
    `[PDF] assertPdfLooksValid: sizeBytes=${sizeBytes} status=blank threshold=${MIN_REASONABLE_PDF_BYTES}`,
  );
  throw new BlankPdfError(sizeBytes);
}

async function printHtml(html: string, paperSize: PaperSize, timeoutMs: number) {
  const size = PAPER_SIZES[paperSize];
  // [Issue #292] 構造化診断ログ: expo-print に渡す直前の HTML バイトサイズを観測。
  // attempt 1 (full quality) が毎回 blank PDF を返す問題の原因として
  // 「HTML が巨大すぎて Android WebView が silent truncate する」仮説を検証中。
  // 詳細: docs/reference/lessons.md 2026-04-09 / Issue #292
  console.warn(
    `[PDF] printHtml: htmlBytes=${html.length} paperSize=${paperSize} timeoutMs=${timeoutMs}`,
  );
  // Print.printToFileAsync は OS 側で hang する場合があり (写真数 × メモリ圧迫)、
  // resolve も reject も来ないため Promise.race でタイムアウトを必ずかける。
  // 詳細: docs/adr/ADR-0013-pdf-export-resilience-and-progress.md
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new PdfHangError(timeoutMs)), timeoutMs);
  });
  let file: { uri: string };
  try {
    file = await Promise.race([
      Print.printToFileAsync({
        html,
        width: Math.round(size.widthMm * MM_TO_POINTS),
        height: Math.round(size.heightMm * MM_TO_POINTS),
      }),
      timeoutPromise,
    ]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
  try {
    await assertPdfLooksValid(file.uri);
  } catch (error) {
    await LegacyFileSystem.deleteAsync(file.uri, { idempotent: true }).catch(() => {});
    throw error;
  }
  return file.uri;
}

export async function generatePdfFile(
  input: PdfGenerateInput,
  onProgress?: (processed: number, total: number) => void,
) {
  // ストレージ事前チェック: temp ファイル書き込みが詰まる前に明示エラーで止める。
  // フォールバックで救えないので最初の 1 回だけ確認する。
  try {
    const freeBytes = await LegacyFileSystem.getFreeDiskStorageAsync();
    if (freeBytes < MIN_FREE_DISK_BYTES) {
      throw new PdfStorageLowError(freeBytes, MIN_FREE_DISK_BYTES);
    }
  } catch (error) {
    if (error instanceof PdfStorageLowError) throw error;
    // getFreeDiskStorageAsync 自体が失敗した場合はチェックをスキップして続行する
    // （古い端末や権限問題で取得できないことがあるため）。
    console.warn('[PDF] getFreeDiskStorageAsync failed, skipping storage check:', error);
  }

  const timeoutMs = calculatePrintTimeoutMs(input.photos.length);

  const attempts: {
    label: string;
    options: Parameters<typeof buildPdfHtml>[0];
  }[] = [
    {
      label: 'full quality (system fonts)',
      // Issue #292 / ADR-0015: Android Chromium 印刷エンジンは 15〜40MB の
      // `@font-face { src: url('data:font/ttf;base64,...') }` を処理できず
      // blank PDF (681 bytes) を silent failure で返す。このため attempt 1 では
      // カスタムフォント埋め込みを使用しない（画像は full quality 1200/1600px
      // @ 0.80 を維持）。19 言語の描画は pdfFontStack の system-ui /
      // -apple-system / Arial 系フォールバックで OS 標準フォントに委譲する。
      // 詳細: docs/adr/ADR-0015-pdf-font-strategy-shift.md
      options: { ...input, onProgress, skipFontEmbedding: true },
    },
    {
      label: 'reduced images + no custom fonts',
      options: { ...input, onProgress, skipFontEmbedding: true, imagePreset: 'reduced' },
    },
    {
      label: 'tiny images + no custom fonts',
      options: { ...input, onProgress, skipFontEmbedding: true, imagePreset: 'tiny' },
    },
  ];

  let lastError: unknown = null;

  for (let index = 0; index < attempts.length; index += 1) {
    const attemptNumber = index + 1;
    const attempt = attempts[index];
    try {
      const html = await buildPdfHtml(attempt.options);
      return await printHtml(html, input.paperSize, timeoutMs);
    } catch (error) {
      lastError = error;
      const recoverable = isRecoverablePdfError(error);
      const hasNext = attemptNumber < attempts.length;
      if (!recoverable || !hasNext) {
        throw error;
      }
      const reason = isHangError(error)
        ? 'hang detected'
        : isOomError(error)
          ? 'OOM'
          : 'blank PDF';
      console.warn(`[PDF] ${reason} on attempt ${attemptNumber} (${attempt.label}), retrying...`);
      // フォールバック前に少し待って native heap が解放される時間を確保する。
      await sleep(FALLBACK_COOLDOWN_MS);
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
