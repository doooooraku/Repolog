# AdMob広告セットアップ手順（ゼロから収益化まで）
最終更新: 2026-03-19（JST）

この手順は、Repologアプリに**Google AdMobバナー広告を導入し、ユーザーが広告を見ることで開発者に収益が入る**状態を実現するための完全ガイドです。

想定:
- Expo SDK 54 + React Native 0.81.5 + New Architecture
- `react-native-google-mobile-ads` v16.3.0
- ローカルGradleビルド（EAS `--local`）
- WSL2 + Windows ADB 経由で Pixel 8a に導入
- Free版のみ広告表示、Pro版は広告ゼロ

---

## 0. 全体像（広告が収益を生むまでのフロー）

```
[Phase 1] AdMobアカウント作成 & 広告ユニット作成
    ↓
[Phase 2] コード実装（adService.ts / AdBanner / app.config.ts）
    ↓
[Phase 3] 環境変数に本番IDを注入（.env / EAS環境変数）
    ↓
[Phase 4] app-ads.txt を開発者サイトに設置
    ↓
[Phase 5] AdMob管理画面でプライバシー設定（GDPR / IDFA）
    ↓
[Phase 6] Google Play Console にデベロッパーWebサイトを設定
    ↓
[Phase 7] ビルド & 実機テスト（広告が表示されることを確認）
    ↓
[Phase 8] ストア公開 → ユーザーが広告を見る → 収益発生
    ↓
[Phase 9] AdMob支払い設定 → 銀行口座に入金
```

---

## Phase 1: AdMobアカウント作成 & 広告ユニット作成

### 1-1. AdMobアカウントの作成

```
1. https://admob.google.com にアクセス
2. Googleアカウントでログイン
3. 利用規約に同意してアカウント作成
4. アカウント情報を設定:
   - 国: 日本
   - タイムゾーン: (GMT+09:00) 東京
   - 通貨: 日本円 (JPY ¥)
```

### 1-2. アプリの登録

```
1. AdMobコンソール → 左メニュー「アプリ」→「アプリを追加」
2. プラットフォームを選択:
   - Android: パッケージ名 = com.dooooraku.repolog
   - iOS: バンドルID = com.dooooraku.repolog
3. アプリ名: Repolog
4. 「アプリを追加」をクリック
```

### 1-3. 広告ユニットの作成

```
1. アプリ一覧から「Repolog (Android)」を選択
2. 「広告ユニット」→「広告ユニットを追加」
3. 「バナー」を選択
4. 広告ユニット名: "Home Banner" など
5. 「広告ユニットを作成」をクリック
6. 表示されるIDをメモ:
   - App ID:     ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
   - Banner ID:  ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ

7. iOS版も同様に作成

※ 新しい広告ユニットで広告表示が始まるまでに1時間ほどかかる場合がある
```

### 1-4. パブリッシャーIDの確認

```
1. AdMobコンソール → 左メニュー「設定」
2. 「アカウント情報」セクション
3. 「パブリッシャーID」をメモ: pub-XXXXXXXXXXXXXXXX
   （app-ads.txt で使う）
```

**Repologの実際のID:**

| 項目 | Android | iOS |
|------|---------|-----|
| App ID | `ca-app-pub-4344515384188052~3841999743` | `ca-app-pub-4344515384188052~4133643788` |
| Banner Unit ID | `ca-app-pub-4344515384188052/4815202462` | `ca-app-pub-4344515384188052/6444112352` |
| Publisher ID | `pub-4344515384188052` | 同左（アカウント共通） |

---

## Phase 2: コード実装

### 2-1. ライブラリのインストール

```bash
npx expo install react-native-google-mobile-ads
```

意味:
- `npx expo install`: Expo SDKバージョンに互換性のあるバージョンを自動選択してインストール

### 2-2. Expo Config Plugin の設定（app.config.ts）

`app.config.ts` で AdMob の Config Plugin を登録します。

