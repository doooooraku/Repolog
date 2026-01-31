import {
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
});
