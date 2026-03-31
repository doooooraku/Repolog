# iOS ビルド手順（Debug / Release / TestFlight提出）
最終更新: 2026-03-27（JST）

この文書は iOS アプリのビルドと提出に関する手順をまとめたものです。

> **TestFlight 提出のCI/CDワークフロー**については `docs/how-to/workflow/ios_testflight_release.md` を参照。
> GitHub Actions macOS ランナーでの .ipa ビルド → TestFlight 自動提出の全工程を記載しています。

---

## 1. タグ運用（リリース可視化）
リリース前に必ずタグとノートを作成する。
正は `docs/how-to/workflow/release_notes_template.md`。

タグを push すると `build-ios-testflight.yml` ワークフローが自動実行される（`v*` パターン）。

### 1-1. 候補版タグ（RC）を作る
```bash
git switch main
git pull --ff-only origin main
git tag -a v1.0.0-rc.1 -m "Repolog v1.0.0-rc.1"
git push origin v1.0.0-rc.1
```

意味：
- `git tag -a`：注釈付きタグを作る
- `v1.0.0-rc.1`：候補版（release candidate）
- `git push origin <tag>`：タグをリモートへ公開

### 1-2. GitHub Release を作る
```bash
gh release create v1.0.0-rc.1 \
  --repo doooooraku/Repolog \
  --title "Repolog v1.0.0-rc.1" \
  --notes-file docs/how-to/workflow/release_notes_template.md \
  --prerelease
```

意味：
- `gh release create`：Release作成
- `--prerelease`：候補版扱いで公開
- `--notes-file`：ノート本文をファイルから読み込み

---

## 2. Debug（開発用）: シミュレータで確認
### 2-1. 全体の流れ（一本道）
1) iOS Simulator 起動（Xcode）
2) Metro 起動
3) Simulator で動作確認

### 2-2. 手順（超具体）
#### Step 0: ルートへ移動
```bash
cd <project-root>
```

意味：
- `cd`：フォルダ移動

#### Step 1: Metro 起動
```bash
npx expo start --clear
```

意味：
- `npx`：このプロジェクトの Expo を使って実行
- `expo start`：開発サーバ起動
- `--clear`：キャッシュ削除して起動

#### Step 2: iOS Simulator で起動
- Xcode の Simulator から端末を起動
- Metro の案内に従って iOS でアプリを開く

## 3. Release（提出用）: GitHub Actions で TestFlight 提出

> 詳細は `docs/how-to/workflow/ios_testflight_release.md` を参照。

### 3-1. CI/CD による自動提出（推奨）

タグを push するとワークフローが自動実行され、TestFlight に提出される：

```bash
git switch main
git pull --ff-only origin main
git tag -a v1.0.0-rc.1 -m “Repolog v1.0.0-rc.1”
git push origin v1.0.0-rc.1
```

意味：
- `git tag -a`：注釈付きタグを作成（リリース候補の目印）
- `git push origin <tag>`：タグをリモートに push → `build-ios-testflight.yml` が自動実行

手動実行も可能：GitHub Actions 画面 →「Build iOS & Submit to TestFlight」→「Run workflow」

### 3-2. ワークフローの処理内容

1. macOS ランナー上で `eas build --local` により .ipa をビルド（約12分）
2. GitHub Secret から .p8 ファイルを復元
3. `eas submit` で TestFlight に自動提出
4. .ipa を Artifacts に7日間保存

### 3-3. 事前に必要なもの

| 項目 | 設定場所 | 詳細 |
|------|---------|------|
| Apple Developer Program | https://developer.apple.com/ | 年額 $99 |
| App Store Connect アプリ登録 | https://appstoreconnect.apple.com/ | ascAppId の取得 |
| EAS 証明書 | `eas credentials --platform ios` | WSL2 から対話式で実行 |
| GitHub Secrets | リポジトリ Settings → Secrets | EXPO_TOKEN, ASC_API_KEY_P8_BASE64 等 |
| eas.json submit 設定 | `eas.json` | ascAppId, ascApiKeyId 等 |