```typescript
// app.config.ts（関連部分のみ抜粋）

import 'dotenv/config'; // .envファイルを自動読み込み

// 開発用テストApp ID（Googleが公式提供するテスト用）
const ADMOB_TEST_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const ADMOB_TEST_APP_ID_IOS = 'ca-app-pub-3940256099942544~1458002511';

// 環境変数から本番IDを読む。なければテストIDを使う
const admobAndroidAppId = process.env.ADMOB_ANDROID_APP_ID ?? ADMOB_TEST_APP_ID_ANDROID;
const admobIosAppId = process.env.ADMOB_IOS_APP_ID ?? ADMOB_TEST_APP_ID_IOS;

// Config Pluginとして登録
const pluginsWithAdMob = ensurePlugin(plugins, 'react-native-google-mobile-ads', {
  androidAppId: admobAndroidAppId,
  iosAppId: admobIosAppId,
  delayAppMeasurementInit: true,           // 同意完了前の計測を遅延
  userTrackingUsageDescription:            // iOS ATTの理由文言
    'This identifier will be used to deliver relevant ads to Free plan users.',
});

// Banner IDはextraに格納（ランタイムで読み取り可能にする）
extra: {
  ADMOB_ANDROID_BANNER_ID: process.env.ADMOB_ANDROID_BANNER_ID ?? '',
  ADMOB_IOS_BANNER_ID: process.env.ADMOB_IOS_BANNER_ID ?? '',
}
```

各設定の意味:
- `androidAppId / iosAppId`: ネイティブのマニフェストに埋め込まれるApp ID
- `delayAppMeasurementInit: true`: UMP同意完了前にGoogleの計測を開始しない（GDPR対応）
- `userTrackingUsageDescription`: iOSのATTダイアログに表示する理由文
- `extra.*`: アプリ実行時に `Constants.expoConfig.extra` から読み取れる値

### 2-3. 広告サービス層（src/services/adService.ts）

UMP同意 → SDK初期化 → バナーID取得の一連のフローを実装。

```
フローの全体像:

[アプリ起動]
  → initializeAds()
    → canRequestAdsAfterConsent()
      → AdsConsent.gatherConsent()     ← EU/EEAユーザーには同意画面を表示
      → consentInfo.canRequestAds      ← 同意が得られたか確認
    → setRequestConfiguration()        ← 子供向け設定 / コンテンツレーティング
    → mobileAds().initialize()         ← AdMob SDKを初期化
  → getBannerUnitId()
    → __DEV__ ? TestIds.ADAPTIVE_BANNER   ← 開発中はテスト広告
    → extra.ADMOB_ANDROID_BANNER_ID       ← 本番はenv変数から取得
```

主要な関数:
- `initializeAds()`: SDK初期化（同意確認後）
- `getBannerUnitId()`: Dev/Prod切り替え付きバナーID取得
- `showAdPrivacyOptionsForm()`: Privacy options再選択（Settings画面用）
- `buildAdsConsentInfoOptions()`: UMPデバッグ設定の構築

### 2-4. バナー広告コンポーネント（components/ad-banner.tsx）

```typescript
export function AdBanner() {
  // 1. 広告SDKの初期化を待つ
  // 2. 準備完了後にBannerAdを表示
  // 3. エラー時はconsole.warnでログ出力（__DEV__のみ）
  // 4. Web/unitIDなし/未準備の場合はnullを返す（何も表示しない）
}
```

### 2-5. ホーム画面への配置（app/(tabs)/index.tsx）

```typescript
// Free版のみ広告を表示（Pro版はコンポーネントをマウントしない）
{proInitialized && !isPro && (
  <View style={styles.adBannerWrap}>
    <AdBanner />
  </View>
)}
```

### 2-6. 設定画面のプライバシー導線（SettingsScreen.tsx）

```
Settings画面に「広告のプライバシー設定」ボタンを配置:
- privacyOptionsRequirementStatus === REQUIRED の場合: フォームを開く
- NOT_REQUIRED の場合: 「現在は変更不要」を通知
```

### 2-7. テスト（__tests__/adService.test.ts）

```
テスト対象:
- parseConsentDebugGeography(): デバッグ地理の文字列パース
- parseConsentTestDeviceIdentifiers(): テスト端末IDのパース
- buildAdsConsentInfoOptions(): UMPオプション構築
- showAdPrivacyOptionsForm(): プライバシーフォーム表示制御
```

---

## Phase 3: 環境変数に本番IDを注入

### 3-1. ローカルビルド用: .env ファイルの作成

```bash
# プロジェクトルートに.envファイルを作成
cat > .env << 'EOF'
# AdMob App IDs（ネイティブビルドに必要）
ADMOB_ANDROID_APP_ID=ca-app-pub-4344515384188052~3841999743
ADMOB_IOS_APP_ID=ca-app-pub-4344515384188052~4133643788

# AdMob Banner Unit IDs（アプリ実行時に使われる）
ADMOB_ANDROID_BANNER_ID=ca-app-pub-4344515384188052/4815202462
ADMOB_IOS_BANNER_ID=ca-app-pub-4344515384188052/6444112352
EOF
```

