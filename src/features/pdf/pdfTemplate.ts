import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

import type { Photo, Report } from '@/src/types/models';
import { buildPdfFontCss, pdfFontStack } from './pdfFonts';
import {
  COVER_COMMENT_CHAR_LIMIT,
  PAPER_SIZES,
  type PaperSize,
  type PdfLayout,
  chunkPhotos,
  formatDateTime,
  photoLabel,
  reportTitle,
  splitCommentIntoPages,
} from './pdfUtils';

type PdfTemplateInput = {
  report: Report;
  photos: Photo[];
  layout: PdfLayout;
  paperSize: PaperSize;
  isPro: boolean;
  localeHint?: string;
  appName?: string;
  weatherLabel?: string;
  labels?: Partial<PdfLabels>;
  /** When true, uses tiny thumbnails and skips font embedding for fast preview. */
  preview?: boolean;
  /** Skip embedding custom fonts. Useful for low-memory fallback generation. */
  skipFontEmbedding?: boolean;
  /** Explicit image preset to control memory usage during PDF generation. */
  imagePreset?: 'default' | 'reduced' | 'tiny';
};

type PdfLabels = {
  createdAt: string;
  reportName: string;
  author: string;
  address: string;
  location: string;
  weather: string;
  photoCount: string;
  pageCount: string;
  photos: string;
  pages: string;
  comment: string;
};

const DEFAULT_LABELS: PdfLabels = {
  createdAt: 'Created at',
  reportName: 'Report name',
  author: 'Author',
  address: 'Address',
  location: 'Location',
  weather: 'Weather',
  photoCount: 'Photo count',
  pageCount: 'Page count',
  photos: 'Photos',
  pages: 'Pages',
  comment: 'Comment',
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

type ImageSizeConfig = { maxEdge: number; quality: number };

const IMAGE_SIZE_STANDARD: ImageSizeConfig = { maxEdge: 1200, quality: 0.80 };
const IMAGE_SIZE_LARGE: ImageSizeConfig = { maxEdge: 1600, quality: 0.80 };
const IMAGE_SIZE_REDUCED_STANDARD: ImageSizeConfig = { maxEdge: 800, quality: 0.65 };
const IMAGE_SIZE_REDUCED_LARGE: ImageSizeConfig = { maxEdge: 1000, quality: 0.65 };
const IMAGE_SIZE_PREVIEW: ImageSizeConfig = { maxEdge: 400, quality: 0.4 };

export const PDF_IMAGE_CONFIGS = {
  standard: IMAGE_SIZE_STANDARD,
  large: IMAGE_SIZE_LARGE,
} as const;

const getImageSizeConfig = (layout: PdfLayout, preview?: boolean): ImageSizeConfig =>
  preview ? IMAGE_SIZE_PREVIEW : layout === 'large' ? IMAGE_SIZE_LARGE : IMAGE_SIZE_STANDARD;

const resolveImageSizeConfig = (input: PdfTemplateInput): ImageSizeConfig => {
  if (input.imagePreset === 'tiny') return IMAGE_SIZE_PREVIEW;
  if (input.imagePreset === 'reduced') {
    return input.layout === 'large' ? IMAGE_SIZE_REDUCED_LARGE : IMAGE_SIZE_REDUCED_STANDARD;
  }
  return getImageSizeConfig(input.layout, input.preview);
};

const fileToDataUri = async (
  uri: string,
  config: ImageSizeConfig,
  photoWidth?: number | null,
  photoHeight?: number | null,
) => {
  const w = photoWidth ?? 0;
  const h = photoHeight ?? 0;
  const longestEdge = Math.max(w, h);

  const actions: ImageManipulator.Action[] = [];
  if (longestEdge === 0) {
    actions.push({ resize: { width: config.maxEdge } });
  } else if (longestEdge > config.maxEdge) {
    if (w >= h) {
      actions.push({ resize: { width: config.maxEdge } });
    } else {
      actions.push({ resize: { height: config.maxEdge } });
    }
  }

  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    actions,
    { compress: config.quality, format: ImageManipulator.SaveFormat.JPEG },
  );
  const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
    encoding: 'base64',
  });
  FileSystem.deleteAsync(compressed.uri, { idempotent: true }).catch(() => {});
  return `data:image/jpeg;base64,${base64}`;
};

