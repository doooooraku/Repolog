# Backup Import/Export Runbook（Repolog）
最終更新: 2026-02-10（JST）

この文書は **How-to（やり方）** です。  
実装の正は `src/features/backup/backupService.ts` と `__tests__/backupImportPlanner.test.ts` を参照してください。

---

## 0. この文書の目的
- バックアップの Export / Import を、第三者が同じ手順で再現できるようにする
- 障害時に「どこで失敗しているか」を切り分ける
- append（追加）戦略の前提を運用側にも固定する

---

## 1. まず固定する前提（Source of Truth）
- バックアップ形式:
  - `manifest.json`
  - `photos/`（画像ファイル）
- スキーマ互換:
  - 現在は `schemaVersion = 1`
- Import戦略:
  - **append（追加）**
  - 既存データは削除しない
  - `report.id` / `photo.id` が重複したらスキップ
  - 同じバックアップを再Importしても重複登録しない（冪等）

関連:
- `docs/adr/ADR-0007-backup-import-append-strategy.md`
- `src/features/backup/backupService.ts`
- `__tests__/backupImportPlanner.test.ts`

---

## 2. 事前準備（ユーザー/運用者共通）
1. 端末に十分な空き容量があることを確認する
2. Export時:
   - 共有シートが使える端末であることを確認する
3. Import時:
   - `.zip` ファイルを端末から選べる状態にする

注意:
- Web ではバックアップ機能は未対応（`unsupported`）
- PDFファイルはバックアップ対象外

---

## 3. Export手順（標準運用）
1. アプリで Settings を開く
2. `Backup` を開く
3. `Export` を押す
4. 共有シートで保存先を選ぶ（Files / Drive 等）
5. `repolog-backup-<timestamp>.zip` が出力されたことを確認する

期待結果:
- zip内に `manifest.json` と `photos/` が存在する
- エラー時は次のいずれか:
  - `Sharing unavailable`
  - `Failed to export backup`

---

## 4. Import手順（append運用）
1. アプリで Settings を開く
2. `Backup` を開く
3. `Import` を押す
4. zipファイルを選択する
5. Import完了メッセージを確認する
   - 例: `Added {reports} reports and {photos} photos.`

期待結果:
- 既存レポート/写真は保持される（削除されない）
- 重複IDはスキップされる
- 新規分だけ追加される

---

## 5. トラブルシューティング（切り分け表）

### 5.1 `Invalid backup` が出る
想定原因:
- zip内に `manifest.json` がない
- `photos/` がない
- `manifest.json` のJSONが壊れている
- `photos` が存在しない `reportId` を参照している
- zip内で参照された写真ファイルが実体として存在しない

確認ポイント:
1. zipを展開して `manifest.json` と `photos/` の存在を確認
2. `manifest.json` がJSONとして読めるか確認
3. `manifest.photos[].reportId` が `manifest.reports[].id` に存在するか確認

対処:
- 正常なバックアップを再取得する
- 壊れたzipは再利用しない

### 5.2 `Unsupported backup` が出る
想定原因:
- `schemaVersion` が現行アプリと不一致

確認ポイント:
1. `manifest.json` の `schemaVersion` を確認

対処:
- 同じメジャー系統のアプリバージョンで再実行
- 互換方針が必要な場合はADRを起票

### 5.3 `Not supported` が出る
想定原因:
- Web環境など非対応プラットフォーム

対処:
- iOS/Android端末で実行する

### 5.4 `Sharing unavailable` が出る（Export）
想定原因:
- 共有シートを開けない端末/設定

対処:
- 共有機能が有効な端末で再実行

### 5.5 追加件数が `0`（Import成功だが増えない）
想定原因:
- Importしたバックアップがすべて既存IDと重複している

対処:
- これはappend戦略上の正常動作
- 重複スキップ件数の可視化改善が必要ならIssue化する

---

## 6. 受け入れ条件に対応した確認手順（Issue #74）

### AC1: 手順書だけで復元を再現できる
1. 端末AでExport zipを作成
2. 端末B（または同端末の別データ状態）でImport
3. レポート/写真が追加されることを確認

### AC2: 失敗時の切り分け
以下を意図的に作って挙動確認:
1. `manifest.json` なしzip → `Invalid backup`
2. `schemaVersion` 改変zip → `Unsupported backup`
3. 重複IDのみzip → 成功 + 追加0件

### AC3: 導線リンク
- 本文書から:
  - `docs/how-to/testing.md`
  - `docs/how-to/whole_workflow.md`
- 逆リンク:
  - `docs/how-to/testing.md` から本Runbook
  - `docs/how-to/whole_workflow.md` から本Runbook

---

## 7. 開発者向け検証コマンド

### 7.1 append判定ロジックだけを確認
```bash
pnpm test __tests__/backupImportPlanner.test.ts
```
意味:
- バックアップImportの追加/スキップ判定を単体で検証する

### 7.2 PR前の最低ライン
```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
```
意味:
- CIと同じ順序で依存解決・静的検査・テストを行う

---

## 8. 運用インシデント対応（簡易）
1. 症状を記録（日時 / 端末 / zip元 / エラー文言）
2. `Invalid` / `Schema` / `Unsupported` / `Share` のどれかに分類
3. 再現手順をIssueへ転記
4. 必要なら zip（個人情報に注意）を安全経路で回収し検証

---

## 9. 参照リンク（一次情報）
- Expo DocumentPicker: https://docs.expo.dev/versions/latest/sdk/document-picker/
- Expo FileSystem: https://docs.expo.dev/versions/latest/sdk/filesystem/
- Expo Sharing: https://docs.expo.dev/versions/latest/sdk/sharing/
- react-native-zip-archive: https://github.com/mockingbot/react-native-zip-archive