意味:
- `.env` ファイルは `app.config.ts` の `import 'dotenv/config'` で自動読み込みされる
- `.gitignore` で保護されているのでGitにコミットされない
- ローカルビルド（`eas build --local`）でのみ使用される

### 3-2. セキュリティ確認

```bash
# .envがGitに追跡されないことを確認
git check-ignore .env
# 「.env」と表示されればOK
```

### 3-3. クラウドビルド用: EAS環境変数の登録

```bash
# 各環境（development / preview / production）に変数を登録
npx eas-cli@latest env:create \
  --name ADMOB_ANDROID_APP_ID \
  --value "ca-app-pub-4344515384188052~3841999743" \
  --environment production \
  --visibility sensitive \
  --non-interactive
```

意味:
- `env:create`: EASサーバーに環境変数を作成
- `--visibility sensitive`: 値をマスク表示（ログに出ない）
- クラウドビルド時に自動注入される
- ローカルビルドでも最新のEAS CLIなら自動読み込みされる

### 3-4. 既存の変数を更新する場合

```bash
npx eas-cli@latest env:update <環境名> \
  --variable-name ADMOB_ANDROID_APP_ID \
  --value "ca-app-pub-新しいID" \
  --non-interactive
```

### 3-5. テンプレートファイル（.env.example）

新しい開発者が必要な変数を把握できるよう、`.env.example` をリポジトリにコミット。実際の値は空欄。

---

## Phase 4: app-ads.txt を開発者サイトに設置

### 4-1. app-ads.txt とは

広告詐欺を防止するための業界標準ファイル。「このアプリの広告はGoogle AdMobだけに正式に許可しています」と宣言する。2025年1月から新規アプリでは必須化。

### 4-2. ファイルの内容（1行のみ）

```
google.com, pub-4344515384188052, DIRECT, f08c47fec0942fa0
```

| フィールド | 値 | 説明 |
|-----------|-----|------|
| ドメイン | `google.com` | 広告ネットワーク（固定） |
| パブリッシャーID | `pub-4344515384188052` | AdMobのアカウントID |
| 関係性 | `DIRECT` | 直接契約（固定） |
| 認証タグ | `f08c47fec0942fa0` | Googleの認証ID（固定） |

### 4-3. 配置場所（重要！）

```
✅ 正しい: https://doooooraku.github.io/app-ads.txt（ドメインのルート）
❌ 間違い: https://doooooraku.github.io/Repolog/app-ads.txt（サブディレクトリ）
```

Googleは「デベロッパーWebサイトのドメインルート」の `/app-ads.txt` だけを見に来る。

### 4-4. GitHub Pagesでの設置手順

```bash
# 1. ユーザーサイト用リポジトリを作成
gh repo create doooooraku/doooooraku.github.io --public \
  --description "Developer site - app-ads.txt for AdMob verification"

# 2. クローンしてファイル作成
cd /tmp
git clone https://github.com/doooooraku/doooooraku.github.io.git
cd doooooraku.github.io

# 3. app-ads.txt を作成
echo "google.com, pub-4344515384188052, DIRECT, f08c47fec0942fa0" > app-ads.txt

# 4. コミット & プッシュ
git add . && git commit -m "Add app-ads.txt for AdMob" && git push origin main

# 5. 確認（数分後）
# ブラウザで https://doooooraku.github.io/app-ads.txt を開く
```

### 4-5. 複数アプリの場合

app-ads.txt はパブリッシャーID（アカウントレベル）で管理されるため、**1ファイルで全アプリに対応**できる。アプリごとに別のファイルは不要。

---

## Phase 5: AdMob管理画面でプライバシー設定

### 5-1. 欧州の規制（GDPR同意メッセージ）— 必須

```
1. admob.google.com → 左メニュー「プライバシーとメッセージ」
2. 「欧州の規制」→「作成」
3. アプリを選択: Repolog (Android) + Repolog (iOS)
4. 言語: English（デフォルト）+ Japanese + その他必要な言語
5. メッセージ名: "Repolog GDPR Consent"
6. 「公開」をクリック
```

