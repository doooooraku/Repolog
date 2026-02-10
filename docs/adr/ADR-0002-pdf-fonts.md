---

# ADR-0002: PDFはNoto Sans系フォントを埋め込みで固定する

- Status: Accepted
- Date: 2026-01-31
- Deciders: @doooooraku
- Related: Issue #5 / PR #TBD / constraints / basic_spec / functional_spec

---

## Context（背景：いま何に困っている？）
- 現状：PDF生成はHTMLベースで、端末フォント任せだと表示崩れが起きる可能性がある。
- 困りごと：提出先の端末で「同じ見た目」で印刷されないと価値が落ちる。
- 制約/前提（リンク推奨）：
  - `docs/reference/constraints.md`（19言語対応、提出に強いPDF）

---

## Decision（決めたこと：結論）
- 決定：PDFはNoto Sans系フォントを埋め込み（@font-face）で固定する。
- 適用範囲：v1.x のPDF出力（A4/Letter）

---

## Decision Drivers（判断の軸：何を大事にした？）
- 提出先の端末でも見た目が崩れないこと
- 19言語で文字化けしないこと
- ライセンス上の安全性（再配布/埋め込みOK）
- ローカル完結（ネットワーク前提にしない）

---

## Alternatives considered（他の案と却下理由）

### Option A: 端末フォント任せ
- 概要：OSが持つ標準フォントだけでPDF生成
- 良い点：実装が軽い／アプリサイズが増えない
- 悪い点：端末差で表示崩れ・文字化けが起きる
- 却下理由：提出品質を担保できない

### Option B: 商用フォント埋め込み
- 概要：有料フォントを埋め込み
- 良い点：見た目の質は高い
- 悪い点：配布/埋め込みライセンスが重い
- 却下理由：配布条件と運用コストが大きい

### Option C: 必要時にネットからフォント取得
- 概要：オンライン時だけフォントをダウンロードして埋め込み
- 良い点：アプリサイズを抑えられる
- 悪い点：オフラインでPDFが作れない
- 却下理由：ローカル完結の前提と衝突する

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）
- 提出先でも同じ見た目で印刷できる
- 19言語で文字化けしにくい

### Negative（辛い/副作用）
- アプリサイズが増える
- PDF生成時のメモリ使用量が増える

### Follow-ups（後でやる宿題）
- [x] PDF生成時に「必要なスクリプトだけ埋め込む」最適化の検討（Issue #72）
- [x] PDF生成パフォーマンス計測（Issue #72）

### 2026-02-10 Follow-up結果（Issue #72）
- 実測結果（`docs/how-to/benchmarks/pdf_font_benchmark.latest.md`）:
  - 短文シナリオ：`all_fonts` 66.93MB → `script_subset` 2.61MB（font payload）
  - 多言語シナリオ：`all_fonts` 66.93MB → `script_subset` 29.14MB
  - warm中央値：短文で約96.8%短縮、多言語で約54.7%短縮
- 判断（採用/非採用）:
  - **v1.0.x では runtime の script subset 最適化は採用しない（保留）**
  - 理由:
    - CJKは文字集合の重なりが大きく、文字種推定だけで `JP/SC/TC` を誤判定するリスクがある
    - 誤判定時は文字化け/豆腐化が発生し、Repologの最優先価値（提出品質）を損なう
  - 継続方針:
    - 現行の全フォント埋め込みを維持し、ベンチ基盤で継続測定する
    - 実機の回帰テスト条件を満たせる段階で、段階導入を再検討する

---

## Acceptance / Tests（合否：テストに寄せる）
- 正（自動テスト）：
  - Jest：フォントCSS生成のユニットテスト（今後追加）
- 手動チェック：
  - 手順：多言語（日本語/中国語/韓国語/タイ語/ヒンディー語）を含むPDFを生成
  - 期待結果：端末やPCで同じ見た目になる

---

## Rollout / Rollback（出し方/戻し方）
- リリース手順への影響：なし
- ロールバック方針：該当PRをrevert
- 検知方法：PDF出力時の表示崩れ報告

---

## Links（関連リンク：正へ寄せる）
- constraints: `docs/reference/constraints.md`
- reference: `docs/reference/basic_spec.md` / `docs/reference/functional_spec.md`
- Issue: #5
- Issue: #72
- PR: #TBD
- Benchmark runbook: `docs/how-to/pdf_font_benchmark.md`
- Benchmark result: `docs/how-to/benchmarks/pdf_font_benchmark.latest.md`
- External docs: https://scripts.sil.org/OFL

---

## Notes（メモ：任意）
- フォントは `assets/fonts/` に格納し、`assets/fonts/licenses/` にOFLを同梱する。
