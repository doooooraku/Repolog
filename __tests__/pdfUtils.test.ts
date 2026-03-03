jest.mock('expo-localization', () => ({
  getCalendars: jest.fn(() => [{}]),
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

import * as Localization from 'expo-localization';

import {
  buildPdfExportFileName,
  chunkPhotos,
  formatDateTime,
  photoLabel,
  splitCommentIntoPages,
} from '@/src/features/pdf/pdfUtils';

const makePhoto = (id: number) => ({
  id: `p${id}`,
  reportId: 'r1',
  localUri: `file://${id}.jpg`,
  width: null,
  height: null,
  createdAt: new Date().toISOString(),
  orderIndex: id,
});

const mockTimeZone = (tz: string | undefined) => {
  (Localization.getCalendars as jest.Mock).mockReturnValue([
    tz ? { timeZone: tz } : {},
  ]);
};

describe('pdfUtils', () => {
  afterEach(() => {
    mockTimeZone(undefined);
  });

  test('formatDateTime formats ISO', () => {
    expect(formatDateTime('2026-01-31T01:02:03.000Z')).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
    );
  });

  test('splitCommentIntoPages splits by codepoints', () => {
    const text = '👍'.repeat(5);
    const pages = splitCommentIntoPages(text, 2);
    expect(pages).toEqual(['👍👍', '👍👍', '👍']);
  });

  test('chunkPhotos groups by perPage', () => {
    const photos = [0, 1, 2, 3, 4].map(makePhoto);
    const chunks = chunkPhotos(photos, 2);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(2);
    expect(chunks[2]).toHaveLength(1);
  });

  test('photoLabel increments from 1', () => {
    expect(photoLabel(0)).toBe('Photo 1');
    expect(photoLabel(5)).toBe('Photo 6');
  });

  test('buildPdfExportFileName uses timestamp and report name', () => {
    expect(
      buildPdfExportFileName({
        createdAt: '2026-02-09T07:18:05',
        reportName: 'Site A',
      }),
    ).toBe('20260209_0718_Site_A_Repolog.pdf');
  });

  test('buildPdfExportFileName omits report name when empty', () => {
    expect(
      buildPdfExportFileName({
        createdAt: '2026-02-09T07:18:05',
        reportName: '   ',
      }),
    ).toBe('20260209_0718_Repolog.pdf');
  });

  test('buildPdfExportFileName sanitizes forbidden characters', () => {
    expect(
      buildPdfExportFileName({
        createdAt: '2026-02-09T07:18:05',
        reportName: 'Area / B:*?"<>|\\\\ done',
      }),
    ).toBe('20260209_0718_Area_B_done_Repolog.pdf');
  });

  test('buildPdfExportFileName truncates long report name to 30 chars', () => {
    const fileName = buildPdfExportFileName({
      createdAt: '2026-02-09T07:18:05',
      reportName: '12345678901234567890123456789012345',
    });
    expect(fileName).toBe('20260209_0718_123456789012345678901234567890_Repolog.pdf');
  });
});

describe('timezone handling', () => {
  afterEach(() => {
    mockTimeZone(undefined);
  });

  test('Asia/Tokyo (UTC+9): converts UTC to JST', () => {
    mockTimeZone('Asia/Tokyo');
    expect(formatDateTime('2026-02-09T01:00:00.000Z')).toBe('2026-02-09 10:00');
  });

  test('Asia/Tokyo (UTC+9): date boundary crossing forward', () => {
    mockTimeZone('Asia/Tokyo');
    expect(formatDateTime('2026-02-09T22:18:05.000Z')).toBe('2026-02-10 07:18');
  });

  test('America/New_York (UTC-5 winter): converts UTC to EST', () => {
    mockTimeZone('America/New_York');
    expect(formatDateTime('2026-02-09T07:18:05.000Z')).toBe('2026-02-09 02:18');
  });

  test('America/New_York (UTC-5): date boundary crossing backward', () => {
    mockTimeZone('America/New_York');
    expect(formatDateTime('2026-02-09T03:00:00.000Z')).toBe('2026-02-08 22:00');
  });

  test('Asia/Kolkata (UTC+5:30): half-hour offset', () => {
    mockTimeZone('Asia/Kolkata');
    expect(formatDateTime('2026-02-09T07:18:05.000Z')).toBe('2026-02-09 12:48');
  });

  test('Pacific/Auckland (UTC+13 DST): large positive offset', () => {
    mockTimeZone('Pacific/Auckland');
    expect(formatDateTime('2026-02-09T07:18:05.000Z')).toBe('2026-02-09 20:18');
  });

  test('midnight displays as 00:00 not 24:00', () => {
    mockTimeZone('Asia/Tokyo');
    // 15:00 UTC = 00:00 JST next day
    expect(formatDateTime('2026-02-09T15:00:00.000Z')).toBe('2026-02-10 00:00');
  });

  test('buildPdfExportFileName respects device timezone', () => {
    mockTimeZone('Asia/Tokyo');
    // 22:18 UTC = 07:18 JST next day
    expect(
      buildPdfExportFileName({
        createdAt: '2026-02-08T22:18:05.000Z',
        reportName: 'Site A',
      }),
    ).toBe('20260209_0718_Site_A_Repolog.pdf');
  });

  test('buildPdfExportFileName midnight does not produce 2400', () => {
    mockTimeZone('Asia/Tokyo');
    expect(
      buildPdfExportFileName({
        createdAt: '2026-02-09T15:00:00.000Z',
        reportName: 'Test',
      }),
    ).toBe('20260210_0000_Test_Repolog.pdf');
  });
});
