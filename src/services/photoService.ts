import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

import type { Photo } from '@/src/types/models';
import { listPhotosByReport, createPhoto, deletePhoto } from '@/src/db/photoRepository';
import { resolvePhotoAddLimit } from '@/src/features/photos/photoUtils';

const PHOTO_DIR_ROOT = 'repolog/reports';
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

type AddPhotoResult = {
  photos: Photo[];
  blocked: boolean;
  canceled: boolean;
  failedCount: number;
  reason?: 'permission' | 'error';
};

const getDocumentDirectory = () =>
  FileSystem.Paths?.document?.uri ?? (FileSystem as unknown as { documentDirectory?: string }).documentDirectory;

const ensureReportPhotoDir = async (reportId: string) => {
  const documentDirectory = getDocumentDirectory();
  if (!documentDirectory) {
    throw new Error('Document directory not available.');
  }
  const dir = `${documentDirectory}${PHOTO_DIR_ROOT}/${reportId}/photos/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
};

const getReportPhotoDir = (reportId: string) => {
  const documentDirectory = getDocumentDirectory();
  if (!documentDirectory) return null;
  return `${documentDirectory}${PHOTO_DIR_ROOT}/${reportId}/photos/`;
};

const buildTargetPath = (dir: string, name: string, extension = 'jpg') => `${dir}${name}.${extension}`;

const deriveFileExtension = (uri: string, fallback = 'jpg') => {
  const sanitized = uri.split('?')[0] ?? uri;
  const ext = sanitized.split('.').pop()?.toLowerCase();
  if (!ext || ext.length > 5) return fallback;
  return ext;
};

const transferFileToPath = async (from: string, to: string) => {
  try {
    await FileSystem.copyAsync({ from, to });
    return;
  } catch {
    await FileSystem.moveAsync({ from, to });
  }
};

const resizeIfNeeded = async (asset: ImagePicker.ImagePickerAsset) => {
  const width = asset.width ?? null;
  const height = asset.height ?? null;
  if (!width || !height) {
    return ImageManipulator.manipulateAsync(
      asset.uri,
      [],
      { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
    );
  }

  const maxEdge = Math.max(width, height);
  if (maxEdge <= MAX_EDGE) {
    return ImageManipulator.manipulateAsync(
      asset.uri,
      [],
      { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
    );
  }

  const scale = MAX_EDGE / maxEdge;
  const resize = {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
  return ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );
};

const persistAsset = async (reportId: string, asset: ImagePicker.ImagePickerAsset) => {
  const dir = await ensureReportPhotoDir(reportId);
  const baseName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const targetPath = buildTargetPath(dir, baseName, 'jpg');
  try {
    const result = await resizeIfNeeded(asset);
    await transferFileToPath(result.uri, targetPath);
    return {
      uri: targetPath,
      width: result.width ?? asset.width ?? null,
      height: result.height ?? asset.height ?? null,
    };
  } catch {
    const extension = deriveFileExtension(asset.uri);
    const fallbackPath = buildTargetPath(dir, baseName, extension);
    await transferFileToPath(asset.uri, fallbackPath);
    return {
      uri: fallbackPath,
      width: asset.width ?? null,
      height: asset.height ?? null,
    };
  }
};

const addAssetsToReport = async (
  reportId: string,
  assets: ImagePicker.ImagePickerAsset[],
  isPro: boolean,
): Promise<AddPhotoResult> => {
  if (assets.length === 0) {
    return { photos: [], blocked: false, canceled: false, failedCount: 0 };
  }

  const existing = await listPhotosByReport(reportId);
  const { allowedCount, blocked } = resolvePhotoAddLimit(isPro, existing.length, assets.length);

  const toAdd = assets.slice(0, allowedCount);
  const added: Photo[] = [];
  let failedCount = 0;
  for (let i = 0; i < toAdd.length; i += 1) {
    const asset = toAdd[i];
    try {
      const stored = await persistAsset(reportId, asset);
      const photo = await createPhoto({
        reportId,
        localUri: stored.uri,
        width: stored.width,
        height: stored.height,
        orderIndex: existing.length + added.length,
      });
      added.push(photo);
    } catch {
      failedCount += 1;
    }
  }

  if (added.length === 0 && failedCount > 0) {
    return {
      photos: [],
      blocked,
      canceled: false,
      failedCount,
      reason: 'error',
    };
  }

  return {
    photos: added,
    blocked,
    canceled: false,
    failedCount,
  };
};

export async function consumePendingPhotoSelection(
  reportId: string,
  isPro: boolean,
): Promise<AddPhotoResult | null> {
  try {
    const pending = await ImagePicker.getPendingResultAsync();
    if (!pending) return null;
    if ('code' in pending) {
      return {
        photos: [],
        blocked: false,
        canceled: false,
        failedCount: 0,
        reason: 'error',
      };
    }
    if (pending.canceled) return null;
    return addAssetsToReport(reportId, pending.assets ?? [], isPro);
  } catch {
    return {
      photos: [],
      blocked: false,
      canceled: false,
      failedCount: 0,
      reason: 'error',
    };
  }
}

export async function addPhotosFromCamera(
  reportId: string,
  isPro: boolean,
): Promise<AddPhotoResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { photos: [], blocked: false, canceled: false, failedCount: 0, reason: 'permission' };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled) {
    return { photos: [], blocked: false, canceled: true, failedCount: 0 };
  }

  return addAssetsToReport(reportId, result.assets ?? [], isPro);
}

export async function addPhotosFromLibrary(
  reportId: string,
  isPro: boolean,
): Promise<AddPhotoResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { photos: [], blocked: false, canceled: false, failedCount: 0, reason: 'permission' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: 0,
    quality: 1,
  });

  if (result.canceled) {
    return { photos: [], blocked: false, canceled: true, failedCount: 0 };
  }

  return addAssetsToReport(reportId, result.assets ?? [], isPro);
}

export async function removeReportPhotos(reportId: string, cached?: Photo[]) {
  const photos = cached ?? (await listPhotosByReport(reportId));
  await Promise.all(
    photos.map((photo) =>
      FileSystem.deleteAsync(photo.localUri, { idempotent: true }),
    ),
  );
  const dir = getReportPhotoDir(reportId);
  if (dir) {
    await FileSystem.deleteAsync(dir, { idempotent: true });
  }
}

export async function removePhotoFromReport(reportId: string, photo: Photo) {
  if (photo.reportId !== reportId) {
    throw new Error('Photo delete rejected: report mismatch.');
  }

  await FileSystem.deleteAsync(photo.localUri, { idempotent: true });
  await deletePhoto(photo.id);
}
