# App Store 多言語ローカライズ手順（fastlane + GitHub Actions）
最終更新: 2026-04-10（JST）

この手順は、Expo アプリの **App Store 掲載情報を複数言語にローカライズ** するための完全ガイドです。
テキストメタデータ + スクリーンショットを fastlane で自動 push し、コスト ¥0 で完結します。

Repolog で実証済み（PR #304〜#311、19 言語）。次のアプリでもこの手順をそのまま再利用できます。

想定:
- Expo SDK 54+ / React Native
- GitHub Actions macOS ランナー（**公開リポジトリなら無料**）
- App Store Connect API Key (.p8) 取得済み
- WSL2 (Ubuntu) — fastlane はローカルでは実行しない（CI 上で動かす）
- 対応言語数: 任意（この手順では 19 言語を例にする）

---

## 0. 全体像

```
[Phase 1] 準備                      [Phase 2] テキスト             [Phase 3] スクリーンショット
┌──────────────────────┐   ┌──────────────────────────┐   ┌────────────────────────────┐
│ fastlane 環境構築     │   │ 19 言語の説明文・         │   │ 19 言語のスクショを        │
│ + 既存メタデータ取込  │──►│ キーワード等を作成        │──►│ fastlane で ASC に送る     │
│ (Stage 1)            │   │ + fastlane で ASC に送る  │   │ (Stage 3)                 │
└──────────────────────┘   │ (Stage 2)                │   └────────────────────────────┘
                           └──────────────────────────┘
```

所要時間の目安:
- Phase 1: 1〜2 時間（初回のみ。2 アプリ目以降は 30 分）
- Phase 2: 2〜3 時間（Claude Code が翻訳を生成する時間含む）
- Phase 3: 30 分（スクショが既に生成済みの場合）

---

## 1. 前提条件チェック

以下が揃っていることを確認してから開始する。

| # | 項目 | 確認方法 |
|---|---|---|
| 1 | Apple Developer Program 加入済み ($99/年) | https://developer.apple.com/ |
| 2 | App Store Connect にアプリ登録済み | ASC → マイ App にアプリがある |
| 3 | ASC API Key (.p8) 取得済み | ASC → ユーザとアクセス → キー |
| 4 | GitHub リポジトリが **公開 (Public)** | Settings → Danger Zone → Visibility |
| 5 | GitHub Secrets に 3 つ登録済み | `ASC_API_KEY_P8_BASE64`, `ASC_API_KEY_ID`, `ASC_API_KEY_ISSUER_ID` |
| 6 | アプリ内の多言語対応が完了 | `src/core/i18n/locales/` に各言語ファイルがある |
| 7 | スクリーンショット生成パイプラインがある（任意） | `scripts/store-screenshots/` |

**GitHub Secrets の登録方法:**
```
ASC_API_KEY_P8_BASE64:
  base64 -w 0 AuthKey_XXXXXXXXXX.p8 | clip.exe

ASC_API_KEY_ID:
  App Store Connect → ユーザとアクセス → キー → Key ID（例: 6768KZU85A）

ASC_API_KEY_ISSUER_ID:
  同じ画面の Issuer ID（例: 1f21bf99-fe11-4f44-9827-5b0bfbc3390e）
```

---

## 2. Phase 1: fastlane 環境構築

### Claude Code への指示文（コピペ用）

```
App Store のストア掲載情報を多言語ローカライズしたいです。
fastlane + GitHub Actions で自動化してください。コストは ¥0 で。

■ やること
1. Gemfile, fastlane/Appfile, fastlane/Fastfile を新規作成
2. .github/workflows/push-app-store-metadata.yml を新規作成
3. .gitignore に fastlane の生成物を追加
4. PR を作って main にマージ

■ 前提
- ASC API Key は GitHub Secrets に登録済み (ASC_API_KEY_P8_BASE64, ASC_API_KEY_ID, ASC_API_KEY_ISSUER_ID)
- リポジトリは Public（GitHub Actions macOS 無料）
- app.json の ios.bundleIdentifier: {ここにバンドルID}
- ASC App ID: {ここにApple ID数字}

■ 注意 (docs/reference/lessons.md L-FL01〜L-FL07 参照)
- 全 uses: を SHA pin すること（リポジトリポリシー）
- precheck は default_rule_level: :warn のみ（個別ルール指定は TypeError する）
- push_screenshots レーンには run_precheck_before_submit: false を設定
- sync_screenshots は使わない（fastlane 2.232 でベータ扱い）
- .gitignore に !fastlane/screenshots/ の除外ルールを最初から入れること
```

### Phase 1 の中身（Claude Code が実行する内容）

