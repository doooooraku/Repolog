import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { unzip, zip } from 'react-native-zip-archive';

import { getDb } from '@/src/db/db';
import { listReports } from '@/src/db/reportRepository';
import { listAllPhotos } from '@/src/db/photoRepository';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { getLang, setLang } from '@/src/core/i18n/i18n';
import {
  clampComment,
  normalizeAddressSource,
  normalizeTags,
  normalizeWeather,
  roundCoordinate,
} from '@/src/features/reports/reportUtils';
import { buildAppendImportPlan } from '@/src/features/backup/backupImportPlanner';
import type { AddressSource, WeatherType } from '@/src/types/models';

const BACKUP_SCHEMA_VERSION = 1;
const BACKUP_MANIFEST = 'manifest.json';
const BACKUP_PHOTOS_DIR = 'photos';
const PHOTO_ROOT = 'repolog/reports';

export type BackupManifest = {
  schemaVersion: number;
  exportedAt: string;
  appVersion?: string | null;
  reports: BackupReport[];
  photos: BackupPhoto[];
  settings: BackupSettings;
  tagHistory?: string[];
  reportNameHistory?: string[];
};

export type BackupReport = {
  id: string;
  createdAt: string;
  updatedAt: string;
  reportName: string | null;
  weather: WeatherType;
  locationEnabledAtCreation: boolean;
  lat: number | null;
  lng: number | null;
  latLngCapturedAt: string | null;
  address: string | null;
  addressSource: AddressSource | null;
  addressLocale: string | null;
  comment: string;
  tags: string[];
  pinned: boolean;
};

export type BackupPhoto = {
  id: string;
  reportId: string;
  fileName: string;
  width: number | null;
  height: number | null;
  createdAt: string;
  orderIndex: number;
};

export type BackupSettings = {
  includeLocation: boolean;
  language: string;
};

export type BackupImportResult = {
  reports: number;
  photos: number;
};

type BackupErrorCode = 'unsupported' | 'invalid' | 'schema' | 'share';

export class BackupError extends Error {
  code: BackupErrorCode;

