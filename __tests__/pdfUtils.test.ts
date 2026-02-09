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

describe('pdfUtils', () => {
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
