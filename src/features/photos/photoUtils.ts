export const MAX_FREE_PHOTOS_PER_REPORT = 10;

export const getRemainingPhotoSlots = (isPro: boolean, currentCount: number) => {
  if (isPro) return Number.POSITIVE_INFINITY;
  return Math.max(0, MAX_FREE_PHOTOS_PER_REPORT - currentCount);
};

export const resolvePhotoAddLimit = (
  isPro: boolean,
  currentCount: number,
  addCount: number,
) => {
  const remaining = getRemainingPhotoSlots(isPro, currentCount);
  const allowedCount = Math.max(0, Math.min(addCount, remaining));
  return {
    allowedCount,
    blocked: allowedCount < addCount,
  };
};
