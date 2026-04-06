# Repolog → テンプレート移植 & 技術スタック更新 総合議論書 v1

> 作成日: 2026-04-01
> ステータス: v1（初版）— v2でブラッシュアップ予定

---

## 目次
1. [現状のギャップ分析（Repolog vs テンプレート）](#1-現状のギャップ分析repolog-vs-テンプレート)
2. [テンプレート移植戦略 ─ 4つのアプローチ比較](#2-テンプレート移植戦略--4つのアプローチ比較)
3. [何を移植して何を移植しないか ─ 判定マトリクス](#3-何を移植して何を移植しないか--判定マトリクス)
4. [技術スタック更新 ─ バージョンアップ分析](#4-技術スタック更新--バージョンアップ分析)
5. [ドキュメントのテンプレート化設計](#5-ドキュメントのテンプレート化設計)
6. [追加提案 ─「そもそもこれ考えてる？」](#6-追加提案--そもそもこれ考えてる)
7. [推奨アクションプラン](#7-推奨アクションプラン)

---

## 1. 現状のギャップ分析（Repolog vs テンプレート）

### テンプレートに「既にあるもの」と「まだ無いもの」

| カテゴリ | テンプレートに既にある | Repologにあってテンプレートに無い |
|---|---|---|
| **アプリ基盤** | app/ (tabs), app.config.ts, babel, tamagui | experiments (typedRoutes, reactCompiler), edgeToEdge |
| **コード構造** | src/core/i18n, src/services, src/types | src/db/ (SQLite層), src/features/ (垂直分割), src/stores/ (Zustand), plugins/ |
| **i18n** | 18言語 | 19言語（pl=ポーランド語が不足） |
| **テスト** | maestro/smoke.yml のみ | __tests__/ (15ファイル), Maestro 6フロー |
| **CI/CD** | なし（ワークフロー未設定） | ci.yml, maestro-smoke.yml, build-ios-testflight.yml, i18n-audit.yml, ump-consent-validation.yml |
| **スクリプト** | reset-project.js のみ | i18n-audit, i18n-check, config-check, ump-consent-check, dev-start, debug_session, monitor, store-screenshots |
| **ドキュメント** | 基本構造（Diataxis）, ADR-0001 | ADR 0002-0010, quickstart, development/, workflow/, testing/, store-listing/ (19言語) |
| **設定** | eas.json (基本) | eas.json (4プロファイル + iOS submit), eslint拡張 |
| **アセット** | アイコン類のみ | Noto Sans変数フォント7ファイル（PDF用） |
| **依存パッケージ** | 基本セット | 20+追加パッケージ（画像、PDF、ZIP、位置情報等） |

---

## 2. テンプレート移植戦略 ─ 4つのアプローチ比較

### 方法A: GitHub Template Repository + `setup.sh` ← 推奨

| 項目 | 評価 |
|---|---|
| 導入の簡単さ | ★★★★★ |
| 学習コスト | ★★★★★ |
| テンプレート更新の反映 | ★☆☆☆☆ |
| カスタマイズ性 | ★★★☆☆ |
| エコシステム連携 | ★★★★☆ |

### 方法B: Copier（Python製テンプレートエンジン）

| 項目 | 評価 |
|---|---|
| 導入の簡単さ | ★★★☆☆ |
| 学習コスト | ★★★☆☆ |
| テンプレート更新の反映 | ★★★★★ |
| カスタマイズ性 | ★★★★★ |
| エコシステム連携 | ★★★☆☆ |

### 方法C: `create-expo-app --template`

| 項目 | 評価 |
|---|---|
| 導入の簡単さ | ★★★★☆ |
| 学習コスト | ★★★★☆ |
| テンプレート更新の反映 | ★☆☆☆☆ |
| カスタマイズ性 | ★★☆☆☆ |
| エコシステム連携 | ★★★★☆ |

### 方法D: 手動 fork/clone + 書き換え

| 項目 | 評価 |
|---|---|
| 導入の簡単さ | ★★★★★ |
| 学習コスト | ★★★★★ |
| テンプレート更新の反映 | ★★☆☆☆ |
| カスタマイズ性 | ★★★★★ |
| エコシステム連携 | ★★★★★ |

**結論: 方法A（GitHub Template + setup.sh）を推奨**

---

## 3. 何を移植して何を移植しないか

### A. 移植する（汎用インフラ）

- src/db/ の構造（スケルトン）
- src/features/ のディレクトリ構造
- src/stores/ の構造
- plugins/ (withLargeHeap, withFragmentFactory)
- .github/workflows/ci.yml
- .github/workflows/maestro-smoke.yml
- scripts/i18n-audit.mjs, i18n-check.mjs
- scripts/config-check.mjs
- scripts/ump-consent-check.mjs
- ポーランド語(pl)ロケール
- app.json experiments
- eas.json 拡充
- __tests__/ 構造
- docs/how-to/ サブディレクトリ構造
- docs/adr/adr_template.md
- eslint 拡張ルール

### B. 移植しない（Repolog固有）

- src/features/reports/, pdf/, photos/, backup/
- Noto Sans変数フォント
- docs/store-listing/ の内容
- ADR-0002〜0010 の内容
- scripts/store-screenshots/
- scripts/debug_session.sh, monitor_repolog.sh
- scripts/pdf-font-benchmark.mjs
- react-native-pdf, expo-print, react-native-zip-archive等

### C. ボーダーライン

- docs/store-listing/ 構造 → 構造だけ移植
- build-ios-testflight.yml → コメントアウト状態で移植
- scripts/dev-start.sh → 汎用化して移植
- @shopify/flash-list → 移植する
- react-native-webview → 移植する
- expo-location → 移植しない
- playwright + sharp → 移植しない（要議論）

---

## 4. 技術スタック更新

| パッケージ | 現在 | 推奨ターゲット | リスク |
|---|---|---|---|
| Expo SDK | 54 | 55 | 高 |
| React Native | 0.81.5 | 0.83.2 | 中 |
| React | 19.1.0 | 19.2.0 | 低 |
| Expo Router | ~6.0.23 | ~55.0.8 (v7) | 中 |
| Tamagui | 1.138.5 | 1.144.3 (v1維持) | 低 |
| async-storage | ^2.2.0 | ^2.2.0 (据え置き) | - |
| Node.js | 20 | 22 LTS | 低 |

**実行順序: Phase 1（移植）→ Phase 2（SDK55）→ Phase 3（検証）**

---

## 5. ドキュメントのテンプレート化設計

### プレースホルダー一覧

| プレースホルダー | 説明 | 例 |
|---|---|---|
| `{{APP_NAME}}` | アプリ表示名 | `Repolog` |
| `{{APP_SLUG}}` | URLセーフな識別子 | `repolog` |
| `{{ANDROID_PACKAGE}}` | Androidパッケージ名 | `com.dooooraku.repolog` |
| `{{IOS_BUNDLE_IDENTIFIER}}` | iOSバンドルID | `com.dooooraku.repolog` |
| `{{APP_SCHEME}}` | ディープリンクスキーム | `repolog` |
| `{{DESCRIPTION}}` | アプリの一行説明 | `Daily report logging app` |
| `{{EAS_PROJECT_ID}}` | EASプロジェクトID | `xxxxxxxx-xxxx-...` |

---

## 6. 追加提案

1. setup.sh の置換漏れ検証機能
2. `pnpm verify` コマンドの統一
3. Husky + lint-staged の導入
4. Renovate / Dependabot の導入
5. CI/CDワークフロー充実
6. EXPO_PUBLIC_ プレフィックスの整理
7. EAS Workflows は見送り（GitHub Actions維持）

---

## 7. 推奨アクションプラン

### Phase 1: テンプレートへのノウハウ移植（SDK 54のまま）
### Phase 2: SDK 55 アップグレード
### Phase 3: 検証

---

> 次のステップ: ユーザーフィードバックを反映してv2を作成
