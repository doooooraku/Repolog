# Google Play ストアスクリーンショット生成手順

> ステータス: 運用中（Phase 1 完了、Phase 2 進行中）
> 初版: 2026-03-30 / 最終更新: 2026-03-31

19言語 × 4画面 = 76枚のストア提出用スクリーンショットを生成する手順です。
アプリUIが変わったとき・言語を追加したときに再実行してください。

想定:
- WSL2 (Ubuntu) + Pixel 8a 実機（ADB接続済み）
- Expo SDK 54 Dev Build（SCREENSHOT_MODE=1）
- Maestro CLI インストール済み
- Node.js 22.x（Metro bundler 用）

---

## 概要

### ワークフローの全体像

```
Phase 1: 撮影 (自動)          Phase 2: 仕上げ (Figma + 手動)
┌──────────────────────┐     ┌───────────────────────────────┐
│ Maestro + ADB        │     │ Figma MCP: テキスト設定        │
│ → raw スクショ 76枚   │────►│ 手動: フレーム変更・スクショ挿入 │
│   (screenshots/raw/) │     │ 手動: エクスポート → 提出画像    │
└──────────────────────┘     └───────────────────────────────┘
```

### Google Play 仕様

| 項目 | 要件 |
|---|---|
| サイズ | **1080 × 1920 px**（縦）推奨 |
| アスペクト比 | 9:16。**最大辺が最小辺の2倍を超えると却下** |
| フォーマット | JPEG or 24bit PNG（**透過NG**） |
| ファイルサイズ | 最大 8MB/枚 |
| 枚数 | 1言語あたり最小2枚 / 最大8枚 |
| Feature Graphic | 1024 × 500 px（**公開に必須** → 別途対応） |

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
└── raw/{lang}/                    # Maestro撮影の生スクショ（Figmaに挿入する素材）
```

---

## 0. 全体像

```
[Step 1] 準備（初回のみ / APK未ビルド時のみ）
    ↓ .env設定 → Dev APK ビルド → インストール
[Step 2] Metro起動 + ADB接続確認
    ↓ Metro bundler起動 → ポートフォワーディング
[Step 3] 撮影（19言語一括 or 1言語ずつ）
    ↓ データ注入 → Demo Mode → Maestro → raw PNG 76枚
[Step 4] Figmaで仕上げ（手動）
    ↓ フレーム調整 → スクショ挿入 → エクスポート → 提出画像 76枚
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

## Step 4: Figma で仕上げ（手動）

Figma ファイル: https://www.figma.com/design/CTrun6PxYslD5z1JvntweR/

19言語分のページとマーケティングテキストは Figma MCP で設定済み。

### 4-1. テンプレート修正（初回のみ）

1つのページで以下を修正し、他のページにコピーする:

| 修正項目 | 現状 | 修正後 |
|---|---|---|
| フレームサイズ | 1284 × 2778 px | **1080 × 1920 px** |
| デバイスフレーム | iPhone 16 Pro | **Android (Pixel)** |
| 背景色 | 白 | お好みで設定 |

> **重要:** 1284×2778 のままエクスポートすると Google Play に却下されます（アスペクト比 2.16:1 > 許容上限 2:1）。

### 4-2. スクリーンショットを挿入

各ページの4フレームに、`screenshots/raw/{lang}/` の画像をドラッグ:

| フレーム | 挿入する画像 |
|---|---|
| 1枚目 | `01_home.png` |
| 2枚目 | `02_editor_top.png` |
| 3枚目 | `03_editor_bottom.png` |
| 4枚目 | `04_pdf_preview.png` |

19言語 × 4枚 = 76回の挿入が必要。

### 4-3. エクスポート

各ページの4スライスを PNG で書き出す:
- フォーマット: **PNG**（24bit、透過なし）
- サイズ: **1080 × 1920 px**
- ファイルサイズ: 8MB以下

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

| 症状 | 原因 | 対策 |
|---|---|---|
| `adb: device not found` | ADB接続切れ | USBケーブル再接続 → `env -u ADB_SERVER_SOCKET adb devices` で確認 |
| Maestro で `e2e_home_screen` が見つからない | Dev Client メニューが表示されている | Maestro フローに "Continue"/"Go home" のハンドリング済み。アプリを再起動してリトライ |
| Home画面の写真がグレー | DB の `local_uri` がフルパスでない | `inject-locale.mjs` が `file:///data/user/0/...` のフルパスで設定するので、スクリプト経由で再注入 |
| Metro が `toReversed is not a function` | Node 18 を使っている | Node 22 で起動する: `export PATH="$HOME/.nvm/versions/node/v22.21.0/bin:$PATH"` |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | 既存APKと署名が異なる | 先に `adb uninstall com.dooooraku.repolog` してから install |
| Figma エクスポートが Google Play で却下 | フレームサイズが 1284×2778 のまま | **1080×1920** にリサイズしてからエクスポート |
| テキストに□（文字化け） | `\u2009`（thin space）をNoto Sansが描画不可 | 通常スペースに置換済み |
| PDFプレビューが写真ページを表示 | Maestro フローにスクロール指示があった | スクロールを削除し表紙ビューのまま撮影 |
| Figma で `getNodeById` が null | ページ切替前にノードアクセスした | `await figma.setCurrentPageAsync(page)` を先に実行 |

---

## 参考リンク

- [Google Play スクショ仕様](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Google Play ベストプラクティス](https://support.google.com/googleplay/android-developer/answer/13393723)
- [Maestro ドキュメント](https://docs.maestro.dev)
- [ADB Demo Mode](https://android.googlesource.com/platform/frameworks/base/+/master/packages/SystemUI/docs/demo_mode.md)
- [Figma デザインファイル](https://www.figma.com/design/CTrun6PxYslD5z1JvntweR/)
