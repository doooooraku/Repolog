/**
 * pdfService.test.ts
 *
 * `generatePdfFile()` の以下の防御的振る舞いを検証する。
 *
 * 1. ストレージ事前チェック: 空き容量が 100MB 未満なら PdfStorageLowError を即 throw
 * 2. 動的タイムアウト: 写真数に応じて Print.printToFileAsync の応答待ち時間を計算し、
 *    超過したら PdfHangError を投げて next attempt にフォールバックする
 * 3. attempt 1 タイムアウト上限 (Issue #298 緩和): attempt 1 のみ 10 秒でキャップし
 *    40 秒 hang を 10 秒で打ち切る。attempt 2 以降は通常の動的タイムアウトを維持する
 *
 * 関連: docs/adr/ADR-0013-pdf-export-resilience-and-progress.md
 */

jest.mock('expo-localization', () => ({
  getCalendars: jest.fn(() => [{}]),
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(async (uri: string) => ({ uri })),
  SaveFormat: { JPEG: 'jpeg' },
}));

const mockPrintToFileAsync = jest.fn();
jest.mock('expo-print', () => ({
  printToFileAsync: (...args: unknown[]) => mockPrintToFileAsync(...args),
}));

const mockGetInfoAsync = jest.fn();
const mockGetFreeDiskStorageAsync = jest.fn();
jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(async () => 'fakebase64data'),
  deleteAsync: jest.fn(async () => undefined),
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
  getFreeDiskStorageAsync: () => mockGetFreeDiskStorageAsync(),
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn(),
    createFileAsync: jest.fn(),
  },
  EncodingType: { Base64: 'base64' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

import {
  generatePdfFile,
  PdfHangError,
  PdfStorageLowError,
} from '@/src/features/pdf/pdfService';
import type { Photo, Report } from '@/src/types/models';

const ABUNDANT_FREE_BYTES = 500 * 1024 * 1024; // 500 MB

const makeReport = (overrides: Partial<Report> = {}): Report => ({
  id: 'r1',
  createdAt: '2026-04-08T10:00:00.000Z',
  updatedAt: '2026-04-08T10:00:00.000Z',
  reportName: 'Test Report',
  weather: 'sunny',
  locationEnabledAtCreation: false,
  lat: null,
  lng: null,
  latLngCapturedAt: null,
  address: null,
  addressSource: null,
  addressLocale: null,
  comment: '',
  tags: [],
  pinned: false,
  authorName: null,
  ...overrides,
});

const makePhotos = (n: number): Photo[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    reportId: 'r1',
    localUri: `file:///tmp/${i}.jpg`,
    width: 1200,
    height: 1600,
    createdAt: '2026-04-08T10:00:00.000Z',
    orderIndex: i,
    caption: null,
  }));

const makeInput = (photoCount: number) => ({
  report: makeReport(),
  photos: makePhotos(photoCount),
  layout: 'standard' as const,
  paperSize: 'A4' as const,
  isPro: true,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetFreeDiskStorageAsync.mockResolvedValue(ABUNDANT_FREE_BYTES);
  // 既定では valid PDF を返すよう mock
  mockGetInfoAsync.mockResolvedValue({ exists: true, size: 8192 });
  mockPrintToFileAsync.mockResolvedValue({ uri: 'file:///tmp/output.pdf' });
});

describe('generatePdfFile — storage pre-flight check', () => {
  test('throws PdfStorageLowError when free disk is below 100MB', async () => {
    mockGetFreeDiskStorageAsync.mockResolvedValueOnce(99 * 1024 * 1024);
    await expect(generatePdfFile(makeInput(2))).rejects.toBeInstanceOf(PdfStorageLowError);
    // ストレージ不足ならフォールバックは試さず、即 throw する
    expect(mockPrintToFileAsync).not.toHaveBeenCalled();
  });

  test('proceeds when free disk equals 100MB', async () => {
    mockGetFreeDiskStorageAsync.mockResolvedValueOnce(100 * 1024 * 1024);
    await expect(generatePdfFile(makeInput(1))).resolves.toBe('file:///tmp/output.pdf');
  });

  test('proceeds when getFreeDiskStorageAsync itself fails (best-effort)', async () => {
    mockGetFreeDiskStorageAsync.mockRejectedValueOnce(new Error('not supported'));
    await expect(generatePdfFile(makeInput(1))).resolves.toBe('file:///tmp/output.pdf');
  });
});

