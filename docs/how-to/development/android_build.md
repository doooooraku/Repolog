# Android_ビルド手順（自前Android実機にAPK導入）
最終更新: 2026-02-27（JST）

この手順は、`Repolog` を **EAS + ローカルGradle** で APK 化し、
自前の Android スマホへインストールして確認するための運用です。

想定:
- WSL2 から Windows ADB 経由でスマホと通信
- `adb install` でAPKを直接インストール（推奨）
- 手動転送（Google Drive 等）はフォールバック

---

## 0. 全体像（最短ルート）
1. 依存関係と品質チェック（CIと同順）
2. EAS 設定を準備（`eas.json`）
3. `preview-local-apk` プロファイルでローカル APK ビルド
4. `adb install` でスマホへ直接インストール（約20秒）
5. 失敗時は `preview-cloud-apk` へ切替（EAS internal 配布）

---

## 1. 事前準備（初回のみ）

### 1-1. 必要ツール
- Node.js 20 以上（`eas-cli@18` が Node 20+ 必須）
- Java 17
- Android SDK（`platform-tools`, `build-tools`, `platforms`）
- Expo アカウント

### 1-2. 実行場所
```bash
cd /home/doooo/04_app-factory/apps/Repolog
```
意味:
- `cd`: 作業ディレクトリを移動する

### 1-3. バージョン確認
```bash
node -v
java -version
pnpm -v
```
意味:
- `node -v`: Node.js のバージョンを表示
- `java -version`: Java のバージョンを表示
- `pnpm -v`: pnpm のバージョンを表示

### 1-4. Android SDK パス確認
```bash
echo "$ANDROID_SDK_ROOT"
echo "$ANDROID_HOME"
```
意味:
- `echo`: 環境変数の中身を表示
- `ANDROID_SDK_ROOT` / `ANDROID_HOME`: Android SDK の場所

---

