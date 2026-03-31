# ストアスクリーンショット生成手順（Apple App Store / Google Play）

> ステータス: 運用中（Phase 1 + Phase 2 完了）
> 初版: 2026-03-30 / 最終更新: 2026-03-31

19言語 × 4画面 × 2ストア = 152枚のストア提出用スクリーンショットを生成する手順です。
アプリUIが変わったとき・言語を追加したときに再実行してください。

想定:
- WSL2 (Ubuntu) + Pixel 8a 実機（ADB接続済み）
- Expo SDK 54 Dev Build（SCREENSHOT_MODE=1）
- Maestro CLI インストール済み
- Node.js 22.x（Metro bundler 用）
- Playwright + Sharp インストール済み（Phase 2 用）

---

## 概要

### ワークフローの全体像

```
Phase 1: 撮影 (自動)               Phase 2: 合成 (自動)
┌───────────────────────┐         ┌────────────────────────────────────┐
│ Maestro + ADB          │         │ Playwright + Sharp                  │
│ → raw スクショ 76枚     │────────►│ → Apple 用 76枚 (1320×2868)         │
│   (screenshots/raw/)   │         │ → Google Play 用 76枚 (1080×1920)   │
└───────────────────────┘         │   (screenshots/store/)              │
                                  └────────────────────────────────────┘
                                    ↑ コマンド1つ、約1分で完了
```

### ストア仕様比較

| 項目 | Apple App Store | Google Play |
|---|---|---|
| サイズ | **1320 × 2868 px**（iPhone 6.9"） | **1080 × 1920 px**（9:16） |
| フォーマット | PNG or JPEG（**透過NG**） | 24bit PNG or JPEG（**透過NG**） |
| 色空間 | sRGB or Display P3 | sRGB（24bit） |
| ファイルサイズ | 制限なし（実質） | 最大 8MB/枚 |
| 枚数 | 1〜10枚/デバイスサイズ/言語 | 2〜8枚/言語 |
| 必須デバイス | iPhone 6.9"（他サイズは自動縮小） | Phone のみ |
| iPad | Repolog は iPhone のみ → **不要** | — |
| Feature Graphic | なし | 1024 × 500 px（**公開に必須** → 別途対応） |

> **ポイント:** Apple は 6.9" の画像さえあれば、6.7" / 6.5" / 6.1" / 5.5" は自動縮小される。

### 撮影する4画面

| # | 画面 | 内容 | マーケティングテキストの主旨 |
|---|---|---|---|
| 1 | Home | レポート一覧 + 写真カード | 記録がまとまる |
| 2 | Editor（上部） | 基本情報・天気・位置情報 | すぐ完成する |
| 3 | Editor（下部） | コメント・写真セクション | 証拠がまとまる |
| 4 | PDFプレビュー | 表紙ビュー（スクロールなし） | 提出できるPDF |

### データ投入方式

`inject-locale.mjs` で SQLite DB を直接書き換える方式を採用。

```
inject-locale.mjs <locale>
  ↓
  repolog.db: レポート名・作成者・住所・コメントを該当言語に差し替え
  RKStorage: アプリ言語設定を該当言語に切り替え
  ↓
  adb push → デバイスの内部DBを上書き
```

各言語で差し替えるフィールド:
- レポート名（その国の建設点検レポートタイトル）
- 作成者名（その国の「田中太郎」的な代表名）
- 住所（その国の書式に従った架空住所）
- コメント（その国の建設業界用語を使った検査所見）

差し替えないもの: 写真（全言語共通）、天気（アイコン表示）

### マーケティングテキスト

→ [`marketing-text.md`](../../store-listing/marketing-text.md) に一覧あり

設計原則:
- ペルソナ準拠: 現場作業者が日常で使う言葉を使用
- 画面対応: 各テキストはスクショの内容と1:1で対応
- ASO意識: 各言語の建設/現場系検索キーワードを自然に含む
- 独立作成: 日本語からの翻訳ではなく各言語で独自に作成

### ファイル構成

