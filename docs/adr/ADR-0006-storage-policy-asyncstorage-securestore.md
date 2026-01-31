---

# ADR-0006: split storage by sensitivity (AsyncStorage vs SecureStore)

- Status: Accepted
- Date: 2026-01-31
- Deciders: @doooooraku
- Related: Issue #24 / constraints / ADR-0001

---

## Context（背景：いま何に困っている？）
- 現状：実装は「設定=AsyncStorage、課金状態=SecureStore」だが、constraints/ADR-0001はSecureStore一本の記述になっている。
- 困りごと：ドキュメントと実装のズレで意思決定が曖昧になる。
- 制約/前提（リンク推奨）：
  - `docs/reference/constraints.md` の「データ保存の原則」

---

## Decision（決めたこと：結論）
- 決定：**非機密設定はAsyncStorage、機密情報はSecureStore** に分離して保存する。
- 適用範囲：v1.x（Settings/ProState/購読ID/トークン）

---

## Decision Drivers（判断の軸：何を大事にした？）
- セキュリティ（機密は暗号化ストレージへ）
- 実装の整合性（現行コードと一致させる）
- 運用/保守の明確化（保存先の混乱を防ぐ）

---

## Alternatives considered（他の案と却下理由）

### Option A: すべてSecureStoreに保存
- 概要：設定も課金状態もSecureStoreに統一
- 良い点：機密性は高い
- 悪い点：非機密まで暗号化する必要はなく、API制約の影響が増える
- 却下理由：現行実装と乖離し、過剰な保護になる

### Option B: すべてAsyncStorageに保存
- 概要：一律でAsyncStorageに保存
- 良い点：実装が単純
- 悪い点：機密情報の安全性が下がる
- 却下理由：課金・購読情報は機密扱いが必要

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）
- 保存方針が明確化し、仕様と実装が一致する
- 機密情報はSecureStoreで保護できる

### Negative（辛い/副作用）
- 保存先が2系統になり、ドキュメント更新が必須

### Follow-ups（後でやる宿題）
- [ ] constraints更新の反映確認

---

## Acceptance / Tests（合否：テストに寄せる）
- 正（自動テスト）：なし（docs変更）
- 手動チェック（必要なら最小限）：
  - 手順：constraintsの記述がコードと一致しているか確認
  - 期待結果：SettingsはAsyncStorage、課金系はSecureStoreと明記

---

## Rollout / Rollback（出し方/戻し方）
- リリース手順への影響：なし
- ロールバック方針：docs/ADRのrevert
- 検知方法：レビューでズレを検知

---

## Links（関連リンク：正へ寄せる）
- constraints: `docs/reference/constraints.md`
- Issue: #24
- External docs (SDK公式など):
  - https://react-native-async-storage.github.io/async-storage/docs/usage/
  - https://docs.expo.dev/versions/latest/sdk/securestore/

---

## Notes（メモ：任意）
- ADR-0001 のデータ保存方針は本ADRで更新（置き換え）