## 2. 品質チェック（CIと同じ順番）

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm type-check
```

意味:
- `pnpm install --frozen-lockfile`: lockfile どおりに依存を厳密インストール
- `pnpm lint`: ESLint で静的検査
- `pnpm test`: Jest テスト実行
- `pnpm type-check`: TypeScript の型検査

補足:
- CI は `pnpm install -> pnpm lint -> pnpm test -> pnpm type-check` 順です。

---

## 3. EAS ログインと設定

### 3-1. EAS にログイン
```bash
npx eas-cli@latest login
```
意味:
- `npx`: ローカルに固定インストールせず一時実行
- `eas-cli`: Expo Application Services の CLI
- `login`: Expo アカウント認証

### 3-2. EAS プロジェクト連携（初回のみ）
```bash
npx eas-cli@latest init
```
意味:
- `init`: Expo プロジェクトと EAS プロジェクトを紐付ける
- 実行すると、必要に応じて `app.json` / `app.config.*` に EAS Project ID が保存される

### 3-3. 設定ファイル確認
`Repolog` では `eas.json` を利用します。
主要プロファイル:
- `preview-local-apk`: ローカルビルド用 APK
- `preview-cloud-apk`: クラウドビルド用 APK
- `production`: Play 提出用 AAB

---

## 4. ローカル APK ビルド（本命）

### 4-1. 出力先フォルダ作成
```bash
mkdir -p dist
```
意味:
- `mkdir`: フォルダを作る
- `-p`: すでに存在してもエラーにしない

### 4-2. APK ビルド実行
```bash
pnpm build:android:apk:local
```

実体コマンド:
```bash
npx eas-cli@latest build -p android --profile preview-local-apk --local --output dist/repolog-preview-local.apk
```

意味:
- `eas build`: EAS ビルドを実行
- `-p android`: Android 向け
- `--profile preview-local-apk`: `eas.json` のビルド設定を指定
- `--local`: EAS クラウドではなく、手元マシンでビルド（内部で Gradle 実行）
- `--output ...apk`: 成果物 APK の保存先

### 4-3. 生成物を確認
```bash
ls -lh dist/repolog-preview-local.apk
```
意味:
- `ls`: ファイル一覧表示
- `-l`: 詳細表示
- `-h`: サイズを人間向け表示（KB/MB）

---

## 5. スマホへインストール

### 5-1. adb install（推奨・約20秒）

USB 接続＋USBデバッグ ON の状態で、WSL2 から直接インストールできる。

```bash
pnpm install:device
```

実体コマンド:
```bash
adb install -r "$(wslpath -w dist/repolog-preview-local.apk)"
```

意味:
- `adb install`: USBケーブル経由でAPKを直接スマホにインストール
- `-r`: 既にインストール済みでも上書き（replace）する
- `wslpath -w`: WSL2のパスをWindows形式（`\\wsl.localhost\...`）に変換
- `adb.exe` はWindowsバイナリのため、Windowsが理解できるパスが必要

前提:
- スマホがUSB接続されている
- USBデバッグが ON（`android_デバッグ手順.md` 参照）
- `adb devices` で `device` と表示される

### 5-2. ビルド＆インストール一括実行

```bash
pnpm build:android:apk:local && pnpm install:device
```

意味:
- APK ビルド後、自動的にスマホへインストールまで実行
- `&&`: 前のコマンドが成功した場合のみ次を実行

### 5-3. 手動転送（フォールバック）

USB接続が使えない場合の代替手段:
- Google Drive / OneDrive / Dropbox にAPKをアップロード
- スマホでダウンロード → タップしてインストール
- 初回は「提供元不明アプリのインストール許可」が必要

### 5-4. 起動確認チェック
- アプリ起動できる
- レポート作成できる
- 写真追加できる
- PDF プレビューできる

---

## 6. 失敗時の切替（クラウド internal 配布）

ローカルビルドで詰まったら、同じ `eas.json` でクラウドに切替。

```bash
pnpm build:android:apk:cloud
```

実体コマンド:
```bash
npx eas-cli@latest build -p android --profile preview-cloud-apk
```

意味:
- `preview-cloud-apk`: EAS クラウドで APK を作成
- 完了後に配布 URL が発行されるため、スマホから直接インストール可能

---

## 7. Play提出用（参考）

スマホ確認用 APK と、Play 提出用 AAB は用途が違います。

```bash
pnpm build:android:aab:cloud
```

実体コマンド:
```bash
npx eas-cli@latest build -p android --profile production
```

意味:
- `production` プロファイルは `app-bundle`（AAB）を生成
- AAB は基本的に端末へ直接インストールせず、Play Console へ提出する

---

## 8. よくある詰まりポイント

1. Node 18 で `eas-cli@18` を使っている
- 対処: Node 20 以上へ上げる

2. `ANDROID_SDK_ROOT` が空
- 対処: Android SDK をインストールし、環境変数を設定

3. AdMob / RevenueCat の環境変数が未設定
- 対処: `.env` などで必要値を設定（秘密情報の直書き禁止）

4. `prebuild` 反映漏れ
- 対処: ネイティブ設定変更時は `npx expo prebuild --platform android` を実行

5. AAB をスマホに入れようとしている
- 対処: 実機確認は APK を使う

---

## 9. 参考（一次情報）
- EAS local builds: https://docs.expo.dev/build-reference/local-builds/
- Build APKs for Android emulators and devices: https://docs.expo.dev/build-reference/apk/
- Internal distribution: https://docs.expo.dev/build/internal-distribution/
- eas.json reference: https://docs.expo.dev/eas/json/
- Set up EAS Build: https://docs.expo.dev/build/setup/
- Environment variables in EAS: https://docs.expo.dev/eas/environment-variables/
- Android App Bundle overview: https://developer.android.com/guide/app-bundle
- Android adb command-line tool: https://developer.android.com/tools/adb