```
scripts/store-screenshots/
├── data/
│   └── marketing-text.ts          # 19言語×4枚分のキャッチコピー（TypeScript）
├── lib/                           # Phase 2: 合成スクリプト群
│   ├── config.ts                  # ストアサイズ・ロケール・パス定数
│   ├── template.ts                # HTMLテンプレート生成（白背景+テキスト+角丸スクショ）
│   ├── fonts.ts                   # ロケール別Noto Sans @font-face生成
│   ├── renderer.ts                # Playwright ヘッドレスChrome描画
│   └── postprocess.ts             # Sharpクロップ・アルファ除去・sRGB埋込
├── generate.ts                    # Phase 2 CLIエントリポイント
├── backups/ja/                    # 日本語バックアップデータ（写真含む）
├── inject-locale.mjs              # 言語別データ注入スクリプト（19言語分のデータ内蔵）
├── capture.sh                     # 単一言語の撮影スクリプト
├── capture-all-remaining.sh       # 17言語一括撮影スクリプト
└── demo-mode.sh                   # ADB Demo Mode on/off

maestro/flows/
└── store-screenshots.yaml         # 4画面撮影フロー（Dev Client対応済み）

docs/store-listing/
└── marketing-text.md              # 19言語マーケティングテキスト一覧

docs/store-listing/android/screenshots/
└── sample-data.ts                 # 19言語サンプルレポートデータ（参照用）

screenshots/                       # .gitignore済み
├── raw/{lang}/                    # Phase 1: Maestro撮影の生スクショ（720×1520）
└── store/                         # Phase 2: ストア提出用の完成画像
    ├── apple/{lang}/              #   Apple App Store (1320×2868)
    └── google/{lang}/             #   Google Play (1080×1920)
```

---

## 0. 全体像

```
[Step 1] 準備（初回のみ / APK未ビルド時のみ）
    ↓ .env設定 → Dev APK ビルド → インストール → Playwright + Sharp インストール
[Step 2] Metro起動 + ADB接続確認
    ↓ Metro bundler起動 → ポートフォワーディング
[Step 3] 撮影（Phase 1: 19言語一括 or 1言語ずつ）
    ↓ データ注入 → Demo Mode → Maestro → raw PNG 76枚
[Step 4] 合成（Phase 2: 自動）
    ↓ pnpm store-screenshots → Apple 76枚 + Google Play 76枚 = 152枚
[Step 5] 後片付け
```

---

## Step 1: 準備（初回のみ）

### 1-1. SCREENSHOT_MODE を有効にする

`.env` の末尾に以下を追加（既にあれば値を `1` に変更）:

```bash
# .env
SCREENSHOT_MODE=1
```

これによりアプリ内の広告バナーが非表示になる。
コード: `src/core/screenshotMode.ts` → `components/ad-banner.tsx`

### 1-2. Dev APK をビルドする

```bash
npx eas-cli@latest build -p android --profile development --local --output dist/repolog-dev-screenshot.apk
```

| オプション | 意味 |
|---|---|
| `-p android` | Android用にビルド |
| `--profile development` | Dev Client（デバッグ可能、run-as対応） |
| `--local` | クラウドではなくローカルでビルド（無料） |
| `--output ...` | 出力先を指定 |

所要時間: 約15分

### 1-3. APK をインストールする

```bash
# 既存アプリと署名が異なる場合は先にアンインストール
env -u ADB_SERVER_SOCKET adb uninstall com.dooooraku.repolog

# インストール
env -u ADB_SERVER_SOCKET adb install dist/repolog-dev-screenshot.apk
```

> **`env -u ADB_SERVER_SOCKET`** はWSL2環境でADBが正しく動作するために必要。
> ADB_SERVER_SOCKET環境変数をunset（無効化）してからadbを実行する。

### 1-4. Phase 2 の依存パッケージ（初回のみ）

```bash
# devDependencies のインストール（playwright, sharp, tsx）
pnpm install

# Playwright 用 Chromium ダウンロード（約100MB）
npx playwright install chromium
```

| コマンド | 意味 |
|---|---|
| `pnpm install` | package.json の全依存パッケージをインストール |
| `npx playwright install chromium` | Playwright が使う Chromium ブラウザバイナリをダウンロード。`~/.cache/ms-playwright/` に保存される |

> これは Phase 2（ストア画像合成）で必要。Phase 1（撮影）だけなら不要。

---

## Step 2: Metro起動 + ADB接続確認

### 2-1. ADB ポートフォワーディング

Dev Build はMetro bundler に接続する必要がある。ポートフォワーディングを設定:

```bash
env -u ADB_SERVER_SOCKET adb reverse tcp:8081 tcp:8081
```

| 部分 | 意味 |
|---|---|
| `adb reverse` | デバイス→PC方向のポート転送 |
| `tcp:8081 tcp:8081` | デバイスの8081番→PCの8081番に転送 |