設定後、EU/EEAユーザーがアプリを開くと自動的に同意ダイアログが表示される。コード側は `AdsConsent.gatherConsent()` で自動処理済み。

### 5-2. IDFA説明メッセージ（iOS ATT）— iOS向け必須

```
1. 「プライバシーとメッセージ」→「IDFA 説明メッセージ」→「作成」
2. アプリを選択: Repolog (iOS)
3. 言語: English + Japanese
4. メッセージ名: "Repolog IDFA Explainer"
5. 「公開」をクリック
```

設定後、iOSユーザーにAppleのATTポップアップの前に説明画面が表示される。

### 5-3. 米国の州の規制 — グローバル公開前に設定推奨

カリフォルニア州（CCPA）等に対応。アプリを全世界に公開する場合、カリフォルニア州のユーザーが含まれるため設定を推奨。手順は欧州の規制とほぼ同じ。

---

## Phase 6: ストア設定（Google Play Console / App Store Connect）

### 6-1. Google Play Console — デベロッパーWebサイトを設定

```
1. https://play.google.com/console にログイン
2. Repolog を選択
3. 左メニュー「ストアでの表示」→「ストアの設定」
4. 「ストアの掲載情報に表示する連絡先の詳細」セクション
5. ウェブサイト欄に: https://doooooraku.github.io
6. 「保存」をクリック
```

この設定により、Googleが `https://doooooraku.github.io/app-ads.txt` をクロールし、広告の正当性を検証する（24時間以内）。

**複数アプリの場合:** 全アプリで同じデベロッパーWebサイトURLを使ってOK。

### 6-2. Google Play Console — Data Safety宣言

広告を表示するアプリは、Data Safety フォームで以下を申告する必要がある:

```
1. Play Console → Repolog → 「アプリのコンテンツ」→「データ セーフティ」
2. 以下を宣言:
   - デバイスまたはその他の ID: 収集する（AdMobが広告IDを使用）
   - 共有先: 広告（Google AdMob）
   - 目的: 広告またはマーケティング
   - 暗号化: はい（HTTPS経由）
3. 詳細は docs/store-listing/data-safety/data-safety-declaration.md を参照
```

### 6-3. app-ads.txt のクロール状態を確認

```
1. admob.google.com → 左メニュー「アプリ」
2. Repolog を選択
3. 「app-ads.txt」タブを確認
4. ステータス:
   - 「確認済み」: 正常（Googleが正しくクロール済み）
   - 「未クロール」: まだクロールされていない（24時間待つ）
   - 「見つかりません」: URLが間違っている（Phase 4を再確認）
```

### 6-4. iOS App Store Connect — App Privacy（将来のiOS公開時）

```
App Store Connect → Repolog → App Privacy セクション:
- 「Identifiers」→「Device ID」: 収集する（AdMobが使用）
- 「Usage Data」→「Advertising Data」: 収集する
- 用途: Third-Party Advertising
- ユーザーにリンク: はい（AdMobがデバイスIDと紐づけて広告配信）
```

---

## Phase 7: ビルド & 実機テスト

### 7-1. ビルド（Node.js 20以上が必要）

```bash
# Node.js 20に切り替え（nvm使用の場合）
source ~/.nvm/nvm.sh && nvm use 20

# ANDROID_HOMEを設定（.bashrcに設定済みならsource ~/.bashrcでも可）
export ANDROID_HOME="$HOME/Android/Sdk"

# APKビルド
pnpm build:android:apk:local
```

意味:
- `nvm use 20`: Node.js 20に切り替え（metro-configがNode 20+を要求）
- `ANDROID_HOME`: Android SDKの場所をGradleに教える
- `pnpm build:android:apk:local`: EASローカルビルド（preview-local-apkプロファイル）

### 7-2. 実機インストール

```bash
pnpm install:device
# 内部コマンド: adb install -r "$(wslpath -w dist/repolog-preview-local.apk)"
```

### 7-3. テスト項目チェックリスト

**基本動作**
- [ ] アプリが正常に起動する
- [ ] レポート作成・写真追加・PDF出力が動作する

**広告表示（Free状態）**
- [ ] ホーム画面下部にバナー広告が表示される
- [ ] 画面スクロールがスムーズ（広告が邪魔しない）
- [ ] ネットワーク切断時もアプリが正常に動作する（広告は非表示でOK）
- [ ] 広告読み込み失敗時にレイアウトが崩れない

