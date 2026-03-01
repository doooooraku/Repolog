# Repolog Documentation Index

> **docs-as-code**: ドキュメントは Git で管理し、PR + CI で品質を担保する。

---

## ファイルマップ

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
│   ├── wireframes.md              画面設計ワイヤーフレーム
│   └── UI_Figma/                  Figma 連携・画面ノード台帳
│
├── adr/                      ── なぜそうしたか（意思決定ログ）
│   ├── ADR-0001  初期アーキテクチャ
│   ├── ADR-0002  PDFフォント選定
│   ├── ADR-0003  AdMob バナー配置
│   ├── ADR-0004  バックアップ ZIP 形式
│   ├── ADR-0005  19言語セット選定
│   ├── ADR-0006  AsyncStorage/SecureStore 使い分け
│   ├── ADR-0007  バックアップ Import 追記戦略
│   └── ADR-0008  AdMob UMP 同意プリフライト
│
├── how-to/                   ── 手順・レシピ
│   ├── development/               ビルド・実機・コーディング
│   │   ├── android_build.md
│   │   ├── android_debug.md
│   │   ├── android_device.md
│   │   ├── ios_build.md
│   │   └── coding_rules.md
│   ├── workflow/                  開発〜リリースの流れ
│   │   ├── whole_workflow.md      Issue→PR→CI→Release 全体像
│   │   ├── git_workflow.md        ブランチ/コミット規約
│   │   ├── release_notes_template.md
│   │   ├── backup_restore.md      バックアップ運用と障害対応
│   │   └── figma_mcp_prompt.md
│   ├── testing/                   テスト・ベンチマーク
│   │   ├── testing.md             テスト戦略と実行手順
│   │   ├── pdf_font_benchmark.md  フォント性能計測
│   │   └── benchmarks/            計測結果 (JSON/MD)
│   ├── i18n/                      多言語
│   │   ├── i18n_key_inventory.md
│   │   └── i18n_pl_fallback_audit.md
│   └── archive/                   完了済み / 一時的
│       ├── legal_pages_github_pages.md
│       └── figma_ui_issue_pr_review.md
│
├── index.html                ── GitHub Pages: 利用規約ルーター
├── privacy/index.html        ── GitHub Pages: プライバシーポリシー
└── terms/index.html          ── GitHub Pages: 利用規約
```

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

> PRテンプレ (`.github/pull_request_template.md`) のセクション8にも同じチェックリストがあります。

---

## 安定度の目安

| レベル | ファイル | 変更頻度 |
|--------|----------|----------|
| 高（基盤） | product_strategy, basic_spec, functional_spec | 稀。ADR + テスト更新とセットで |
| 中（蓄積） | constraints, glossary, ADR | 機能追加ごとに追記 |
| 低（手順） | how-to/* | 運用が変わるたび更新 |