  constructor(code: BackupErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const getDocumentDirectory = () => FileSystem.documentDirectory;

const getCacheDirectory = () => FileSystem.cacheDirectory;

const stripFileScheme = (uri: string) => uri.replace(/^file:\/\//, '');

const ensureDir = async (uri: string) => {
  await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
};

const getReportPhotoDir = (reportId: string) => {
  const documentDirectory = getDocumentDirectory();
  if (!documentDirectory) return null;
  return `${documentDirectory}${PHOTO_ROOT}/${reportId}/photos/`;
};

const getBackupRoot = () => {
  const cacheDirectory = getCacheDirectory();
  if (!cacheDirectory) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${cacheDirectory}repolog-backup-${stamp}/`;
};

const buildManifest = (reports: BackupReport[], photos: BackupPhoto[]): BackupManifest => {
  const includeLocation = useSettingsStore.getState().includeLocation;
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: Constants.expoConfig?.version ?? null,
    reports,
    photos,
    settings: {
      includeLocation,
      language: getLang(),
    },
    tagHistory: [],
    reportNameHistory: [],
  };
};

const findManifestRoot = async (baseDir: string) => {
  const directPath = `${baseDir}${BACKUP_MANIFEST}`;
  const directInfo = await FileSystem.getInfoAsync(directPath);
  if (directInfo.exists) return baseDir;

  const entries = await FileSystem.readDirectoryAsync(baseDir);
  for (const entry of entries) {
    const candidate = `${baseDir}${entry}/`;
    const candidateInfo = await FileSystem.getInfoAsync(`${candidate}${BACKUP_MANIFEST}`);
    if (candidateInfo.exists) {
      return candidate;
    }
  }

  return null;
};

export async function exportBackup(): Promise<void> {
  if (Platform.OS === 'web') {
    throw new BackupError('unsupported');
  }
  const sharingAvailable = await Sharing.isAvailableAsync();
  if (!sharingAvailable) {
    throw new BackupError('share');
  }

  const backupRoot = getBackupRoot();
  if (!backupRoot) {
    throw new BackupError('unsupported');
  }
  const photosDir = `${backupRoot}${BACKUP_PHOTOS_DIR}/`;
  await ensureDir(photosDir);

  const reports = await listReports();
  const photos = await listAllPhotos();

  const backupReports: BackupReport[] = reports.map((report) => ({
    id: report.id,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    reportName: report.reportName ?? null,
    weather: report.weather,
    locationEnabledAtCreation: report.locationEnabledAtCreation,
    lat: report.lat,
    lng: report.lng,
    latLngCapturedAt: report.latLngCapturedAt ?? null,
    address: report.address ?? null,
    addressSource: report.addressSource ?? null,
    addressLocale: report.addressLocale ?? null,
    comment: report.comment ?? '',
    tags: report.tags ?? [],
    pinned: report.pinned,
  }));

  const backupPhotos: BackupPhoto[] = [];
  for (const photo of photos) {
    const fileName = `${photo.id}.jpg`;
    const targetPath = `${photosDir}${fileName}`;
    const info = await FileSystem.getInfoAsync(photo.localUri);
    if (!info.exists) {
      throw new BackupError('invalid', 'Missing photo file');
    }
    await FileSystem.copyAsync({ from: photo.localUri, to: targetPath });
    backupPhotos.push({
      id: photo.id,
      reportId: photo.reportId,
      fileName,
      width: photo.width ?? null,
      height: photo.height ?? null,
      createdAt: photo.createdAt,
      orderIndex: photo.orderIndex,
    });
  }

  const manifest = buildManifest(backupReports, backupPhotos);
  await FileSystem.writeAsStringAsync(
    `${backupRoot}${BACKUP_MANIFEST}`,
    JSON.stringify(manifest, null, 2),
  );

  const zipPath = `${backupRoot.replace(/\/$/, '')}.zip`;
  await zip(stripFileScheme(backupRoot), stripFileScheme(zipPath));

  try {
    await Sharing.shareAsync(zipPath, {
      mimeType: 'application/zip',
      UTI: 'public.zip-archive',
    });
  } finally {
    await FileSystem.deleteAsync(backupRoot, { idempotent: true });
    await FileSystem.deleteAsync(zipPath, { idempotent: true });
  }
}

export async function importBackup(): Promise<BackupImportResult | null> {
  if (Platform.OS === 'web') {
    throw new BackupError('unsupported');
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/zip',
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) {
    throw new BackupError('invalid');
  }

  const cacheDirectory = getCacheDirectory();
  if (!cacheDirectory) {
    throw new BackupError('unsupported');
  }

  const importRoot = `${cacheDirectory}repolog-import-${Date.now()}/`;
  await ensureDir(importRoot);

  try {
    await unzip(stripFileScheme(asset.uri), stripFileScheme(importRoot));

    const manifestRoot = await findManifestRoot(importRoot);
    if (!manifestRoot) {
      throw new BackupError('invalid');
    }

    const manifestPath = `${manifestRoot}${BACKUP_MANIFEST}`;
    const raw = await FileSystem.readAsStringAsync(manifestPath);
    const manifest = JSON.parse(raw) as BackupManifest;

    if (manifest.schemaVersion !== BACKUP_SCHEMA_VERSION) {
      throw new BackupError('schema');
    }
    if (!Array.isArray(manifest.reports) || !Array.isArray(manifest.photos)) {
      throw new BackupError('invalid');
    }

    const photosDir = `${manifestRoot}${BACKUP_PHOTOS_DIR}/`;
    const photosDirInfo = await FileSystem.getInfoAsync(photosDir);
    if (!photosDirInfo.exists) {
      throw new BackupError('invalid');
    }

    const db = await getDb();
    const existingReportRows = await db.getAllAsync<{ id: string }>('SELECT id FROM reports');
    const existingPhotoRows = await db.getAllAsync<{ id: string }>('SELECT id FROM photos');

    const plan = buildAppendImportPlan({
      reports: manifest.reports,
      photos: manifest.photos,
      existingReportIds: new Set(existingReportRows.map((row) => row.id)),
      existingPhotoIds: new Set(existingPhotoRows.map((row) => row.id)),
    });
    if (plan.invalidPhotoRefs.length > 0) {
      throw new BackupError('invalid');
    }

    for (const photo of plan.photosToInsert) {
      const sourcePath = `${photosDir}${photo.fileName}`;
      const sourceInfo = await FileSystem.getInfoAsync(sourcePath);
      if (!sourceInfo.exists) {
        throw new BackupError('invalid');
      }
    }

    const copiedPhotoPaths: string[] = [];
    try {
      await db.withTransactionAsync(async () => {
        for (const report of plan.reportsToInsert) {
          const weather = normalizeWeather(report.weather ?? 'none');
          const addressSource = normalizeAddressSource(report.addressSource ?? null);
          const tags = normalizeTags(report.tags ?? []);
          await db.runAsync(
            `INSERT INTO reports (
              id, created_at, updated_at, report_name, weather, location_enabled,
              lat, lng, lat_lng_captured_at, address, address_source, address_locale,
              comment, tags_json, pinned
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            report.id,
            report.createdAt,
            report.updatedAt,
            report.reportName ?? null,
            weather,
            report.locationEnabledAtCreation ? 1 : 0,
            roundCoordinate(report.lat ?? null),
            roundCoordinate(report.lng ?? null),
            report.latLngCapturedAt ?? null,
            report.address ?? null,
            addressSource,
            report.addressLocale ?? null,
            clampComment(report.comment ?? ''),
            JSON.stringify(tags),
            report.pinned ? 1 : 0,
          );
        }

        for (const photo of plan.photosToInsert) {
          const targetDir = getReportPhotoDir(photo.reportId);
          if (!targetDir) {
            throw new BackupError('unsupported');
          }
          await ensureDir(targetDir);
          const targetPath = `${targetDir}${photo.fileName}`;
          const sourcePath = `${photosDir}${photo.fileName}`;
          await FileSystem.deleteAsync(targetPath, { idempotent: true });
          await FileSystem.copyAsync({ from: sourcePath, to: targetPath });
          copiedPhotoPaths.push(targetPath);
          await db.runAsync(
            `INSERT INTO photos (
              id, report_id, local_uri, width, height, created_at, order_index
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            photo.id,
            photo.reportId,
            targetPath,
            photo.width ?? null,
            photo.height ?? null,
            photo.createdAt,
            photo.orderIndex,
          );
        }
      });
    } catch (error) {
      for (const path of copiedPhotoPaths) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
      throw error;
    }

    if (manifest.settings?.includeLocation !== undefined) {
      useSettingsStore.getState().setIncludeLocation(Boolean(manifest.settings.includeLocation));
    }
    if (manifest.settings?.language) {
      setLang(manifest.settings.language as any);
    }

    return {
      reports: plan.reportsToInsert.length,
      photos: plan.photosToInsert.length,
    };
  } finally {
    await FileSystem.deleteAsync(importRoot, { idempotent: true });
  }
}
