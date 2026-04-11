<!-- グローバルルール (シンプル第一 / HARD GATE / 対処療法禁止 / 4段階デバッグ / pnpm 必須 等) は ~/.claude/CLAUDE.md を参照 -->

# Repolog プロジェクト固有ルール

## iOS 初期設定ルール

- Expo プロジェクト作成時、`app.json` の `ios` セクションに `"config": { "usesNonExemptEncryption": false }` と `privacyManifests` を必ず設定する
- 暗号化ライブラリ追加時は `usesNonExemptEncryption` の値を再評価する (ADR-0010 参照)
- 不要な iOS 権限 (マイク、常時位置情報等) はプラグイン設定で明示的にブロックする

---

## Sub-Agents (user-level: `~/.claude/agents/`)

| Agent              | Tools                  | Model | When                                                  |
| ------------------ | ---------------------- | ----- | ----------------------------------------------------- |
| `eas-build-doctor` | Bash, Read, Glob, Grep | haiku | EAS ビルド前の env 検証 + ビルド実行支援              |
| `commit-helper`    | Bash, Read             | haiku | Conventional Commits ドラフト + ユーザー承認後 commit |

> **インストール**: `cp -n ../../template/app_template/.claude/agents/*.md ~/.claude/agents/`
> **認識確認**: Claude Code 再起動後に `/agents` で Personal Library に表示される
> **理由**: 現バージョンの Claude Code は project-level `.claude/agents/` を認識しない (2026-04-11 検証済み)。SoT は `template/app_template/.claude/agents/`

---

## User-Invocable Skills (user-level: `~/.claude/skills/`)

| Skill            | When                                                  |
| ---------------- | ----------------------------------------------------- |
| `/discuss`       | 議論 / 方針決定 / 認識合わせ (コードを変更しない)     |
| `/plan`          | W-01〜W-05: Issue / ADR / Context ドラフト作成        |
| `/review-pr`     | W-10.5: PR レビュー (AC 適合 / ADR 整合 / 影響範囲)   |
| `/retro`         | リリース / マイルストーン振り返り                     |
| `/progress`      | 3 軸監査 (planning / integration / quality)           |
| `/store-text`    | App Store / Google Play 文言生成                      |
| `/release-check` | リリース前最終チェック                                |

---

## Repolog 固有コマンド

- `pnpm dev` — Metro 起動
- `pnpm verify` — full check (lint + type-check + format + test + i18n + config)
- `pnpm test` — Jest unit
- `pnpm test:e2e` — Maestro E2E
- `pnpm build:android:apk:local` — local APK (`SKIP_KEYS=1` で初回)
- `pnpm build:android:aab:local` — local AAB (production)
- `pnpm i18n:check` — locale keys 検証
- `pnpm metadata:check` — `fastlane/metadata/` 検証

---

## Repolog 固有の重要制約

- **PDF hang は受容済み (ADR-0016)**: OS-level WebView pool 累積が真因。アプリ側での追加緩和策は実施しない
- **EAS local build は `.env` をコピーしない**: API キーは `eas env:create --environment production` で登録 (詳細: MEMORY.md)
- **expo-file-system SDK 54 破壊変更**: legacy API は `expo-file-system/legacy` 経由
- **photos.local_uri は相対パス**: iOS Store update での container UUID 変化対策
- **WSL2 PATH literal `${PATH}` 問題**: pnpm/node 実行時は `PATH=/usr/bin:/bin:$PATH` を prepend
