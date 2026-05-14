# Google Play公開フロー（AABビルドから製品版リリースまで）
最終更新: 2026-03-19（JST）

この手順は、Repologアプリを**Google Play Storeで公開する**ための完全ガイドです。
AABファイルのビルドから、内部テスト→クローズドテスト→製品版リリースまでの全工程を記載します。

想定:
- Expo SDK 54 + React Native 0.81.5 + New Architecture
- EAS production ビルド（AAB形式）
- WSL2 (Ubuntu) + ローカルビルド（`--local`、クラウド無料枠を消費しない）
- 個人デベロッパーアカウント（2023年11月13日以降作成 → 12人テスター要件あり）
- お金をかけずに公開する方針

---

## 0. 全体像（Google Play公開までのフロー）

```
[Phase 1] 環境構築 & AABビルド
    ↓ 環境変数設定 → ローカルAABビルド → 署名付き.aab完成
    ↓ keystoreバックアップ（初回ビルド後に必ず実施）
[Phase 2] Play Console 手動アップロード（内部テスト）
    ↓ AABアップロード → テスター招待 → 動作確認
[Phase 3] クローズドテスト → 製品版申請 & リリース
    ↓ 昇格 → Google審査 → 段階的ロールアウト
[Phase 4] EAS Submit 設定（2回目以降の自動化）
    ↓ サービスアカウント作成 → eas.json設定 → コマンド1発でアップロード
[Phase 5] リリース後の運用
    ↓ クラッシュ監視 → アップデート → ストア統計確認
```

---

## Phase 1: 環境構築 & AABビルド

### 1-1. 前提条件（初回のみ確認）

| 項目 | 必要バージョン | 確認コマンド |
|------|-------------|------------|
| Node.js | 20.x 以上 | `node -v` |
| Java (JDK) | OpenJDK 17 | `java -version` |
| Android SDK | platforms;android-36, build-tools;36.0.0 | `ls ~/Android/Sdk/platforms/` |
| EAS CLI | 18.0.0 以上 | `npx eas-cli@latest --version` |
| Expo アカウント | ログイン済み | `npx eas-cli@latest whoami` |

### 1-2. 環境変数の確認

以下が `~/.bashrc` に設定されていることを確認：

```bash
# 確認コマンド
echo "JAVA_HOME=$JAVA_HOME"
echo "ANDROID_HOME=$ANDROID_HOME"
```

未設定の場合、以下を `~/.bashrc` に追加：

```bash
# Java
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"

# Android SDK
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

# PATH
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
```

各行の意味：

| 行 | 意味 |
|----|------|
| `JAVA_HOME` | Gradleビルドシステムが使うJDKの場所を指定 |
| `ANDROID_HOME` | Android SDKの場所。EAS CLIとGradleが参照する |
| `ANDROID_SDK_ROOT` | `ANDROID_HOME` の旧名。古いツールとの互換性のため |
| `PATH` への追加 | `sdkmanager` や `adb` をフルパスなしで使えるようにする |

設定後に反映：

```bash
source ~/.bashrc
```

### 1-3. EAS Environment 運用ルール

EAS Environment は、Expoのクラウド上で環境変数を管理する仕組み。
ローカルの `.env` ファイルと役割が似ているが、**クラウドビルド時にも使える**点が異なる。

#### .env と EAS Environment の使い分け

| 状況 | 使うもの | 理由 |
|------|---------|------|
| ローカルビルド (`--local`) | `.env` ファイル | ローカルで直接読み込まれる |
| クラウドビルド | EAS Environment | `.env` はクラウドサーバーに存在しないため |
| `npx expo start`（開発サーバー） | `.env` ファイル | EAS Environmentは無関係 |

#### 現在の設定状況

ローカル（`.env`）とクラウド（EAS Environment production）に同じ4変数が登録済み：

