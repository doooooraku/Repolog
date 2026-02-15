# docs/how-to/pdf_font_benchmark.md

# PDFフォント性能ベンチマーク（Issue #72 / #101）

この文書は「PDFフォント埋め込みの重さ」を、同じ条件で何度でも測るための手順書です。  
目的は、`ADR-0002` の Follow-up（最適化検討/性能計測）を再現可能にすることです。

---

## 1. 何を測るか

このベンチマークは、次の2戦略を比較します。

- `all_fonts`：
  - 現行実装と同じく、Noto Sans系7フォントを常に埋め込む
- `script_subset`：
  - テキストに含まれる文字種（ラテン/CJK/ハングル/タイ/デーヴァナーガリー）から必要フォントだけを選ぶ

測定値:
- フォントpayload（base64化後サイズ）
- 推定PDF入力サイズ（フォント + 文章 + サンプル画像分）
- 実行時間
  - `cold`（初回、読み込みあり）
  - `warm`（キャッシュ後）

## 1.1 実験フラグとの関係（Issue #101）

- アプリ実行時には `PDF_FONT_SUBSET_EXPERIMENT` フラグで挙動を切り替えます。
  - `0`（既定）: `all_fonts`（7フォント常時埋め込み）
  - `1`: `script_subset` を試行
- ただし、未知スクリプト（例: アラビア文字や絵文字）が含まれる場合は
  安全優先で `all_fonts` に自動フォールバックします。

---

## 2. 実行コマンド（最短）

```bash
pnpm pdf:font:benchmark
```

コマンドの意味:
- `pnpm`：
  - `package.json` の `scripts` を実行するコマンドランナー
- `pdf:font:benchmark`：
  - `node --expose-gc scripts/pdf-font-benchmark.mjs` を呼び出す
- `node --expose-gc`：
  - Node.js の `global.gc()` を有効化し、cold runのメモリ差分を安定化しやすくする
- `scripts/pdf-font-benchmark.mjs`：
  - 実際の計測スクリプト

---

## 3. オプション付き実行

```bash
node --expose-gc scripts/pdf-font-benchmark.mjs \
  --iterations 9 \
  --sample-image assets/images/icon.png \
  --out-json docs/how-to/benchmarks/pdf_font_benchmark.custom.json \
  --out-md docs/how-to/benchmarks/pdf_font_benchmark.custom.md
```

各オプションの意味:
- `--iterations 9`：
  - 1シナリオあたり9回計測（1回目=cold、残り=warm集計）
- `--sample-image <path>`：
  - 1枚あたりの画像payload推定に使うサンプル画像
- `--out-json <path>`：
  - 生データ（集計済みJSON）の出力先
- `--out-md <path>`：
  - 表形式レポート（Markdown）の出力先

---

## 4. 出力ファイル

デフォルトでは次に保存されます。

- `docs/how-to/benchmarks/pdf_font_benchmark.latest.json`
- `docs/how-to/benchmarks/pdf_font_benchmark.latest.md`

---

## 5. 最新実測（2026-02-10 UTC）

実行条件:
- Node: `v18.20.8`
- Platform: `linux/x64`
- Iterations: `7`
- Sample image: `assets/images/icon.png`（raw `393,493` bytes）

結果サマリ（抜粋）:
- 短文シナリオ（4枚）:
  - `all_fonts`: font payload `66.93 MB`, warm中央値 `32.78 ms`
  - `script_subset`: font payload `2.61 MB`, warm中央値 `1.03 ms`
- 多写真シナリオ（80枚）:
  - `all_fonts`: 推定入力 `106.96 MB`
  - `script_subset`: 推定入力 `42.64 MB`
- 多言語シナリオ（12枚）:
  - `all_fonts`: font payload `66.93 MB`
  - `script_subset`: font payload `29.14 MB`

---

## 6. 読み方の注意

- これは「フォント埋め込み経路」の比較ベンチです。
- 実機の最終PDFサイズ/生成時間は、写真内容・端末性能・ネイティブ印刷エンジンで変動します。
- そのため、最終採用判断は `ADR-0002` の追記を正とします。
- 実験有効化時の実機確認は `docs/how-to/testing.md` のPDF実機チェックに従ってください。
