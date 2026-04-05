import type { Photo } from '@/src/types/models';
import {
  isPhotoOrderNormalized,
  normalizePhotoOrder,
  removePhotoAndNormalize,
  restorePhotoAtIndexAndNormalize,
  swapPhotos,
} from '@/src/features/reports/photoOrderUtils';

const buildPhoto = (id: string, orderIndex: number): Photo => ({
  id,
  reportId: 'r_1',
  localUri: `/tmp/${id}.jpg`,
  width: 100,
  height: 100,
  createdAt: '2026-01-01T00:00:00.000Z',
  orderIndex,
  caption: null,
});

describe('photoOrderUtils', () => {
  test('normalizePhotoOrder reassigns sequential indices', () => {
    const photos = [buildPhoto('p1', 4), buildPhoto('p2', 8)];

    const result = normalizePhotoOrder(photos);

    expect(result.map((photo) => photo.orderIndex)).toEqual([0, 1]);
    expect(result.map((photo) => photo.id)).toEqual(['p1', 'p2']);
  });

  test('removePhotoAndNormalize removes target and compacts indices', () => {
    const photos = [buildPhoto('p1', 0), buildPhoto('p2', 1), buildPhoto('p3', 2)];

    const result = removePhotoAndNormalize(photos, 'p2');

    expect(result.map((photo) => photo.id)).toEqual(['p1', 'p3']);
    expect(result.map((photo) => photo.orderIndex)).toEqual([0, 1]);
  });

  test('restorePhotoAtIndexAndNormalize inserts photo at given position', () => {
    const photos = [buildPhoto('p1', 0), buildPhoto('p3', 1)];

    const result = restorePhotoAtIndexAndNormalize(photos, buildPhoto('p2', 99), 1);

    expect(result.map((photo) => photo.id)).toEqual(['p1', 'p2', 'p3']);
    expect(result.map((photo) => photo.orderIndex)).toEqual([0, 1, 2]);
  });

  test('isPhotoOrderNormalized validates index continuity', () => {
    expect(isPhotoOrderNormalized([buildPhoto('p1', 0), buildPhoto('p2', 1)])).toBe(true);
    expect(isPhotoOrderNormalized([buildPhoto('p1', 0), buildPhoto('p2', 4)])).toBe(false);
  });

  test('swapPhotos swaps first and second items', () => {
    const photos = [buildPhoto('p1', 0), buildPhoto('p2', 1), buildPhoto('p3', 2)];
    const result = swapPhotos(photos, 0, 1);
    expect(result.map((p) => p.id)).toEqual(['p2', 'p1', 'p3']);
    expect(result.map((p) => p.orderIndex)).toEqual([0, 1, 2]);
  });

  test('swapPhotos swaps last two items', () => {
    const photos = [buildPhoto('p1', 0), buildPhoto('p2', 1), buildPhoto('p3', 2)];
    const result = swapPhotos(photos, 2, 1);
    expect(result.map((p) => p.id)).toEqual(['p1', 'p3', 'p2']);
    expect(result.map((p) => p.orderIndex)).toEqual([0, 1, 2]);
  });

  test('swapPhotos returns original array for out-of-range index', () => {
    const photos = [buildPhoto('p1', 0)];
    const result = swapPhotos(photos, 0, 1);
    expect(result).toBe(photos);
  });

  test('swapPhotos returns original array for same index', () => {
    const photos = [buildPhoto('p1', 0), buildPhoto('p2', 1)];
    const result = swapPhotos(photos, 1, 1);
    expect(result).toBe(photos);
  });

  test('swapPhotos returns original array for negative index', () => {
    const photos = [buildPhoto('p1', 0), buildPhoto('p2', 1)];
    const result = swapPhotos(photos, -1, 0);
    expect(result).toBe(photos);
  });
});