1. **feature ブランチを作成**
2. **Gemfile** を作成（`gem "fastlane", "~> 2.232"`）
3. **fastlane/Appfile** を作成（`app_identifier` のみ）
4. **fastlane/Fastfile** を作成 — 3 レーン:
   - `precheck_metadata` — PR 用バリデーション（upload しない）
   - `push_metadata` — テキストメタデータを ASC に push
   - `push_screenshots` — スクリーンショットを ASC に push
5. **workflow YAML** を作成:
   - PR トリガー: precheck のみ（安全）
   - main push: push_metadata（自動）
   - workflow_dispatch: metadata / screenshots 切り替え
6. **.gitignore** に fastlane の生成物 + `!fastlane/screenshots/` を追加
7. **PR → CI 確認 → merge**
8. **workflow_dispatch で動作確認**（metadata/ が無いので graceful skip）

### Phase 1 の後: ASC にプライマリ以外の言語を 1 つ手動追加

**これは人間がやる作業**（Claude Code ではできない）:

1. https://appstoreconnect.apple.com → アプリ → 配信 → iOS
2. 右上の言語ドロップダウン → 「ローカライズされていない言語」→ **English (U.S.)** の「+」
3. 最低限のテキストを入れて Save（後で fastlane が上書きする）

なぜ必要か: `fastlane deliver download_metadata` は **ASC に既にある言語** しかダウンロードしない。

### Phase 1 の後: 既存メタデータのダウンロード

**Claude Code への指示文:**
```
fastlane deliver download_metadata を GitHub Actions で実行して、
既存の ASC メタデータを fastlane/metadata/ にダウンロードしてください。
ダウンロード結果を PR にしてください。

■ 注意 (lessons L-FL02)
- deliver download_metadata は ENV 経由の API Key を読まない
- --api_key_path で JSON ファイルを渡す必要がある
```

---

## 3. Phase 2: テキストメタデータの作成

### 必要なファイル（1 言語あたり）

```
fastlane/metadata/{ASC_locale}/
├── name.txt               # アプリ名（30 文字以内）
├── subtitle.txt           # サブタイトル（30 文字以内）
├── description.txt        # 説明文（4000 文字以内）
├── keywords.txt           # キーワード（100 文字、カンマ区切り、スペースなし）
├── promotional_text.txt   # プロモテキスト（170 文字以内）
├── release_notes.txt      # What's New
├── support_url.txt        # サポート URL
├── privacy_url.txt        # プライバシーポリシー URL
├── marketing_url.txt      # マーケティング URL（空欄可）
└── apple_tv_privacy_policy.txt  # Apple TV（空欄）
```

### ASC ロケールコード対応表

| 言語 | ASC コード | 注意 |
|---|---|---|
| 日本語 | `ja` | `ja-JP` ではない |
| 英語（米国） | `en-US` | |
| フランス語 | `fr-FR` | `fr-CA` は別 |
| スペイン語 | `es-ES` | `es-MX` は別 |
| ドイツ語 | `de-DE` | |
| イタリア語 | `it` | リージョンなし |
| ポルトガル語（BR） | `pt-BR` | `pt-PT` は別。汎用 `pt` は存在しない |
| ロシア語 | `ru` | |
| 中国語（簡体字） | `zh-Hans` | |
| 中国語（繁体字） | `zh-Hant` | |
| 韓国語 | `ko` | |
| タイ語 | `th` | |
| インドネシア語 | `id` | |
| ベトナム語 | `vi` | |
| ヒンディー語 | `hi` | |
| トルコ語 | `tr` | |
| オランダ語 | `nl-NL` | |
| ポーランド語 | `pl` | |
| スウェーデン語 | `sv` | |

### Claude Code への指示文（コピペ用）

```
App Store の 17 言語（ja, en-US 以外）のメタデータを作成してください。

■ 対象言語
fr-FR, es-ES, de-DE, it, pt-BR, ru, zh-Hans, zh-Hant, ko,
th, id, vi, hi, tr, nl-NL, pl, sv

■ 作成ルール
- 翻訳ではなく、言語ごとにゼロからネイティブコピーを書く
- 7 つのサブエージェントに 2〜3 言語ずつ担当させる
- 各言語でペルソナ（その国の建設現場作業者）を設定する
- 文字数は必ずカウントして制限内に収める
- keywords はその国のユーザーが実際に検索する語にする（直訳しない）
- 商標名（WhatsApp, LINE 等）は使わない
- 誇大表現（No.1, best 等）は使わない
- ラテン文字言語は必ず正しいアクセント（á,é,ñ,ç 等）を含めること
- 作成後に pnpm metadata:check を実行して 0 errors を確認

■ 参考
- 既存の ja/en-US メタデータ: fastlane/metadata/{ja,en-US}/
- マーケティングテキスト: docs/store-listing/marketing-text.md
- lessons: docs/reference/lessons.md L-FL04（アクセント欠落対策）
```

