---

# ADR-0004: バックアップはZIP形式で出力し、react-native-zip-archiveを採用する

- Status: Accepted
- Date: 2026-01-31
- Deciders: @doooooraku / Codex
- Related: Issue #8 / PR #21 / constraints

---

## Context（背景：いま何に困っている？）
- 現状：バックアップの形式は `manifest.json + photos/` が決定済み。
- 困りごと：iOS/Androidの保存先選択を統一し、ファイルとして扱える形式が必要。
- 制約/前提（リンク推奨）：
  - `docs/reference/constraints.md`（外部SDK追加時はADR）
  - `docs/reference/functional_spec.md`（F-07 バックアップ）

---

## Decision（決めたこと：結論）
- 決定：バックアップはZIP形式で保存し、`react-native-zip-archive` でzip/unzipを行う。
- 適用範囲：S-08 バックアップ（Export/Import）

---

## Decision Drivers（判断の軸：何を大事にした？）
- OS共通で「1ファイル」として扱えること
- 端末内ストレージに依存しない保存/共有導線
- 実装と保守の安定性

---

## Alternatives considered（他の案と却下理由）

### Option A: フォルダ保存（ZIPなし）
- 概要：manifest + photos をフォルダで保存
- 良い点：追加ライブラリ不要
- 悪い点：iOSで保存先選択が難しい（共有シートはファイル前提）
- 却下理由：OS間の体験差が大きい

### Option B: JSのみでZIP生成
- 概要：純JSのZIPライブラリを利用
- 良い点：ネイティブ依存が減る
- 悪い点：大量写真でメモリ負荷が高い
- 却下理由：安定性と性能が不安

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）
- 1ファイルで保存/共有ができる
- Import/ExportがOS共通の手順になる

### Negative（辛い/副作用）
- iOSのデプロイターゲット制約（ライブラリ要件）
- 追加SDKの保守コストが増える

### Follow-ups（後でやる宿題）
- [ ] バックアップの手順をHow-toへ整理（必要なら）

---

## Acceptance / Tests（合否：テストに寄せる）
- 正（自動テスト）：
  - Jest：対象なし（ファイルI/O/SDK）
- 手動チェック：
  - Exportでzipが保存できる
  - Importで復元できる

---

## Rollout / Rollback（出し方/戻し方）
- リリース手順への影響：Dev Client / ネイティブビルドが必要
- ロールバック方針：バックアップ機能を一時非表示にして次リリースへ
- 検知方法：手動テスト/ストア審査

---

## Links（関連リンク：正へ寄せる）
- constraints: `docs/reference/constraints.md`
- Issue: #8
- PR: #21
- External docs:
  - https://github.com/mockingbot/react-native-zip-archive
  - https://docs.expo.dev/versions/latest/sdk/sharing/
  - https://docs.expo.dev/versions/latest/sdk/document-picker/

---

## Notes（メモ：任意）
- iOS 15.5 以上が必要なため、ビルド設定と整合させる。