---

## 4. iOS提出前チェックリスト（Issue #214）

### 4-1. app.json 必須設定

- [ ] `ios.config.usesNonExemptEncryption` が設定されている（通常 `false`。ADR-0010 参照）
- [ ] `ios.privacyManifests.NSPrivacyAccessedAPITypes` が設定されている（Apple 2024年5月〜必須）
- [ ] `ios.bundleIdentifier` が Apple Developer Portal と一致（`com.dooooraku.repolog`）

### 4-2. iOS権限説明文

- [ ] `expo-image-picker` プラグインで `cameraPermission` / `photosPermission` が明示設定されている
- [ ] `microphonePermission: false` でマイク権限がブロックされている（写真のみ、動画不要）
- [ ] `expo-location` プラグインで `locationWhenInUsePermission` が明示設定されている
- [ ] `locationAlwaysPermission: false` で常時位置情報がブロックされている

### 4-3. App Store Connect

- [ ] Privacy Policy URL が設定済み（`https://doooooraku.github.io/Repolog/privacy/`）
- [ ] アプリカテゴリが選択済み
- [ ] 年齢レーティング（IARC）が回答済み

### 4-4. CI検証

```bash
pnpm config:check
```

意味：
- `config:check`：app.json の必須iOS設定（暗号化コンプライアンス、Privacy Manifests、bundle ID等）が正しく設定されているか自動検証する

---

## 5. 参考（一次情報）
- Expo EAS Build（iOS）: https://docs.expo.dev/build/introduction/
- Expo EAS Submit（iOS）: https://docs.expo.dev/submit/ios/
- Apple Developer: https://developer.apple.com/
- TestFlight 提出フロー: `docs/how-to/workflow/ios_testflight_release.md`

---

## 6. AdMob / UMP 審査前チェック（Issue #73）
目的：
- EU/EEA 同意フローの不足による審査差し戻しを防ぐ

### 6-1. 事前に環境変数を確認
ADMOB_IOS_APP_ID=<本番App ID>
ADMOB_IOS_BANNER_ID=<本番バナーID>
ADMOB_CONSENT_DEBUG_GEOGRAPHY=EEA
ADMOB_CONSENT_TEST_DEVICE_IDS=<テスト端末IDをカンマ区切り>
ADMOB_USER_TRACKING_USAGE_DESCRIPTION=<追跡利用理由の文言>

意味：
- `ADMOB_IOS_APP_ID`：iOSアプリ全体のAdMob ID（必須）
- `ADMOB_IOS_BANNER_ID`：Free表示用バナー広告枠ID
- `ADMOB_CONSENT_DEBUG_GEOGRAPHY=EEA`：EEA想定の同意フローをデバッグ
- `ADMOB_CONSENT_TEST_DEVICE_IDS`：テスト対象端末を限定
- `ADMOB_USER_TRACKING_USAGE_DESCRIPTION`：`NSUserTrackingUsageDescription` に反映する文言

### 6-2. 手動確認（実機推奨）
1) Free状態でアプリ起動  
2) 同意フォームが必要な場合に表示されることを確認  
3) 同意後のみバナーが表示されることを確認  
4) Pro状態でバナーが表示されないことを確認

判定基準：
- Free: `canRequestAds=true` の後にのみバナー表示
- Pro: 常にバナー非表示

### 6-3. 審査提出前の最終確認
- App Store Connect の Privacy Policy URL が設定済みであること
- 同意フロー変更時は `docs/adr/ADR-0008-admob-ump-consent-preflight.md` の差分を確認すること
- 実行手順の正は `docs/how-to/testing/testing.md` の「9. UMP EEA 同意検証（Issue #93）」を参照
- GitHub Actionsで反復確認する場合は `ump-consent-validation.yml` を `workflow_dispatch` で実行
