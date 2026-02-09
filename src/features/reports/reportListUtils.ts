import type { Report } from '@/src/types/models';

export type ReportSection = {
  title: string;
  data: Report[];
};

export type ReportSearchFilters = {
  query?: string;
  fromDate?: string | null;
  toDate?: string | null;
  tags?: string[];
  pinnedOnly?: boolean;
};

const normalizeSearchText = (value: string) => value.trim().toLowerCase();

export const matchesQuery = (report: Report, query: string) => {
  const text = normalizeSearchText(query);
  if (!text) return true;
  const name = report.reportName ?? '';
  const comment = report.comment ?? '';
  const tags = report.tags.join(' ');
  return (
    name.toLowerCase().includes(text) ||
    comment.toLowerCase().includes(text) ||
    tags.toLowerCase().includes(text)
  );
};

const formatDateKey = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeFilterDate = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
};

const normalizeFilterTags = (tags?: string[]) =>
  (tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);

export const matchesReportFilters = (
  report: Report,
  {
    query = '',
    fromDate,
    toDate,
    tags = [],
    pinnedOnly = false,
  }: ReportSearchFilters,
) => {
  if (pinnedOnly && !report.pinned) return false;
  if (!matchesQuery(report, query)) return false;

  const reportDate = formatDateKey(report.createdAt);
  const normalizedFromDate = normalizeFilterDate(fromDate);
  if (normalizedFromDate && reportDate < normalizedFromDate) {
    return false;
  }
  const normalizedToDate = normalizeFilterDate(toDate);
  if (normalizedToDate && reportDate > normalizedToDate) {
    return false;
  }

  const normalizedTags = normalizeFilterTags(tags);
  if (normalizedTags.length === 0) return true;

  const reportTags = new Set(report.tags.map((tag) => tag.trim().toLowerCase()));
  return normalizedTags.every((tag) => reportTags.has(tag));
};

export const buildTimelineSections = (
  reports: Report[],
  query: string,
  pinnedTitle: string,
): ReportSection[] => {
  const filtered = reports.filter((report) => matchesQuery(report, query));
  const pinned = filtered.filter((report) => report.pinned);
  const others = filtered.filter((report) => !report.pinned);

  const sections: ReportSection[] = [];
  if (pinned.length > 0) {
    sections.push({ title: pinnedTitle, data: pinned });
  }

  const byDate = new Map<string, Report[]>();
  others.forEach((report) => {
    const key = formatDateKey(report.createdAt);
    const current = byDate.get(key) ?? [];
    current.push(report);
    byDate.set(key, current);
  });

  const sortedKeys = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : -1));
  sortedKeys.forEach((key) => {
    const data = byDate.get(key) ?? [];
    sections.push({ title: key, data });
  });

  return sections;
};
