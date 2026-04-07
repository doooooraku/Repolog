# iOS TestFlight公開フロー（IPAビルドからTestFlight提出まで）
最終更新: 2026-03-27（JST）

この手順は、ExpoアプリをGitHub Actionsの**macOSランナーでIPAビルド**し、**TestFlightへ自動提出**するための完全ガイドです。
初回セットアップから、CI/CDワークフロー構築、動作確認までの全工程を記載します。

想定:
- Expo SDK 54 + React Native 0.81.5 + New Architecture
- EAS production ビルド（IPA形式）
- GitHub Actions macOS ランナー（公開リポジトリのため無料）でローカルビルド（`--local`）
- WSL2 (Ubuntu) から初期セットアップ（Macを持っていない前提）
- App Store Connect API Key 方式（セッションキャッシュに依存しない恒久的な方式）

---

## 0. 全体像（TestFlight提出までのフロー）

```
[Phase 1] Apple 側の準備（App Store Connect）
    ↓ アプリ登録 → ascAppId 取得

[Phase 2] EAS 証明書セットアップ（WSL2 から実行）
    ↓ eas credentials → Distribution Certificate + Provisioning Profile

[Phase 3] Expo アクセストークン作成
    ↓ expo.dev でトークン生成

[Phase 4] GitHub Secrets 設定
    ↓ EXPO_TOKEN + ASC_API_KEY_P8_BASE64 + 環境変数

[Phase 5] eas.json 設定
    ↓ submit.production.ios セクション追加

[Phase 6] GitHub Actions ワークフロー作成
    ↓ build-ios-testflight.yml 作成

[Phase 7] テスト実行 & TestFlight 確認
    ↓ 手動実行 → 全ステップ成功 → TestFlight でインストール確認
```

---

## アカウント単位の資産（全アプリ共通・再作成不要）

以下は一度セットアップすれば、新しいアプリでも再利用できる。

| 資産 | 保管場所 | 備考 |
|------|---------|------|
| Apple Developer Program | https://developer.apple.com/ | 年額 $99 |
| App Store Connect API Key (.p8) | `04_app-factory/docs/01_key/01_AppStore/App Store Connect API/AuthKey_6768KZU85A.p8` | Key ID: `6768KZU85A` |
| Issuer ID | App Store Connect → 統合 → API | `1f21bf99-fe11-4f44-9827-5b0bfbc3390e` |
| Expo アカウント | https://expo.dev/ | dooraku |
| EXPO_TOKEN | GitHub Secrets | アカウント単位。全プロジェクト共通で使い回し可能 |
| ASC_API_KEY_P8_BASE64 | GitHub Secrets | .p8 の Base64。全プロジェクト共通で使い回し可能 |
| Distribution Certificate | EAS サーバー | EAS が管理。全アプリ共通で自動再利用される |

---

## Phase 1: Apple 側の準備（App Store Connect）

### 1-1. アプリを App Store Connect に登録

1. https://appstoreconnect.apple.com/ にログイン
2. 「マイ App」→「+」→「新規 App」
3. 入力項目：

| 項目 | 値の例 | 説明 |
|------|-------|------|
| プラットフォーム | iOS | iOSを選択 |
| 名前 | Repolog | App Storeに表示される名前 |
| プライマリ言語 | 日本語 | 主要言語 |
| バンドル ID | com.dooooraku.repolog | Apple Developer Portal で事前登録が必要 |
| SKU | repolog | 任意の一意文字列 |

### 1-2. ascAppId を取得

作成後の画面で確認：
- 「App 情報」→「一般情報」→ **Apple ID** に表示される数字

```
例: 6760099822
```

この数字を Phase 5 で `eas.json` に設定する。

---

## Phase 2: EAS 証明書セットアップ（WSL2 から実行）

> Mac がなくても WSL2 から実行可能。ただし Apple の **2FA（二段階認証）** のため、iPhone/iPad が手元に必要。

### 2-1. 前提条件

| 項目 | 必要バージョン | 確認コマンド |
|------|-------------|------------|
| Node.js | 20.x 以上 | `node -v` |
| EAS CLI | 18.0.0 以上 | `npx eas-cli@latest --version` |
| Expo ログイン | 済 | `npx eas-cli@latest whoami` |

### 2-2. プロジェクトルートに移動

```bash
cd /home/doooo/04_app-factory/apps/Repolog
```

意味：
- `cd`：ディレクトリを移動するコマンド
- プロジェクトのルートで EAS コマンドを実行する必要がある

### 2-3. iOS 証明書のセットアップ（対話式・初回のみ）

