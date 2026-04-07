/**
 * Unit tests for reviewPromptService.
 *
 * - shouldRequestReview() は副作用なしの純粋関数なので、入力→出力で網羅する
 * - maybeRequestReview() は expo-store-review と useSettingsStore をモックして
 *   副作用（OS API 呼び出し / フラグセット / エラー握りつぶし）を検証する
 *
 * 注: jest.mock() のファクトリーは hoist されるため、参照する変数名は `mock` プレフィックスが必須。
 */

const mockIsAvailableAsync = jest.fn();
const mockHasAction = jest.fn();
const mockRequestReview = jest.fn();

jest.mock('expo-store-review', () => ({
  __esModule: true,
  isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
  hasAction: (...args: unknown[]) => mockHasAction(...args),
  requestReview: (...args: unknown[]) => mockRequestReview(...args),
}));

const mockSetReviewPromptShownFreeAt = jest.fn();
const mockSetReviewPromptShownProAt = jest.fn();

const mockStoreState: {
  reviewPromptShownFreeAt: string | null;
  reviewPromptShownProAt: string | null;
  setReviewPromptShownFreeAt: jest.Mock;
  setReviewPromptShownProAt: jest.Mock;
} = {
  reviewPromptShownFreeAt: null,
  reviewPromptShownProAt: null,
  setReviewPromptShownFreeAt: mockSetReviewPromptShownFreeAt,
  setReviewPromptShownProAt: mockSetReviewPromptShownProAt,
};

jest.mock('@/src/stores/settingsStore', () => ({
  useSettingsStore: {
    getState: () => mockStoreState,
  },
}));

import {
  shouldRequestReview,
  maybeRequestReview,
  FREE_THRESHOLD,
  PRO_THRESHOLD,
} from '@/src/services/reviewPromptService';

beforeEach(() => {
  jest.clearAllMocks();
  mockStoreState.reviewPromptShownFreeAt = null;
  mockStoreState.reviewPromptShownProAt = null;
});

/* ---------- shouldRequestReview ---------- */

describe('shouldRequestReview', () => {
  test('Free, count=3, never shown -> null (まだ閾値未満)', () => {
    expect(
      shouldRequestReview({
        isPro: false,
        cumulativeCount: 3,
        reviewPromptShownFreeAt: null,
        reviewPromptShownProAt: null,
      }),
    ).toBeNull();
  });

  test('Free, count=4, never shown -> "free" (閾値ぴったりで発火)', () => {
    expect(
      shouldRequestReview({
        isPro: false,
        cumulativeCount: FREE_THRESHOLD,
        reviewPromptShownFreeAt: null,
        reviewPromptShownProAt: null,
      }),
    ).toBe('free');
  });

  test('Free, count=10, free フラグ既セット -> null', () => {
    expect(
      shouldRequestReview({
        isPro: false,
        cumulativeCount: 10,
        reviewPromptShownFreeAt: '2026-04-01T00:00:00.000Z',
        reviewPromptShownProAt: null,
      }),
    ).toBeNull();
  });

  test('Pro, count=19, never shown -> null', () => {
    expect(
      shouldRequestReview({
        isPro: true,
        cumulativeCount: 19,
        reviewPromptShownFreeAt: null,
        reviewPromptShownProAt: null,
      }),
    ).toBeNull();
  });

  test('Pro, count=20, never shown -> "pro" (閾値ぴったりで発火)', () => {
    expect(
      shouldRequestReview({
        isPro: true,
        cumulativeCount: PRO_THRESHOLD,
        reviewPromptShownFreeAt: null,
        reviewPromptShownProAt: null,
      }),
    ).toBe('pro');
  });

  test('Pro, count=25, pro フラグ既セット -> null', () => {
    expect(
      shouldRequestReview({
        isPro: true,
        cumulativeCount: 25,
        reviewPromptShownFreeAt: null,
        reviewPromptShownProAt: '2026-04-01T00:00:00.000Z',
      }),
    ).toBeNull();
  });

  test('Pro, count=4 では Free 閾値で発火しない（プラン跨ぎ判定の独立性）', () => {
    expect(
      shouldRequestReview({
        isPro: true,
        cumulativeCount: 4,
        reviewPromptShownFreeAt: null,
        reviewPromptShownProAt: null,
      }),
    ).toBeNull();
  });

  test('Pro→Free ダウングレード後, free フラグ未セットなら count=4 で発火する', () => {
    expect(
      shouldRequestReview({
        isPro: false,
        cumulativeCount: 4,
        reviewPromptShownFreeAt: null,
        reviewPromptShownProAt: '2026-04-01T00:00:00.000Z',
      }),
    ).toBe('free');
  });

  test('Free→Pro アップグレード後, free フラグ既セットでも count=20 で pro 発火する', () => {
    expect(
      shouldRequestReview({
        isPro: true,
        cumulativeCount: 20,
        reviewPromptShownFreeAt: '2026-04-01T00:00:00.000Z',
        reviewPromptShownProAt: null,
      }),
    ).toBe('pro');
  });

  test('Free, count=5 でも free フラグ未セットなら "free" を返す（5 を境に止まらない）', () => {
    // 副作用関数側で 4 のときに即フラグを立てるため、実運用ではここに来ない。
    // 純粋関数としては「閾値以上 && 未送信」で返すのが正しい。
    expect(
      shouldRequestReview({
        isPro: false,
        cumulativeCount: 5,
        reviewPromptShownFreeAt: null,
        reviewPromptShownProAt: null,
      }),
    ).toBe('free');
  });
});

