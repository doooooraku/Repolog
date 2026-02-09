import { getDb } from './db';
import type { NewReportInput, Report, UpdateReportInput, AddressSource, WeatherType } from '@/src/types/models';
import { clampComment, normalizeTags, roundCoordinate, normalizeWeather, normalizeAddressSource } from '@/src/features/reports/reportUtils';

const REPORT_COLUMNS = [
  'id',
  'created_at',
  'updated_at',
  'report_name',
  'weather',
  'location_enabled',
  'lat',
  'lng',
  'lat_lng_captured_at',
  'address',
  'address_source',
  'address_locale',
  'comment',
  'tags_json',
  'pinned',
] as const;

type ReportRow = {
  id: string;
  created_at: string;
  updated_at: string;
  report_name: string | null;
  weather: string;
  location_enabled: number;
  lat: number | null;
  lng: number | null;
  lat_lng_captured_at: string | null;
  address: string | null;
  address_source: string | null;
  address_locale: string | null;
  comment: string;
  tags_json: string;
  pinned: number;
};

const toReport = (row: ReportRow): Report => {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags_json);
    if (Array.isArray(parsed)) {
      tags = parsed.filter((tag) => typeof tag === 'string');
    }
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reportName: row.report_name ?? null,
    weather: normalizeWeather(row.weather),
    locationEnabledAtCreation: Boolean(row.location_enabled),
    lat: row.lat,
    lng: row.lng,
    latLngCapturedAt: row.lat_lng_captured_at ?? null,
    address: row.address ?? null,
    addressSource: normalizeAddressSource(row.address_source),
    addressLocale: row.address_locale ?? null,
    comment: row.comment ?? '',
    tags,
    pinned: Boolean(row.pinned),
  };
};

const createId = () => {
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `r_${now}_${rand}`;
};

export async function listReports(): Promise<Report[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ReportRow>(
    `SELECT ${REPORT_COLUMNS.join(', ')} FROM reports ORDER BY pinned DESC, updated_at DESC`,
  );
  return rows.map(toReport);
}

export async function searchReports(query: string): Promise<Report[]> {
  const db = await getDb();
  const text = `%${query.trim()}%`;
  if (!query.trim()) {
    return listReports();
  }
  const rows = await db.getAllAsync<ReportRow>(
    `SELECT ${REPORT_COLUMNS.join(', ')} FROM reports
     WHERE report_name LIKE ? COLLATE NOCASE
        OR comment LIKE ? COLLATE NOCASE
     ORDER BY pinned DESC, updated_at DESC`,
    text,
    text,
  );
  return rows.map(toReport);
}

export async function getLatestReportName(): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ report_name: string | null }>(
    `SELECT report_name
       FROM reports
      WHERE report_name IS NOT NULL
        AND TRIM(report_name) != ''
      ORDER BY updated_at DESC
      LIMIT 1`,
  );
  const reportName = row?.report_name?.trim() ?? '';
  return reportName.length > 0 ? reportName : null;
}

export async function getReportById(id: string): Promise<Report | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ReportRow>(
    `SELECT ${REPORT_COLUMNS.join(', ')} FROM reports WHERE id = ?`,
    id,
  );
  return row ? toReport(row) : null;
}

export async function createReport(input: NewReportInput = {}): Promise<Report> {
  const now = new Date().toISOString();
  const reportName = input.reportName ?? null;
  const weather: WeatherType = normalizeWeather(input.weather ?? 'none');
  const locationEnabledAtCreation = Boolean(input.locationEnabledAtCreation);
  const lat = roundCoordinate(input.lat ?? null);
  const lng = roundCoordinate(input.lng ?? null);
  const latLngCapturedAt = input.latLngCapturedAt ?? null;
  const address = input.address ?? null;
  const addressSource: AddressSource | null = normalizeAddressSource(input.addressSource ?? null);
  const addressLocale = input.addressLocale ?? null;
  const comment = clampComment(input.comment ?? '');
  const tags = normalizeTags(input.tags);
  const pinned = Boolean(input.pinned);
  const id = createId();

  const db = await getDb();
  await db.runAsync(
    `INSERT INTO reports (
      id, created_at, updated_at, report_name, weather, location_enabled,
      lat, lng, lat_lng_captured_at, address, address_source, address_locale,
      comment, tags_json, pinned
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    now,
    now,
    reportName,
    weather,
    locationEnabledAtCreation ? 1 : 0,
    lat,
    lng,
    latLngCapturedAt,
    address,
    addressSource,
    addressLocale,
    comment,
    JSON.stringify(tags),
    pinned ? 1 : 0,
  );

  return {
    id,
    createdAt: now,
    updatedAt: now,
    reportName,
    weather,
    locationEnabledAtCreation,
    lat,
    lng,
    latLngCapturedAt,
    address,
    addressSource,
    addressLocale,
    comment,
    tags,
    pinned,
  };
}

export async function updateReport(input: UpdateReportInput): Promise<Report | null> {
  const existing = await getReportById(input.id);
  if (!existing) return null;

  const next: Report = {
    ...existing,
    reportName: input.reportName ?? existing.reportName,
    weather: input.weather ? normalizeWeather(input.weather) : existing.weather,
    locationEnabledAtCreation:
      input.locationEnabledAtCreation ?? existing.locationEnabledAtCreation,
    lat: input.lat !== undefined ? roundCoordinate(input.lat) : existing.lat,
    lng: input.lng !== undefined ? roundCoordinate(input.lng) : existing.lng,
    latLngCapturedAt: input.latLngCapturedAt ?? existing.latLngCapturedAt,
    address: input.address ?? existing.address,
    addressSource:
      input.addressSource !== undefined
        ? normalizeAddressSource(input.addressSource)
        : existing.addressSource,
    addressLocale: input.addressLocale ?? existing.addressLocale,
    comment: input.comment !== undefined ? clampComment(input.comment) : existing.comment,
    tags: input.tags ? normalizeTags(input.tags) : existing.tags,
    pinned: input.pinned ?? existing.pinned,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };

  const db = await getDb();
  await db.runAsync(
    `UPDATE reports SET
      updated_at = ?,
      report_name = ?,
      weather = ?,
      location_enabled = ?,
      lat = ?,
      lng = ?,
      lat_lng_captured_at = ?,
      address = ?,
      address_source = ?,
      address_locale = ?,
      comment = ?,
      tags_json = ?,
      pinned = ?
    WHERE id = ?`,
    next.updatedAt,
    next.reportName,
    next.weather,
    next.locationEnabledAtCreation ? 1 : 0,
    next.lat,
    next.lng,
    next.latLngCapturedAt,
    next.address,
    next.addressSource,
    next.addressLocale,
    next.comment,
    JSON.stringify(next.tags),
    next.pinned ? 1 : 0,
    next.id,
  );

  return next;
}

export async function deleteReport(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM reports WHERE id = ?', id);
}
