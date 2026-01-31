import type { Photo, Report } from '@/src/types/models';

export type PaperSize = 'A4' | 'Letter';
export type PdfLayout = 'standard' | 'large';

export const PAPER_SIZES = {
  A4: { widthMm: 210, heightMm: 297 },
  Letter: { widthMm: 216, heightMm: 279 },
} as const;

export const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm';

export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (value: number) => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const splitCommentIntoPages = (comment: string, charsPerPage = 1200) => {
  if (!comment) return [''];
  const chars = Array.from(comment);
  const pages: string[] = [];
  for (let i = 0; i < chars.length; i += charsPerPage) {
    pages.push(chars.slice(i, i + charsPerPage).join(''));
  }
  return pages;
};

export const chunkPhotos = (photos: Photo[], perPage: number) => {
  const chunks: Photo[][] = [];
  for (let i = 0; i < photos.length; i += perPage) {
    chunks.push(photos.slice(i, i + perPage));
  }
  return chunks;
};

export const normalizeLayout = (layout: PdfLayout) => layout;

export const photoLabel = (index: number) => `Photo ${index + 1}`;

export const reportTitle = (report: Report) => report.reportName ?? 'Untitled Report';
