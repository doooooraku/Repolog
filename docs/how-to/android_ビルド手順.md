# Android_ビルド手順（Debug運用 / Release提出）
最終更新: 2026-02-10（JST）

## 1. タグ運用（リリース可視化）
リリース前に必ずタグとノートを作成する。  
正は `docs/how-to/release_notes_template.md`。

### 1-1. 候補版タグ（RC）を作る
git switch main
git pull --ff-only origin main
git tag -a v1.0.0-rc.1 -m "Repolog v1.0.0-rc.1"
git push origin v1.0.0-rc.1

意味：
- git tag -a：注釈付きタグを作る（履歴として残る）
- v1.0.0-rc.1：候補版（release candidate）
- git push origin <tag>：タグをGitHubへ公開

### 1-2. GitHub Release を作る
gh release create v1.0.0-rc.1 \
  --repo doooooraku/Repolog \
  --title "Repolog v1.0.0-rc.1" \
  --notes-file docs/how-to/release_notes_template.md \
  --prerelease

意味：
- gh release create：Releaseを作る
- --prerelease：候補版として扱う（本番版ではない）
- --notes-file：テンプレから本文を読み込む

## 2. Debug（開発用）: ExpoGoを活用しエミュレータでデバッグ
### 2-1. 全体の流れ（一本道）
1) エミュレータ起動（Android Studioなど）
2) adb devicesで接続確認
3) Metro起動
4) ExpoGoを用いてエミュレータで確認

### 2-2. 手順（超具体）
#### Step 0: ルートへ移動
cd <project-root>

意味：
- cd：フォルダ移動

#### Step 1: adb接続確認
adb devices

意味：
- adb：Android端末/エミュレータ操作ツール
- devices：接続端末一覧を表示

#### Step 2: Metro起動
npx expo start --clear

意味：
- npx：このプロジェクトのExpoを使って起動
- expo start：開発サーバ開始
- --clear：キャッシュ削除して起動

#### Step 3: ExpoGoで確認
- エミュレータ上でExpoGoを起動
- MetroのQR/URLから対象プロジェクトを開いて動作確認


## 3. Release（提出用）: EASで署名済みAABを作る
### 3-1. “prebuildが必要か？”判定
ネイティブに効く変更をしたら：
npx expo prebuild --platform android

意味：
- expo prebuild：ネイティブ側（android/）を設定に合わせて更新
- --platform android：Androidのみ対象

### 3-2. AAB作成（初回：鍵作成のため）
（実行場所）プロジェクトルート
eas build -p android --profile production --local --non-interactive --output=○○.aab

意味：
- eas build：ビルド
- -p android：Android向け
- --profile production：提出用設定
- --local：ローカルでビルド
- --non-interactive：対話なし
- --output：成果物名

### 3-3. 提出（EAS Submitを使う場合）
- Google Playのサービスアカウントキーが必要（EAS Credentialsに登録して再利用）


## 4. AAB作成（2回目以降）: GradleでAABファイル作成
注意：
- versionCodeを確実に増やす

### 4-1. AAB作成
cd android
./gradlew clean
./gradlew bundleRelease

意味：
- cd android：Androidネイティブプロジェクトへ移動
- ./gradlew：Gradle Wrapperでビルド実行
- clean：前回成果物を削除
- bundleRelease：Release用AABを生成

### 4-2. 成果物確認
ls -alht app/
ls -ahlt app/build/outputs/bundle/release/

### 4-3. 証明書情報の確認（必要時）
keytool -printcert -jarfile app/build/outputs/bundle/release/app-release.aab

成果物：
android/app/build/outputs/bundle/release/app-release.aab

## 5. AdMob / UMP 審査前チェック（Issue #73）
目的：
- EU/EEA 同意フローの不足で審査や配信が止まる事故を防ぐ

### 5-1. 事前に環境変数を確認
ADMOB_ANDROID_APP_ID=<本番App ID>
ADMOB_ANDROID_BANNER_ID=<本番バナーID>
ADMOB_CONSENT_DEBUG_GEOGRAPHY=EEA
ADMOB_CONSENT_TEST_DEVICE_IDS=<テスト端末IDをカンマ区切り>

意味：
- `ADMOB_ANDROID_APP_ID`：Androidアプリ全体のAdMob ID（必須）
- `ADMOB_ANDROID_BANNER_ID`：Free表示用バナー広告枠ID
- `ADMOB_CONSENT_DEBUG_GEOGRAPHY=EEA`：EEA想定の同意ダイアログをテストする
- `ADMOB_CONSENT_TEST_DEVICE_IDS`：本番端末にテスト設定を限定する

### 5-2. EEA想定の同意フローを手動確認
1) Free状態でアプリ起動  
2) 同意フォームが出ることを確認  
3) 同意後のみバナーが表示されることを確認  
4) Pro状態でバナーが表示されないことを確認

判定基準：
- Free: `canRequestAds=true` の後にのみバナー表示
- Pro: 常にバナー非表示

### 5-3. 事故防止の固定ルール
- 同意関連の設定変更がある場合は `docs/adr/ADR-0008-admob-ump-consent-preflight.md` を参照
- 実行手順の正は `docs/how-to/testing.md` の「9. UMP EEA 同意検証（Issue #93）」を参照
- GitHub Actionsで反復確認する場合は `ump-consent-validation.yml` を `workflow_dispatch` で実行
- どうしても同意フローが壊れた場合は、リリース前に広告表示を停止して提出する（審査優先）