### Phase 2 完了後の自動 push

main にマージすると `push-app-store-metadata.yml` の push トリガーが自動発火し、`push_metadata` レーンが ASC にテキストを送る。**人間の追加操作は不要**。

---

## 4. Phase 3: スクリーンショット

### Claude Code への指示文（コピペ用）

```
19 言語のスクリーンショットを fastlane で ASC にアップロードしてください。

■ やること
1. screenshots/store/apple/{lang_dir}/ のファイルを
   fastlane/screenshots/{ASC_locale}/ にコピー
2. ディレクトリ名の変換が必要（例: ja_日本語/ → ja/）
3. PR を作って merge
4. merge 後、workflow_dispatch で mode: screenshots を実行

■ 注意 (lessons L-FL05, L-FL06, L-FL07)
- .gitignore の !fastlane/screenshots/ 除外ルールを確認
- git push が大きいファイルでタイムアウトしたら git config http.postBuffer 524288000
- sync_screenshots は使わない（ベータ）
- push_screenshots レーンには precheck を無効化
```

---

## 5. 検証チェックリスト

全 Phase 完了後に確認する項目:

```
□ ASC → 配信 → 言語ドロップダウンに全言語が表示される
□ 各言語の Name / Subtitle / Description が正しい内容で表示される
□ 各言語のスクリーンショットが表示される
□ プレビュー画面で文字化けがない
□ 「審査へ提出」ボタンが押せる状態にある
□ pnpm metadata:check が 0 errors
```

---

## 6. 運用: リリースごとの更新

新しいバージョンをリリースするとき:

1. `fastlane/metadata/{locale}/release_notes.txt` を全言語更新
2. 必要なら `description.txt` や `promotional_text.txt` も更新
3. `pnpm metadata:check` でバリデーション
4. PR → main merge → 自動 push
5. ASC で「審査へ提出」を手動で押す

**スクリーンショットの更新が必要なとき:**
1. `pnpm store-screenshots` で再生成
2. `fastlane/screenshots/{locale}/` にコピー
3. PR → merge
4. `gh workflow run "Push App Store Metadata" -f mode=screenshots`

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| `all actions must be pinned to a full-length commit SHA` | タグ参照で uses: を書いた | SHA pin に変更 (L-FL01) |
| `No value found for 'username'` | deliver CLI が ENV API Key を読まない | `--api_key_path` で JSON 渡し (L-FL02) |
| `no implicit conversion of Symbol into Integer` | precheck パラメータ形式不一致 | `default_rule_level: :warn` のみに (L-FL03) |
| アクセント記号が欠落 | LLM が ASCII で生成 | `pnpm metadata:check` で検出 (L-FL04) |
| `git add` が ignored で拒否 | `.gitignore` の `screenshots/` がマッチ | `!fastlane/screenshots/` を追加 (L-FL05) |
| `FASTLANE_ENABLE_BETA_DELIVER_SYNC_SCREENSHOTS` | sync がベータ機能 | `sync_screenshots` を削除 (L-FL06) |
| `Precheck cannot check In-app purchases with API Key` | precheck が IAP を API Key でチェック不可 | `run_precheck_before_submit: false` (L-FL07) |
| `HTTP 408` で push タイムアウト | 大量の PNG ファイル | `git config http.postBuffer 524288000` |

---

## 関連ファイル

| ファイル | 役割 |
|---|---|
| `Gemfile` | fastlane バージョン管理 |
| `fastlane/Appfile` | アプリ識別子 |
| `fastlane/Fastfile` | 3 レーン定義 |
| `.github/workflows/push-app-store-metadata.yml` | CI/CD ワークフロー |
| `scripts/validate-metadata.mjs` | メタデータ自動バリデーション |
| `docs/reference/lessons.md` | 教訓 L-FL01〜07 |
| `docs/store-listing/marketing-text.md` | スクショ用キャッチコピー |
| `scripts/store-screenshots/generate.ts` | スクショ生成パイプライン |

---

## 参考（一次情報）

- [App Store Connect Help — Localize app information](https://developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information/)
- [App Store Connect Help — Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [App Store Review Guidelines — 2.3 Accurate Metadata](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata)
- [fastlane deliver (upload_to_app_store)](https://docs.fastlane.tools/actions/upload_to_app_store/)
- [fastlane App Store Connect API auth](https://docs.fastlane.tools/app-store-connect-api/)
- [GitHub Actions billing — free for public repos](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions)
