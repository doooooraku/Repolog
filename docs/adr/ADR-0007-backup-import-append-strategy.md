---

# ADR-0007: Backup Import は append（追加）を正とし、ID重複はスキップする

- Status: Accepted
- Date: 2026-02-09
- Deciders: @doooooraku / Codex
- Related: Issue #41 / constraints / basic_spec(F-09) / functional_spec(F-07)

---

## Context（背景）
- 仕様（basic_spec）は Import を「追加（append）」前提としている。
- しかし実装は Import 時に `reports` と写真ディレクトリを削除してから復元しており、実質「置換（replace）」だった。
- 置換方式は誤操作や失敗時のデータ損失リスクが高い。

---

## Decision（決定）
- Import 戦略は **append（追加）** を採用する。
- 既存データ（reports/photos）は Import 前に削除しない。
- 競合時（同じ `report.id` / `photo.id`）は既存を優先し、バックアップ側をスキップする。
- 同じバックアップの再Importで重複登録しない（ID基準で冪等）。
- DB書き込みは transaction で実行し、失敗時は rollback する。

---

## Alternatives considered（比較した案）

### Option A: replace（全削除して復元）
- 良い点: 実装が単純で「完全復元」しやすい
- 悪い点: 失敗時や誤操作時に既存データを失う
- 却下理由: データ安全性の優先度（P1）に反する

### Option B: append + 衝突時にID再採番して強制取り込み
- 良い点: 取り込み量を最大化できる
- 悪い点: 同一バックアップ再Importで重複が増える、追跡しづらい
- 却下理由: 冪等性と運用のわかりやすさを優先

---

## Consequences（影響）

### Positive
- 既存データを守ったまま復元できる
- 再Import時の重複事故を抑制できる
- 仕様（basic/functional）と実装が一致する

### Negative
- 衝突したバックアップデータは取り込まれない（スキップ）
- 「どれがスキップされたか」の詳細表示は今後の改善余地

---

## Acceptance / Tests（合否）
- Jest:
  - `__tests__/backupImportPlanner.test.ts`
    - append時の追加/スキップ判定
    - 不正参照（存在しない reportId を参照する photo）の検知
    - 再Import時の冪等性
- 実装要件:
  - Import で既存 reports/photos を削除しない
  - transaction + rollback で DB 一貫性を守る

---

## Rollout / Rollback
- Rollout: append 実装をリリースし、Import成功時に「追加件数」を表示する
- Rollback: 重大問題時のみ従来 replace 実装へ戻す（ただしデータ損失リスクを明示）

---

## Links
- `docs/reference/basic_spec.md`
- `docs/reference/functional_spec.md`
- `src/features/backup/backupService.ts`