### 2-2. Metro bundler を起動

```bash
# Node 22 を使用（Node 18ではMetroが起動しない）
export PATH="$HOME/.nvm/versions/node/v22.21.0/bin:$PATH"

npx expo start --port 8081
```

Metro が `Waiting on http://localhost:8081` と表示されたら成功。
**このターミナルは開いたまま** にして、別のターミナルで Step 3 に進む。

### 2-3. アプリの接続確認

デバイスでアプリが起動していない場合:

```bash
env -u ADB_SERVER_SOCKET adb shell am start -a android.intent.action.VIEW \
  -d "exp+repolog://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" \
  com.dooooraku.repolog
```

Metro の出力に `Android Bundled ...ms` と表示されればアプリがバンドルを読み込んだ証拠。

---

## Step 3: 撮影

### 3-A. 全19言語を一括撮影する場合

```bash
bash scripts/store-screenshots/capture-all-remaining.sh
```

このスクリプトが内部で行うこと（1言語あたり）:
1. `inject-locale.mjs` でSQLite DBにその言語のサンプルデータを注入
2. ADB Demo Mode ON（ステータスバーをクリーン化）
3. deeplink でアプリ起動 → Metro接続
4. Maestro フローで4画面を撮影
5. 次の言語へ

所要時間: 約20〜30分（19言語）

> **注意:** このスクリプトは ja/en を含まない17言語版。
> ja/en も含む全19言語を撮りたい場合はスクリプト内の `LOCALES` 配列を編集するか、
> 先に ja/en を個別撮影してから実行する。

### 3-B. 1言語だけ撮影する場合（パイロット / やり直し）

```bash
# ① データ注入（例: 日本語）
export PATH="$HOME/.nvm/versions/node/v22.21.0/bin:$PATH"
env -u ADB_SERVER_SOCKET adb shell am force-stop com.dooooraku.repolog
env -u ADB_SERVER_SOCKET adb exec-out run-as com.dooooraku.repolog cat files/SQLite/repolog.db > /tmp/repolog_base.db
env -u ADB_SERVER_SOCKET adb exec-out run-as com.dooooraku.repolog cat databases/RKStorage > /tmp/RKStorage_base.db

node scripts/store-screenshots/inject-locale.mjs ja

env -u ADB_SERVER_SOCKET adb push /tmp/repolog_out.db /data/local/tmp/repolog.db
env -u ADB_SERVER_SOCKET adb shell run-as com.dooooraku.repolog cp /data/local/tmp/repolog.db files/SQLite/repolog.db
env -u ADB_SERVER_SOCKET adb push /tmp/RKStorage_out.db /data/local/tmp/RKStorage.db
env -u ADB_SERVER_SOCKET adb shell run-as com.dooooraku.repolog cp /data/local/tmp/RKStorage.db databases/RKStorage
```

```bash
# ② Demo Mode ON
bash scripts/store-screenshots/demo-mode.sh on
```

```bash
# ③ アプリ起動
env -u ADB_SERVER_SOCKET adb shell am start -a android.intent.action.VIEW \
  -d "exp+repolog://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" \
  com.dooooraku.repolog

# 15秒待機（バンドル読み込み）
sleep 15
```

```bash
# ④ Maestro で撮影
mkdir -p screenshots/raw/ja_日本語
env -u ADB_SERVER_SOCKET maestro test \
  --test-output-dir="screenshots/raw/ja_日本語" \
  maestro/flows/store-screenshots.yaml

# スクショを正しい位置に移動
mv screenshots/raw/ja_日本語/screenshots/*.png screenshots/raw/ja_日本語/
```

```bash
# ⑤ Demo Mode OFF
bash scripts/store-screenshots/demo-mode.sh off
```

### 3-C. 出力の確認

```bash
ls screenshots/raw/ja_日本語/
# → 01_home.png  02_editor_top.png  03_editor_bottom.png  04_pdf_preview.png
```

Windows エクスプローラーからも確認可能:
`\\wsl.localhost\Ubuntu\home\doooo\04_app-factory\apps\Repolog\screenshots\raw\`

---

## Step 4: ストア画像の自動合成（Phase 2）

Phase 1 で撮影した raw スクリーンショットから、ストア提出用の完成画像を自動生成する。

### 4-0. Phase 2 の仕組み

```
screenshots/raw/{lang}/0X_*.png  (720×1520, Android)
    ↓ Sharp: 上56px/下32pxクロップ（ステータスバー・ジェスチャーバー除去）
    ↓ base64 data URI に変換
    ↓ HTML テンプレートに埋め込み（白背景 + マーケティングテキスト + 角丸スクショ）
    ↓ Playwright: ヘッドレスChrome で HTML を描画 → PNG キャプチャ
    ↓ Sharp: アルファチャンネル除去 + sRGB ICC 埋め込み + 寸法検証
    ↓
