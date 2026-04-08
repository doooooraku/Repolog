/**
 * PDF 出力の進捗バーが monotonic non-decreasing に保たれることを検証する。
 *
 * ADR-0013 のフォールバックチェーン（full quality → reduced → tiny）下で
 * attempt 2 の buildPdfHtml() が冒頭で onProgress(0, total) を再発火させる
 * 既知のリセット挙動に対し、UI 層の clamp ロジックが進捗を逆戻りさせないことを
 * 保証する。
 *
 * 加えて Issue #296 の修正として、印刷フェーズ用の擬似進捗タイマーが
 * 写真処理完了のタイミング（processed === total）で起動すべきことを検証する。
 *
 * 関連:
 * - docs/adr/ADR-0013-pdf-export-resilience-and-progress.md
 * - docs/reference/lessons.md 2026-04-09 / 2026-04-10 セクション
 * - app/reports/[id]/pdf.tsx の handleExport 内 onProgress / startPrintPhaseTimer
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

/**
 * Issue #296: 印刷フェーズ擬似タイマーの起動タイミングを検証する。
 *
 * pdf.tsx の handleExport 内 onProgress ハンドラが持つ「写真処理完了で
 * タイマーを起動する」判定ロジックと、「startPrintPhaseTimer の tick 間隔
 * 計算 + キャップ挙動」を純関数として再現し、単体で検証する。
 */

// pdf.tsx と完全に同じ判定式（processed >= total && total > 0）を再現する。
const shouldStartPrintPhaseTimer = (processed: number, total: number): boolean =>
  total > 0 && processed >= total;

// pdf.tsx の startPrintPhaseTimer と同じ tick 間隔計算式。
const computeTickIntervalMs = (photoCount: number): number =>
  Math.max(500, photoCount * 30);

// pdf.tsx の setExportProgress functional setState と同じロジックを純関数化する。
// 95 キャップと null ガードも完全一致させる。
const tickPrintPhase = (prev: number | null): number | null => {
  if (prev == null || prev >= 95) return prev;
  return prev + 1;
};

describe('PDF export print-phase timer — start condition', () => {
  test('returns true only when processed reaches total', () => {
    expect(shouldStartPrintPhaseTimer(0, 10)).toBe(false);
    expect(shouldStartPrintPhaseTimer(5, 10)).toBe(false);
    expect(shouldStartPrintPhaseTimer(9, 10)).toBe(false);
    expect(shouldStartPrintPhaseTimer(10, 10)).toBe(true);
  });

  test('returns false when total is 0 (zero-photo report uses safety net)', () => {
    expect(shouldStartPrintPhaseTimer(0, 0)).toBe(false);
  });

  test('returns true for processed > total edge case', () => {
    // 万一 processed が total を超えて呼ばれても起動する（安全側）
    expect(shouldStartPrintPhaseTimer(11, 10)).toBe(true);
  });

  test('returns false when both are 0', () => {
    expect(shouldStartPrintPhaseTimer(0, 0)).toBe(false);
  });
});

describe('PDF export print-phase timer — tick interval', () => {
  test('has 500ms floor for small photo counts', () => {
    expect(computeTickIntervalMs(0)).toBe(500);
    expect(computeTickIntervalMs(1)).toBe(500);
    expect(computeTickIntervalMs(10)).toBe(500);
    expect(computeTickIntervalMs(16)).toBe(500); // 16 * 30 = 480 < 500 → 500
  });

  test('scales linearly with photo count above floor', () => {
    expect(computeTickIntervalMs(17)).toBe(510); // 17 * 30 = 510
    expect(computeTickIntervalMs(40)).toBe(1200);
    expect(computeTickIntervalMs(70)).toBe(2100);
  });

  test('completes 80 → 95 in expected total duration', () => {
    // 15 step × interval = 総所要時間
    expect(computeTickIntervalMs(10) * 15).toBe(7500); // 7.5s
    expect(computeTickIntervalMs(40) * 15).toBe(18000); // 18s
    expect(computeTickIntervalMs(70) * 15).toBe(31500); // 31.5s
  });
});

describe('PDF export print-phase timer — tick progression', () => {
  test('advances by 1 each call until reaching 95 cap', () => {
    let state: number | null = 80;
    for (let i = 0; i < 15; i += 1) {
      state = tickPrintPhase(state);
    }
    expect(state).toBe(95);
  });

  test('does not exceed 95 on further ticks', () => {
    let state: number | null = 95;
    state = tickPrintPhase(state);
    expect(state).toBe(95);
    state = tickPrintPhase(state);
    expect(state).toBe(95);
  });

  test('no-op when state is null (before first tick)', () => {
    expect(tickPrintPhase(null)).toBe(null);
  });

  test('advances from arbitrary starting point within range', () => {
    expect(tickPrintPhase(80)).toBe(81);
    expect(tickPrintPhase(85)).toBe(86);
    expect(tickPrintPhase(94)).toBe(95);
  });
});

describe('PDF export print-phase timer — integration with clamp', () => {
  test('photo-phase clamp and print-phase tick do not collide', () => {
    // 写真処理中: onProgress が bar を 0 → 80 に駆動
    // その後印刷フェーズで tick が 80 → 95 に駆動
    // 両者の値は監視対象レンジが重ならないため、clamp は壊れない
    let state: number | null = null;

    // 写真処理フェーズ (onProgress 発火)
    for (const [p, t] of [[0, 10], [3, 10], [6, 10], [10, 10]] as const) {
      const denom = Math.max(t, 1);
      const next = Math.round(Math.min(1, p / denom) * 80);
      state = state == null ? next : Math.max(state, next);
    }
    expect(state).toBe(80);

    // 印刷フェーズ (setInterval tick 発火)
    for (let i = 0; i < 10; i += 1) {
      state = tickPrintPhase(state);
    }
    expect(state).toBe(90);
  });
});
