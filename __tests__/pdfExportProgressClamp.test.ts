/**
 * PDF 出力の進捗バーが monotonic non-decreasing に保たれることを検証する。
 *
 * ADR-0013 のフォールバックチェーン（full quality → reduced → tiny）下で
 * attempt 2 の buildPdfHtml() が冒頭で onProgress(0, total) を再発火させる
 * 既知のリセット挙動に対し、UI 層の clamp ロジックが進捗を逆戻りさせないことを
 * 保証する。
 *
 * 関連:
 * - docs/adr/ADR-0013-pdf-export-resilience-and-progress.md
 * - docs/reference/lessons.md 2026-04-09 セクション
 * - app/reports/[id]/pdf.tsx の handleExport 内 onProgress ハンドラ
 */

// pdf.tsx の handleExport 内 onProgress ハンドラと同じロジックを純関数として再現する。
// UI 実装と同期性を保つため、計算式は完全に一致させる。
const clampProgress = (
  prev: number | null,
  processed: number,
  total: number,
): number => {
  const denom = Math.max(total, 1);
  const ratio = Math.min(1, processed / denom);
  const next = Math.round(ratio * 80);
  return prev == null ? next : Math.max(prev, next);
};

describe('PDF export progress — monotonic clamp', () => {
  test('initial null state is initialized by first call', () => {
    expect(clampProgress(null, 0, 10)).toBe(0);
  });

  test('progresses normally in a single successful attempt', () => {
    let state: number | null = null;
    const calls: [number, number][] = [
      [0, 10],
      [2, 10],
      [5, 10],
      [10, 10],
    ];
    for (const [p, t] of calls) {
      state = clampProgress(state, p, t);
    }
    expect(state).toBe(80);
  });

  test('does not regress when attempt 2 re-fires onProgress(0, total)', () => {
    let state: number | null = null;
    // attempt 1: photo 処理が 0 → 80 まで進む
    const attempt1: [number, number][] = [
      [0, 10],
      [5, 10],
      [10, 10],
    ];
    for (const [p, t] of attempt1) {
      state = clampProgress(state, p, t);
    }
    expect(state).toBe(80);

    // attempt 2 (fallback): buildPdfHtml が onProgress(0, total) を再発火
    // → UI 側で無視されるべき
    state = clampProgress(state, 0, 10);
    expect(state).toBe(80);

    // attempt 2 の photo 処理が 0 → 80 まで進む間、state は 80 で据え置き
    const attempt2: [number, number][] = [
      [3, 10],
      [7, 10],
      [10, 10],
    ];
    for (const [p, t] of attempt2) {
      state = clampProgress(state, p, t);
      expect(state).toBe(80);
    }
  });

  test('never decreases across 3-attempt fallback chain', () => {
    let state: number | null = null;
    const sequences: [number, number][][] = [
      // attempt 1 (full quality)
      [
        [0, 20],
        [10, 20],
        [20, 20],
      ],
      // attempt 2 (reduced — hang detected on attempt 1)
      [
        [0, 20],
        [12, 20],
        [20, 20],
      ],
      // attempt 3 (tiny — still failing, final retry)
      [
        [0, 20],
        [15, 20],
        [20, 20],
      ],
    ];
    let previous = 0;
    for (const seq of sequences) {
      for (const [p, t] of seq) {
        state = clampProgress(state, p, t);
        expect(state).toBeGreaterThanOrEqual(previous);
        previous = state as number;
      }
    }
    expect(state).toBe(80);
  });

  test('handles partial photo counts correctly (e.g. 3 of 10 = 24%)', () => {
    let state: number | null = null;
    state = clampProgress(state, 3, 10); // 3/10 = 0.3 → round(24) = 24
    expect(state).toBe(24);
    state = clampProgress(state, 5, 10); // 5/10 = 0.5 → round(40) = 40
    expect(state).toBe(40);
    state = clampProgress(state, 2, 10); // 2/10 = 0.2 → 16 but clamped to 40
    expect(state).toBe(40);
  });

  test('total = 0 edge case does not divide by zero', () => {
    const state = clampProgress(null, 0, 0);
    expect(state).toBe(0);
  });

  test('processed > total is capped at 80 (safety net)', () => {
    // 万一 processed が total を超えて呼ばれても 80 を超えない
    const state = clampProgress(null, 15, 10);
    expect(state).toBe(80);
  });
});
