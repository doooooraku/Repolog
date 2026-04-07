import * as StoreReview from 'expo-store-review';

import { useSettingsStore } from '@/src/stores/settingsStore';

/**
 * Repolog のアプリ内レビュー依頼サービス。
 *
 * 仕様（ADR-0012）:
 * - PDF 出力成功直後にだけ呼ぶ（ハッピーモーメント）
 * - Free ユーザー: 累計 PDF 出力 4 回目で 1 度だけ依頼
 * - Pro ユーザー : 累計 PDF 出力 20 回目で 1 度だけ依頼
 * - 1 ユーザーあたり生涯最大 2 回（Free フラグ + Pro フラグを独立管理）
 * - OS 標準ダイアログを直接呼ぶだけで、自前モーダルやプレ確認は置かない
 * - PDF 出力フローへ例外を伝播させない（fire-and-forget）
 */

export const FREE_THRESHOLD = 4;
export const PRO_THRESHOLD = 20;

export type ReviewPromptDecision = 'free' | 'pro' | null;

type ShouldRequestArgs = {
  isPro: boolean;
  cumulativeCount: number;
  reviewPromptShownFreeAt: string | null;
  reviewPromptShownProAt: string | null;
};

/**
 * 副作用なしの純粋関数。テストしやすいようにストアアクセスから分離する。
 *
 * 戻り値:
 *   - 'free' : Free 用プロンプトを表示すべき
 *   - 'pro'  : Pro  用プロンプトを表示すべき
 *   - null   : 表示しない
 */
export function shouldRequestReview(args: ShouldRequestArgs): ReviewPromptDecision {
  if (!args.isPro) {
    if (args.reviewPromptShownFreeAt) return null;
    if (args.cumulativeCount < FREE_THRESHOLD) return null;
    return 'free';
  }

  if (args.reviewPromptShownProAt) return null;
  if (args.cumulativeCount < PRO_THRESHOLD) return null;
  return 'pro';
}

type MaybeRequestReviewArgs = {
  isPro: boolean;
  cumulativeCount: number;
};

/**
 * 副作用ありのラッパー。PDF 出力成功直後に fire-and-forget で呼ぶ。
 *
 * - 判定 → OS API 利用可否確認 → ダイアログ呼び出し → フラグセット
 * - すべて try-catch で囲い、例外は console.warn に握りつぶす（PDF フローを壊さない）
 * - StoreReview.requestReview() は OS 都合で実際にダイアログが表示されないことがあり、
 *   その成否はクライアント側で取得できない。よって「呼んだ＝試行済み」としてフラグを立てる。
 */
export async function maybeRequestReview(input: MaybeRequestReviewArgs): Promise<void> {
  try {
    const state = useSettingsStore.getState();
    const decision = shouldRequestReview({
      isPro: input.isPro,
      cumulativeCount: input.cumulativeCount,
      reviewPromptShownFreeAt: state.reviewPromptShownFreeAt,
      reviewPromptShownProAt: state.reviewPromptShownProAt,
    });
    if (!decision) return;

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      console.warn('[ReviewPrompt] StoreReview is not available on this device.');
      return;
    }

    const hasAction = await StoreReview.hasAction();
    if (!hasAction) {
      console.warn('[ReviewPrompt] StoreReview has no action available right now.');
      return;
    }

    console.warn(`[ReviewPrompt] Requesting review (decision=${decision}, count=${input.cumulativeCount})`);
    await StoreReview.requestReview();

    const nowIso = new Date().toISOString();
    if (decision === 'free') {
      state.setReviewPromptShownFreeAt(nowIso);
    } else {
      state.setReviewPromptShownProAt(nowIso);
    }
  } catch (e) {
    // PDF 出力フローを絶対に壊さないため、エラーは握りつぶす（観測のためログだけ残す）
    console.warn('[ReviewPrompt] failed (non-fatal):', e);
  }
}