```bash
npx eas-cli@latest credentials --platform ios
```

意味：
- `npx eas-cli@latest`：EAS CLIの最新版を使って実行
- `credentials`：証明書の管理コマンド
- `--platform ios`：iOS用の証明書を操作

対話の流れ：

| 質問 | 回答 |
|------|------|
| Which build profile? | `production` を選択 |
| Log in to Apple account? | `yes` |
| Apple ID: | Apple Developer のメールアドレス |
| Password: | Apple Developer のパスワード |
| 2FA code: | iPhone に届く6桁コード |
| What do you want to do? | `Build Credentials` を選択 |
| What do you want to do? | `All: Set up all the required credentials` を選択 |
| Reuse distribution cert? | `yes`（2つ目以降のアプリの場合） |
| Generate provisioning profile? | `yes` |

完了メッセージ：
```
All credentials are ready to build @dooraku/（アプリ名）
```

**重要ポイント：**
- Distribution Certificate はアカウント単位（全アプリ共通で再利用される）
- Provisioning Profile はアプリ単位（アプリごとに新規作成される）
- 証明書は EAS サーバーに安全に保存される。ローカルに `.p12` 等を持つ必要はない

---

## Phase 3: Expo アクセストークン作成

> 既にトークンがある場合はスキップ可能。1つのトークンで全プロジェクト共通で使い回せる。

### 3-1. トークンを作成

1. https://expo.dev/accounts/dooraku/settings/access-tokens にアクセス
2. 「Create token」をクリック
3. Token name: `（アプリ名）Actions`（例: `RepologActions`）
4. Expiration: `No expiration`
5. 「Create」→ 表示されたトークン値をコピー

**注意**: この画面を閉じるとトークン値は二度と表示されない。必ず即座にコピーすること。

---

## Phase 4: GitHub Secrets 設定

### 4-1. Secrets 一覧

`https://github.com/(owner)/(repo)/settings/secrets/actions` で設定する。

| # | Secret 名 | 値の取得方法 | 全アプリ共通？ |
|---|-----------|------------|-------------|
| 1 | `EXPO_TOKEN` | Phase 3 でコピーした値 | 共通OK |
| 2 | `ASC_API_KEY_P8_BASE64` | 下記コマンドで生成 | 共通OK |
| 3 | `ADMOB_IOS_APP_ID` | `.env` から転記 | アプリ固有 |
| 4 | `ADMOB_IOS_BANNER_ID` | `.env` から転記 | アプリ固有 |
| 5 | `REVENUECAT_IOS_API_KEY` | `.env` から転記 | アプリ固有 |

Secret 3〜5 はアプリが使う外部サービスにより異なる。AdMob や RevenueCat を使わないアプリでは不要。

### 4-2. ASC_API_KEY_P8_BASE64 の生成

WSL2 で以下を実行：

```bash
base64 -w 0 "/home/doooo/04_app-factory/docs/01_key/01_AppStore/App Store Connect API/AuthKey_6768KZU85A.p8" | clip.exe
```

意味：
- `base64`：ファイルを Base64 文字列に変換するコマンド
- `-w 0`：改行なしで1行に出力（Secret に貼り付けるため）
- `| clip.exe`：出力を Windows のクリップボードにコピー

実行後、**他の操作をせずに**ブラウザで GitHub Secrets ページを開き `Ctrl+V` で貼り付ける。

---

## Phase 5: eas.json の submit 設定

`eas.json` の `submit` セクションに iOS の提出先情報を追加する。

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "（Phase 1 で取得した Apple ID 数字）",
        "ascApiKeyId": "6768KZU85A",
        "ascApiKeyIssuerId": "1f21bf99-fe11-4f44-9827-5b0bfbc3390e",
        "ascApiKeyPath": "./secrets/AuthKey.p8"
      }
    }
  }
}
```

各フィールドの意味：

| フィールド | 意味 | アプリごとに変える？ |
|-----------|------|-------------------|
| `ascAppId` | App Store Connect 上のアプリ ID | **はい** |
| `ascApiKeyId` | API Key の識別子 | いいえ（アカウント共通） |
| `ascApiKeyIssuerId` | Apple Developer チームの識別子 | いいえ（アカウント共通） |
| `ascApiKeyPath` | CI で復元される .p8 ファイルのパス | いいえ（パスは統一） |

**重要**: `.gitignore` に `secrets/` と `*.p8` が含まれていることを確認すること。

---

## Phase 6: GitHub Actions ワークフロー作成

`.github/workflows/build-ios-testflight.yml` を作成する。

### 6-1. ワークフローの全体構造

```
Checkout → pnpm → Node.js → EAS CLI → 依存関係
    ↓
