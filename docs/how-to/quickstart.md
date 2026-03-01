# Quickstart (開発環境セットアップ)

> 新しくプロジェクトに入る開発者が「動くまで」を最短で辿るためのガイド。

---

## 前提

- Node.js 20+ / npm 10+
- Android Studio（Android開発）/ Xcode 16+（iOS開発）
- 実機推奨：Pixel 8a 等の Android 13+ / iPhone 15 等

---

## 1. 依存インストール

```bash
npm install
```

## 2. ネイティブコード生成（初回 / ネイティブ依存追加時）

```bash
npx expo prebuild
```

## 3. 開発サーバー起動

```bash
npm run dev          # Metro bundler 起動
```

## 4. 実機/エミュレータで実行

```bash
# Android（実機 USB 接続済み、または エミュレータ起動中）
npm run android

# iOS（Mac のみ）
npm run ios
```

WSL2 + Windows ADB 環境の場合は `docs/how-to/development/android_device.md` を参照。

---

## よく使うコマンド一覧

| コマンド | 用途 |
|---------|------|
| `npm run lint` | ESLint 実行 |
| `npm run type-check` | TypeScript 型チェック（`tsc --noEmit`） |
| `npm run test` | Jest 単体テスト |
| `npm run test:e2e` | Maestro E2E テスト |
| `npm run i18n:audit` | 翻訳キー監査 |
| `npm run i18n:inventory` | 翻訳キー棚卸し → MD 出力 |
| `npm run ump:consent:check` | AdMob UMP 同意チェック |
| `npm run pdf:font:benchmark` | PDF フォント性能計測 |

---

## ビルド（リリース用）

```bash
# Android APK（ローカルビルド）
npm run build:android:apk:local

# Android AAB（クラウドビルド → Play Console）
npm run build:android:aab:cloud

# 実機インストール（WSL2）
npm run install:device
```

詳細: `docs/how-to/development/android_build.md` / `docs/how-to/development/ios_build.md`

---

## 次に読むべきドキュメント

- `docs/how-to/workflow/whole_workflow.md` — Issue → PR → CI → Release 全体像
- `docs/how-to/workflow/git_workflow.md` — ブランチ/コミット規約
- `docs/how-to/development/coding_rules.md` — コーディングルール
- `docs/reference/basic_spec.md` — アプリの基本仕様
