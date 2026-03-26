import type { Photo } from '@/src/types/models';

export function normalizePhotoOrder(photos: Photo[]): Photo[] {
  return photos.map((photo, index) => ({
    ...photo,
    orderIndex: index,
  }));
}

export function removePhotoAndNormalize(photos: Photo[], photoId: string): Photo[] {
  return normalizePhotoOrder(photos.filter((photo) => photo.id !== photoId));
}

export function restorePhotoAtIndexAndNormalize(
  photos: Photo[],
  photo: Photo,
  targetIndex: number,
): Photo[] {
  const index = Math.max(0, Math.min(targetIndex, photos.length));
  const next = [...photos];
  next.splice(index, 0, photo);
  return normalizePhotoOrder(next);
}

export function isPhotoOrderNormalized(photos: Photo[]): boolean {
  return photos.every((photo, index) => photo.orderIndex === index);
}

export function swapPhotos(photos: Photo[], fromIndex: number, toIndex: number): Photo[] {
  if (
    fromIndex < 0 ||
    fromIndex >= photos.length ||
    toIndex < 0 ||
    toIndex >= photos.length ||
    fromIndex === toIndex
  ) {
    return photos;
  }
  const next = [...photos];
  const temp = next[fromIndex];
  next[fromIndex] = next[toIndex];
  next[toIndex] = temp;
  return normalizePhotoOrder(next);
}
