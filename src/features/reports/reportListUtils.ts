import type { Report } from '@/src/types/models';

export type ReportSection = {
  title: string;
  data: Report[];
};

const normalizeSearchText = (value: string) => value.trim().toLowerCase();

export const matchesQuery = (report: Report, query: string) => {
  const text = normalizeSearchText(query);
  if (!text) return true;
  const name = report.reportName ?? '';
  const comment = report.comment ?? '';
  return (
    name.toLowerCase().includes(text) ||
    comment.toLowerCase().includes(text)
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
