# Dev Build vs Preview Build 使い分けガイド

最終更新: 2026-03-03（JST）

## 概要

Repolog には 2 種類のビルドがあり、目的に応じて使い分けます。

| | Dev Build | Preview Build |
|---|---|---|
| **用途** | 日常の開発・デバッグ | リリース前の動作確認 |
| **EAS Profile** | `development` | `preview-local-apk` |
| **Metro bundler** | 必要（JS は PC から配信） | 不要（JS は APK に同梱） |
| **ホットリロード** | あり（1〜3 秒で反映） | なし（毎回ビルドが必要） |
| **expo-dev-client** | あり（Dev Menu 使用可） | なし |
| **`__DEV__`** | `true` | `false` |
| **エラー画面** | あり（Red Box / Yellow Box） | なし（クラッシュ → 白画面） |
| **ビルド時間** | 初回: 5〜10 分 / 以降: 不要 | 毎回: 10〜20 分 |
| **1 サイクル** | コード保存 → 1〜3 秒 | コード変更 → ビルド → 転送 → 起動 |

## いつどちらを使うか

### Dev Build を使う場面
- コードを頻繁に変更する日常の開発
- UI の微調整（色・レイアウト・アニメーション）
- バグの調査・デバッグ
- 新機能のプロトタイピング

### Preview Build を使う場面
- PR マージ前の最終確認（本番に近い動作）
- パフォーマンステスト（`__DEV__=false` の実行速度）
- AdMob 広告の動作確認（dev では表示されない場合がある）
- Maestro E2E テスト

## Dev Build の準備

### 1. APK をビルド

```bash
# EAS Cloud でビルド（推奨）
npx eas-cli@latest build -p android --profile development

# またはローカルビルド
npx eas-cli@latest build -p android --profile development --local --output dist/repolog-dev.apk
```

### 2. APK をインストール

```bash
# ローカルビルドの場合
env -u ADB_SERVER_SOCKET adb install -r dist/repolog-dev.apk

# EAS Cloud ビルドの場合
# → ビルド完了後に表示される URL からダウンロードしてインストール
# → または EAS CLI でインストール
npx eas-cli@latest build:run -p android --profile development
```

### 3. 開発セッションを開始

```bash
# ワンコマンドで ADB 確認 + ポートフォワーディング + Metro 起動
bash scripts/dev-start.sh

# キャッシュクリアして起動（キャッシュ不整合時）
bash scripts/dev-start.sh --clean

# カスタムポート
bash scripts/dev-start.sh --port 8082
```

### 4. デバイスでアプリを起動

1. デバイスで Repolog アプリを開く
2. Dev Menu が表示される → 自動で Metro に接続
3. 接続されない場合: Dev Menu > "Enter URL manually" > `localhost:8081`

## Preview Build の準備

```bash
# ローカルビルド（推奨: CI 不要で高速）
pnpm build:android:apk:local

# デバイスにインストール
pnpm install:device
```

## トラブルシューティング

| 症状 | 原因 | 対処法 |
|------|------|--------|
| アプリに "No development server" と表示 | Metro が動いていない | `bash scripts/dev-start.sh` |
| アプリが Metro に接続できない | ポートフォワーディングが切れた | `env -u ADB_SERVER_SOCKET adb reverse tcp:8081 tcp:8081` |
| 古いバンドルが表示される | Metro キャッシュ | `bash scripts/dev-start.sh --clean` |
| Dev Build APK がインストールできない | Preview Build と競合 | 先に Preview Build をアンインストール |
| "Invariant Violation" エラー | ネイティブモジュール不一致 | Dev Build APK を再ビルド |

## 参考

- `eas.json`: ビルドプロファイル定義
- `scripts/dev-start.sh`: 開発セッション起動スクリプト
- `docs/how-to/development/android_debug.md`: ADB セットアップ・デバッグ全般
