# Repolog → テンプレート移植 & 技術スタック更新 総合議論書 v2

> 作成日: 2026-04-01
> ステータス: v2（フィードバック反映 + 深堀ブラッシュアップ版）
> 前版: template-migration-report-v1.md（Superseded）

---

## 目次

1. [v1からの変更点サマリー](#1-v1からの変更点サマリー)
2. [現状のギャップ分析（修正版）](#2-現状のギャップ分析修正版)
3. [テンプレート移植戦略](#3-テンプレート移植戦略)
4. [何を移植して何を移植しないか（修正版）](#4-何を移植して何を移植しないか修正版)
5. [CI/CD 実効性の徹底監査](#5-cicd-実効性の徹底監査)
6. [品質ゲート強化計画](#6-品質ゲート強化計画)
7. [技術スタック更新 ─ バージョンアップ分析](#7-技術スタック更新--バージョンアップ分析)
8. [ドキュメントのテンプレート化設計](#8-ドキュメントのテンプレート化設計)
9. [ストアスクリーンショット生成パイプラインのテンプレート化](#9-ストアスクリーンショット生成パイプラインのテンプレート化)
10. [デバッグツールキットのテンプレート化](#10-デバッグツールキットのテンプレート化)
11. [ストアリスティング制作How-To](#11-ストアリスティング制作how-to)
12. [推奨アクションプラン（修正版）](#12-推奨アクションプラン修正版)

---

## 1. v1からの変更点サマリー

### 事実誤認の訂正

| v1の記載 | 事実 | 訂正内容 |
|---|---|---|
| テンプレートにCI/CDなし | ci.yml + build-ios-testflight.yml が存在 | ギャップ分析を修正。テンプレートには基本CIが既にある |

### ユーザーフィードバック反映

| フィードバック | 対応 |
|---|---|
| ストアリスティングの「作り方」はテンプレートに含めるべき | B→A に移動。How-Toガイドとして移植。セクション11に詳細 |
| デバッグスクリプトの「やり方」はテンプレート化すべき | B→A に移動。汎用debug toolkitとして移植。セクション10に詳細 |
| playwright + sharp は全アプリで使う | C→A に移動。スクリーンショットパイプラインとして移植。セクション9に詳細 |
| 追加技術スタック提案は全て見送り | NativeWind, Drizzle ORM, Biome を検討対象から除外 |
| 提案6つ（Husky, Dependabot等）は全て採用 | セクション6に詳細設計を記載 |
| CIの実効性を監査してほしい | セクション5に徹底監査結果を記載 |

---

## 2. 現状のギャップ分析（修正版）

### テンプレートに「既にあるもの」と「まだ無いもの」

| カテゴリ | テンプレートに既にある | Repologにあってテンプレートに無い |
|---|---|---|
| **アプリ基盤** | app/ (tabs), app.config.ts, babel, tamagui | experiments (typedRoutes, reactCompiler), edgeToEdge |
| **コード構造** | src/core/i18n, src/services, src/types | src/db/ (SQLite層), src/features/ (垂直分割), src/stores/ (Zustand), plugins/ |
| **i18n** | 18言語 | 19言語（pl=ポーランド語が不足） |
| **テスト** | maestro/smoke.yml（E2Eスケルトン） | __tests__/ (15ファイル), Maestro 6フロー |
| **CI/CD** | ci.yml（lint+型+test+i18n+config）, build-ios-testflight.yml | maestro-smoke.yml, i18n-audit.yml, ump-consent-validation.yml |
| **スクリプト** | reset-project.js, i18n-audit.mjs, i18n-check.mjs, config-check.mjs | ump-consent-check, dev-start, debug_session, monitor, store-screenshots |
| **ドキュメント** | 基本構造（Diataxis）, ADR-0001, 6つのhow-to | quickstart, development/サブディレクトリ, workflow/, testing/, store-listing/ |
| **品質ゲート** | ESLint（ハードコード検出あり）, Prettier（未強制）, Jest（テストゼロ） | Jest 15テスト（ただし--passWithNoTests） |
| **Git Hooks** | prepare設定あり（.githooksパス指定） | **なし**（.githooksディレクトリが存在しない = 実質機能していない） |
| **依存管理** | 手動のみ | 手動のみ（Dependabotなし） |

### 重要な発見: テンプレートの「見せかけの品質ゲート」

テンプレートCI監査で判明した**最大の問題**:

```
pnpm test → jest --passWithNoTests
```

これは「テストファイルが1つもなくてもCIが通る」ことを意味する。
つまり、テンプレートからアプリを作って一度もテストを書かなくても、CIは永遠に緑（成功）のまま。
**品質ゲートとしての機能を果たしていない。**

同様に:
- `prepare: "git config core.hooksPath .githooks"` → `.githooks/`ディレクトリが存在しない → **Git hookが機能していない**
- Prettier ^3.6.2 がdevDependenciesにある → しかし `pnpm verify` にも CI にもフォーマットチェックが含まれていない → **インストールされているだけで実行されていない**

---

## 3. テンプレート移植戦略

### 決定事項（v1で合意済み）

**方法A: GitHub Template Repository + setup.sh を採用**

理由（再掲）:
- ソロ開発者が年に数個のアプリを作るユースケースに最適
- 追加ツール不要、学習コストゼロ
- GitHubのエコシステム（Actions, Issues, PRテンプレート）がそのまま引き継がれる
- setup.shの置換漏れチェック機能で安全性を担保

### setup.sh の設計詳細

#### 何をするスクリプトか（小中学生向け）

> テンプレートからアプリを作ったら、最初に1回だけ実行するスクリプト。
> 「アプリ名は？」「パッケージ名は？」と聞いてきて、答えるとファイル中の
> 「ここにアプリ名を入れてね」という印が全部自動で書き換わる。
> 最後に「書き換え忘れがないか」もチェックしてくれる。

#### 処理フロー

```
setup.sh 実行
  │
  ├─ 1. ユーザーに質問（対話形式）
  │    ├─ APP_NAME（アプリ表示名）         例: "Repolog"
  │    ├─ APP_SLUG（URLセーフな識別子）      例: "repolog"
  │    ├─ ANDROID_PACKAGE（Androidパッケージ名）例: "com.dooooraku.repolog"
  │    ├─ IOS_BUNDLE_IDENTIFIER（iOSバンドルID）例: "com.dooooraku.repolog"
  │    ├─ APP_SCHEME（ディープリンク）       例: "repolog"
  │    └─ DESCRIPTION（一行説明）           例: "現場報告アプリ"
  │
  ├─ 2. プレースホルダーを一括置換
  │    ├─ find + sed で全ファイルの {{APP_NAME}} 等を置換
  │    ├─ .env.example → .env をコピーして値を埋める
  │    └─ package.json の name フィールドも更新
  │
  ├─ 3. テンプレート専用ファイルを削除
  │    ├─ TEMPLATE_README.md（テンプレートの使い方ガイド）
  │    ├─ setup.sh 自身
  │    └─ docs/how-to/template-setup.md
  │
  ├─ 4. 置換漏れチェック
  │    ├─ grep -r "{{" . でプレースホルダー残存を検索
  │    ├─ 残っていたら警告 + 該当ファイル一覧を表示
  │    └─ 残っていなければ「セットアップ完了」
  │
  └─ 5. 次のステップを表示
       ├─ "[ ] pnpm install を実行"
       ├─ "[ ] docs/reference/basic_spec.md を記入"
       ├─ "[ ] docs/explanation/product_strategy.md を記入"
       ├─ "[ ] EAS プロジェクトを作成"
       └─ "[ ] GitHub リポジトリを作成してpush"
```

#### 各コマンドの意味（初心者向け）

```bash
#!/bin/bash
# ↑ このファイルがbash（シェル）スクリプトであることを宣言する1行目

set -euo pipefail
# set -e : コマンドが1つでも失敗したらスクリプト全体を停止する
# set -u : 未定義の変数を使おうとしたらエラーにする（タイプミス防止）
# set -o pipefail : パイプ（|）で繋いだコマンドのどれかが失敗したらエラーにする

read -rp "アプリ表示名を入力: " APP_NAME
# read    : ユーザーからの入力を受け取るコマンド
# -r      : バックスラッシュをエスケープ文字として扱わない（入力をそのまま受け取る）
# -p "..." : 入力を求める前にメッセージを表示する
# APP_NAME : 入力された値を保存する変数名

find . -type f -not -path './.git/*' -not -path './node_modules/*' \
  -exec sed -i "s/{{APP_NAME}}/$APP_NAME/g" {} +
# find .         : 現在のフォルダ以下の全ファイルを探す
# -type f        : ファイルだけ（フォルダは除く）
# -not -path ... : .git/ と node_modules/ は除外する（壊さないため）
# -exec ... {} + : 見つかったファイルそれぞれに対してコマンドを実行
# sed -i         : ファイルを直接書き換える（-i = in-place）
# "s/A/B/g"      : ファイル中の A を B に全て（g = global）置換する

grep -r "{{" . --include="*.ts" --include="*.tsx" --include="*.json" \
  --include="*.md" --include="*.yml" --include="*.yaml" \
  --exclude-dir=node_modules --exclude-dir=.git
# grep -r  : フォルダの中を再帰的に（recursive）テキスト検索する
# "{{"     : 検索する文字列（プレースホルダーの開始記号）
# --include: 検索対象のファイル種類を限定する
# --exclude-dir: 検索対象から除外するフォルダ
# → これが何もヒットしなければ、全プレースホルダーが正しく置換された証拠
```

---

## 4. 何を移植して何を移植しないか（修正版）

### A. 移植する（汎用インフラ）

#### A-1. コード構造

| 項目 | 移植方法 | テンプレートでの姿 |
|---|---|---|
| src/db/ | スケルトン移植 | db.ts（接続設定）, schema.ts（空テーブル例）, exampleRepository.ts（CRUDパターン例） |
| src/features/example/ | パターン例として1つ | ExampleScreen.tsx, exampleUtils.ts の骨格 |
| src/stores/settingsStore.ts | スケルトン | Zustandストアのパターン（言語、テーマ等の汎用設定） |
| plugins/withLargeHeap.js | そのまま | Android JavaヒープをlargeHeapに設定するExpoプラグイン |
| plugins/withFragmentFactory.js | そのまま | AndroidX Fragment factoryを設定するExpoプラグイン |

#### A-2. CI/CD・品質ゲート（新規追加）

| 項目 | 移植方法 | 詳細 |
|---|---|---|
| .github/workflows/maestro-smoke.yml | Repologから汎用化して移植 | testIDのみ差し替え |
| .github/dependabot.yml | 新規作成 | npm + GitHub Actions の自動更新 |
| .githooks/pre-commit | 新規作成 | lint-staged実行 |
| .githooks/commit-msg | 新規作成 | コミットメッセージ形式チェック |
| lint-staged設定 | 新規作成 | .lintstagedrc.js |
| Prettier強制 | verify + CIに追加 | `pnpm format:check` |

#### A-3. スクリプト

| 項目 | 移植方法 | テンプレートでの姿 |
|---|---|---|
| scripts/ump-consent-check.mjs | そのまま移植 | AdMob UMPコンプライアンス検証 |
| scripts/dev-start.sh | 汎用化して移植 | ADB接続チェック→ポートフォワード→Metro起動 |
| scripts/debug/ (新規) | Repologから汎用化 | debug_session.sh + monitor.sh + debug.config.sh |
| scripts/store-screenshots/ | Repologから汎用化 | 汎用レンダラー + app固有configのテンプレート |
| setup.sh | 新規作成 | プレースホルダー置換スクリプト |

#### A-4. ドキュメント

| 項目 | 移植方法 |
|---|---|
| docs/how-to/development/ サブディレクトリ | 構造を移植、内容を汎用化 |
| docs/how-to/workflow/ サブディレクトリ | 構造を移植、内容を汎用化 |
| docs/how-to/testing/ サブディレクトリ | 構造を移植、内容を汎用化 |
| docs/how-to/quickstart.md | Repolog版をベースに汎用化 |
| docs/how-to/store-listing-guide.md | **新規作成**: ストアリスティング制作ガイド |
| docs/how-to/debug-guide.md | **新規作成**: デバッグ手法ガイド |
| docs/how-to/screenshot-generation.md | **新規作成**: スクリーンショット生成ガイド |
| docs/store-listing/ 構造 | 19言語分のフォルダ + プレースホルダーファイル |
| TEMPLATE_README.md | **新規作成**: テンプレート自体の使い方 |

#### A-5. 設定・依存パッケージ

| 項目 | 移植方法 |
|---|---|
| ポーランド語(pl)ロケール | 18→19言語に統一 |
| app.json experiments | typedRoutes: true, reactCompiler: true |
| eas.json 拡充 | 4ビルドプロファイル + iOS submitプレースホルダー |
| @shopify/flash-list | package.jsonに追加 |
| react-native-webview | package.jsonに追加 |
| playwright (devDependency) | スクリーンショット生成用 |
| sharp (devDependency) | スクリーンショット画像処理用 |
| husky (devDependency) | Git hooks管理 |
| lint-staged (devDependency) | ステージファイルのみlint |
| __tests__/ サンプル | 1-2個のサンプルテスト（パターン例） |

### B. 移植しない（Repolog固有）

| 項目 | 理由 |
|---|---|
| src/features/reports/, pdf/, photos/, backup/ | Repolog固有のビジネスロジック |
| Noto Sans変数フォント | PDF生成用。汎用ではない |
| docs/store-listing/ の**内容** | アプリ固有のマーケティングテキスト |
| ADR-0002〜0010 の**内容** | Repolog固有の意思決定 |
| scripts/pdf-font-benchmark.mjs | PDF機能固有 |
| アプリ固有パッケージ | react-native-pdf, expo-print, react-native-zip-archive, react-native-blob-util, react-native-image-viewing, expo-location, @react-native-community/datetimepicker 等 |
| scripts/update-figma-node-ledger.mjs | Repolog固有のFigma連携 |

---

## 5. CI/CD 実効性の徹底監査

### そもそもCIって何？（小中学生向け）

> CI（Continuous Integration = 継続的インテグレーション）は「自動チェック係」のこと。
> コードを変更してGitHubにアップロード（push）するたびに、ロボットが自動で
> 「文法ミスない？」「型エラーない？」「テスト通る？」「翻訳漏れない？」をチェックしてくれる。
> チェックが全部通らないと、変更をメインブランチに取り込めない。
> 
> ただし、CIが「全部OK」と言っていても、実は穴がある場合がある。
> 例えば「テストが0個でもOK」という設定になっていたら、テストを一切書かなくてもCIは通ってしまう。
> これは「見せかけの品質ゲート」で、本当は品質を守れていない。

### Repolog の CI/CD ワークフロー一覧

#### 1. ci.yml（メインCI） ─ 実効性: ⚠️ 部分的に有効

**いつ動くか**: mainブランチへのPR作成時 / mainへのpush時 / 手動実行

**何をチェックするか**:

| ステップ | コマンド | 実効性 | 問題点 |
|---|---|---|---|
| 依存インストール | `pnpm install --frozen-lockfile` | ✅ 有効 | lockfileと差異があればエラー |
| Lint | `pnpm lint` | ✅ 有効 | ESLintルールに違反するコードをブロック |
| 型チェック | `pnpm type-check` | ✅ 有効 | TypeScriptの型エラーをブロック |
| テスト | `pnpm test` | ⚠️ **見せかけ** | `jest --passWithNoTests` → テスト0個でも通る |
| i18nチェック | `pnpm i18n:check` | ✅ 有効 | 翻訳キーの過不足を検出 |
| 設定チェック | `pnpm config:check` | ✅ 有効 | バンドルID、暗号化設定、プライバシーマニフェストを検証 |

**検出できるもの**:
- ESLintルール違反（ハードコード検出含む）
- TypeScript型エラー
- 翻訳キーの漏れ・不要キー
- app.json設定ミス

**検出できないもの（穴）**:
- ❌ テスト未記述（テスト0個でもパス）
- ❌ Prettierフォーマット違反（チェックなし）
- ❌ UIの回帰バグ（E2Eが含まれていない）
- ❌ セキュリティ脆弱性のある依存パッケージ
- ❌ コミットメッセージの形式違反

#### 2. maestro-smoke.yml（E2Eスモークテスト） ─ 実効性: ⚠️ 限定的

**いつ動くか**: 毎日15:18 UTC（日本時間03:15）+ 手動実行

**何をテストするか**: アプリ起動→ホーム画面表示→設定画面遷移→ホームに戻る

**問題点**:
- ❌ **PRに連動していない** → マージ前にE2Eが走らない → UIバグが見逃される
- ❌ テスト範囲が「ホーム→設定→ホーム」のみ → 6つあるE2Eフローのうち1つだけ
- ❌ 毎日深夜に走るが、結果を確認する習慣がなければ意味がない

**有効な点**:
- ✅ エミュレータ設定が本格的（API 35, GPU加速, KVM, リトライロジック）
- ✅ ログ収集・アーティファクト保存が充実
- ✅ 回帰検出には（確認すれば）使える

#### 3. i18n-audit.yml（翻訳監査） ─ 実効性: ✅ 有効だが手動

**いつ動くか**: 手動実行のみ（特定ロケールを指定して実行）

**何をするか**: 指定ロケールの翻訳キーを詳細分析し、レポート生成

**評価**: 目的（深堀り分析）に対して適切。これは自動化すべきものではなく、必要な時に使うツール。

#### 4. build-ios-testflight.yml（iOS配信） ─ 実効性: ✅ 有効

**いつ動くか**: `v*`タグpush時 / 手動実行

**何をするか**: `pnpm verify` → iOSビルド → TestFlight提出

**評価**: リリースパイプラインとして適切。**ビルド前にpnpm verifyが走る**のは良い設計。

#### 5. ump-consent-validation.yml（UMP同意検証） ─ 実効性: ✅ 有効だが手動

**いつ動くか**: 手動実行のみ

**何をするか**: AdMob UMP設定の妥当性チェックリスト生成

**評価**: コンプライアンス確認ツールとして適切。

### テンプレートの CI/CD ワークフロー一覧

#### 1. ci.yml ─ 実効性: ⚠️ Repologと同じ問題あり

Repologのci.ymlとほぼ同構成。同じ `jest --passWithNoTests` 問題を抱える。
加えてテンプレートにはテストファイルが**1つもない**ため、テストステップは常にスキップされる。

#### 2. build-ios-testflight.yml ─ 実効性: ✅ 設計は適切

Repolog版と同構造。プレースホルダー（EASプロジェクトID等）の設定が必要。

### 監査総合評価

```
CI品質スコアカード（100点満点）

Repolog:
  ├─ Lint           : 15/15  ✅ 有効
  ├─ 型チェック      : 15/15  ✅ 有効
  ├─ 単体テスト      :  3/15  ⚠️ 存在するが --passWithNoTests で実質オプション
  ├─ i18nチェック    : 10/10  ✅ 有効
  ├─ 設定チェック    : 10/10  ✅ 有効
  ├─ E2Eテスト      :  3/10  ⚠️ 存在するがPR非連動、範囲狭い
  ├─ フォーマット    :  0/5   ❌ Prettier未強制
  ├─ ローカル品質    :  0/10  ❌ Git hooks未実装
  ├─ 依存管理       :  0/5   ❌ Dependabotなし
  └─ セキュリティ    :  0/5   ❌ npm audit未実装
  合計: 56/100

テンプレート:
  ├─ Lint           : 15/15  ✅ 有効（ハードコード検出含む）
  ├─ 型チェック      : 15/15  ✅ 有効
  ├─ 単体テスト      :  0/15  ❌ テストファイル0個、--passWithNoTestsで素通り
  ├─ i18nチェック    : 10/10  ✅ 有効
  ├─ 設定チェック    : 10/10  ✅ 有効
  ├─ E2Eテスト      :  2/10  ⚠️ smoke.ymlあるがCIに未統合
  ├─ フォーマット    :  0/5   ❌ Prettier未強制
  ├─ ローカル品質    :  0/10  ❌ .githooksディレクトリ欠落
  ├─ 依存管理       :  0/5   ❌ Dependabotなし
  └─ セキュリティ    :  0/5   ❌ npm audit未実装
  合計: 52/100
```

### 専門家チームの議論

**QAエンジニア**: 「CIスコア52-56/100は"体裁は整っているが実質半分しか機能していない"状態。特にテストが実質オプションなのは致命的。テンプレートを使って新アプリを作ったら、テストを書かないまま本番リリースできてしまう。」

**セキュリティエンジニア**: 「npm auditがCIにないのは見過ごせない。依存パッケージに既知の脆弱性があっても検出されない。ソロ開発だからこそ、自動検出が重要。チームなら誰かが気づくかもしれないが、一人では気づけない。」

**DevOpsエンジニア**: 「Dependabotがないと、依存パッケージが静かに古くなる。半年後に気づいたらメジャーバージョンが3つも上がっていて、アップグレードが大仕事になる。週次で小さなPRが来る方がはるかに楽。」

**ソロ開発者本人視点**: 「CIが通っているから大丈夫と思っていたが、実はテストが素通りだったとは…。品質を守る仕組みのはずが、見せかけになっていた。これはテンプレートで直したい。」

---

## 6. 品質ゲート強化計画

### 目標: CIスコアを52点 → 90点以上に

#### 6-1. Husky + lint-staged の導入

##### 何をするの？（小中学生向け）

> gitで「コミット」（= 変更を記録）する前に、自動で「書き方チェック」と「見た目整え」を実行する仕組み。
> もしチェックに引っかかったら、コミットが止まる。
> これにより「汚いコード」がリポジトリに入ることを防げる。

##### 必要なパッケージと役割

```
husky (devDependency)
  → Git hooksを簡単に設定・管理するツール
  → 「コミット前」「プッシュ前」に自動でスクリプトを実行してくれる
  → npm/pnpm installすると自動でhooksが設定される（prepareスクリプト経由）

lint-staged (devDependency)
  → 「これからコミットするファイルだけ」にlintやformatを実行するツール
  → 全ファイルをチェックするより高速（変更したファイルだけ見る）
  → ESLintやPrettierと組み合わせて使う
```

##### 設定ファイルの構成

```
.husky/
  pre-commit       ← コミット前に実行されるスクリプト（lint-stagedを呼ぶ）

.lintstagedrc.js   ← lint-stagedの設定（どのファイルに何を実行するか）
```

##### .lintstagedrc.js の内容と意味

```javascript
module.exports = {
  // *.ts, *.tsx ファイルが変更されたら
  '*.{ts,tsx}': [
    'eslint --fix',    // ESLintで自動修正可能な問題を修正
    'prettier --write', // Prettierでフォーマットを整える
  ],
  // *.json ファイルが変更されたら
  '*.json': [
    'prettier --write', // JSONもフォーマットを整える
  ],
  // *.md ファイルが変更されたら
  '*.md': [
    'prettier --write', // Markdownもフォーマットを整える
  ],
};
```

##### 動作の流れ

```
開発者が git commit を実行
  │
  ├─ .husky/pre-commit が自動起動
  │    └─ npx lint-staged を実行
  │         │
  │         ├─ 変更された .ts/.tsx ファイルを検出
  │         ├─ eslint --fix で自動修正
  │         ├─ prettier --write でフォーマット
  │         │
  │         ├─ 全て成功 → コミット続行 ✅
  │         └─ ESLintエラーあり → コミット中断 ❌
  │              └─ 「ここにエラーがあります」と表示
  │
  └─ コミット完了 or 中断
```

#### 6-2. Prettier の強制

##### 現状の問題

Prettierはインストールされているが、`pnpm verify` にも CI にもフォーマットチェックが含まれていない。
つまり、フォーマットがバラバラでも誰も気づかない。

##### 追加すべきもの

```json
// package.json scripts に追加
{
  "format:check": "prettier --check .",
  "format:fix": "prettier --write .",
  "verify": "pnpm lint && pnpm type-check && pnpm format:check && pnpm test && pnpm i18n:check && pnpm config:check"
}
```

各コマンドの意味:
```bash
prettier --check .
# prettier  : コードフォーマッター（コードの見た目を統一するツール）
# --check   : フォーマットが正しいかチェックする（修正はしない）
# .         : 現在のフォルダ以下の全ファイルを対象にする
# → フォーマットが崩れているファイルがあればエラー（exit code 1）

prettier --write .
# --write   : フォーマットが崩れているファイルを自動修正する
# → 開発者が手元で実行して、フォーマットを整える時に使う
```

##### .prettierrc の作成

現在、Prettierの設定ファイルがないためデフォルト動作。明示的に設定ファイルを作ることを推奨:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

各設定の意味:
```
semi: true          → 行末にセミコロン(;)をつける
singleQuote: true   → 文字列はシングルクォート(')を使う（ダブルクォートでなく）
trailingComma: "es5" → 配列やオブジェクトの最後の要素にもカンマをつける
tabWidth: 2         → インデント（字下げ）はスペース2個分
printWidth: 100     → 1行は最大100文字（超えたら自動改行）
```

#### 6-3. Dependabot の設定

##### 何をするの？（小中学生向け）

> アプリが使っている「部品（ライブラリ）」に新しいバージョンが出たら、
> GitHubのロボット（Dependabot）が自動で「この部品を新しくしませんか？」という
> PR（変更提案）を作ってくれる。
> セキュリティの問題がある古い部品を使い続けるリスクを防げる。

##### 設定ファイル

```yaml
# .github/dependabot.yml

version: 2

# ↑ Dependabot設定ファイルのバージョン（これは2で固定）

updates:
  # npm パッケージの自動更新
  - package-ecosystem: "npm"
    # ↑ 「npmパッケージを監視して」という指定
    directory: "/"
    # ↑ package.jsonがあるフォルダ（ルート）
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    # ↑ 毎週月曜の朝9時（日本時間）にチェック
    open-pull-requests-limit: 10
    # ↑ 同時に開くPRは最大10個まで（多すぎると管理しきれない）
    labels:
      - "dependencies"
    # ↑ 自動作成されるPRに「dependencies」ラベルをつける
    commit-message:
      prefix: "chore(deps):"
    # ↑ コミットメッセージの先頭に「chore(deps):」をつける
    groups:
      expo:
        patterns:
          - "expo*"
          - "@expo/*"
        # ↑ Expo関連のパッケージをまとめて1つのPRにする
      react:
        patterns:
          - "react"
          - "react-native"
          - "react-dom"
        # ↑ React関連もまとめて1つのPRにする
      tamagui:
        patterns:
          - "tamagui"
          - "@tamagui/*"
        # ↑ Tamagui関連もまとめて1つのPRにする

  # GitHub Actions の自動更新
  - package-ecosystem: "github-actions"
    # ↑ CI/CDワークフローで使っているActionも監視する
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    labels:
      - "ci"
```

#### 6-4. テストの実効性確保

##### 現状の問題

```json
"test": "jest --passWithNoTests"
```

`--passWithNoTests` = テストファイルが0個でもエラーにならない → テストを書かなくてもCIが通る

##### 対策: 2段階アプローチ

**Phase 1（テンプレート移植時）**: サンプルテストを2-3個含める

テンプレートに最初から含めるサンプルテスト:
- `__tests__/i18n.test.ts` — 全19言語のキー完全性テスト
- `__tests__/config.test.ts` — app.config.tsの値検証テスト

これらは**どのアプリでも変更不要で動く汎用テスト**。
テストファイルが存在するので `--passWithNoTests` でも実際にテストが実行される。

**Phase 2（テンプレートからアプリ作成後）**: `--passWithNoTests`を削除

新アプリで独自のテストを書き始めたら、`--passWithNoTests`フラグを外す。
これにより、テストファイルが見つからない場合はエラーになる。

##### カバレッジ閾値

現在のテンプレート設定:
```json
"coverageThreshold": { "global": { "statements": 20 } }
```

20%は低すぎるが、テンプレート段階では妥当。理由: アプリ固有のコードはまだない。
アプリ開発が進んだら段階的に引き上げる:
- 初期: 20%（テンプレートデフォルト）
- MVP: 40%
- 本番リリース: 60%

#### 6-5. npm audit の CI 統合

##### 何をするの？（小中学生向け）

> 使っている部品（ライブラリ）に「セキュリティの穴（脆弱性）」がないかチェックする。
> 例えば「このバージョンには情報漏洩の危険がある」とわかっている部品を使っていたら教えてくれる。

##### ci.yml への追加

```yaml
- name: Security audit
  run: pnpm audit --audit-level=high
  # pnpm audit     : インストール済みパッケージのセキュリティチェック
  # --audit-level=high : 「高」以上の深刻度の脆弱性があればエラー
  # → low/moderate はワーニングのみ、high/critical でCIを止める
```

#### 6-6. 強化後のCIスコア予測

```
テンプレート（強化後）:
  ├─ Lint           : 15/15  ✅ 有効（変更なし）
  ├─ 型チェック      : 15/15  ✅ 有効（変更なし）
  ├─ 単体テスト      : 12/15  ✅ サンプルテスト含む + カバレッジ閾値
  ├─ i18nチェック    : 10/10  ✅ 有効（変更なし）
  ├─ 設定チェック    : 10/10  ✅ 有効（変更なし）
  ├─ E2Eテスト      :  5/10  ✅ smoke.ymlをCIに統合（PR時は任意、daily必須）
  ├─ フォーマット    :  5/5   ✅ Prettier強制（verify + CI）
  ├─ ローカル品質    :  8/10  ✅ Husky + lint-staged
  ├─ 依存管理       :  5/5   ✅ Dependabot導入
  └─ セキュリティ    :  4/5   ✅ npm audit (high+)
  合計: 89/100（52点→89点）
```

残り11点の内訳:
- 単体テスト -3: サンプルのみ。アプリ固有のテストは開発者が書く必要あり
- E2E -5: PRごとのE2E実行はコスト（実行時間15分+）が高い。daily実行は確保
- ローカル品質 -2: pre-pushフックは未設定（過剰な制約を避ける）
- セキュリティ -1: SAST（静的アプリケーションセキュリティテスト）は未導入

---

## 7. 技術スタック更新 ─ バージョンアップ分析

### 決定事項（v1で合意済み）

| パッケージ | 現在 | ターゲット | 実行フェーズ |
|---|---|---|---|
| Expo SDK | 54 | **55** | Phase 2 |
| React Native | 0.81.5 | **0.83.2** | Phase 2 |
| React | 19.1.0 | **19.2.0** | Phase 2 |
| Expo Router | ~6.0.x | **~55.0.8 (v7)** | Phase 2 |
| Tamagui | 1.138.5 | **1.144.3** | Phase 1 |
| async-storage | ^2.2.0 | **据え置き** | - |
| Node.js | 20 | **22 LTS** | Phase 2 |
| TypeScript | ~5.9.2 | **据え置き** | - |
| Zustand | ^5.0.8 | **据え置き** | - |
| React Query | ^5.90.10 | **据え置き** | - |

### SDK 55 アップグレード時の波及影響マップ

```
SDK 55 アップグレード
  │
  ├─ package.json
  │    ├─ expo: ~54.0.x → ~55.0.9
  │    ├─ react: 19.1.0 → 19.2.0
  │    ├─ react-native: 0.81.5 → 0.83.2
  │    ├─ expo-router: ~6.0.x → ~55.0.8
  │    └─ 全expo-*パッケージのバージョン更新（SDK同期）
  │
  ├─ .nvmrc
  │    └─ 20 → 22
  │
  ├─ package.json engines
  │    └─ >=20.0.0 → >=20.19.4
  │
  ├─ eas.json
  │    ├─ cli.version: >= 18.0.0（確認）
  │    └─ build.base.node: 22（更新）
  │
  ├─ .github/workflows/*.yml
  │    └─ node-version: '20' → '22'（全ワークフロー）
  │
  ├─ app.json
  │    ├─ android.edgeToEdgeEnabled: true（SDK 55で必須化確認）
  │    └─ newArchEnabled: true（既に設定済み、SDK 55では設定自体不要に）
  │
  ├─ app/(tabs)/_layout.tsx
  │    └─ resetOnFocus リネーム確認（Expo Router v7の破壊的変更）
  │
  ├─ babel.config.js
  │    └─ 変更なし（@tamagui/babel-plugin + reanimated/plugin は互換）
  │
  ├─ tamagui.config.ts
  │    └─ 変更なし（v1.144.3はSDK 55互換）
  │
  └─ tsconfig.json
       └─ 変更なし
```

### アップグレード手順（詳細）

```bash
# Step 1: Expoのアップグレードコマンドを実行
npx expo install --fix
# npx     : package.jsonに入っていないコマンドも一時的にダウンロードして実行
# expo install : Expo互換のバージョンを自動解決してインストール
# --fix   : バージョン不整合を自動修正する

# Step 2: 互換性の自動チェック
npx expo-doctor
# expo-doctor : インストール済みパッケージのExpo互換性を診断
# → 問題があれば「このパッケージはSDK 55と互換性がない」等を表示

# Step 3: 全品質チェック
pnpm verify
# lint + type-check + format:check + test + i18n:check + config:check
# → 全て通ればアップグレード成功

# Step 4: ビルドテスト
pnpm prebuild --clean
# prebuild : Expoの設定からネイティブコード（android/, ios/）を生成
# --clean  : 古いネイティブコードを削除してから生成（クリーンビルド）
```

---

## 8. ドキュメントのテンプレート化設計

### 設計方針（v1で合意済み + 補足）

ドキュメントのプレースホルダーは**2種類**に分類:

| 種類 | 記法 | setup.shで自動置換 | 例 |
|---|---|---|---|
| **自動置換** | `{{APP_NAME}}` | ✅ される | アプリ名、パッケージ名、スキーム |
| **手動記入** | `<!-- TODO: ここに記入 -->` | ❌ されない | 機能一覧、ターゲットユーザー、KPI |

### プレースホルダー一覧（自動置換）

| プレースホルダー | 説明 | .env.exampleの対応変数 |
|---|---|---|
| `{{APP_NAME}}` | アプリ表示名 | APP_NAME |
| `{{APP_SLUG}}` | URLセーフな識別子 | APP_SLUG |
| `{{ANDROID_PACKAGE}}` | Androidパッケージ名 | ANDROID_PACKAGE |
| `{{IOS_BUNDLE_IDENTIFIER}}` | iOSバンドルID | IOS_BUNDLE_IDENTIFIER |
| `{{APP_SCHEME}}` | ディープリンクスキーム | （APP_SLUGと同値が多い） |
| `{{DESCRIPTION}}` | アプリの一行説明 | （.envには含めない） |
| `{{EAS_PROJECT_ID}}` | EASプロジェクトID | EAS_PROJECT_ID |

### ファイル別テンプレート化方針

| ファイル | 方針 |
|---|---|
| docs/README.md | そのまま（変更不要） |
| docs/adr/README.md | そのまま（変更不要） |
| docs/adr/adr_template.md | そのまま（変更不要） |
| docs/adr/ADR-0001-initial-decisions.md | テンプレート版の初期決定として書き直し |
| docs/reference/basic_spec.md | 自動置換（APP_NAME） + 手動記入（機能一覧等） |
| docs/reference/functional_spec.md | 自動置換（APP_NAME） + 手動記入（画面フロー等） |
| docs/reference/constraints.md | 自動置換 + 手動記入（制約条件等） |
| docs/reference/glossary.md | スケルトン（用語例を2-3個残す） |
| docs/explanation/product_strategy.md | 自動置換 + 手動記入（価値提案、KPI等） |
| docs/how-to/git_workflow.md | そのまま（変更不要） |
| docs/how-to/testing.md | そのまま（変更不要） |
| docs/how-to/quickstart.md | 自動置換（APP_NAME, パッケージ名） |
| docs/how-to/development/*.md | 自動置換 + 汎用化 |
| docs/how-to/workflow/*.md | 自動置換 + 汎用化 |

---

## 9. ストアスクリーンショット生成パイプラインのテンプレート化

### なぜスクリーンショット生成をテンプレートに含めるのか

> 全アプリでGoogle Play / App Storeに提出するスクリーンショットが必要。
> 19言語 x 4画面 x 2ストア = 152枚の画像を手作業で作るのは非現実的。
> Repologで構築した自動生成パイプラインは、設定ファイルを変えるだけで
> どのアプリでも使える汎用的な仕組み。

### パイプラインの仕組み（小中学生向け）

```
Phase 1: 撮影（Maestro）
  スマホのアプリを自動操作して、画面のスクリーンショットを撮る

Phase 2: 加工（Playwright + HTML）
  撮った画像を「ストア用のデザイン」に合成する
  → 白い背景 + マーケティング文章 + アプリ画面のスクリーンショット
  → ブラウザ（Playwright）がHTMLをレンダリングして画像化

Phase 3: 仕上げ（Sharp）
  → ステータスバー（時計やバッテリー表示）を切り取る
  → アルファチャンネル（透明度）を除去（ストア要件）
  → sRGBカラープロファイルを埋め込む
  → 最終サイズ確認（Apple: 1320x2868, Google: 1080x1920）
```

### テンプレートでのディレクトリ構成

```
scripts/store-screenshots/
  ├─ lib/                          # 汎用層（アプリ間で共通）
  │    ├─ config.ts                # ストアサイズ定数
  │    │    Apple: 1320 x 2868 px
  │    │    Google: 1080 x 1920 px
  │    │    Feature Graphic: 1024 x 500 px
  │    ├─ template.html            # HTMLテンプレート（vh/vw レスポンシブ）
  │    ├─ renderer.ts              # Playwright レンダリング関数
  │    ├─ fonts.ts                 # Noto Sans フォントローダー
  │    └─ postprocess.ts           # Sharp 後処理パイプライン
  │
  ├─ screenshot-config.ts.template # アプリ固有設定のテンプレート
  │    ├─ appName, persona, targetUser
  │    ├─ screens[] （画面ごとの設定）
  │    ├─ locales[] （対応言語）
  │    └─ textGuidelines （テキスト生成ガイドライン）
  │
  ├─ generate.ts                   # CLIエントリポイント
  └─ README.md                     # 使い方ガイド
```

### ストア要件一覧（テンプレートに記載すべき）

| 項目 | Google Play | Apple App Store |
|---|---|---|
| **スクリーンショットサイズ（必須）** | 1080 x 1920 px（推奨） | 1320 x 2868 px（iPhone 6.9"） |
| **枚数** | 2〜8枚/言語 | 最大10枚/言語 |
| **形式** | JPEG or PNG（アルファなし） | PNG or JPEG（アルファなし） |
| **最大ファイルサイズ** | 8MB/枚 | 制限なし（実用上10MB以下推奨） |
| **Feature Graphic（必須）** | 1024 x 500 px | なし |
| **タブレット** | 任意（1600x2560推奨） | iPadアプリなら必須 |
| **対応ロケール数** | 77 | 40+ |

### 2026年のスクリーンショットトレンド

- **フレームレスデザインが主流**: デバイスの枠（ベゼル）を表示しないデザインが増加
- **最初の3枚が勝負**: ユーザーの91%は最初の3枚しか見ない
- **推奨構成**: 1枚目=価値提案、2枚目=使い方、3枚目=信頼性
- **Apple AI タグ（WWDC 2025）**: スクリーンショット内のテキストをAIが読み取り、検索タグを自動生成。ASO（検索最適化）に直結

---

## 10. デバッグツールキットのテンプレート化

### なぜデバッグツールキットをテンプレートに含めるのか

> バグ修正は全アプリで発生する作業。
> 「ログの取り方」「スクリーンショットの撮り方」「メモリの確認方法」は
> アプリが違っても同じ手順。
> テンプレートに含めれば、新しいアプリでも初日からデバッグ環境が整う。

### テンプレートでのディレクトリ構成

```
scripts/debug/
  ├─ debug.config.sh              # アプリ固有設定（唯一の変更点）
  │    ├─ APP_NAME（app.jsonから自動検出も可能）
  │    ├─ PACKAGE（Androidパッケージ名）
  │    ├─ SESSION_PREFIX（セッションファイル名のプレフィックス）
  │    └─ FALSE_POSITIVE_PATTERN（無視するログパターン）
  │
  ├─ debug_session.sh             # セッション管理（start / stop / status）
  │    ├─ start: ログ取得開始、スクリーンショット撮影
  │    ├─ stop: ログ保存、録画停止、メモリ情報取得、サマリー生成
  │    └─ status: 現在のセッション状態を表示
  │
  ├─ monitor.sh                   # リアルタイムログ監視
  │    ├─ PID自動追跡（10秒ごとに再チェック）
  │    ├─ エラーキーワード検出（FATAL, ANR, OOM等）
  │    └─ 誤検知パターン除外（システムログの無害なエラー）
  │
  └─ debug_common.sh              # 共通ヘルパー関数
       ├─ ADB接続チェック（WSL2対応: env -u ADB_SERVER_SOCKET）
       ├─ スクリーンショット撮影
       ├─ 画面録画の開始/停止
       ├─ メモリ情報取得（dumpsys meminfo）
       └─ カラー出力ヘルパー
```

### debug.config.sh の自動検出機能

```bash
# app.json から自動でパッケージ名を取得する仕組み
# 手動で書き換える必要がなくなる

if [ -z "${PACKAGE:-}" ]; then
  # node -e : Node.jsで1行のJavaScriptを実行
  # require('./app.json') : app.jsonファイルを読み込む
  # .expo.android.package : Androidパッケージ名を取得
  PACKAGE=$(node -e "console.log(require('$PROJECT_ROOT/app.json').expo?.android?.package || '')")
fi

if [ -z "${APP_NAME:-}" ]; then
  APP_NAME=$(node -e "console.log(require('$PROJECT_ROOT/app.json').expo?.slug || 'app')")
fi
```

### 各ADBコマンドの意味（初心者向け）

```bash
# ADB = Android Debug Bridge
# パソコンとAndroidスマホを繋いで、コマンドでスマホを操作するツール

env -u ADB_SERVER_SOCKET adb devices
# env -u ADB_SERVER_SOCKET : 環境変数ADB_SERVER_SOCKETを一時的に解除する
#   → WSL2環境でADBが正しく動くための回避策
# adb devices : 接続されているAndroid端末の一覧を表示

adb logcat -c
# logcat : Androidのログ（動作記録）を表示するコマンド
# -c     : ログバッファを消去（新しいログだけ見たい時に使う）

adb logcat --pid=$(adb shell pidof -s $PACKAGE) -v threadtime
# --pid=... : 指定したプロセスID（アプリ）のログだけ表示
# pidof -s  : パッケージ名からプロセスIDを取得
# -v threadtime : タイムスタンプとスレッドIDを含む形式で表示

adb shell dumpsys meminfo $PACKAGE
# shell    : スマホ上でコマンドを実行
# dumpsys  : Androidシステムの内部情報を表示
# meminfo  : メモリ使用量の詳細

adb exec-out screencap -p > screenshot.png
# exec-out : コマンドの出力をそのままパソコンに転送（バイナリ対応）
# screencap : スクリーンショットを撮影
# -p       : PNG形式で出力
# > file   : ファイルに保存

adb shell screenrecord --time-limit 180 /sdcard/recording.mp4
# screenrecord : 画面録画を開始
# --time-limit 180 : 最大180秒（3分）で自動停止
# /sdcard/... : スマホ内の保存先パス
```

### デバッグツール最新動向（テンプレートのドキュメントに記載すべき）

| ツール | 用途 | ステータス（2026年） |
|---|---|---|
| React Native DevTools | 標準デバッガー（コンソール、ブレークポイント、メモリ、ネットワーク） | ✅ RN 0.76+で標準。Flipperを置き換え |
| Flipper | 旧デバッガー | ⚠️ RN向けは非推奨。v0.239.0が最終版 |
| Reactotron | 状態管理・API監視・パフォーマンス | ✅ v5.1.18。Infinite Redがメンテ |
| Expo DevTools Plugins | ライブラリ固有のデバッグUI | ✅ TanStack Query, AsyncStorage等に対応 |
| Flashlight | モバイルLighthouse（FPS、CPU、RAM） | ✅ BAM社がメンテ。CI統合可能 |
| Expo Atlas | バンドルサイズ分析 | ✅ SDK 53+。`EXPO_ATLAS=1`で有効化 |
| Sentry | クラッシュ監視・パフォーマンス監視 | ✅ `@sentry/react-native`がExpo公式対応 |

---

## 11. ストアリスティング制作How-To

### なぜこのガイドをテンプレートに含めるのか

> Google PlayやApp Storeにアプリを公開するとき、「タイトル」「説明文」「キーワード」を
> 各言語で用意する必要がある。
> 「何を書けばいいか」「どう書けば検索で見つかるか」はアプリが違っても基本は同じ。
> このガイドをテンプレートに入れておけば、毎回調べ直す必要がない。

### ストアリスティング制作7ステップ

#### Step 1: ペルソナ（想定ユーザー）を定義する

> 「誰がこのアプリを使うのか？」を具体的に書き出す。
> 名前、年齢、職業、どんな場面で使うか、普段どんな言葉を使うか。
> これが全ての文章の土台になる。

#### Step 2: 画面ごとに「ユーザーが得る価値」を1つ決める

> スクリーンショット4枚なら、4つの価値を決める。
> 「機能の説明」ではなく「ユーザーにとっての良いこと」を書く。
> ✗ 「PDFエクスポート機能」（機能の説明）
> ✓ 「ワンタップで報告書をPDFに」（ユーザーの体験）

#### Step 3: 各言語で独立して文章を作る

> 英語から翻訳するのではなく、各言語でネイティブが自然に感じる表現を使う。
> 翻訳ツールの出力をそのまま使うと、不自然な文章になりダウンロード率が下がる。
> 理想は各言語のネイティブスピーカーにレビューしてもらうこと。

#### Step 4: ASO（検索最適化）キーワードを埋め込む

> ユーザーがストアで検索するとき、どんな言葉を打つか？
> その言葉をタイトル・サブタイトル・説明文に自然に入れる。

| 場所 | Google Play | Apple App Store |
|---|---|---|
| タイトル | 最大50文字。キーワードを含める | 最大30文字。キーワードを含める |
| サブタイトル/短い説明 | 最大80文字。検索対象 | 最大30文字。検索対象 |
| 説明文 | **検索対象**（キーワードを含める） | **検索対象外**（人間向けに書く） |
| キーワードフィールド | なし | 最大100文字（非公開、カンマ区切り） |

**重要な違い**: Google Playは説明文を検索インデックスに使う。Apple App Storeは使わない。
つまりGoogle Play向けは「キーワードを自然に含んだ説明文」、Apple向けは「純粋に人間が読む説明文」を書く。

#### Step 5: 文字数制限を守る

| 言語種別 | 1行の目安 | 理由 |
|---|---|---|
| CJK（日本語、中国語、韓国語） | 15〜18文字 | 文字幅が広い |
| ラテン文字（英語、フランス語等） | 35〜45文字 | 文字幅が狭い |

検索結果のサムネイルでは文字が非常に小さく表示される。長すぎると読めない。

#### Step 6: 最初の3枚に全力を注ぐ

> ストアの検索結果では、最初の3枚（〜4枚）のスクリーンショットしか表示されない。
> ユーザーの91%はスクロールしない。
> 推奨構成: 1枚目=価値提案 / 2枚目=メイン機能 / 3枚目=信頼性・実績

#### Step 7: A/Bテストで改善する

> Google Play: 「カスタムストアリスティング」でA/Bテスト可能
> Apple: 「製品ページの最適化」でA/Bテスト可能
> → 2パターンの説明文やスクリーンショットを用意して、どちらがダウンロード率が高いか実験

### テンプレートに含めるディレクトリ構造

```
docs/store-listing/
  ├─ README.md                   # このガイド（上記7ステップ）
  ├─ android/
  │    ├─ en-US/
  │    │    ├─ title.txt          # 最大50文字
  │    │    ├─ short-description.txt  # 最大80文字
  │    │    └─ full-description.txt   # 最大4000文字
  │    ├─ ja-JP/
  │    │    └─ ...（同構造）
  │    └─ {19言語分のフォルダ}
  ├─ ios/
  │    ├─ en-US/
  │    │    ├─ name.txt           # 最大30文字
  │    │    ├─ subtitle.txt       # 最大30文字
  │    │    ├─ description.txt
  │    │    ├─ keywords.txt       # 最大100文字（カンマ区切り）
  │    │    └─ promotional_text.txt  # 最大170文字
  │    ├─ ja/
  │    │    └─ ...（同構造）
  │    └─ {言語分のフォルダ}
  └─ screenshots/
       └─ .gitkeep               # 生成画像は.gitignoreで除外
```

各テキストファイルにはプレースホルダーコメントを入れる:
```
<!-- TODO: {{APP_NAME}} のタイトルを記入（最大50文字、ASO キーワードを含める） -->
```

---

## 12. 推奨アクションプラン（修正版）

### Phase 1: テンプレートへのノウハウ移植（SDK 54のまま）

| # | 作業 | カテゴリ | 補足 |
|---|---|---|---|
| 1-1 | ディレクトリ構造追加 | コード | src/db/, src/features/example/, src/stores/, plugins/, __tests__/ |
| 1-2 | CI/CDワークフロー移植・新規 | CI | maestro-smoke.yml移植 + dependabot.yml新規 |
| 1-3 | 品質ゲート強化 | CI | Husky + lint-staged + Prettier強制 + npm audit |
| 1-4 | スクリプト移植 | 自動化 | ump-consent-check, dev-start汎用化 |
| 1-5 | デバッグツールキット移植 | 自動化 | debug_session.sh + monitor.sh + debug.config.sh 汎用化 |
| 1-6 | スクリーンショットパイプライン移植 | 自動化 | lib/汎用層 + screenshot-config.ts.template |
| 1-7 | ポーランド語(pl)追加 | i18n | 18→19言語統一 |
| 1-8 | ドキュメントテンプレート化 | ドキュメント | プレースホルダー挿入 + 手動記入TODO |
| 1-9 | ストアリスティング構造 + How-To | ドキュメント | 19言語フォルダ + 制作ガイド |
| 1-10 | デバッグガイド新規作成 | ドキュメント | docs/how-to/debug-guide.md |
| 1-11 | スクリーンショット生成ガイド新規作成 | ドキュメント | docs/how-to/screenshot-generation.md |
| 1-12 | app.json experiments追加 | 設定 | typedRoutes + reactCompiler |
| 1-13 | eas.json 拡充 | 設定 | 4ビルドプロファイル + iOS submitプレースホルダー |
| 1-14 | Tamagui更新 | 依存 | 1.138.5 → 1.144.3 |
| 1-15 | 依存パッケージ追加 | 依存 | flash-list, webview, playwright, sharp, husky, lint-staged |
| 1-16 | サンプルテスト追加 | テスト | __tests__/i18n.test.ts + __tests__/config.test.ts |
| 1-17 | plugins/ 移植 | コード | withLargeHeap + withFragmentFactory |
| 1-18 | setup.sh 作成 | 自動化 | プレースホルダー置換 + 検証 + 次のステップ表示 |
| 1-19 | TEMPLATE_README.md 作成 | ドキュメント | テンプレート自体の使い方ガイド |
| 1-20 | .prettierrc 作成 | 設定 | 明示的なPrettier設定 |
| 1-21 | .editorconfig 作成 | 設定 | IDE間のフォーマット統一 |
| 1-22 | verify + CIスクリプト更新 | CI | format:check追加 + npm audit追加 |

### Phase 2: SDK 55 アップグレード

| # | 作業 | 補足 |
|---|---|---|
| 2-1 | `npx expo install --fix` | SDK 55への自動アップグレード |
| 2-2 | `npx expo-doctor` | 互換性診断 |
| 2-3 | package.json更新確認 | expo, react, react-native, expo-router |
| 2-4 | Expo Router v7対応 | resetOnFocus等の破壊的変更確認 |
| 2-5 | Node.js 22 更新 | .nvmrc + engines + eas.json + CI |
| 2-6 | edge-to-edge確認 | Android設定 |
| 2-7 | expo-file-system確認 | 新APIを使用していることを確認 |
| 2-8 | `pnpm verify` 通過確認 | 全品質チェック |

### Phase 3: 検証

| # | 作業 | 合格基準 |
|---|---|---|
| 3-1 | setup.sh でテストアプリ作成 | 全プレースホルダーが置換され、残存がゼロ |
| 3-2 | `pnpm install` 成功 | エラーなし |
| 3-3 | `pnpm verify` 通過 | lint + type-check + format + test + i18n + config 全パス |
| 3-4 | Android ビルド | `pnpm prebuild && cd android && ./gradlew assembleRelease` 成功 |
| 3-5 | CI動作確認 | テストPR作成 → ci.yml パス |
| 3-6 | Maestro E2E確認 | smoke.yml 通過 |
| 3-7 | Dependabot確認 | 初回スキャン実行、PRが生成される |
| 3-8 | Git hooks確認 | コミット時にlint-stagedが動く |
| 3-9 | ドキュメント整合性 | Repolog固有情報の残存がゼロ |
| 3-10 | スクリーンショットパイプライン確認 | generate.tsの実行がエラーなし（テストアプリの画面で） |

---

## 付録: 決定事項一覧

| # | 決定事項 | 選択 | 根拠 |
|---|---|---|---|
| D-01 | テンプレート方式 | GitHub Template + setup.sh | シンプル、追加ツール不要、ソロ開発に最適 |
| D-02 | SDK | 55（Phase 2で実施） | テンプレートは最新で始めるべき |
| D-03 | Tamagui | v1 (1.144.3) | v2はRC、安定版を待つ |
| D-04 | async-storage | v2 据え置き | v3は破壊的変更多、メリット少 |
| D-05 | Node.js | 22 LTS | SDK 55推奨 |
| D-06 | UIフレームワーク変更 | 見送り（Tamagui維持） | 既存デザインシステム再構築コスト |
| D-07 | ORM導入 | 見送り（ドキュメントのみ） | テンプレートの軽量性維持 |
| D-08 | Linter変更 | 見送り（ESLint+Prettier維持） | Expo公式サポート |
| D-09 | CI/CD | GitHub Actions維持 | 無料、汎用 |
| D-10 | Husky + lint-staged | 採用 | コミット時品質チェック |
| D-11 | Dependabot | 採用 | 依存管理自動化 |
| D-12 | Prettier強制 | 採用 | フォーマット一貫性 |
| D-13 | npm audit | 採用 | セキュリティチェック |
| D-14 | playwright + sharp | 移植する | 全アプリでスクリーンショット必須 |
| D-15 | デバッグツールキット | 移植する（汎用化） | 全アプリでデバッグ必須 |
| D-16 | ストアリスティングHow-To | 新規作成 | 全アプリでストア公開必須 |
| D-17 | サンプルテスト | 追加 | CIのテストステップを実効化 |
| D-18 | 実行順序 | Phase 1→2→3 | 問題切り分けのため段階実行 |
