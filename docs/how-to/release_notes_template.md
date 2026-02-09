# release_notes_template.md（タグ運用とリリースノート雛形）

この文書は **How-to（運用手順）** です。  
「なぜこの運用にしたか」は ADR へ、  
「いつリリースするか」は Milestone/Project で管理します。

---

## 1. タグ命名ルール（正）

- 候補版（審査前/検証中）: `v<MAJOR>.<MINOR>.<PATCH>-rc.<N>`
  - 例: `v1.0.0-rc.1`
- 本番版（公開版）: `v<MAJOR>.<MINOR>.<PATCH>`
  - 例: `v1.0.0`

補足:
- SemVer 2.0.0 に合わせて `MAJOR.MINOR.PATCH` を採用する
- `rc` は release candidate（候補版）の意味

---

## 2. タグ作成コマンド（最短）

```bash
# 1) mainを最新化
git switch main
git pull --ff-only origin main

# 2) 候補版タグを作成
git tag -a v1.0.0-rc.1 -m "Repolog v1.0.0-rc.1"

# 3) タグをリモートへ送る
git push origin v1.0.0-rc.1
```

コマンドの意味:
- `git tag -a`: 注釈付きタグを作る（誰が何のために切ったか残せる）
- `-m`: タグの説明文
- `git push origin <tag>`: タグを GitHub へ公開

---

## 3. GitHub Release 作成コマンド（gh CLI）

```bash
# 候補版（pre-release）を作成
gh release create v1.0.0-rc.1 \
  --repo doooooraku/Repolog \
  --title "Repolog v1.0.0-rc.1" \
  --notes-file docs/how-to/release_notes_template.md \
  --prerelease
```

```bash
# 本番版（stable）を作成
gh release create v1.0.0 \
  --repo doooooraku/Repolog \
  --title "Repolog v1.0.0" \
  --notes-file docs/how-to/release_notes_template.md
```

コマンドの意味:
- `gh release create`: GitHub Release を新規作成
- `--prerelease`: 候補版として公開（本番扱いしない）
- `--notes-file`: リリースノート本文をファイルから読み込む

---

## 4. リリースノート雛形（このまま使える最小テンプレ）

以下をコピーして、各版ごとに具体値へ置換する。

```md
# Repolog vX.Y.Z(-rc.N)

## 1. Summary
- 何を直したか（1〜3行）

## 2. User Impact
- Freeへの影響:
- Proへの影響:

## 3. Changes
- feat:
- fix:
- docs/chore:

## 4. Verification
- pnpm lint: ✅/❌
- pnpm test: ✅/❌
- pnpm type-check: ✅/❌
- Actions URL:

## 5. Rollback
- 問題時は対象PRをrevertし、前タグへ戻す
```

---

## 5. 参照（一次情報）

- SemVer 2.0.0: https://semver.org/
- GitHub Releases: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
- gh release create: https://cli.github.com/manual/gh_release_create
