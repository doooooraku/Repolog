import * as FileSystem from 'expo-file-system';

import type { Photo, Report } from '@/src/types/models';
import { buildPdfFontCss, pdfFontStack } from './pdfFonts';
import {
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
  appName?: string;
  weatherLabel?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const guessMime = (uri: string) => {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const fileToDataUri = async (uri: string) => {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  const mime = guessMime(uri);
  return `data:${mime};base64,${base64}`;
};

const buildCover = (input: PdfTemplateInput) => {
  const title = escapeHtml(reportTitle(input.report));
  const createdAt = escapeHtml(formatDateTime(input.report.createdAt));
  const weather = escapeHtml(input.weatherLabel ?? input.report.weather ?? '');
  const location =
    input.report.lat != null && input.report.lng != null
      ? `${input.report.lat}, ${input.report.lng}`
      : '-';
  const address = input.report.address ?? '-';

  return `
    <section class="page">
      <div class="page-inner">
        <div class="page-main">
          <h1 class="title">${title}</h1>
          <div class="meta">
            <div><span class="label">Date</span><span>${createdAt}</span></div>
            <div><span class="label">Weather</span><span>${weather || '-'}</span></div>
            <div><span class="label">Location</span><span>${escapeHtml(location)}</span></div>
            <div><span class="label">Address</span><span>${escapeHtml(address)}</span></div>
          </div>
        </div>
        <div class="page-footer">
          <span>${escapeHtml(input.appName ?? 'Repolog')}</span>
          <span>1</span>
        </div>
        ${input.isPro ? '' : '<div class="watermark">Created by Repolog</div>'}
      </div>
    </section>
  `;
};

const buildCommentPages = (input: PdfTemplateInput, startIndex: number) => {
  const pages = splitCommentIntoPages(input.report.comment ?? '');
  const out: string[] = [];
  pages.forEach((text, index) => {
    const pageNumber = startIndex + index;
    out.push(`
      <section class="page">
        <div class="page-inner">
          <div class="page-main">
            <h2 class="section-title">Comment</h2>
            <div class="comment">${escapeHtml(text || '-')}</div>
          </div>
          <div class="page-footer">
            <span></span>
            <span>${pageNumber}</span>
          </div>
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
) => {
  const chunks = chunkPhotos(input.photos, perPage);
  const out: string[] = [];
  let photoCounter = 0;

  for (let pageIndex = 0; pageIndex < chunks.length; pageIndex += 1) {
    const pageNumber = startIndex + pageIndex;
    const chunk = chunks[pageIndex];
    const slots = await Promise.all(
      chunk.map(async (photo) => {
        const label = photoLabel(photoCounter);
        photoCounter += 1;
        const src = await fileToDataUri(photo.localUri);
        return `
          <div class="photo-slot">
            <div class="photo-label">${escapeHtml(label)}</div>
            <img class="photo" src="${src}" alt="${escapeHtml(label)}" />
          </div>
        `;
      }),
    );

    out.push(`
      <section class="page">
        <div class="page-inner">
          <div class="page-main photo-grid layout-${input.layout}">
            ${slots.join('')}
          </div>
          <div class="page-footer">
            <span></span>
            <span>${pageNumber}</span>
          </div>
        </div>
      </section>
    `);
  }

  return out;
};

const buildCss = async (paperSize: PaperSize) => {
  const fontCss = await buildPdfFontCss();
  const size = PAPER_SIZES[paperSize];
  return `
  ${fontCss}
  @page { size: ${paperSize} portrait; margin: 0; }
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
  .title {
    margin: 0 0 8mm 0;
    font-size: 20pt;
  }
  .meta {
    display: grid;
    gap: 4mm;
    font-size: 11pt;
  }
  .label {
    display: inline-block;
    width: 24mm;
    color: var(--muted);
  }
  .section-title {
    margin: 0 0 4mm 0;
    font-size: 14pt;
  }
  .comment {
    white-space: pre-wrap;
    word-break: break-word;
  }
  .photo-grid {
    display: grid;
    gap: 6mm;
  }
  .photo-grid.layout-standard {
    grid-template-rows: 1fr 1fr;
  }
  .photo-grid.layout-large {
    grid-template-rows: 1fr;
  }
  .photo-slot {
    position: relative;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .photo {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .photo-label {
    position: absolute;
    top: 3mm;
    right: 3mm;
    font-size: 9pt;
    color: var(--muted);
  }
  .watermark {
    position: absolute;
    right: var(--page-pad);
    bottom: calc(var(--page-pad) + var(--footer-h));
    font-size: 9pt;
    color: rgba(0,0,0,0.3);
  }
  `;
};

export async function buildPdfHtml(input: PdfTemplateInput) {
  const layout = input.layout === 'large' ? 'large' : 'standard';
  const perPage = layout === 'large' ? 1 : 2;
  const css = await buildCss(input.paperSize);
  const cover = buildCover(input);
  const commentPages = buildCommentPages(input, 2);
  const photoStartIndex = 2 + commentPages.length;
  const photoPages = await buildPhotoPages(input, photoStartIndex, perPage);

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        ${css}
      </style>
    </head>
    <body>
      ${cover}
      ${commentPages.join('')}
      ${photoPages.join('')}
    </body>
  </html>
  `;
}