screenshots/store/apple/{lang}/0X_*.png   (1320×2868, 24bit RGB, sRGB)
screenshots/store/google/{lang}/0X_*.png  (1080×1920, 24bit RGB, sRGB)
```

合成後の画像レイアウト:
- **背景**: 白 (#FFFFFF)
- **マーケティングテキスト**: 上部に配置、Bold、ダーク (#1A1A1A)、長い言語は自動縮小
- **スクリーンショット**: 中央〜下部、角丸、ドロップシャドウ付き
- **デバイスフレーム（ベゼル）**: なし

### 4-1. 初回セットアップ（Phase 2 依存パッケージ）

```bash
# devDependencies に playwright, sharp, tsx を追加済み
pnpm install

# Playwright 用の Chromium ブラウザをダウンロード（約100MB、初回のみ）
npx playwright install chromium
```

| コマンド | 意味 |
|---|---|
| `pnpm install` | package.json の依存パッケージをインストール |
| `npx playwright install chromium` | Playwright が使うヘッドレス Chrome をダウンロード |

### 4-2. 全19言語 × 両ストアを一括生成

```bash
pnpm store-screenshots
```

このコマンドが内部で行うこと（1枚あたり）:
1. raw スクショを Sharp で読み込み、Android UI（ステータスバー56px + ジェスチャーバー32px）をクロップ
2. クロップした画像を base64 エンコードして HTML テンプレートに埋め込み
3. `marketing-text.ts` からその言語のキャッチコピーを取得
4. `assets/fonts/` の Noto Sans Variable TTF をロケールに応じて `@font-face` で読み込み
5. Playwright でヘッドレス Chrome を起動し、HTML をターゲットサイズで描画
6. PNG スクリーンショットを取得
7. Sharp でアルファチャンネルを除去（白に統合）、sRGB ICC プロファイルを埋め込み
8. 出力寸法を検証（1ピクセルでもズレたらエラー）
9. `screenshots/store/{apple|google}/{lang}/` に保存

所要時間: 約1分（152枚）

### 4-3. 特定の言語・ストアだけ生成（テスト・やり直し用）

```bash
# Apple のみ、日本語のみ（約3秒）
pnpm store-screenshots -- --store apple --lang ja

# Google Play のみ、日本語と英語
pnpm store-screenshots -- --store google --lang ja,en

# Apple のみ、全19言語
pnpm store-screenshots -- --store apple
```

| フラグ | 意味 | デフォルト |
|---|---|---|
| `--store` | `apple`, `google`, `all` のいずれか | `all`（両方） |
| `--lang` | カンマ区切りのロケール（例: `ja,en,de`） | 全19言語 |

> **注意:** pnpm 経由でフラグを渡す場合、`--` の後にフラグを書く。

### 4-4. 出力の確認

```bash
# Apple 用
ls screenshots/store/apple/ja_日本語/
# → 01_home.png  02_editor_top.png  03_editor_bottom.png  04_pdf_preview.png

