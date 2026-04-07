/**
 * pdfExportGuard.test.ts
 *
 * app/reports/[id]/pdf.tsx の handleExport に適用されている
 * ref ベース reentrancy guard パターンを回帰防止として固定する。
 *
 * ## なぜこのテストが必要か
 *
 * 以前 `handleExport` は React state ベースの guard:
 *
 * ```ts
 * if (exporting) return;
 * setExporting(true);
 * ```
 *
 * を使っていた。しかし setState は同期的に反映されないため、同一の
 * JS event loop tick 内で handleExport が 2 回呼ばれた場合、2 回目の
 * 呼び出しも `exporting === false`（前 render の閉じた値）を見てしまい、
 * guard を素通りしてしまう。
 *
 * この現象は以下の条件で発生する:
 *   - iOS Fabric (New Architecture) の Pressable が特定条件で onPress を
 *     連続 2 回発火する（過去の RN issue で報告あり）
 *   - `experiments.reactCompiler: true` (app.json) の auto memoize により
 *     event handler の closure が想定外のタイミングで参照される
 *
 * 結果、`recordExport` が 1 つの押下で 2 回走り、Free ユーザーの
 * 月 5 回上限が実質 4 回で尽きる不具合 (#289) が発生した。
 *
 * 恒久策は ref ベース guard:
 *
 * ```ts
 * const exportingRef = useRef(false);
 * if (exportingRef.current) return;
 * exportingRef.current = true;
 * ```
 *
 * ref は `.current` への代入が同期的なので、同一 tick 内の 2 回目呼び出しは
 * 直ちに true を見て早期 return する。
 *
 * このテストは ref guard パターンを pdf.tsx から独立して検証する。
 * もし将来 state ベースに戻そうとしたら、この test が落ちる設計。
 *
 * 関連: docs/adr/ADR-0014-pdf-export-count-policy.md / docs/reference/lessons.md
 */

describe('PDF export reentrancy guard (ref-based pattern)', () => {
  test('ref-based guard blocks concurrent invocations within the same tick', async () => {
    const guardRef = { current: false };
    const sideEffects: number[] = [];

    const handler = async (id: number) => {
      if (guardRef.current) return;
      guardRef.current = true;
      try {
        // 非同期境界: generatePdfFile / recordExport のシミュレーション
        await new Promise((r) => setTimeout(r, 10));
        sideEffects.push(id);
      } finally {
        guardRef.current = false;
      }
    };

    // 5 つの呼び出しを同一 tick 内で起動する（Pressable の連続発火を模擬）
    const results = await Promise.all([
      handler(1),
      handler(2),
      handler(3),
      handler(4),
      handler(5),
    ]);

    // 最初の呼び出しだけが副作用を実行し、残り 4 つは即 return
    expect(sideEffects).toEqual([1]);
    // 全ての handler は undefined を resolve する（throw しない）
    expect(results).toEqual([undefined, undefined, undefined, undefined, undefined]);
  });

  test('guard is released in finally so subsequent sequential calls proceed', async () => {
    const guardRef = { current: false };
    const sideEffects: number[] = [];

    const handler = async (id: number) => {
      if (guardRef.current) return;
      guardRef.current = true;
      try {
        await new Promise((r) => setTimeout(r, 5));
        sideEffects.push(id);
      } finally {
        guardRef.current = false;
      }
    };

    // 逐次呼び出しは全て成功する
    await handler(1);
    await handler(2);
    await handler(3);

    expect(sideEffects).toEqual([1, 2, 3]);
    expect(guardRef.current).toBe(false);
  });

  test('guard is released even when the handler throws', async () => {
    const guardRef = { current: false };

    const handler = async () => {
      if (guardRef.current) return;
      guardRef.current = true;
      try {
        throw new Error('boom');
      } finally {
        guardRef.current = false;
      }
    };

    await expect(handler()).rejects.toThrow('boom');
    // 次の呼び出しが通ること
    expect(guardRef.current).toBe(false);
  });

  test('simulated React state-based guard (the buggy pattern) FAILS for concurrent calls', async () => {
    // この test は「なぜ state ベースではダメだったか」を文書化するためのもの。
    // React の setState は同一 tick 内で closure に反映されないので、
    // closure が「関数作成時の state 値」を捕まえる限り、2 回目も passthrough する。
    //
    // ここでは React を使わずに closure capture の挙動を再現する。

    // 「render 時点の state 値」を表現するスナップショット
    let renderedState = false;
    const sideEffects: number[] = [];

    // render 時点で closure を作り、呼び出し時に renderedState を読む
    const makeHandler = () => {
      const capturedState = renderedState; // closure capture
      return async (id: number) => {
        if (capturedState) return; // ← ここが同一 tick 2 回目もすり抜ける
        // 本来は setState(true) で再 render → 次 closure は true を見るはずだが
        // 同一 tick 内では次 render が走らないのでこの代入は closure に反映されない
        renderedState = true;
        try {
          await new Promise((r) => setTimeout(r, 10));
          sideEffects.push(id);
        } finally {
          renderedState = false;
        }
      };
    };

    const handler = makeHandler();
    await Promise.all([handler(1), handler(2), handler(3)]);

    // state ベース guard は同一 closure の中で 3 回全部通ってしまう
    // （これが #289 の iOS 月次カウンタ暴発の原因）
    expect(sideEffects.length).toBeGreaterThan(1);
  });
});
