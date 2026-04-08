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

/**
 * SSoT 構造不変条件 — `.photo-no` は必ず `.photo-frame` の内側に存在し、
 * `.photo-slot` の直接子として in-flow に並ばないこと。
 *
 * 背景: 2026-04-08 に「写真ページ直後に空白ページが入る」バグが iOS で再発した。
 * 真因は PR #212 (commit 963b7c7) で `<div class="photo-no">` を `.photo-frame` の
 * 外に出し、`.photo-slot` の flex sibling として in-flow に置いた構造ドリフトで、
 * 1 スロットあたり ~3.82mm の縦消費が ADR-0009 の 3.265mm スラック予算を食い潰し
 * 、iOS WebKit subpixel overflow で `.page-footer` が次ページに押し出されていた。
 *
 * 本 describe ブロックは「将来同じ罠に再び落ちない」ための CI ガード。
 * 構造的に `.photo-no` が `.photo-frame` の内側に留まることを assert する。
 *
 * 関連: docs/adr/ADR-0017-pdf-photo-no-flow-regression.md
 *      docs/reference/pdf_template.md (SSoT)
 */
describe('buildPdfHtml — .photo-no must remain inside .photo-frame (SSoT invariant)', () => {
  const cases: Array<{ layout: PdfLayout; photos: number; label: string }> = [
    { layout: 'standard', photos: 1, label: 'standard/1photo' },
    { layout: 'standard', photos: 2, label: 'standard/2photos' },
    { layout: 'standard', photos: 5, label: 'standard/5photos' },
    { layout: 'large', photos: 1, label: 'large/1photo' },
    { layout: 'large', photos: 3, label: 'large/3photos' },
  ];

  for (const c of cases) {
    test(`${c.label}: .photo-no never appears as a direct sibling of .photo-frame`, async () => {
      const html = await buildPdfHtml({
        report: makeReport(),
        photos: makePhotos(c.photos),
        layout: c.layout,
        paperSize: 'A4',
        isPro: true,
        skipFontEmbedding: true,
      });
      // bad pattern: </div> immediately followed by <div class="photo-no">
      // means photo-no escaped photo-frame and is sitting at .photo-slot level.
      // good pattern: photo-no is wrapped by photo-frame so the only </div>
      // immediately preceding it (if any) is from the <img> closer — but img
      // is self-closing in our template so there is none at all.
      expect(html).not.toMatch(/<\/div>\s*<div class="photo-no"/);

      // Every photo-no MUST sit inside a photo-frame. We assert this by
      // counting frame-internal photo-nos vs total photo-nos.
      const totalPhotoNo = (html.match(/<div class="photo-no">/g) ?? []).length;
      // success path: <div class="photo-frame">  <img ... />  <div class="photo-no">
      // catch  path: <div class="photo-frame">  <div class="photo-no">
      const insideFramePattern =
        /<div class="photo-frame">[\s\S]*?<div class="photo-no">/g;
      const insideFrameCount = (html.match(insideFramePattern) ?? []).length;
      expect(totalPhotoNo).toBeGreaterThan(0);
      expect(insideFrameCount).toBe(totalPhotoNo);
    });
  }

  test('.photo-no CSS rule uses position: absolute', async () => {
    const html = await buildPdfHtml({
      report: makeReport(),
      photos: makePhotos(1),
      layout: 'standard',
      paperSize: 'A4',
      isPro: true,
      skipFontEmbedding: true,
    });
    // photo-no must be absolutely positioned so it consumes ZERO in-flow height
    expect(html).toMatch(/\.photo-no\s*\{[^}]*position:\s*absolute/);
  });

  test('.photo-frame CSS rule retains position: relative as the absolute container', async () => {
    const html = await buildPdfHtml({
      report: makeReport(),
      photos: makePhotos(1),
      layout: 'standard',
      paperSize: 'A4',
      isPro: true,
      skipFontEmbedding: true,
    });
    // photo-frame must establish a positioning context for the absolute photo-no
    expect(html).toMatch(/\.photo-frame\s*\{[^}]*position:\s*relative/);
  });
});