# Google Play 用
ls screenshots/store/google/ja_日本語/
# → 01_home.png  02_editor_top.png  03_editor_bottom.png  04_pdf_preview.png
```

Windows エクスプローラーからも確認可能:
- Apple: `\\wsl.localhost\Ubuntu\home\doooo\04_app-factory\apps\Repolog\screenshots\store\apple\`
- Google: `\\wsl.localhost\Ubuntu\home\doooo\04_app-factory\apps\Repolog\screenshots\store\google\`

### 4-5. 寸法・品質の一括検証（任意）

```bash
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
async function main() {
  const storeDir = 'screenshots/store';
  let pass = 0, fail = 0;
  for (const store of ['apple', 'google']) {
    const ew = store === 'apple' ? 1320 : 1080;
    const eh = store === 'apple' ? 2868 : 1920;
    const dirs = fs.readdirSync(path.join(storeDir, store));
    for (const dir of dirs) {
      const files = fs.readdirSync(path.join(storeDir, store, dir)).filter(f => f.endsWith('.png'));
      for (const file of files) {
        const m = await sharp(path.join(storeDir, store, dir, file)).metadata();
        if (m.width !== ew || m.height !== eh || m.hasAlpha || m.channels !== 3) {
          console.log('FAIL:', store, dir, file);
          fail++;
        } else { pass++; }
      }
    }
  }
  console.log(pass + ' PASS, ' + fail + ' FAIL');
}
main();
"
```

| チェック項目 | Apple 期待値 | Google 期待値 |
|---|---|---|
| 幅 × 高さ | 1320 × 2868 | 1080 × 1920 |
| チャンネル数 | 3 (RGB) | 3 (RGB) |
| アルファ | なし | なし |

---

## Step 5: 後片付け

### 5-1. SCREENSHOT_MODE を無効にする

`.env` を編集:

```bash
SCREENSHOT_MODE=0
```

本番ビルドに広告非表示が混入しないようにするため。

### 5-2. 元のAPKに戻す（任意）

```bash
env -u ADB_SERVER_SOCKET adb uninstall com.dooooraku.repolog
env -u ADB_SERVER_SOCKET adb install dist/repolog-preview-local.apk  # または本番APK
```

### 5-3. Metro を停止

Metro を起動しているターミナルで `Ctrl+C` を押す。

---

## トラブルシューティング

### Phase 1（撮影）

| 症状 | 原因 | 対策 |
|---|---|---|
| `adb: device not found` | ADB接続切れ | USBケーブル再接続 → `env -u ADB_SERVER_SOCKET adb devices` で確認 |
| Maestro で `e2e_home_screen` が見つからない | Dev Client メニューが表示されている | Maestro フローに "Continue"/"Go home" のハンドリング済み。アプリを再起動してリトライ |
| Home画面の写真がグレー | DB の `local_uri` がフルパスでない | `inject-locale.mjs` が `file:///data/user/0/...` のフルパスで設定するので、スクリプト経由で再注入 |
| Metro が `toReversed is not a function` | Node 18 を使っている | Node 22 で起動する: `export PATH="$HOME/.nvm/versions/node/v22.21.0/bin:$PATH"` |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | 既存APKと署名が異なる | 先に `adb uninstall com.dooooraku.repolog` してから install |
| テキストに□（文字化け） | `\u2009`（thin space）をNoto Sansが描画不可 | 通常スペースに置換済み |
| PDFプレビューが写真ページを表示 | Maestro フローにスクロール指示があった | スクロールを削除し表紙ビューのまま撮影 |

### Phase 2（合成）

| 症状 | 原因 | 対策 |
|---|---|---|
| `raw screenshot(s) missing` | Phase 1 の撮影が未実行 | 先に Step 3 を実行して `screenshots/raw/` を生成する |
| `Chromium ... not found` | Playwright の Chromium が未ダウンロード | `npx playwright install chromium` を実行 |
| CJK テキストが □（豆腐） | フォントファイルが見つからない | `assets/fonts/` に Noto Sans Variable TTF が存在するか確認 |
| `Dimension mismatch` エラー | Playwright の描画サイズが期待値と不一致 | `lib/config.ts` の `APPLE_SIZE` / `GOOGLE_SIZE` を確認 |
| 出力 PNG が Apple に却下される | アルファチャンネルが残っている | `lib/postprocess.ts` の `.flatten()` が正しく動作しているか確認。Sharp のバージョンを確認 |
| テキストが切れる / 小さすぎる | shrink-to-fit の最小値以下 | `lib/template.ts` の shrink-to-fit 下限値（2.5vw）を調整、またはテキストを短くする |
| Android ステータスバーが見える | クロップ値が不足 | `lib/config.ts` の `CROP_TOP`（現在56px）を増やす |

---

## 参考リンク

### Phase 1（撮影）
- [Maestro ドキュメント](https://docs.maestro.dev)
- [ADB Demo Mode](https://android.googlesource.com/platform/frameworks/base/+/master/packages/SystemUI/docs/demo_mode.md)
- [Google Play スクショ仕様](https://support.google.com/googleplay/android-developer/answer/9866151)

### Phase 2（合成）
- [Apple スクリーンショット仕様](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/)
- [Google Play スクショ仕様](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Playwright ドキュメント](https://playwright.dev/docs/screenshots)
- [Sharp ドキュメント](https://sharp.pixelplumbing.com/)
- [Noto Sans フォント](https://fonts.google.com/noto)