const getLabel = (input: PdfTemplateInput, key: keyof PdfLabels) =>
  input.labels?.[key] ?? DEFAULT_LABELS[key];

const buildFontSelectionText = (input: PdfTemplateInput) => {
  const labels = {
    ...DEFAULT_LABELS,
    ...input.labels,
  };
  const chunks = [
    input.appName ?? 'Repolog',
    input.report.reportName ?? '',
    input.report.authorName ?? '',
    input.report.comment ?? '',
    input.report.address ?? '',
    input.weatherLabel ?? '',
    labels.createdAt,
    labels.reportName,
    labels.address,
    labels.location,
    labels.weather,
    labels.photoCount,
    labels.pageCount,
    labels.photos,
    labels.pages,
    labels.comment,
    ...input.photos.map((p) => p.caption ?? ''),
  ];
  return chunks.join('\n');
};

const metaRow = (label: string, value: string | null | undefined) => {
  if (!value || value === '-') return '';
  return `<div class="meta-k">${escapeHtml(label)}</div><div class="meta-v">${escapeHtml(value)}</div>`;
};

const buildCover = (input: PdfTemplateInput, pageCount: number, commentText?: string) => {
  const title = escapeHtml(reportTitle(input.report));
  const createdAt = escapeHtml(formatDateTime(input.report.createdAt));
  const weather = input.weatherLabel ?? (input.report.weather !== 'none' ? input.report.weather : null) ?? null;
  const reportName = input.report.reportName?.trim() || null;
  const authorName = input.report.authorName?.trim() || null;
  const location =
    input.report.lat != null && input.report.lng != null
      ? `${input.report.lat}, ${input.report.lng}`
      : null;
  const address = input.report.address?.trim() || null;

  const hasComment = commentText != null && commentText.trim().length > 0;
  const commentBlock = hasComment
    ? `
          <div class="comment-block no-break">
            <h2 class="section-title">${escapeHtml(getLabel(input, 'comment'))}</h2>
            <div class="comment-text">${escapeHtml(commentText)}</div>
          </div>`
    : '';

  return `
    <section class="page cover">
      <div class="page-inner">
        <div class="page-main">
          <h1 class="report-title">${title}</h1>
          <div class="meta-grid">
            <div class="meta-k">${escapeHtml(getLabel(input, 'createdAt'))}</div><div class="meta-v">${createdAt}</div>
            ${metaRow(getLabel(input, 'reportName'), reportName)}
            ${metaRow(getLabel(input, 'author'), authorName)}
            ${metaRow(getLabel(input, 'address'), address)}
            ${metaRow(getLabel(input, 'location'), location)}
            ${metaRow(getLabel(input, 'weather'), weather)}
            <div class="meta-k">${escapeHtml(getLabel(input, 'photoCount'))}</div><div class="meta-v">${input.photos.length} ${escapeHtml(getLabel(input, 'photos'))}</div>
            <div class="meta-k">${escapeHtml(getLabel(input, 'pageCount'))}</div><div class="meta-v">${pageCount} ${escapeHtml(getLabel(input, 'pages'))}</div>
          </div>
          ${commentBlock}
        </div>
        <footer class="page-footer">
          <span>${escapeHtml(input.appName ?? 'Repolog')}</span>
          <span>1/${pageCount}</span>
        </footer>
        ${input.isPro ? '' : '<div class="watermark">Created by Repolog</div>'}
      </div>
    </section>
  `;
};

