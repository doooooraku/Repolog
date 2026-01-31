import { getDb } from './db';
import type { NewPhotoInput, Photo, UpdatePhotoInput } from '@/src/types/models';

const PHOTO_COLUMNS = [
  'id',
  'report_id',
  'local_uri',
  'width',
  'height',
  'created_at',
  'order_index',
] as const;

type PhotoRow = {
  id: string;
  report_id: string;
  local_uri: string;
  width: number | null;
  height: number | null;
  created_at: string;
  order_index: number;
};

const toPhoto = (row: PhotoRow): Photo => ({
  id: row.id,
  reportId: row.report_id,
  localUri: row.local_uri,
  width: row.width,
  height: row.height,
  createdAt: row.created_at,
  orderIndex: row.order_index,
});

const createId = () => {
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `p_${now}_${rand}`;
};

export async function listPhotosByReport(reportId: string): Promise<Photo[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS.join(', ')} FROM photos WHERE report_id = ? ORDER BY order_index ASC`,
    reportId,
  );
  return rows.map(toPhoto);
}

export async function listAllPhotos(): Promise<Photo[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS.join(', ')} FROM photos ORDER BY report_id ASC, order_index ASC`,
  );
  return rows.map(toPhoto);
}

export async function getFirstPhotosByReportIds(
  reportIds: string[],
): Promise<Record<string, Photo>> {
  if (reportIds.length === 0) return {};
  const db = await getDb();
  const placeholders = reportIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS.join(', ')} FROM photos
     WHERE report_id IN (${placeholders})
     ORDER BY report_id ASC, order_index ASC`,
    ...reportIds,
  );
  const map: Record<string, Photo> = {};
  rows.forEach((row) => {
    if (!map[row.report_id]) {
      map[row.report_id] = toPhoto(row);
    }
  });
  return map;
}

export async function countPhotosByReportIds(
  reportIds: string[],
): Promise<Record<string, number>> {
  if (reportIds.length === 0) return {};
  const db = await getDb();
  const placeholders = reportIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<{ report_id: string; count: number }>(
    `SELECT report_id, COUNT(*) as count FROM photos
     WHERE report_id IN (${placeholders})
     GROUP BY report_id`,
    ...reportIds,
  );
  const map: Record<string, number> = {};
  rows.forEach((row) => {
    map[row.report_id] = row.count;
  });
  return map;
}

export async function createPhoto(input: NewPhotoInput): Promise<Photo> {
  const id = createId();
  const createdAt = input.createdAt ?? new Date().toISOString();
  const width = input.width ?? null;
  const height = input.height ?? null;

  const db = await getDb();
  await db.runAsync(
    `INSERT INTO photos (
      id, report_id, local_uri, width, height, created_at, order_index
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.reportId,
    input.localUri,
    width,
    height,
    createdAt,
    input.orderIndex,
  );

  return {
    id,
    reportId: input.reportId,
    localUri: input.localUri,
    width,
    height,
    createdAt,
    orderIndex: input.orderIndex,
  };
}

export async function updatePhoto(input: UpdatePhotoInput): Promise<Photo | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS.join(', ')} FROM photos WHERE id = ?`,
    input.id,
  );
  if (!row) return null;

  const next: Photo = {
    id: row.id,
    reportId: row.report_id,
    localUri: input.localUri ?? row.local_uri,
    width: input.width !== undefined ? input.width : row.width,
    height: input.height !== undefined ? input.height : row.height,
    createdAt: row.created_at,
    orderIndex: input.orderIndex ?? row.order_index,
  };

  await db.runAsync(
    `UPDATE photos SET
      local_uri = ?,
      width = ?,
      height = ?,
      order_index = ?
    WHERE id = ?`,
    next.localUri,
    next.width,
    next.height,
    next.orderIndex,
    next.id,
  );

  return next;
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM photos WHERE id = ?', id);
}

export async function deletePhotosByReport(reportId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM photos WHERE report_id = ?', reportId);
}