| 変数名 | 用途 |
|--------|------|
| `ADMOB_ANDROID_APP_ID` | AdMob Android アプリID |
| `ADMOB_ANDROID_BANNER_ID` | AdMob Android バナー広告ID |
| `ADMOB_IOS_APP_ID` | AdMob iOS アプリID |
| `ADMOB_IOS_BANNER_ID` | AdMob iOS バナー広告ID |

#### EAS Environment の管理コマンド

```bash
# 現在の環境変数を一覧表示
npx eas-cli@latest env:list --environment production

# 値も含めて表示（sensitive変数の中身を見る）
npx eas-cli@latest env:list --environment production --include-sensitive

# 新しい変数を追加
npx eas-cli@latest env:create \
  --name 変数名 \
  --value "値" \
  --environment production \
  --visibility sensitive

# EASの値をローカルの.envファイルとして取得
npx eas-cli@latest env:pull --environment production
```

| コマンド | 意味 |
|---------|------|
| `env:list` | 登録済みの環境変数を一覧表示 |
| `--environment production` | production 環境（本番用）を対象にする |
| `--include-sensitive` | 秘匿設定の値も表示する（デフォルトは `*****` でマスクされる） |
| `env:create` | 新しい環境変数を登録する |
| `--visibility sensitive` | 値を秘匿扱いにする（APIキー等に推奨） |
| `env:pull` | EASサーバーの変数をローカルの `.env.local` にダウンロードする |

#### 運用ガイドライン

| 項目 | ルール |
|------|--------|
| ローカルビルド中心の運用 | `.env` ファイルだけで問題なし |
| クラウドビルド使用時 | EAS Environment に本番値を登録する |
| development と production の分離 | テスト用IDと本番用IDを混ぜない |
| 変更時 | `.env` と EAS Environment の**両方**を更新する |

### 1-4. 品質チェック（ビルド前に必ず実施）

```bash
pnpm install --frozen-lockfile  # 依存関係を完全一致でインストール
pnpm verify                     # 5ゲート一括実行（lint, type-check, test, i18n:check, config:check）
```

個別に実行する場合:

```bash
pnpm lint                       # ESLintでコード品質チェック
pnpm test                       # Jestでユニットテスト実行
pnpm type-check                 # TypeScriptの型チェック
```

| コマンド | 意味 | 失敗時の対応 |
|---------|------|------------|
| `pnpm install --frozen-lockfile` | `pnpm-lock.yaml` と完全一致する依存関係をインストール。差異があるとエラー | `pnpm install` で更新後、ロックファイルをコミット |
| `pnpm lint` | ESLintがコーディング規約違反をチェック。warnings は許容、errors は修正必須 | 指摘箇所を修正 |
| `pnpm test` | Jestが全テストスイートを実行。全テストがパスする必要がある | 失敗したテストを修正 |
| `pnpm type-check` | TypeScriptコンパイラが型エラーをチェック。エラーがあるとビルドも失敗する | 型エラーを修正 |

### 1-5. リリース前チェックリスト（手動確認）

ビルド前に以下を確認する。特にデータ永続性は自動テストでカバーできないため手動確認が必須。

| # | 確認項目 | 確認方法 | 備考 |
|---|---------|---------|------|
| 1 | DBマイグレーションが冪等か | `db.ts` の新規マイグレーションに `hasColumn` / `WHERE` ガードがあるか目視確認 | 二重実行でエラーにならないこと |
| 2 | ファイルパスが相対パスで保存されているか | DBに `file://` や `/` 始まりのパスを直接保存していないか確認 | `photoPathUtils.ts` の `toRelativePath()` を経由すること |
| 3 | バックアップ互換性 | 新フィールドは Optional (`?`) で追加されているか | 旧バックアップのインポートが壊れないこと |
| 4 | データ永続性（Store更新後） | 旧バージョンで写真付きレポートを作成→新バージョンに更新→写真・レポート・設定が保持されているか | TestFlight / クローズドテストで実機確認 |

### 1-6. AABローカルビルド

