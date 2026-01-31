import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

import type { Photo } from '@/src/types/models';
import { listPhotosByReport, createPhoto } from '@/src/db/photoRepository';
import { resolvePhotoAddLimit } from '@/src/features/photos/photoUtils';

const PHOTO_DIR_ROOT = 'repolog/reports';
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

type AddPhotoResult = {
  photos: Photo[];
  blocked: boolean;
  canceled: boolean;
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

const buildTargetPath = (dir: string, name: string) => `${dir}${name}.jpg`;

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
  const result = await resizeIfNeeded(asset);
  const targetPath = buildTargetPath(dir, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  await FileSystem.moveAsync({ from: result.uri, to: targetPath });
  return {
    uri: targetPath,
    width: result.width ?? asset.width ?? null,
    height: result.height ?? asset.height ?? null,
  };
};

const addAssetsToReport = async (
  reportId: string,
  assets: ImagePicker.ImagePickerAsset[],
  isPro: boolean,
): Promise<AddPhotoResult> => {
  if (assets.length === 0) {
    return { photos: [], blocked: false, canceled: false };
  }

  const existing = await listPhotosByReport(reportId);
  const { allowedCount, blocked } = resolvePhotoAddLimit(isPro, existing.length, assets.length);

  const toAdd = assets.slice(0, allowedCount);
  const added: Photo[] = [];
  for (let i = 0; i < toAdd.length; i += 1) {
    const asset = toAdd[i];
    const stored = await persistAsset(reportId, asset);
    const photo = await createPhoto({
      reportId,
      localUri: stored.uri,
      width: stored.width,
      height: stored.height,
      orderIndex: existing.length + i,
    });
    added.push(photo);
  }

  return {
    photos: added,
    blocked,
    canceled: false,
  };
};

export async function addPhotosFromCamera(
  reportId: string,
  isPro: boolean,
): Promise<AddPhotoResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { photos: [], blocked: false, canceled: false, reason: 'permission' };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled) {
    return { photos: [], blocked: false, canceled: true };
  }

  return addAssetsToReport(reportId, result.assets ?? [], isPro);
}

export async function addPhotosFromLibrary(
  reportId: string,
  isPro: boolean,
): Promise<AddPhotoResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { photos: [], blocked: false, canceled: false, reason: 'permission' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: 0,
    quality: 1,
  });

  if (result.canceled) {
    return { photos: [], blocked: false, canceled: true };
  }

  return addAssetsToReport(reportId, result.assets ?? [], isPro);
}
