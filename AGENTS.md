# AGENTS.md (Repolog)

このファイルは **人間とAIが同じルールで作業するためのガイド** です。  
Codex は `AGENTS.md` を最初に読みます。空ファイルは無視されます。  
内容は短く保ち、詳細は docs/ と .github/ を正にします。

---

## 0) プロジェクト名（最重要）
- 正式名称は **Repolog** です。  

---

## 1) 最初に読む 3 本（迷子防止）
1. `docs/README.md`（文書の地図）
2. `docs/explanation/product_strategy.md`（価値/境界）
3. `docs/reference/constraints.md`（前提/不変条件）

---

## 2) 正（Source of Truth）の優先順
1. **コード**（実装の事実）
2. **CI**（`.github/workflows/ci.yml`）
3. **Reference**（`docs/reference/*`）
4. **ADR**（`docs/adr/*`）
5. それ以外（メモやチャット）

---

## 3) docs-as-code のルール（更新漏れ防止）
- 仕様変更は **docs とテスト** がセット。
- 迷ったら `docs/README.md` の更新判断フローに従う。
- UIの見た目は Figma(`docs/reference/UI_Figma/*`) を正（仕様書に細かく書かない）。

---

## 4) Issue / PR 運用（.github を正）
- Issue は **テンプレ必須**（`.github/ISSUE_TEMPLATE/*.yml`）。
- PR は **テンプレ必須**（`.github/pull_request_template.md`）。
- CODEOWNERS を尊重（`.github/CODEOWNERS`）。
- 影響がある場合は ADR を追加（`docs/adr/ADR-*.md`）。

---

## 5) 必須コマンド（CIと同じ順序）
> 実行ルール：**CIと同じ順序で** 実行する。

1. `pnpm install --frozen-lockfile`
   - 依存関係をインストールする。
   - `--frozen-lockfile` は lockfile と違えば失敗する安全モード。
2. `pnpm lint`
   - ESLint でコードの書き方ルール違反を検出する。
3. `pnpm test`
   - Jest を実行する（テストが無い場合も失敗しない設定）。

補足（必要なときだけ）:
- `pnpm type-check`（型チェック。scripts にある場合）
- `pnpm test:e2e`（E2E。maestro がある場合）

---

## 6) セキュリティ/秘密情報
- APIキーや広告IDなど **秘密情報の直書き禁止**。
- ログに個人情報を出さない。

---

## 7) 変更時の必須確認
- 仕様に影響 → `docs/reference/*` を更新
- 理由が必要 → `docs/adr/*` を追加
- 合否が変わる → テスト更新
- 運用が変わる → `docs/how-to/*` を更新

---

## 8) 迷ったら
- `docs/README.md` に戻る。  
- それでも不明なら **人間に質問する** 
