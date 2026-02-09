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

export function isPhotoOrderNormalized(photos: Photo[]): boolean {
  return photos.every((photo, index) => photo.orderIndex === index);
}
