---

# ADR-0005: language set expands to 19 (add nl + pl)

- Status: Accepted
- Date: 2026-01-31
- Deciders: @doooooraku
- Related: Issue #23 / constraints / reference

---

## Context（背景：いま何に困っている？）
- 現状：仕様書は18言語（plを含む）が正、実装はnlを含みplが未対応で乖離がある。
- 困りごと：言語選択の期待値が仕様と実装でズレ、判断が揺れる。
- 制約/前提（リンク推奨）：
  - `docs/reference/constraints.md` の「対応言語の増減」トリガー

---

## Decision（決めたこと：結論）
- 決定：対応言語を **19言語** に拡張し、`nl` と `pl` を両方採用する。
- 適用範囲：v1.x（アプリ全体のi18n・設定の言語選択）

---

## Decision Drivers（判断の軸：何を大事にした？）
- 仕様と実装の整合性（ドキュメントの正を守る）
- ユーザー到達性（オランダ語・ポーランド語の両立）
- BCP47準拠の言語コード運用

---

## Alternatives considered（他の案と却下理由）

### Option A: 18言語のまま（nl を外す）
- 概要：仕様書のplを維持し、実装のnlを削除
- 良い点：仕様に合わせやすい
- 悪い点：既存のnlユーザーを切り捨てる
- 却下理由：ユーザー要求でnlも必要となったため

### Option B: 18言語のまま（pl を外す）
- 概要：実装に合わせてplを仕様から削除
- 良い点：実装変更が少ない
- 悪い点：仕様とFigmaの既存方針と矛盾
- 却下理由：ユーザー判断でplも必要と確定したため

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）
- 仕様と実装が一致し、言語選択の混乱が減る
- 19言語対応の前提が明確になる

### Negative（辛い/副作用）
- 翻訳未整備の言語は英語フォールバックになる可能性

### Follow-ups（後でやる宿題）
- [ ] 必要ならPolishの翻訳品質を改善するIssueを追加

---

## Acceptance / Tests（合否：テストに寄せる）
- 正（自動テスト）：
  - Jest：既存テスト（追加なし）
- 手動チェック（必要なら最小限）：
  - 手順：Settingsで `Polish` を選択
  - 期待結果：選択でき、設定が保持される

---

## Rollout / Rollback（出し方/戻し方）
- リリース手順への影響：なし
- ロールバック方針：当該PRをrevertして言語追加を取り消す
- 検知方法：設定画面の言語リスト確認

---

## Links（関連リンク：正へ寄せる）
- constraints: `docs/reference/constraints.md`（言語セクション）
- reference: `docs/reference/basic_spec.md`, `docs/reference/functional_spec.md`
- Issue: #23

---

## Notes（メモ：任意）
- 追加言語の翻訳品質は段階的に改善する方針
