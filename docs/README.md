# Repolog Documentation Index

> **docs-as-code**: ドキュメントは Git で管理し、PR + CI で品質を担保する。
>
> **棚卸ベースライン (2026-03-31)**: 60 ファイル / 約 11,700 行

---

## ファイルマップ

### 🔰 初めての方の読む順番

1. `how-to/quickstart.md` → 2. `how-to/development/coding_rules.md` → 3. `how-to/workflow/git_workflow.md` → 4. `reference/basic_spec.md`

```
docs/
├── README.md                 ← このファイル（ナビゲーション）
│
├── explanation/              ── なぜ / 価値 / 境界
│   └── product_strategy.md        プロダクト戦略（地図）
│
├── reference/                ── 変わりにくい事実
│   ├── basic_spec.md              基本仕様（何をするか）
│   ├── functional_spec.md         機能仕様（どう動くか）
│   ├── constraints.md             前提/制約/非ゴール
│   ├── glossary.md                用語辞書
│   ├── pdf_template.md            PDF HTML/CSS テンプレ（SSoT）
│   ├── screen_node_ledger.md      Figma 画面ノード台帳
│   └── lessons.md                 開発教訓ログ
│
├── adr/                      ── なぜそうしたか（意思決定ログ）
│   ├── ADR-0001  初期アーキテクチャ（Superseded）
│   ├── ADR-0002  PDFフォント選定
│   ├── ADR-0003  AdMob バナー配置
│   ├── ADR-0004  バックアップ ZIP 形式
│   ├── ADR-0005  19言語セット選定
│   ├── ADR-0006  AsyncStorage/SecureStore 使い分け
│   ├── ADR-0007  バックアップ Import 追記戦略
│   ├── ADR-0008  AdMob UMP 同意プリフライト
│   ├── ADR-0010  iOS暗号化輸出コンプライアンス
│   ├── ADR-0011  レイアウト無料開放
│   ├── ADR-0012  PDF出力成功直後にアプリ内レビュー依頼を表示
│   └── (ADR-0009 は欠番)
│
├── how-to/                   ── 手順・レシピ
│   ├── quickstart.md              セットアップ（30分で動く）
│   ├── development/               ビルド・実機・コーディング
│   │   ├── android_build.md
│   │   ├── android_debug.md
│   │   ├── android_device.md
│   │   ├── ios_build.md
│   │   ├── coding_rules.md
│   │   ├── admob_advertising_setup.md
│   │   ├── dev_vs_preview_builds.md
│   │   └── scrcpy_screen_mirror.md
│   ├── workflow/                  開発〜リリースの流れ
│   │   ├── whole_workflow.md        Issue→PR→CI→Release 全体像
│   │   ├── git_workflow.md          ブランチ/コミット規約
│   │   ├── google_play_release.md   Google Play公開フロー
│   │   ├── ios_testflight_release.md  TestFlight CI/CDセットアップ
│   │   ├── release_notes_template.md
│   │   ├── backup_restore.md        バックアップ運用と障害対応
│   │   ├── figma_mcp_prompt.md
│   │   └── store_screenshots.md     ストアスクリーンショット撮影
│   ├── testing/                   テスト・ベンチマーク
│   │   ├── testing.md             テスト戦略と実行手順
│   │   └── pdf_font_benchmark.md  フォント性能計測
│   └── archive/                   完了済み / 歴史的文書
│       ├── legal_pages_github_pages.md
│       ├── figma_ui_issue_pr_review.md
│       └── wireframes.md           テキスト版ワイヤーフレーム（Figma移行済み）
│
├── reports/                  ── 自動生成レポート（ベンチマーク結果）
│   └── benchmarks/
│       ├── pdf_font_benchmark.latest.json
│       └── pdf_font_benchmark.latest.md
│
├── store-listing/            ── ストア掲載資料
│   ├── marketing-text.md          スクリーンショット文言（19言語）
│   ├── data-safety/               Google Play データ安全性申告
│   ├── iarc-rating/               IARC コンテンツレーティング
│   └── android/                   Google Play 掲載文・スクリーンショット
│       ├── en-US/
│       ├── ja-JP/
│       ├── screenshots/
│       └── feature-graphic/
│
├── index.html                ── GitHub Pages: 法的ページルーター
├── privacy/index.html        ── GitHub Pages: プライバシーポリシー
├── support/index.html        ── GitHub Pages: サポートページ
└── terms/index.html          ── GitHub Pages: 利用規約
```

> デバッグ成果物（ログ/画像/動画）は `.debug-sessions/` に保存（gitignore 対象）。

---

## 迷ったときのドキュメント更新フロー

| 変更の種類 | 更新先 |
|-----------|--------|
| アプリの仕様が変わる | `reference/basic_spec.md` or `functional_spec.md` |
| 前提・制約が変わる | `reference/constraints.md` |
| 用語が増える/意味が変わる | `reference/glossary.md` |
| 「なぜそうしたか」が議論になる | `adr/ADR-XXXX.md` を追加 |
| 合否条件が変わる | テスト (Jest / Maestro) を追加/更新 |
| 運用手順が変わる | `how-to/` の該当ファイル |
| 障害調査の結果を残す | `reports/benchmarks/` |

> PRテンプレ (`.github/pull_request_template.md`) のセクション8にも同じチェックリストがあります。

---

## 安定度の目安

| レベル | ファイル | 変更頻度 |
|--------|----------|----------|
| 高（基盤） | product_strategy, basic_spec, functional_spec | 稀。ADR + テスト更新とセットで |
| 中（蓄積） | constraints, glossary, ADR | 機能追加ごとに追記 |
| 低（手順） | how-to/* | 運用が変わるたび更新 |