```bash
pnpm build:android:aab:local
```

このコマンドの中身（`package.json` で定義済み）：

```bash
node scripts/prebuild-env-check.mjs android \
  && npx eas-cli@latest build -p android --profile production --local --output dist/repolog-production.aab \
  && node scripts/postbuild-verify.mjs dist/repolog-production.aab --stamp-sha
```

| オプション | 意味 |
|-----------|------|
| `prebuild-env-check.mjs android` | EAS 環境変数（REVENUECAT_*, ADMOB_*）が production に登録済か事前検証 |
| `npx eas-cli@latest` | EAS CLIの最新版を一時的にダウンロードして実行 |
| `build` | 「ビルドして」という命令 |
| `-p android` | Androidプラットフォームを指定 |
| `--profile production` | `eas.json` の `production` 設定を使用（AAB形式、autoIncrement有効） |
| `--local` | クラウドではなくローカルでビルド（**無料枠を消費しない**） |
| `--output dist/repolog-production.aab` | 完成ファイルの一時出力先（直後に SHA スタンプ付きにリネームされる） |
| `postbuild-verify.mjs ... --stamp-sha` | (1) API キー埋込検証 (2) 禁止文字列 canary 検証 (3) `dist/repolog-production-{shortSha}.aab` にリネーム |

#### 初回ビルド時の特別な対話

初回は keystore（署名鍵）が存在しないため、以下のプロンプトが表示される：

```
? Generate a new Android Keystore? › Yes / No
```

**「Yes」を選択**する。EAS CLIが自動的に：
1. keystoreを生成
2. EASサーバーに暗号化保存
3. ローカルにダウンロードしてビルドに使用

2回目以降はこのプロンプトは表示されず、自動的にEASサーバーからkeystoreがダウンロードされる。

#### ビルド結果

| 項目 | 値 |
|------|-----|
| 出力ファイル | `dist/repolog-production-{shortSha}.aab`（例: `dist/repolog-production-c71bb11.aab`）|
| ファイルサイズ | 約123MB |
| 所要時間（初回） | 約30-45分 |
| 所要時間（2回目以降） | 約6-15分 |
| versionCode | 自動インクリメント（`eas.json` の `autoIncrement: true`） |

> **2026-04-09 以降**: `pnpm build:android:aab:local` は `dist/repolog-production.aab` でビルドした後、`scripts/postbuild-verify.mjs --stamp-sha` がファイル名を `dist/repolog-production-{shortSha}.aab` に自動リネームします（`shortSha` は `git rev-parse --short HEAD` の出力）。これによりファイル名から「どのコミットからビルドされた成果物か」が視認できます。詳細は `docs/reference/lessons.md` の「2026-04-09: 「修正したのに反映されていない」報告の真因はビルド配信ギャップ」参照。

#### ビルド完了の確認

```bash
ls -lh dist/repolog-production-*.aab
```

最新のスタンプ済み AAB が存在し、サイズが100MB以上あれば成功。アップロード対象は **必ずファイル名のコミット SHA を `git log --oneline -1` の出力と一致するかチェック** してから Play Console に上げること。

#### ビルド成果物の検証ステップ（postbuild-verify.mjs）

`pnpm build:android:aab:local` の最後で自動実行される `scripts/postbuild-verify.mjs` は以下を確認します。すべて ✓ でなければ Play Console にアップロードしないでください:

| チェック | 失敗時の意味 |
|---------|------------|
| API キー埋込（REVENUECAT_*, ADMOB_*）| EAS 環境変数が production に登録されていない |
| Forbidden bundle string canary（`pdfGeneratingProgress` 等の削除済みマーカー）| ビルドキャッシュが古い／JS bundle が stale |
| `--stamp-sha` リネーム | git repo 外で実行されたなど（警告のみで継続） |

Forbidden string list はスクリプト内 `FORBIDDEN_BUNDLE_STRINGS` 配列で管理。新しい削除済み文字列は PR ごとにここへ追記してください。

