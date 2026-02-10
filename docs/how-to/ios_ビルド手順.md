# iOS_ビルド手順（Debug運用 / Release提出）
最終更新: 2026-02-10（JST）

> この文書は **最低限のたたき台** です。  
> 正確な手順・必要要件は **EAS / Apple 公式ドキュメント** を正としてください。

---

## 1. タグ運用（リリース可視化）
リリース前に必ずタグとノートを作成する。  
正は `docs/how-to/release_notes_template.md`。

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
  --notes-file docs/how-to/release_notes_template.md \
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

## 3. Release（提出用）: EAS で署名済みビルド
> ここは **プロジェクトごとの証明書/プロビジョニング** で差分が出ます。  
> まずは公式手順を確認してから進める。

### 3-1. “prebuild が必要か？”判定
ネイティブに効く変更をしたら：
```bash
npx expo prebuild --platform ios
```

意味：
- `expo prebuild`：ネイティブ（ios/）を設定に合わせて更新
- `--platform ios`：iOSのみ対象

### 3-2. iOS ビルド（EAS）
```bash
eas build -p ios --profile production --local --non-interactive --output=app.ipa
```

意味：
- `eas build`：ビルドを実行
- `-p ios`：iOS向け
- `--profile production`：提出用の設定
- `--local`：ローカルビルド
- `--non-interactive`：対話なし
- `--output`：成果物名

### 3-3. 提出（EAS Submit を使う場合）
```bash
eas submit -p ios --profile production
```

意味：
- `eas submit`：ストア提出を実行
- `-p ios`：iOS向け
- `--profile production`：提出用の設定

---

## 4. 事前に必要になりやすいもの
- Apple Developer Program への登録
- 証明書 / プロビジョニングプロファイル
- App Store Connect でのアプリ登録

---

## 5. 参考（正は公式）
- Expo EAS Build（iOS）: https://docs.expo.dev/build/introduction/
- Expo EAS Submit（iOS）: https://docs.expo.dev/submit/introduction/
- Apple Developer: https://developer.apple.com/

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