const buildCommentPages = (input: PdfTemplateInput, startIndex: number, pageCount: number) => {
  const pages = splitCommentIntoPages(input.report.comment ?? '');
  const out: string[] = [];
  pages.forEach((text, index) => {
    const pageNumber = startIndex + index;
    out.push(`
      <section class="page comment-page">
        <div class="page-inner">
          <div class="page-main">
            <h2 class="section-title">${escapeHtml(getLabel(input, 'comment'))}</h2>
            <div class="comment-text">${escapeHtml(text || '-')}</div>
          </div>
          <footer class="page-footer">
            <span></span>
            <span>${pageNumber}/${pageCount}</span>
          </footer>
        </div>
      </section>
    `);
  });
  return out;
};

const buildPhotoPages = async (
  input: PdfTemplateInput,
  startIndex: number,
  perPage: number,
  pageCount: number,
) => {
  const layout = input.layout === 'large' ? 'large' : 'standard';
  const gridClass = layout === 'large' ? 'one' : 'two';
  const chunks = chunkPhotos(input.photos, perPage);
  const out: string[] = [];
  let photoCounter = 0;

  for (let pageIndex = 0; pageIndex < chunks.length; pageIndex += 1) {
    const pageNumber = startIndex + pageIndex;
    const chunk = chunks[pageIndex];
    const slots: string[] = [];
    for (const photo of chunk) {
      const label = photoLabel(photoCounter);
      photoCounter += 1;
      const captionHtml = layout === 'large' && photo.caption
        ? `<div class="photo-caption">${escapeHtml(photo.caption)}</div>`
        : '';
      try {
        const config = resolveImageSizeConfig(input);
        const src = await fileToDataUri(photo.localUri, config, photo.width, photo.height);
        slots.push(`
            <div class="photo-slot">
              <div class="photo-frame">
                <img class="photo" src="${src}" alt="${escapeHtml(label)}" />
              </div>
              <div class="photo-no">${escapeHtml(label)}</div>
              ${captionHtml}
            </div>
          `);
      } catch {
        console.warn(`[PDF] Failed to load photo: ${photo.localUri}`);
        slots.push(`
            <div class="photo-slot">
              <div class="photo-frame"></div>
              <div class="photo-no">${escapeHtml(label)}</div>
              ${captionHtml}
            </div>
          `);
      }
    }

    // Add empty slot for odd photo count in standard layout
    if (perPage === 2 && chunk.length < perPage) {
      slots.push('<div class="photo-slot empty"></div>');
    }

    out.push(`
      <section class="page photo-page ${layout}">
        <div class="page-inner">
          <div class="page-main photo-grid ${gridClass}">
            ${slots.join('')}
          </div>
          <footer class="page-footer">
            <span></span>
            <span>${pageNumber}/${pageCount}</span>
          </footer>
        </div>
      </section>
    `);
  }

  return out;
};