### 1-7. Keystoreバックアップ（初回ビルド後に必ず実施）

keystoreを紛失すると、**Google Play上のアプリを二度と更新できなくなる**。
EASサーバーに暗号化保存されているが、ローカルにもバックアップを取っておくべき。

#### バックアップ手順

```bash
npx eas-cli@latest credentials -p android
```

対話メニューで以下を選択：
1. `Android` を選択
2. `production` ビルドプロファイルを選択
3. `credentials.json: Upload/Download credentials between EAS servers and your local json` を選択
4. `Download credentials from EAS to credentials.json` を選択

これでプロジェクトルートに以下の2ファイルが生成される：

| ファイル | 内容 |
|---------|------|
| `credentials.json` | keystoreのパス、パスワード、keyAlias、keyPassword |
| `*.jks` ファイル | 署名鍵の本体（Java KeyStore 形式） |

#### バックアップの保管

```bash
# 安全な場所にコピー
mkdir -p ~/.repolog-keystore-backup
cp credentials.json ~/.repolog-keystore-backup/
cp *.jks ~/.repolog-keystore-backup/
```

| 保管先 | 推奨度 | 備考 |
|-------|--------|------|
| パスワードマネージャー（1Password, Bitwarden等） | 最も推奨 | .jks + パスワードをセットで保管 |
| 暗号化USBドライブ | 推奨 | オフライン保管。物理紛失リスクあり |
| EASサーバー（デフォルト） | 補助的 | 既に保存済み。唯一のバックアップにしない |

#### keystoreを紛失した場合

Google Play App Signing が有効（EAS Build経由なら自動有効化）であれば、**Upload Key のリセットが可能**：

1. `eas credentials` で新しいkeystoreを生成
2. `keytool -export -rfc` で新しい証明書をPEM形式でエクスポート
3. Play Console →「アプリの整合性」→「アップロード鍵のリセットをリクエスト」

#### SHA-1 / SHA-256 フィンガープリントの確認

```bash
keytool -list -v -keystore ./path/to/keystore.jks
```

パスワードを入力すると、SHA-1とSHA-256が表示される。Google Play Console の「アプリの整合性」セクションでも確認可能。

---

## Phase 2: Play Console 手動アップロード（内部テスト）

### 2-1. AABファイルをWindowsに転送

WSL2からWindowsのダウンロードフォルダにコピー（**必ず最新の SHA スタンプ付きファイル**を選ぶこと）:

```bash
# 1) 最新ビルドの commit SHA を確認
git log --oneline -1

# 2) その SHA を含む AAB をコピー（例: c71bb11）
cp dist/repolog-production-$(git rev-parse --short HEAD).aab /mnt/c/Users/doooo/Downloads/
```

| 部分 | 意味 |
|------|------|
| `cp` | ファイルをコピーするコマンド |
| `dist/repolog-production-$(git rev-parse --short HEAD).aab` | コピー元（現在の HEAD でビルドした AAB）|
| `/mnt/c/Users/doooo/Downloads/` | コピー先（WindowsのダウンロードフォルダをWSL2からアクセスするパス） |

> **配信ミス防止**: コピー前に `ls -lh dist/repolog-production-*.aab` を実行して `dist/` 内に古い世代の AAB が残っていないか確認。残っていてアップロード対象が紛らわしい場合は古いものを削除してから操作する。

### 2-2. Google Play Console でアップロード

