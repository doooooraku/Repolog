/**
 * pdfService.test.ts
 *
 * `generatePdfFile()` の以下の防御的振る舞いを検証する。
 *
 * 1. ストレージ事前チェック: 空き容量が 100MB 未満なら PdfStorageLowError を即 throw
 * 2. 動的タイムアウト: 写真数に応じて Print.printToFileAsync の応答待ち時間を計算し、
 *    超過したら PdfHangError を投げて next attempt にフォールバックする
 * 3. onProgress の pass-through: 写真ループの進捗が呼び出し側に伝わる
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
    // 動的タイムアウト = 30s + 1s × 2 = 32s
    const expectedTimeoutMs = 30_000 + 1_000 * 2;
    // unhandled rejection を出さないため、await の代わりに .catch() で結果を受ける
    const result = generatePdfFile(input).catch((e) => e);
    // 各 attempt をタイムアウトさせる: 3 attempts × タイムアウト + フォールバック cooldown
    for (let i = 0; i < 3; i += 1) {
      await jest.advanceTimersByTimeAsync(expectedTimeoutMs);
      await jest.advanceTimersByTimeAsync(300);
    }
    const error = await result;
    expect(error).toBeInstanceOf(PdfHangError);
    expect(mockPrintToFileAsync).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });

  test('falls back to next attempt when first hang then succeeds', async () => {
    jest.useFakeTimers();
    let callCount = 0;
    mockPrintToFileAsync.mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) return new Promise(() => undefined); // hang
      return Promise.resolve({ uri: 'file:///tmp/recovered.pdf' });
    });

    const input = makeInput(0);
    // 動的タイムアウト = 30s + 0 = 30s
    const promise = generatePdfFile(input);
    await jest.advanceTimersByTimeAsync(30_000);
    await jest.advanceTimersByTimeAsync(300); // fallback cooldown
    await expect(promise).resolves.toBe('file:///tmp/recovered.pdf');
    expect(callCount).toBe(2);
    jest.useRealTimers();
  });
});

describe('generatePdfFile — onProgress pass-through', () => {
  test('forwards photo progress callbacks to caller', async () => {
    const onProgress = jest.fn<void, [number, number]>();
    await generatePdfFile(makeInput(3), onProgress);
    // 初回 (0, 3) + 写真 3 枚分 = 4 回以上
    expect(onProgress.mock.calls.length).toBeGreaterThanOrEqual(4);
    expect(onProgress.mock.calls[0]).toEqual([0, 3]);
    const last = onProgress.mock.calls[onProgress.mock.calls.length - 1];
    expect(last).toEqual([3, 3]);
  });

  test('is optional (no throw when omitted)', async () => {
    await expect(generatePdfFile(makeInput(2))).resolves.toBe('file:///tmp/output.pdf');
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