describe('generatePdfFile — dynamic timeout / hang fallback', () => {
  test('throws PdfHangError when printToFileAsync never resolves on every attempt', async () => {
    jest.useFakeTimers();
    // 全 attempt で永遠 hang
    mockPrintToFileAsync.mockImplementation(() => new Promise(() => undefined));

    const input = makeInput(2);
    // attempt 1 は 10s キャップ、attempt 2/3 は 30+1×2 = 32s
    const attempt1Timeout = 10_000;
    const laterAttemptTimeout = 30_000 + 1_000 * 2;
    // unhandled rejection を出さないため、await の代わりに .catch() で結果を受ける
    const result = generatePdfFile(input).catch((e) => e);
    // attempt 1: 10 秒でキャップ
    await jest.advanceTimersByTimeAsync(attempt1Timeout);
    await jest.advanceTimersByTimeAsync(300);
    // attempt 2: 通常タイムアウト
    await jest.advanceTimersByTimeAsync(laterAttemptTimeout);
    await jest.advanceTimersByTimeAsync(300);
    // attempt 3: 通常タイムアウト
    await jest.advanceTimersByTimeAsync(laterAttemptTimeout);
    await jest.advanceTimersByTimeAsync(300);
    const error = await result;
    expect(error).toBeInstanceOf(PdfHangError);
    expect(mockPrintToFileAsync).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });

  test('attempt 1 is capped at 10 seconds regardless of photo count (Issue #298 mitigation)', async () => {
    jest.useFakeTimers();
    let callCount = 0;
    mockPrintToFileAsync.mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) return new Promise(() => undefined); // hang
      return Promise.resolve({ uri: 'file:///tmp/recovered.pdf' });
    });

    // 写真 10 枚 → 素朴に動的タイムアウトを計算すると 30+10 = 40 秒になるが、
    // attempt 1 のみ 10 秒でキャップされることを検証
    const input = makeInput(10);
    const promise = generatePdfFile(input);
    // 10 秒ちょうどで attempt 1 がタイムアウトする
    await jest.advanceTimersByTimeAsync(10_000);
    await jest.advanceTimersByTimeAsync(300); // fallback cooldown
    await expect(promise).resolves.toBe('file:///tmp/recovered.pdf');
    expect(callCount).toBe(2);
    jest.useRealTimers();
  });

  test('attempt 2+ uses full dynamic timeout (not capped)', async () => {
    jest.useFakeTimers();
    let callCount = 0;
    mockPrintToFileAsync.mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) return new Promise(() => undefined); // attempt 1 hang
      if (callCount === 2) return new Promise(() => undefined); // attempt 2 hang
      return Promise.resolve({ uri: 'file:///tmp/recovered.pdf' });
    });

    const input = makeInput(5);
    // attempt 1: 10 秒 cap, attempt 2: 30+5 = 35 秒
    const promise = generatePdfFile(input);
    // attempt 1 消化
    await jest.advanceTimersByTimeAsync(10_000);
    await jest.advanceTimersByTimeAsync(300);
    // attempt 2 は 10 秒では終わらないことを確認するため 10 秒進める
    await jest.advanceTimersByTimeAsync(10_000);
    expect(callCount).toBe(2); // attempt 3 にはまだ進まない
    // 残り 25 秒進めて attempt 2 のタイムアウトを発火
    await jest.advanceTimersByTimeAsync(25_000);
    await jest.advanceTimersByTimeAsync(300);
    await expect(promise).resolves.toBe('file:///tmp/recovered.pdf');
    expect(callCount).toBe(3);
    jest.useRealTimers();
  });
});

describe('generatePdfFile — attempt 1 font strategy (Issue #292)', () => {
  /**
   * Phase 1 (PR #293) の実機計測で、attempt 1 が `@font-face` data URI を
   * 含む HTML を Android Chromium 印刷エンジンに渡すと blank PDF (681 bytes)
   * を返すことが確定した。ADR-0015 で attempt 1 を `skipFontEmbedding: true`
   * に固定したため、本テストで「attempt 1 が生成する HTML に @font-face が
   * 含まれない」ことを CI で保証する。
   *
   * 関連: docs/adr/ADR-0015-pdf-font-strategy-shift.md
   *      docs/reference/lessons.md > PDF生成 > 2026-04-09
   */
  test('attempt 1 does not embed @font-face (system fonts only)', async () => {
    await generatePdfFile(makeInput(2));
    // attempt 1 で成功し、フォールバック (attempt 2 / 3) が走らないこと
    expect(mockPrintToFileAsync).toHaveBeenCalledTimes(1);
    // attempt 1 の HTML には @font-face も data URI フォントも含まれない
    const firstCallArg = mockPrintToFileAsync.mock.calls[0][0] as { html: string };
    expect(firstCallArg.html).not.toContain('@font-face');
    expect(firstCallArg.html).not.toContain('data:font/ttf;base64');
  });
});
