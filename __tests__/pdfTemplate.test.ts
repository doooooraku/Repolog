/**
 * pdfTemplate.test.ts
 *
 * `buildPdfHtml()` の出力 HTML に含まれる `<section class="page` の数が
 * `calculatePageCount()` の戻り値と必ず一致することを保証する不変条件テスト。
 *
 * 背景: 2026-04-07 に iOS WebKit print の subpixel 丸めで `.page-footer` が
 * 次の PDF ページに押し出される不具合 (#286) があり、CSS パッチで修正した。
 * 同じ問題を将来のリファクタで再発させないため、HTML 構造レベルで
 * 「セクション数 ≡ 期待ページ数」を CI で固定する。
 *
 * 関連: docs/adr/ADR-0009-pdf-print-engine-compat.md
 *      docs/reference/lessons.md > PDF生成 > 2026-04-07
 */

jest.mock('expo-localization', () => ({
  getCalendars: jest.fn(() => [{}]),
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(async (uri: string) => ({ uri })),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(async () => 'fakebase64data'),
  deleteAsync: jest.fn(async () => undefined),
}));

import { buildPdfHtml } from '@/src/features/pdf/pdfTemplate';
import { calculatePageCount, type PdfLayout, type PaperSize } from '@/src/features/pdf/pdfUtils';
import type { Photo, Report } from '@/src/types/models';

const countPageSections = (html: string): number =>
  (html.match(/<section class="page/g) ?? []).length;

const makeReport = (overrides: Partial<Report> = {}): Report => ({
  id: 'r1',
  createdAt: '2026-04-07T10:00:00.000Z',
  updatedAt: '2026-04-07T10:00:00.000Z',
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
    createdAt: '2026-04-07T10:00:00.000Z',
    orderIndex: i,
    caption: i === 0 ? 'sample caption' : null,
  }));

describe('buildPdfHtml — section count must match calculatePageCount', () => {
  const layouts: PdfLayout[] = ['standard', 'large'];
  const paperSizes: PaperSize[] = ['A4', 'Letter'];
  const photoCounts = [0, 1, 2, 3, 5, 10];
  const comments = [
    { label: 'empty', text: '' },
    { label: 'short', text: 'こんにちは' },
    { label: 'mid-900', text: 'a'.repeat(900) },
    { label: 'long-2500', text: 'a'.repeat(2500) },
  ];

  for (const layout of layouts) {
    for (const paperSize of paperSizes) {
      for (const photoCount of photoCounts) {
        for (const comment of comments) {
          test(`${layout}/${paperSize}/${photoCount}photo/comment-${comment.label}`, async () => {
            const html = await buildPdfHtml({
              report: makeReport({ comment: comment.text }),
              photos: makePhotos(photoCount),
              layout,
              paperSize,
              isPro: true,
              skipFontEmbedding: true,
            });
            const expected = calculatePageCount(comment.text, photoCount, layout);
            expect(countPageSections(html)).toBe(expected);
          });
        }
      }
    }
  }
});

describe('buildPdfHtml — defensive CSS for iOS WebKit print (#286)', () => {
  test('.page height uses calc(- 1mm) slack to absorb subpixel rounding', async () => {
    const html = await buildPdfHtml({
      report: makeReport(),
      photos: makePhotos(2),
      layout: 'standard',
      paperSize: 'A4',
      isPro: true,
      skipFontEmbedding: true,
    });
    // 1mm slack must be present in .page rule to prevent footer overflow on iOS
    expect(html).toContain('height: calc(var(--page-h) - 1mm)');
    // .page-footer must use border-box to fix outer height to var(--footer-h)
    expect(html).toMatch(/\.page-footer\s*\{[^}]*box-sizing:\s*border-box/);
  });
});

