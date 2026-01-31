import { getRemainingPhotoSlots, resolvePhotoAddLimit, MAX_FREE_PHOTOS_PER_REPORT } from '@/src/features/photos/photoUtils';

describe('photoUtils', () => {
  test('getRemainingPhotoSlots respects free limit', () => {
    expect(getRemainingPhotoSlots(false, 0)).toBe(MAX_FREE_PHOTOS_PER_REPORT);
    expect(getRemainingPhotoSlots(false, 9)).toBe(1);
    expect(getRemainingPhotoSlots(false, 10)).toBe(0);
  });

  test('getRemainingPhotoSlots is infinite for Pro', () => {
    expect(getRemainingPhotoSlots(true, 10)).toBe(Number.POSITIVE_INFINITY);
  });

  test('resolvePhotoAddLimit caps additions for Free', () => {
    const result = resolvePhotoAddLimit(false, 9, 3);
    expect(result.allowedCount).toBe(1);
    expect(result.blocked).toBe(true);
  });

  test('resolvePhotoAddLimit allows all for Pro', () => {
    const result = resolvePhotoAddLimit(true, 9, 3);
    expect(result.allowedCount).toBe(3);
    expect(result.blocked).toBe(false);
  });
});