const buildCss = async (input: PdfTemplateInput) => {
  const skipFontEmbedding = input.preview || input.skipFontEmbedding;
  const fontCss = skipFontEmbedding
    ? ''
    : await buildPdfFontCss({
        lang: input.localeHint ?? 'en',
        textForSubset: buildFontSelectionText(input),
      });
  const size = PAPER_SIZES[input.paperSize];
  return `
  ${fontCss}
  @page { size: ${input.paperSize} portrait; margin: 0; }
  :root {
    --page-w: ${size.widthMm}mm;
    --page-h: ${size.heightMm}mm;
    --page-pad: 12mm;
    --footer-h: 10mm;
    --gap: 6mm;
    --border: rgba(0,0,0,0.12);
    --text: #111;
    --muted: #666;
  }
  html, body {
    margin: 0;
    padding: 0;
    color: var(--text);
    background: #fff;
    font-family: ${pdfFontStack};
    font-size: 11pt;
    line-height: 1.35;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: var(--page-w);
    height: var(--page-h);
    box-sizing: border-box;
    padding: var(--page-pad);
    background: #fff;
    break-after: page;
    page-break-after: always;
  }
  .page-inner {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }
  .page-main {
    flex: 1;
    min-height: 0;
  }
  .page-footer {
    height: var(--footer-h);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 9pt;
    color: var(--muted);
    border-top: 1px solid rgba(0,0,0,0.08);
    padding-top: 2mm;
  }
  .report-title {
    text-align: center;
    font-size: 24pt;
    font-weight: 800;
    margin: 0 0 6mm 0;
    padding-bottom: 4mm;
    border-bottom: 2px solid rgba(0,0,0,0.75);
  }
  .meta-grid {
    display: grid;
    grid-template-columns: 32mm 1fr;
    column-gap: 6mm;
    row-gap: 3mm;
    text-align: start;
    margin-bottom: 6mm;
  }
  .meta-k {
    font-weight: 700;
    color: #444;
  }
  .meta-v {
    font-weight: 600;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .section-title {
    margin: 0 0 3mm 0;
    font-size: 13pt;
    font-weight: 800;
    color: #333;
    border-left: 5px solid rgba(0,0,0,0.65);
    padding-left: 3mm;
  }
  .comment-text {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    font-size: 11pt;
    line-height: 1.45;
  }
  .comment-block {
    margin-top: 6mm;
    padding: 5mm;
    border: 1px solid rgba(0,0,0,0.10);
    border-radius: 3mm;
    background: #fafafa;
  }
  .no-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .photo-grid {
    height: 100%;
    display: grid;
    gap: var(--gap);
  }
  .photo-grid.two {
    grid-template-rows: 1fr 1fr;
  }
  .photo-grid.one {
    grid-template-rows: 1fr;
  }
  .photo-slot {
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .photo-slot.empty {
    border: 1px dashed rgba(0,0,0,0.10);
    border-radius: 3mm;
  }
  .photo-frame {
    flex: 1;
    min-height: 0;
    border: 1px solid var(--border);
    border-radius: 3mm;
    background: #fff;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .photo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .photo-no {
    text-align: right;
    font-size: 8pt;
    color: #666;
    padding-top: 1mm;
    padding-right: 2mm;
    line-height: 1;
  }
  .photo-caption {
    padding: 2mm 2mm 0;
    font-size: 9pt;
    line-height: 1.35;
    color: #333;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .watermark {
    position: absolute;
    right: var(--page-pad);
    bottom: calc(var(--page-pad) + var(--footer-h));
    font-size: 9pt;
    color: rgba(0,0,0,0.25);
  }
  `;
};

export async function buildPdfHtml(input: PdfTemplateInput) {
  const layout = input.layout === 'large' ? 'large' : 'standard';
  const perPage = layout === 'large' ? 1 : 2;
  const css = await buildCss(input);
  const comment = input.report.comment ?? '';
  const isCommentOnCover = comment.length <= COVER_COMMENT_CHAR_LIMIT;
  const commentPageCount = isCommentOnCover ? 0 : splitCommentIntoPages(comment).length;
  const photoPageCount = Math.ceil(input.photos.length / perPage);
  const pageCount = 1 + commentPageCount + photoPageCount;
  const cover = buildCover(input, pageCount, isCommentOnCover ? comment : undefined);
  const commentPageHtml = isCommentOnCover ? [] : buildCommentPages(input, 2, pageCount);
  const photoStartIndex = 2 + commentPageHtml.length;
  const photoPages = await buildPhotoPages(input, photoStartIndex, perPage, pageCount);
  const lang = escapeHtml(input.localeHint ?? 'en');

  return `
  <!DOCTYPE html>
  <html lang="${lang}">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        ${css}
      </style>
    </head>
    <body>
      ${cover}
      ${commentPageHtml.join('')}
      ${photoPages.join('')}
    </body>
  </html>
  `;
}