**広告非表示（Pro状態）**
- [ ] Pro購入後、バナー広告が完全に消える
- [ ] セッション中にProへアップグレードした場合も即座に広告が消える

**プライバシー**
- [ ] 設定画面の「広告のプライバシー設定」が動作する

**テスト広告 vs 本番広告の見分け方**
- テスト広告は「Test Ad」というラベルが表示される
- Dev Build（`__DEV__=true`）ではテスト広告が表示される
- Preview/Production Build（`__DEV__=false`）では本番広告が表示される

> **重要:** 本番広告が表示されたら絶対にクリックしないこと。自分の広告をクリックするとAdMobポリシー違反でアカウント停止の恐れあり。

### 7-4. UMP同意フローのテスト（GDPR）

日本からEU/EEAの同意ダイアログをテストするには、`.env` にデバッグ設定を追加する:

```bash
# .env に追加（テスト時のみ。テスト後は削除する）
ADMOB_CONSENT_DEBUG_GEOGRAPHY=EEA
ADMOB_CONSENT_TEST_DEVICE_IDS=テスト端末のハッシュID
```

テスト端末のハッシュIDの取得方法:
```bash
# アプリを起動してlogcatを確認
env -u ADB_SERVER_SOCKET adb logcat | grep -i "device.*id\|test.*device"
# 「Use RequestConfiguration.Builder().setTestDeviceIds(Arrays.asList("XXXXXXXX"))」
# のようなログからハッシュIDをコピー
```

テスト手順:
1. `.env` にデバッグ設定を追加してリビルド
2. アプリ起動 → 同意ダイアログが表示されることを確認
3. 同意する → バナー広告が表示されることを確認
4. アプリを再インストールして同意を拒否 → 広告が表示されないことを確認
5. **テスト後は `.env` からデバッグ設定を必ず削除する**

### 7-5. 広告が表示されない場合のトラブルシューティング

```bash
# ログを確認（AdMobネイティブSDKのログも含む）
env -u ADB_SERVER_SOCKET adb logcat | grep -iE "ReactNativeJS|AdBanner|Ads|GoogleAds|AdMob|consent|UMP"
```

よくある原因:
1. 広告ユニット作成後1時間未満 → 待つ
2. ネットワーク接続がない → Wi-Fi確認
3. AdMobアカウントが審査中 → 数日〜数週間かかることもある（新規アカウントの場合）
4. `.env` のIDが間違っている → `cat .env` で確認
5. App IDとBanner IDを混同している → App IDは `~` 区切り、Banner IDは `/` 区切り
6. `__DEV__=true`（Dev Build）の場合 → テスト広告が表示される（正常動作）
7. UMP同意が取れていない → EEAデバッグでテスト（7-4参照）

---

## Phase 8: ストア公開 → 収益発生

### 8-1. ストア公開

Google Play への提出は `android_build.md` のSection 7「Play提出用」を参照。

```bash
pnpm build:android:aab:cloud
# → production プロファイルで AAB を生成
# → Play Console にアップロード
```

### 8-2. 収益が発生する仕組み

```
ユーザーがアプリを開く
  → バナー広告が表示される（= インプレッション）
  → 広告主がインプレッションに対して入札
  → 最高額の広告が表示される
  → ユーザーが広告をクリックする（任意）
  → 広告主が支払い → Googleが手数料を引く → 残りがあなたの収益
```

収益の指標:
- **eCPM**: 1,000回表示あたりの収益（日本のバナー: 約$0.50〜$3.00、平均$1.25前後）
- **Fill Rate**: 広告リクエストに対して広告が返ってきた割合（新規アプリは低い場合がある）
- **CTR**: クリック率（バナーは通常0.5-1%）

### 8-3. 収益の確認方法

```
admob.google.com → 左メニュー「レポート」
- 推定収益額: 日別/月別の収益推移
- インプレッション数: 広告が表示された回数
- eCPM: 1,000インプレッションあたりの収益
- Fill Rate: 広告リクエストに対する充填率
```

---

## Phase 9: AdMob支払い設定

### 9-1. 支払い情報の登録

```
1. admob.google.com → 左メニュー「お支払い」
2. 「お支払い情報を追加」
3. 国: 日本
4. 口座タイプ: 個人
5. 名前・住所を入力
```

### 9-2. PIN確認

