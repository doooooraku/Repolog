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
  - `docs/reference/constraints.md`（18言語対応、提出に強いPDF）

---

## Decision（決めたこと：結論）
- 決定：PDFはNoto Sans系フォントを埋め込み（@font-face）で固定する。
- 適用範囲：v1.x のPDF出力（A4/Letter）

---

## Decision Drivers（判断の軸：何を大事にした？）
- 提出先の端末でも見た目が崩れないこと
- 18言語で文字化けしないこと
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
- 18言語で文字化けしにくい

### Negative（辛い/副作用）
- アプリサイズが増える
- PDF生成時のメモリ使用量が増える

### Follow-ups（後でやる宿題）
- [ ] PDF生成時に「必要なスクリプトだけ埋め込む」最適化の検討
- [ ] PDF生成パフォーマンス計測

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
- PR: #TBD
- External docs: https://scripts.sil.org/OFL

---

## Notes（メモ：任意）
- フォントは `assets/fonts/` に格納し、`assets/fonts/licenses/` にOFLを同梱する。
