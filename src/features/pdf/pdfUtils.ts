import type { Photo, Report } from '@/src/types/models';

export type PaperSize = 'A4' | 'Letter';
export type PdfLayout = 'standard' | 'large';

export const PAPER_SIZES = {
  A4: { widthMm: 210, heightMm: 297 },
  Letter: { widthMm: 216, heightMm: 279 },
} as const;

export const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const FILE_NAME_FORBIDDEN_CHARS = /[\/\\:*?"<>|]/g;
const FILE_NAME_SPACES = /\s+/g;
const FILE_NAME_DUPLICATED_UNDERSCORES = /_+/g;
const FILE_NAME_EDGE_UNDERSCORES = /^_+|_+$/g;
const MAX_FILE_NAME_REPORT_PART_LENGTH = 30;

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

export const calculatePageCount = (comment: string, photoCount: number, layout: PdfLayout) => {
  const commentPages = splitCommentIntoPages(comment);
  const perPage = layout === 'large' ? 1 : 2;
  const photoPages = Math.ceil(photoCount / perPage);
  return 1 + commentPages.length + photoPages;
};

const normalizeFileNamePart = (value: string, maxLength?: number) => {
  const normalized = value
    .trim()
    .replace(FILE_NAME_FORBIDDEN_CHARS, '_')
    .replace(FILE_NAME_SPACES, '_')
    .replace(FILE_NAME_DUPLICATED_UNDERSCORES, '_')
    .replace(FILE_NAME_EDGE_UNDERSCORES, '');
  if (!maxLength) return normalized;
  return normalized.slice(0, maxLength);
};

const formatFileNameTimestamp = (iso: string) => {
  const date = new Date(iso);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const pad = (value: number) => String(value).padStart(2, '0');
  const year = safeDate.getFullYear();
  const month = pad(safeDate.getMonth() + 1);
  const day = pad(safeDate.getDate());
  const hours = pad(safeDate.getHours());
  const minutes = pad(safeDate.getMinutes());
  return `${year}${month}${day}_${hours}${minutes}`;
};

export const buildPdfExportFileName = (params: {
  createdAt: string;
  reportName?: string | null;
  appName?: string;
}) => {
  const appPart = normalizeFileNamePart(params.appName ?? 'Repolog') || 'Repolog';
  const reportPart = normalizeFileNamePart(
    params.reportName ?? '',
    MAX_FILE_NAME_REPORT_PART_LENGTH,
  );
  const timestamp = formatFileNameTimestamp(params.createdAt);
  if (reportPart.length === 0) {
    return `${timestamp}_${appPart}.pdf`;
  }
  return `${timestamp}_${reportPart}_${appPart}.pdf`;
};
