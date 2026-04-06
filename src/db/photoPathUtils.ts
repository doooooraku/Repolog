import * as FileSystem from 'expo-file-system/legacy';

const PHOTO_PATH_ANCHOR = 'repolog/reports/';

/** Absolute → relative path. Idempotent (returns relative paths unchanged). */
export function toRelativePath(uri: string): string {
  if (!uri.startsWith('file://') && !uri.startsWith('/')) return uri;
  const idx = uri.indexOf(PHOTO_PATH_ANCHOR);
  return idx === -1 ? uri : uri.substring(idx);
}

/** Relative → absolute path. Idempotent (returns absolute paths unchanged). */
export function toAbsolutePath(relativePath: string): string {
  if (relativePath.startsWith('file://') || relativePath.startsWith('/')) return relativePath;
  const docDir = FileSystem.documentDirectory;
  if (!docDir) throw new Error('Document directory not available.');
  return `${docDir}${relativePath}`;
}