```
- 収益が認証のしきい値（約1,000円）に達すると、
  Googleから郵便でPINコードが届く（2-3週間）
- 届いたPINをAdMobコンソールに入力して認証
```

### 9-3. 銀行口座の登録

```
1. 「お支払い」→「お支払い方法を追加」
2. 銀行口座振込を選択
3. 銀行名・口座番号を入力
4. テストデポジット（少額の入金）で口座を確認（2-5営業日）
5. テストデポジットの金額をAdMobコンソールに入力して認証
```

### 9-4. 支払いスケジュール

```
- 最低支払い額: 8,000円
- 支払いサイクル: 月末締め → 翌月21日頃に入金
- 残高が8,000円に満たない場合: 翌月に繰り越し
```

### 9-5. 税務上の注意点（日本）

```
- AdMob収益は「国外取引」（Google Asia Pacific Pte. Ltd. シンガポール）
- 日本の消費税は免除（インボイス制度の影響なし）
- 年間利益20万円超で確定申告が必要
- 20万円以下でも住民税の申告は必要
- 開業届を出すと青色申告（65万円控除）が可能
```

---

## 広告ターゲティング設定の補足

### tagForChildDirectedTreatment

`adService.ts` で `tagForChildDirectedTreatment: false` を設定済み。

- `false`: このアプリは子供向けではない（Repologは現場レポートアプリ、IARC 3+）
- `true`: 子供向けアプリの場合に設定（COPPA準拠、パーソナライズ広告が無効化される）

### maxAdContentRating

`adService.ts` で `maxAdContentRating: MaxAdContentRating.G` を設定済み。

- `G`: 一般向け（General audiences）— 最も制限的。IARC 3+に対応
- `PG`: 保護者の指導推奨
- `T`: 十代向け
- `MA`: 成人向け

### 開発モードでの広告動作

`adService.ts` の `canRequestAdsAfterConsent()` には `return __DEV__` というフォールバックがある。これはUMP同意が失敗した場合でも、開発モード（`__DEV__=true`）ではテスト広告を表示するための意図的な設計。本番モード（`__DEV__=false`）では同意失敗時に広告は表示されない。

---

## 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `src/services/adService.ts` | AdMob SDK初期化、UMP同意、バナーID取得 |
| `components/ad-banner.tsx` | バナー広告UIコンポーネント |
| `app.config.ts` | Config Plugin設定、環境変数の読み込み |
| `.env` | ローカルビルド用の本番ID（gitignored） |
| `.env.example` | 環境変数テンプレート（コミット済み） |
| `app/(tabs)/index.tsx` | ホーム画面（AdBanner配置箇所） |
| `src/features/settings/SettingsScreen.tsx` | 設定画面（プライバシー導線） |
| `src/stores/proStore.ts` | Pro状態管理（広告表示/非表示の制御） |
| `__tests__/adService.test.ts` | 広告サービスのユニットテスト |
| `docs/adr/ADR-0003-admob-banner.md` | AdMob採用の意思決定記録 |
| `docs/adr/ADR-0008-admob-ump-consent-preflight.md` | UMP同意必須化の意思決定記録 |
| `docs/reference/constraints.md` §2-3 | AdMob制約ルール |
| `docs/store-listing/data-safety/data-safety-declaration.md` | Google Play Data Safety宣言 |
| `docs/privacy/index.html` | プライバシーポリシー |
| `.github/workflows/ump-consent-validation.yml` | UMP検証CIワークフロー |
| `scripts/ump-consent-check.mjs` | UMPバリデーションスクリプト |
| `eas.json` | ビルドプロファイル |

---

## 参考（一次情報）

- react-native-google-mobile-ads: https://docs.page/invertase/react-native-google-mobile-ads
- AdMob テスト広告: https://developers.google.com/admob/android/test-ads
- UMP SDK (Android): https://developers.google.com/admob/android/next-gen/privacy
- UMP SDK (iOS): https://developers.google.com/admob/ios/privacy
- EU同意: https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent
- AdMob EU Consent Policy: https://support.google.com/admob/answer/7666519?hl=en
- app-ads.txt セットアップ: https://support.google.com/admob/answer/9363762?hl=en
- IDFA説明メッセージ: https://support.google.com/admob/answer/10115331?hl=en
- Expo EAS環境変数: https://docs.expo.dev/eas/environment-variables/
- AdMob支払い設定: https://support.google.com/admob/answer/2772208?hl=ja