.env 生成（GitHub Secrets → .env ファイル）
    ↓
品質チェック（pnpm verify）
    ↓
iOS ビルド（eas build --local → Repolog.ipa）
    ↓
ASC API Key 復元（GitHub Secret → secrets/AuthKey.p8）
    ↓
TestFlight 提出（eas submit）
    ↓
Artifact 保存 + Summary 出力
```

### 6-2. ワークフロー YAML

正は `.github/workflows/build-ios-testflight.yml` を参照。

主要なコマンドの意味：

| コマンド | 意味 |
|---------|------|
| `eas build --platform ios --profile production --local --non-interactive --output=Repolog.ipa` | macOS ランナー上で iOS アプリをビルドし、Repolog.ipa として出力 |
| `echo "${{ secrets.ASC_API_KEY_P8_BASE64 }}" \| base64 -d > secrets/AuthKey.p8` | GitHub Secret から .p8 ファイルを復元 |
| `eas submit --platform ios --path Repolog.ipa --profile production --non-interactive --no-wait` | ビルドした .ipa を TestFlight にアップロード |

各オプションの詳細：

| オプション | 意味 |
|-----------|------|
| `--platform ios` | iOS 向けにビルド/提出 |
| `--profile production` | `eas.json` の `production` 設定を使用 |
| `--local` | EAS クラウドではなく、この macOS ランナー上でビルド |
| `--non-interactive` | 対話的な質問をスキップ（CI 向け） |
| `--output=Repolog.ipa` | 出力ファイル名を指定 |
| `--path Repolog.ipa` | 提出する .ipa ファイルを指定 |
| `--no-wait` | アップロード後、Apple の処理完了を待たない |

### 6-3. トリガー

| トリガー | 説明 | 使い分け |
|---------|------|---------|
| `workflow_dispatch` | GitHub Actions 画面の「Run workflow」ボタン | テスト実行、緊急再ビルド |
| `push: tags: - "v*"` | `v` で始まるタグの push | リリース候補(`v1.0.0-rc.1`)、正式版(`v1.0.0`) |

タグ push でビルドする手順：

```bash
git switch main
git pull --ff-only origin main
git tag -a v1.0.0-rc.1 -m "Repolog v1.0.0-rc.1"
git push origin v1.0.0-rc.1
```

意味：
- `git tag -a`：注釈付きタグを作成
- `git push origin <tag>`：タグをリモートに push → ワークフロー自動実行

**注意**: 通常の `git push`（ブランチ push）や PR マージではワークフローは実行されない。タグを明示的に作成・push したときだけ実行される。

### 6-4. macOS ランナーの料金

| リポジトリ種別 | `macos-latest` | `macos-latest-large` |
|-------------|---------------|---------------------|
| **公開（Public）** | **無料**（分数制限なし） | 有料 |
| 非公開（Private） | 10倍消費（月200分まで無料） | 有料 |

公開リポジトリであれば `macos-latest` は完全無料で使い放題。同時実行は5ジョブまで。

---

## Phase 7: テスト実行 & TestFlight 確認

### 7-1. 手動実行

1. `https://github.com/(owner)/(repo)/actions` にアクセス
2. 左メニューから「Build iOS & Submit to TestFlight」を選択
3. 「Run workflow」→「Run workflow」をクリック
4. 全ステップが成功するまで待つ（約15分）

### 7-2. 成功の確認

GitHub Actions の全ステップが緑色（success）であることを確認。特に：

| ステップ | 確認内容 |
|---------|---------|
| Build iOS IPA | `Build successful` が表示されること |
| Setup ASC API Key | エラーなしで完了すること |
| Submit to TestFlight | `Uploaded to EAS Submit` が表示されること |
| Upload IPA artifact | Artifact がアップロードされること |

### 7-3. TestFlight で確認

1. https://appstoreconnect.apple.com/ → 「TestFlight」タブ
2. 新しいビルドが表示されるまで 5〜15分待つ（Apple の処理時間）
3. 「内部テスト」グループにテスターを追加
4. テスターの iPhone で TestFlight アプリからインストール

### 7-4. ⚠️ TestFlight ビルドでは確認できないこと

**Apple の仕様により、以下は TestFlight 配布では動作しない**。検証が必要な場合は **App Store Production 配信版** または **Xcode dev ビルド**（`expo run:ios`）を使うこと。

