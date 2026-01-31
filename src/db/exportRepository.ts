import { getDb } from './db';

export type ExportInput = {
  reportId: string;
  exportedAt: string;
  layoutMode: 'standard' | 'large';
  pageCount: number;
  photoCount: number;
  paperSize: 'A4' | 'Letter';
  planAtExport: 'free' | 'pro';
};

const createId = () => {
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `x_${now}_${rand}`;
};

export async function recordExport(input: ExportInput): Promise<void> {
  const db = await getDb();
  const id = createId();
  await db.runAsync(
    `INSERT INTO exports (
      id, report_id, exported_at, layout_mode, page_count, photo_count, paper_size, plan_at_export
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.reportId,
    input.exportedAt,
    input.layoutMode,
    input.pageCount,
    input.photoCount,
    input.paperSize,
    input.planAtExport,
  );
}

export async function countExportsSince(isoStart: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exports WHERE exported_at >= ?',
    isoStart,
  );
  return row?.count ?? 0;
}
