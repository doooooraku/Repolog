export const SCHEMA_VERSION = 1;

export const schemaV1 = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  report_name TEXT,
  weather TEXT NOT NULL DEFAULT 'none',
  location_enabled INTEGER NOT NULL DEFAULT 0,
  lat REAL,
  lng REAL,
  lat_lng_captured_at TEXT,
  address TEXT,
  address_source TEXT,
  address_locale TEXT,
  comment TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  pinned INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY NOT NULL,
  report_id TEXT NOT NULL,
  local_uri TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON reports(updated_at);
CREATE INDEX IF NOT EXISTS idx_photos_report_order ON photos(report_id, order_index);
`;