| 機能 | TestFlight での挙動 | 検証方法 |
|---|---|---|
| `SKStoreReviewController.requestReview()`（アプリ内レビュー依頼） | **ダイアログは一切表示されない**（完全に no-op） | App Store Production 版 / Xcode dev ビルド |

**SKStoreReviewController の TestFlight 非表示は Issue #289 で再発確認済み**。一次情報:
- [Apple Developer Forums: Potential Issue with SKStoreReview](https://developer.apple.com/forums/thread/794961)
- [Critical Moments: SKStoreReviewController Guide](https://criticalmoments.io/blog/skstorereviewcontroller_guide_with_examples)
- [react-native-rate Issue #52](https://github.com/KjellConnelly/react-native-rate/issues/52)

ADR-0012 の手動チェック手順では iOS 行に「TestFlight では検証不可」と注記してある。検証環境の違いを取り違えると **コードが正しいのにバグとして誤報告される** ので注意。

---

## トラブルシューティング

### E-1: 「App Store Connect API Keys cannot be set up in --non-interactive mode」

原因：`eas.json` に ASC API Key 情報が設定されていない、または `secrets/AuthKey.p8` が正しく復元されていない。

対処：
1. `eas.json` の `submit.production.ios` に `ascApiKeyId`, `ascApiKeyIssuerId`, `ascApiKeyPath` があるか確認
2. GitHub Secret `ASC_API_KEY_P8_BASE64` が正しく設定されているか確認
3. ワークフローに「Setup ASC API Key」ステップがあるか確認

### E-2: 証明書セットアップ時に「Session expired」

原因：Apple のセッションが期限切れ。

対処：Apple ID + パスワード + 2FA コードで再認証する。`eas credentials --platform ios` を再実行。

### E-3: Distribution Certificate limit reached

原因：Apple の証明書上限（最大3つ）に達した。

対処：EAS が既存の証明書を Revoke（無効化）するか聞いてくるので、不要なものを選んで `Yes`。

---

## 新アプリ作成時チェックリスト

```
□ Phase 1: App Store Connect にアプリ登録 → ascAppId メモ
□ Phase 2: eas credentials --platform ios 実行（証明書セットアップ）
□ Phase 3: EXPO_TOKEN 作成（既存流用なら不要）
□ Phase 4: GitHub Secrets 設定
  □ EXPO_TOKEN（既存流用可能）
  □ ASC_API_KEY_P8_BASE64（既存流用可能）
  □ アプリ固有の環境変数（AdMob, RevenueCat 等）
□ Phase 5: eas.json の submit.production.ios 設定（ascAppId のみ変更）
□ Phase 6: build-ios-testflight.yml 作成（テンプレートコピー）
□ Phase 7: .gitignore に *.p8, secrets/ があるか確認
□ Phase 7: 手動実行テスト → 全ステップ成功確認
□ Phase 7: TestFlight でビルド表示・インストール確認
```

---

## 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `eas.json` | EAS ビルド・提出の設定ファイル |
| `.github/workflows/build-ios-testflight.yml` | iOS ビルド＆TestFlight 提出ワークフロー |
| `app.json` | Expo アプリ設定（`ios.bundleIdentifier`, Privacy Manifests 等） |
| `docs/how-to/development/ios_build.md` | iOS ビルド手順（Debug/Release） |
| `docs/how-to/workflow/release_notes_template.md` | リリースノートテンプレート |
| `docs/adr/ADR-0010-ios-encryption-export-compliance.md` | 暗号化コンプライアンス方針 |
| `scripts/config-check.mjs` | app.json の iOS 必須設定を自動検証 |
| `04_app-factory/docs/01_key/01_AppStore/App Store Connect API/AuthKey_6768KZU85A.p8` | ASC API Key（全アプリ共通） |

---

## 参考（一次情報）

- Expo EAS Build: https://docs.expo.dev/build/introduction/
- Expo EAS Submit (iOS): https://docs.expo.dev/submit/ios/
- Expo eas.json reference: https://docs.expo.dev/eas/json/
- Expo Building on CI: https://docs.expo.dev/build/building-on-ci/
- Expo Local Builds: https://docs.expo.dev/build-reference/local-builds/
- Expo Managed Credentials: https://docs.expo.dev/app-signing/managed-credentials/
- Apple Developer: https://developer.apple.com/
- App Store Connect: https://appstoreconnect.apple.com/
- GitHub Actions macOS Runners: https://docs.github.com/en/actions/using-github-hosted-runners/using-github-hosted-runners/about-github-hosted-runners
- GitHub Actions Billing: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