1. ブラウザで [Google Play Console](https://play.google.com/console/) を開く
2. Repolog アプリを選択
3. 左メニュー →「テスト」→「内部テスト」
4. **「新しいリリースを作成」** をクリック
5. 「App Bundle」セクションの **「アップロード」** をクリック
6. Windowsのダウンロードフォルダから `repolog-production-{shortSha}.aab` を選択（**ファイル名の SHA が `git log --oneline -1` の SHA と一致するか必ず目視確認**）
7. アップロード完了を待つ（123MB、数分かかる）

### 2-3. リリースの詳細を入力

| 項目 | 入力内容 |
|------|---------|
| リリース名 | 自動入力されるのでそのままでOK（例: `2 (1.0.0)`） |
| リリースノート | テスターへのメッセージを入力（下記例参照） |

リリースノートの例：
```
Repolog v1.0.0 内部テスト版

【テストしてほしいこと】
- レポートの作成・編集・削除
- PDF出力
- 写真の追加・編集
- 日本語/英語の言語切替
- 広告バナーの表示（Free版）

【フィードバック方法】
問題を見つけたら GitHub Issues に報告してください
```

### 2-4. テスターの管理

1. 「テスター」タブに移動
2. **「メーリングリストを作成」** をクリック
3. リスト名を入力（例: `内部テスター`）
4. テスターのGmailアドレスを入力
5. **「保存」** → **「オプトインURL」** をコピー
6. テスターにオプトインURLを送る

### 2-5. リリースを公開

1. **「リリースのレビュー」** をクリック
2. 内容を確認
3. **「内部テストとしてリリースを開始」** をクリック

内部テストは審査なしで即時配信される（数分〜数時間で反映）。

---

## Phase 3: クローズドテスト → 製品版申請 & リリース

### 3-1. 内部テストからクローズドテストに昇格

1. Play Console →「テスト」→「内部テスト」
2. リリース済みバージョンの **「リリースをプロモート」** をクリック
3. **「クローズドテスト」** を選択
4. リリースノートを入力（クローズドテスト用に修正可能）
5. **「リリースのレビュー」→「クローズドテストとしてリリースを開始」**

**注意**: クローズドテスト初回はGoogleの審査が入る（数時間〜最大7日）。

### 3-2. クローズドテストで必要な追加情報

クローズドテストでは以下の入力が必要（内部テストでは不要だったもの）：

| 項目 | 入力内容 | 参照ドキュメント |
|------|---------|----------------|
| ストア掲載文（日英） | アプリ名、短い説明、詳しい説明 | `docs/store-listing/android/` |
| スクリーンショット | 最低2枚（推奨4-8枚） | 既存の撮影済みファイル |
| Feature Graphic | 1024×500px | 既存の作成済みファイル |
| プライバシーポリシーURL | `https://doooooraku.github.io/Repolog/privacy/` | `docs/privacy/index.html` |
| Data Safety | データ収集の申告 | `docs/store-listing/data-safety/data-safety-declaration.md` |
| コンテンツレーティング | IARCアンケート回答 | 全年齢（Everyone）を想定 |

### 3-3. 製品版リリース

製品版の準備が整ったら：
1. Play Console →「製品版」→「新しいリリースを作成」
2. クローズドテストのAABを **昇格（プロモート）**
3. **段階的ロールアウト**を推奨（1% → 10% → 50% → 100%）

#### 段階的ロールアウト判断基準

| 段階 | ユーザー率 | 期間 | 次に進む条件 |
|------|---------|------|------------|
| 1 | 1% | 1日 | クラッシュ率 0%、起動時間 < 3秒 |
| 2 | 10% | 2日 | レビュー平均 ⭐4.0 以上、重大バグ報告 0件 |
| 3 | 50% | 3日 | メモリ使用量・バッテリー消費が正常 |
| 4 | 100% | 即時 | 全段階で問題なし |

---

## Phase 4: EAS Submit 設定（2回目以降の自動化）

### 4-0. EAS Submitとは

手動でPlay Console画面からAABをアップロードする代わりに、コマンド1つで自動アップロードできるツール。

```
手動: AAB → ブラウザでPlay Console開く → ドラッグ&ドロップ → 設定入力
自動: eas submit -p android --path ./dist/repolog-production.aab  ← これだけ
```

**費用: 完全無料**（回数制限なし）。

**前提**: 初回のAABは必ず手動でアップロードする必要がある（Google Play API の制限）。

### 4-1. Google Cloud Console でサービスアカウントを作成

サービスアカウントは、あなたの代わりにPlay ConsoleにアプリをアップロードしてくれるAPI用アカウント。

#### A. 新規プロジェクト作成

1. ブラウザで [Google Cloud Console](https://console.cloud.google.com/projectcreate) を開く
2. プロジェクト名を入力（例: `Repolog Play Store`）→「作成」
3. 完了確認: プロジェクト一覧に新規プロジェクトが表示される

#### B. サービスアカウント作成

4. 左メニュー →「IAMと管理」→「サービスアカウント」
5. **「サービスアカウントを作成」** をクリック
6. 名前: `repolog-play-submit`、説明: `Google Playへの自動アップロード用`
7. **「完了」** をクリック（IAMロールの付与はスキップ）
8. 完了確認: サービスアカウント一覧に表示される
9. 作成されたアカウントの**メールアドレス**をコピーして控える（Step 4-3 で使う）

#### C. JSONキー生成

10. アカウントをクリック → 上部の **「鍵」** タブを開く
11. **「鍵を追加」→「新しい鍵を作成」→「JSON」→「作成」**
12. JSONファイルが自動ダウンロードされる
13. 完了確認: ダウンロードフォルダにJSONファイルがある

### 4-2. Google Play Android Developer API を有効化

1. ブラウザで [Google Play Android Developer API](https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com) を開く
2. 正しいプロジェクトが選択されていることを確認
3. **「有効にする」** をクリック

### 4-3. Play Console でサービスアカウントに権限を付与

1. [Google Play Console](https://play.google.com/console/) →「ユーザーと権限」→「新しいユーザーを招待」
2. Step 4-1 でコピーした**メールアドレス**を入力
3. 「アプリの権限」で **Repolog** を選択（「Add app」で追加）
4. 以下の権限を付与：
   - 「Release to production, exclude devices, and use Play app signing」
   - 「Release apps to testing tracks」
5. **「ユーザーを招待」** をクリック

**注意**: 権限反映に**最大24〜48時間**かかることがある。

### 4-4. サービスアカウントキーを安全に保管

Step 4-1 でダウンロードしたJSONキーファイルをプロジェクトに配置：

```bash
# secrets ディレクトリを作成
mkdir -p secrets

# WindowsのダウンロードフォルダからJSONキーをコピー
cp /mnt/c/Users/doooo/Downloads/repolog-play-submit-*.json secrets/google-service-account.json

# 配置を確認
ls -la secrets/google-service-account.json
```

**セキュリティ確認**: `.gitignore` で `secrets/` が除外されているか確認：

```bash
grep secrets .gitignore
# → "secrets/" と表示されればOK（PR #199 で追加済み）
```

**重要**: このJSONファイルは秘密鍵。Gitにコミットしない。

### 4-5. eas.json の submit セクションを設定

`eas.json` の `"submit"` セクションを以下に変更：

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./secrets/google-service-account.json",
      "track": "internal",
      "releaseStatus": "completed"
    }
  }
}
```

| 設定キー | 意味 | 有効な値 |
|---------|------|---------|
| `serviceAccountKeyPath` | JSONキーファイルへのパス | ファイルパス |
| `track` | アップロード先トラック | `internal`（内部テスト）, `alpha`（クローズド）, `beta`（オープン）, `production`（製品版） |
| `releaseStatus` | リリース状態 | `completed`（即時公開）, `draft`（下書き、手動公開が必要） |

**トラックの使い分け**:
- テスト段階: `"track": "internal"` で内部テストに提出
- 製品版リリース: `"track": "production"` に変更して提出

### 4-6. EAS Submit を実行（2回目以降）

```bash
# ローカルのAABファイルを直接提出（現在の HEAD でビルドしたものを選ぶ）
npx eas-cli@latest submit -p android --path "./dist/repolog-production-$(git rev-parse --short HEAD).aab"