/* ---------- maybeRequestReview ---------- */

describe('maybeRequestReview', () => {
  test('閾値未満なら StoreReview API を呼ばず、フラグもセットしない', async () => {
    await maybeRequestReview({ isPro: false, cumulativeCount: 3 });
    expect(mockIsAvailableAsync).not.toHaveBeenCalled();
    expect(mockRequestReview).not.toHaveBeenCalled();
    expect(mockSetReviewPromptShownFreeAt).not.toHaveBeenCalled();
    expect(mockSetReviewPromptShownProAt).not.toHaveBeenCalled();
  });

  test('isAvailableAsync が false なら requestReview を呼ばず、フラグもセットしない', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);
    await maybeRequestReview({ isPro: false, cumulativeCount: 4 });
    expect(mockIsAvailableAsync).toHaveBeenCalledTimes(1);
    expect(mockHasAction).not.toHaveBeenCalled();
    expect(mockRequestReview).not.toHaveBeenCalled();
    expect(mockSetReviewPromptShownFreeAt).not.toHaveBeenCalled();
  });

  test('hasAction が false なら requestReview を呼ばず、フラグもセットしない', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);
    mockHasAction.mockResolvedValue(false);
    await maybeRequestReview({ isPro: false, cumulativeCount: 4 });
    expect(mockRequestReview).not.toHaveBeenCalled();
    expect(mockSetReviewPromptShownFreeAt).not.toHaveBeenCalled();
  });

  test('Free 4 回目の正常系: requestReview が呼ばれ、free フラグがセットされる', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);
    mockHasAction.mockResolvedValue(true);
    mockRequestReview.mockResolvedValue(undefined);

    await maybeRequestReview({ isPro: false, cumulativeCount: 4 });

    expect(mockRequestReview).toHaveBeenCalledTimes(1);
    expect(mockSetReviewPromptShownFreeAt).toHaveBeenCalledTimes(1);
    expect(mockSetReviewPromptShownProAt).not.toHaveBeenCalled();
  });

  test('Pro 20 回目の正常系: requestReview が呼ばれ、pro フラグがセットされる', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);
    mockHasAction.mockResolvedValue(true);
    mockRequestReview.mockResolvedValue(undefined);

    await maybeRequestReview({ isPro: true, cumulativeCount: 20 });

    expect(mockRequestReview).toHaveBeenCalledTimes(1);
    expect(mockSetReviewPromptShownProAt).toHaveBeenCalledTimes(1);
    expect(mockSetReviewPromptShownFreeAt).not.toHaveBeenCalled();
  });

  test('requestReview が throw しても例外を握りつぶし、フラグはセットされない', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);
    mockHasAction.mockResolvedValue(true);
    mockRequestReview.mockRejectedValue(new Error('boom'));

    await expect(
      maybeRequestReview({ isPro: false, cumulativeCount: 4 }),
    ).resolves.toBeUndefined();

    expect(mockSetReviewPromptShownFreeAt).not.toHaveBeenCalled();
  });

  test('Free フラグが既セットなら、count=4 でも何もしない', async () => {
    mockStoreState.reviewPromptShownFreeAt = '2026-04-01T00:00:00.000Z';

    await maybeRequestReview({ isPro: false, cumulativeCount: 4 });

    expect(mockIsAvailableAsync).not.toHaveBeenCalled();
    expect(mockRequestReview).not.toHaveBeenCalled();
    expect(mockSetReviewPromptShownFreeAt).not.toHaveBeenCalled();
  });
});