# またはEASビルド済みの最新を提出
npx eas-cli@latest submit -p android --latest
```

| オプション | 意味 |
|-----------|------|
| `submit` | 「ストアに提出して」という命令 |
| `-p android` | Androidを対象 |
| `--path ./dist/...` | ローカルのAABファイルを直接指定（SHA スタンプ付き）|
| `--latest` | EASサーバー上の最新ビルドを自動選択 |

### 4-7. ビルドから提出までの一括フロー（推奨）

```bash
# Step 1: 品質チェック
pnpm verify

# Step 2: ローカルビルド（dist/repolog-production-{sha}.aab に出力される）
pnpm build:android:aab:local

# Step 3: 自動提出（同じ HEAD の SHA を解決して渡す）
npx eas-cli@latest submit -p android --path "./dist/repolog-production-$(git rev-parse --short HEAD).aab"
```

---

## Phase 5: リリース後の運用

### 5-1. アップデートの流れ

```bash
# 1. コード修正 & マージ
# 2. 品質チェック
pnpm verify

# 3. AABビルド（versionCodeは自動インクリメント、ファイル名に commit SHA が付く）
pnpm build:android:aab:local

# 4. 提出（EAS Submit設定済みの場合）
npx eas-cli@latest submit -p android --path "./dist/repolog-production-$(git rev-parse --short HEAD).aab"
```

### 5-2. バージョン管理

| 項目 | 管理方法 |
|------|---------|
| `versionCode` (整数) | `eas.json` の `autoIncrement: true` で自動管理 |
| `versionName` (文字列) | `app.json` の `version` を手動更新（例: `1.0.0` → `1.1.0`） |

```bash
# 現在のリモートバージョンを確認
npx eas-cli@latest build:version:get -p android
```

---

## 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `app.config.ts` | Android設定、パーミッション、AdMob、ローカライゼーション |
| `app.json` | アプリ名、バージョン、アイコン、パッケージ名 |
| `eas.json` | ビルドプロファイル、submit設定、バージョン管理 |
| `package.json` | ビルドスクリプト定義 |
| `.env` | ローカル環境変数（AdMob ID等） |
| `.gitignore` | 署名鍵・認証情報の除外設定 |
| `docs/store-listing/` | ストア掲載文（日英）のドラフト |
| `docs/store-listing/data-safety/` | Data Safety申告の下書き |
| `docs/privacy/index.html` | プライバシーポリシー |
| `docs/terms/index.html` | 利用規約 |
| `docs/how-to/development/android_build.md` | Android APK/AABビルド手順（前提ドキュメント） |
| `docs/how-to/development/admob_advertising_setup.md` | AdMob本番化手順（Phase 7がストア公開に対応） |

---

## 参考（一次情報）

- [Google Play Console ヘルプ: 内部テスト](https://support.google.com/googleplay/android-developer/answer/9845334?hl=ja)
- [Google Play Console ヘルプ: 個人アカウントテスト要件](https://support.google.com/googleplay/android-developer/answer/14151465?hl=ja)
- [Expo: Submit to Google Play Store](https://docs.expo.dev/submit/android/)
- [Expo: Run EAS Build locally](https://docs.expo.dev/build-reference/local-builds/)
- [Expo: Android build process](https://docs.expo.dev/build-reference/android-builds/)
- [Expo: Configure EAS Submit with eas.json](https://docs.expo.dev/submit/eas-json/)
- [Expo: Environment variables in EAS](https://docs.expo.dev/eas/environment-variables/)
- [Expo: App credentials](https://docs.expo.dev/app-signing/app-credentials/)
- [Expo FYI: Creating Google Service Account](https://github.com/expo/fyi/blob/main/creating-google-service-account.md)
- [Expo FYI: First Android Submission](https://github.com/expo/fyi/blob/main/first-android-submission.md)
- [Expo FYI: Android Reset Keystore](https://github.com/expo/fyi/blob/main/android-reset-keystore.md)
