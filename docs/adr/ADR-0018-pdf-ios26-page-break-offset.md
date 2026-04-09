# ADR-0018: iOS 26 で再発した PDF 写真ページ後の空白ページ — `.page` slack を 1mm → 20mm に拡大

- Status: Accepted
- Date: 2026-04-09
- Deciders: @doooooraku
- Related: ADR-0009 / ADR-0017 / `src/features/pdf/pdfTemplate.ts` / `__tests__/pdfTemplate.test.ts` / `docs/reference/pdf_template.md` / `docs/reference/lessons.md`

---

## Context（背景：いま何に困っている？）

ユーザーから 2026-04-09 に「iOS 26.2.1 で出力した PDF の写真ページ直後に空白ページが入る」という報告を受けた。提供された 1 ファイル（`docs/reference/9B946DF5-…pdf`、producer=`iOS Version 26.2.1 (Build 23C71) Quartz PDFContext`）を PyMuPDF で構造解析した結果:

```
レポート: 写真 10 枚 / standard レイアウト / A4 / Pro / 表紙コメントなし
表紙の自己申告: 「6 ページ」
実体: 11 ページ
+5 ページの空白挿入
```

物理ページごとの内容:

| 物理ページ | 内容 | 期待 |
|---|---|---|
| 1 | 表紙 + フッター "1/6"（y=793） | OK |
| 2 | 写真1, 写真2（写真番号は overlay で正常）。**フッター無し** | NG |
| 3 | **空白**。フッター "2/6" が y=5（最上部）に押し出されている | NG |
| 4 | 写真3, 写真4。フッター無し | NG |
| 5 | 空白 + フッター "3/6" 押し出し | NG |
| 6, 7, 8, 9, 10, 11 | 同パターン繰り返し | NG |

**ADR-0017 (PR #300/#301) の修正が iOS 18 では有効だったにもかかわらず、iOS 26 で完全に再発している**。表紙だけが正常で、写真ページ全てに同じ症状。

### 困りごと

- **iOS 26 ユーザー全員 × 全レポート × 全写真ページに発生する致命的不具合**。iOS 26 はストア配布開始済みで影響ユーザー比率が日々増加
- 表紙の `pageCount` 表記（「6 ページ」）と実体ページ数（11）が完全乖離 → アプリの数値表示への信頼を毀損
- ADR-0012（PDF 出力直後のレビュー依頼）が「壊れた PDF」直後に発火する最悪 UX
- ADR-0009 → ADR-0017 → 本 ADR-0018 で **同種バグの 3 度目の再発**。「修正済み」とラベルされた既知不具合が連続再発する状況は、ADR の信頼性そのものを損なう

### 制約/前提

- HTML 構造の変更は ADR-0009 / ADR-0013 / ADR-0015 / ADR-0016 / ADR-0017 の防御層と整合する必要がある
- `expo-print` の WebView 印刷エンジン（iOS=WKWebView, Android=Chromium）には手を入れない
- 19 言語サポートを維持
- `docs/reference/pdf_template.md` を Single Source of Truth (SSoT) として尊重する
- 実 PDF の自動検証手段は CI に存在しない（macOS + 実機/シミュ必須）
- ホットフィックスとして即日 TestFlight 配布したい（緊急度高）

### 真因（PyMuPDF + 描画矩形抽出による実測値で確定）

#### 計測 1: 物理ページ別 `.page` 配置

```
物理ページ | .page rect (x0, y0)→(x1, y1)            | 解釈
─────────┼─────────────────────────────────────────┼──────────────
Phys 1    | (0.0, 0.2)  → (594.6, 838.4)             | 表紙、ズレ無し ✅
Phys 2    | (0.0, 54.2) → (594.6, 892.4)             | 写真ページ1、上端54.2pt押し下げ・下端50pt はみ出し ❌
Phys 3    | (0.0,-787.4)→ (594.6, 50.8)              | Phys2 の続き（フッター "2/6" のみ）
Phys 4    | (0.0, 54.2) → (594.6, 892.4)             | 写真ページ2、同パターン ❌
Phys 5    | (0.0,-787.4)→ (594.6, 50.8)              | フッター "3/6"
... (Phys 6-11 で同パターンが繰り返し)
```

#### 計測 2: WebView コンテンツストリーム上の各 `.page` セクション位置

| # | セクション | cs 開始 | cs 終了 | 高さ | 直前との gap |
|---|---|---|---|---|---|
| 1 | 表紙 | -0.0 | 838.2 | 838.2 | — |
| 2 | 写真ページ1 | **895.5** | 1733.7 | 838.2 | **+57.3** |
| 3 | 写真ページ2 | 2578.6 | 3416.8 | 838.2 | +844.9 |
| 4 | 写真ページ3 | 4261.7 | 5099.8 | 838.2 | +844.9 |
| 5 | 写真ページ4 | 5944.8 | 6782.9 | 838.2 | +844.9 |
| 6 | 写真ページ5 | 7627.8 | 8466.0 | 838.2 | +844.9 |

#### 真因の確定

- **`.page` 自体は仕様通り 838.2pt（=296mm）** で正しく作られている。`calc(var(--page-h) - 1mm)` が効いている
- **`.photo-no` は正しく `.photo-frame` の内側に absolute 配置されている**。ADR-0017 の SSoT 不変条件は満たされている。in-flow 縦消費はゼロ
- **iOS 26 の WKWebView 印刷エンジンは、`break-after: page` 後の `.page` を物理ページの y=54.2pt（≒19mm）から配置している**。表紙（最初の `.page`）には適用されないため、表紙だけ正常
- **838.2 + 54.2 = 892.4 > 物理ページ高 842pt** → 50.4pt（=17.8mm）が物理ページ下端からはみ出して次ページに送られる
- その押し出し量がちょうど **`.page-footer` の領域**を含んでいるため、フッターだけが次の物理ページの最上部に出現する

→ **真因**: iOS 26 の WKWebView 印刷エンジンは、`break-after: page` 後の `.page` を「次の物理ページの y=0 ではなく y≈54pt（≒19mm）」から配置する。**ADR-0009 が iOS 18 で確認した「1mm slack」では到底足りない（必要 slack ≒ 19mm）**。

### なぜ ADR-0009 / ADR-0017 で気付かれなかったか

- ADR-0009 (2026-04-07) は **iOS 18.6.2 を前提**に設計されていた。当時の subpixel 丸め (1〜2 px = 0.5mm 未満) は 1mm slack で十分吸収できた
- ADR-0017 (2026-04-08) も **iOS 18.6.2 で再現確認**しており、PR #212 の `.photo-no` in-flow ドリフトを修正するのが目的だった
- iOS 26 はその後にリリースされたメジャーアップデートで、`UIPrintPageRenderer` / `UIViewPrintFormatter` / `WKWebView.viewPrintFormatter()` のいずれかの内部挙動が変わり、`break-after: page` 後の page placement に ~54pt の top offset が入るようになった（Apple WWDC 2025 でも未公表、内部実装変更）
- ADR-0009 の Re-evaluation criteria は「ユーザー報告があれば 1mm を 2mm に増やす」とだけ書かれていたが、**「桁違いの拡大」（1mm → 20mm）には対応していなかった**
- `pdfTemplate.test.ts` は CSS literal の `'- 1mm'` を assert していたが、これは「実装ドリフト検出」の役割しか果たしておらず、**iOS OS バージョン横断の挙動変化は検出できない**
- 結果として「外部依存ツール（iOS 印刷エンジン）の挙動が OS 更新で桁違いに変わる」というクラスの脅威が、ADR レベルでも CI レベルでも防御されていなかった

---

## Decision（決めたこと：結論）

**`.page { height: calc(var(--page-h) - 1mm) }` を `calc(var(--page-h) - 20mm)` に拡大する。** 20mm slack の内訳は:

- **観測値: 19mm** (iOS 26.2.1 の物理ページ y 配置オフセット 54.2pt の mm 換算: 54.2 / 2.835 = 19.13mm)
- **安全マージン: 1mm** (iOS 26.x minor 更新での微小変動への保険)
- **合計: 20mm**

A4 の場合: 297mm − 20mm = 277mm = 785.3pt
+ iOS 26 の 54.2pt offset = 839.5pt < 物理ページ 842pt（2.5pt = 0.88mm の余裕）

Letter の場合: 279mm − 20mm = 259mm = 733.7pt
+ 54.2pt offset = 787.9pt < 物理ページ 792pt（4.1pt = 1.45mm の余裕）

加えて、`pdfTemplate.test.ts` の既存 ADR-0009 アサーション（`'height: calc(var(--page-h) - 1mm)'`）を新値 `'- 20mm'` に更新し、旧値が残っていないことも明示的に assert する。SSoT (`pdf_template.md`) も同一値・同一コメントに同期する。

### 適用範囲

- すべての PDF 出力経路（standard / large × A4 / Letter × Free / Pro × preview / 本生成 / OOM フォールバック）
- iOS 18 / iOS 26 / Android 全プラットフォーム（修正は CSS 数値 1 箇所のみ、HTML 構造・JS ロジック・依存追加なし）

---

## Decision Drivers（判断の軸）

1. **緊急度**: iOS 26 はストア配布開始済みで日々ユーザー比率が増加。**ホットフィックスとして即日 TestFlight 配布**できる最小修正が必要
2. **既存設計との整合**: ADR-0009 / ADR-0017 の slack 設計の延長線上で、HTML 構造を一切触らない
3. **ADR-0017 の SSoT 不変条件を壊さない**: `.photo-no` が `.photo-frame` の内側 absolute である前提は維持。`pdfTemplate.test.ts` の SSoT 不変条件テストはそのまま green
4. **依存追加ゼロ**: pdf-lib などの新依存を入れない。`expo-print@~15.0.8` の範囲内で完結
5. **多言語対応 (19 言語) への影響ゼロ**: フォント embed (`pdfFonts.ts`) / locale ヒント / `containsUnsupportedScripts` ロジックには無関係
6. **写真サイズの劣化を最小化**: 19mm + 1mm = 20mm という最小限の slack。standard レイアウトで写真高さは 125mm → 116mm（−7.4%）にとどめる
7. **再発防止**: `pdfTemplate.test.ts` の literal assertion を更新し、旧値 `'- 1mm'` が残っていないことも assert（リグレッション防止）。SSoT も同期させ、ADR-0017 で確立した「SSoT と実装の乖離検出」原則を維持
8. **長期治療の選択肢を残す**: Approach B (CSS Paged Media リファクタ) を Follow-up で再評価できるよう本 ADR の Alternatives に保存

---

## Alternatives considered（他の案と却下理由）

### Option A: HTML 構造リファクタ（forced break 廃止 + CSS Paged Media）

- **概要**: `<section class="page">` × N + `break-after: page` をやめ、`<body>` 全体を 1 つの長い文書として流し、自然な pagination に任せる。フッターは `@page { @bottom-right { content: counter(page) "/" pages } }` で実装
- **良い点**:
  - 根本治療。`break-after: page` の挙動差に依存しない
  - 長期的に最もエレガント
- **悪い点**:
  - `pdfTemplate.ts` の HTML 構造を全面書き換え。`buildCover` / `buildCommentPages` / `buildPhotoPages` を統合する必要あり
  - iOS WebKit print が CSS Paged Media の `@page` margin-box (`@top-left`, `@bottom-right` 等) を完全サポートしているか不明。実機検証に時間が掛かる
  - 19 言語フォント埋め込み (`@font-face`) との相互作用が未検証
  - 本ホットフィックスの緊急性に合わない（即日配布不可）
- **却下理由**: スコープ過大、検証コスト過大、緊急ホットフィックスとしては不適。**ただし長期治療の有力候補として Follow-up に保存**

### Option B: PDFKit / pdf-lib による per-page 個別レンダリング

- **概要**: 各 `.page` を独立した HTML として `Print.printToFileAsync` に個別に渡し、得られた N 個の単一ページ PDF を `pdf-lib` で連結する
- **良い点**:
  - 各ページが独立しているため `break-after: page` の挙動差に依存しない
  - 完全な根本治療
- **悪い点**:
  - `pdf-lib` を新規依存追加（bundle size +1.5MB、サプライチェーンリスク）
  - ADR-0013 の hang 対策 / fallback chain との整合に大幅な再設計が必要
  - 性能劣化（N 倍の print 呼び出し）
  - ADR-0001 の依存最小主義に反する
- **却下理由**: 依存追加の代償が大きい、検証コスト大、緊急ホットフィックスに不向き

### Option C: OS バージョン別 slack（Platform.Version 分岐）

- **概要**: iOS 26 以降は 20mm slack、iOS 18 以前は 1mm slack、Android は 0mm を `Platform.Version` で動的に切り替える
- **良い点**:
  - iOS 18 ユーザーは現状の見た目を維持
  - 写真サイズの劣化を iOS 26 ユーザーに局所化
- **悪い点**:
  - OS 別ロジックは保守コスト増（テストマトリクスが倍）
  - iOS 26 minor バージョン (26.0, 26.1, 26.2, 26.3...) で挙動差が出る可能性
  - シミュ vs 実機の差を吸収できない
  - ユーザーから「実害なければ A で良い」と明示的にこだわりなしと回答済み（2026-04-09 計画レビュー）
- **却下理由**: 統一 20mm の方が保守コストが低く、iOS 18 ユーザーへの実害（フッター位置 19mm 上昇）も視認可能だが「実害なし」レベル

### Option D: UIMarkupTextPrintFormatter 切り替え (`useMarkupFormatter: true`)

- **概要**: `expo-print` の `useMarkupFormatter: true` オプションで `UIMarkupTextPrintFormatter` を使い、WKWebView を経由しない
- **良い点**:
  - iOS 26 の WKWebView quirk を回避できる可能性
- **悪い点**:
  - `UIMarkupTextPrintFormatter` は **HTML4 ベースのレガシーレンダラー**で、CSS3 (grid, flex, calc, custom properties, `@font-face data:URI`) をほぼサポートしない
  - 19 言語フォント埋め込み (ADR-0015) が機能しない
  - grid レイアウトが崩壊する
- **却下理由**: スコープ過大、テンプレ全面書き直し相当

### Option E: 後加工で空白ページ削除（pdf-lib + コンテンツ判定）

- **概要**: 11 ページ生成後、`pdf-lib` で「テキスト 5 文字以下、画像 0 枚」の物理ページを検出して削除
- **悪い点**: ADR-0009 / ADR-0017 で **2 度却下済み**（誤検知、依存追加、対症療法）
- **却下理由**: チーム原則（根本治療優先）に違反

### Option F: スラック値を Approach A より小さく（19mm ぴったり）

- **概要**: 観測値 19.13mm に近い 19mm をそのまま使う
- **悪い点**: iOS 26.3 等で挙動が微変動した場合に即再発。安全マージンゼロ
- **却下理由**: ユーザーが 1mm 安全マージンを許容済み（2026-04-09 計画レビュー）

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）

- iOS 26 の写真ページ後の空白ページが消える（standard 10 写真: 11→6 ページ / large 70 写真: 141→71 ページ相当）
- 表紙の `pageCount` 表記と実体 PDF の `/Count` が一致
- ADR-0017 の SSoT 不変条件テスト（`.photo-no` 内側 absolute）はそのまま green
- 19 言語のフォント embed / 多言語ロジックに無影響
- HTML 構造変更ゼロのため、ADR-0009 / ADR-0013 / ADR-0015 / ADR-0016 / ADR-0017 の既存防御層と完全整合
- `pdfService.ts` / `app/reports/[id]/pdf.tsx` / DB / i18n には一切影響しない
- iOS 18 でも引き続き正常動作（slack が増えるだけ）
- Android (Chromium) でも引き続き正常動作

### Negative（辛い/副作用）

- **写真サイズが ~7.4% 縮小**: standard レイアウトで 1 写真スロット 125mm → 116mm。実 DPI が ~7% 低下するが、4032×3024 写真を A4 に印刷するユースケースでは画質劣化として認識されないレベル
- **iOS 18 ユーザーにも 19mm の余白増加**: 表紙のフッター位置が ~19mm 上に移動。視認可能だが「ページの中心が下に空く」レベルの違和感にとどまる。実害なし
- **長文コメントの行数が ~7% 減**: 2500 文字コメントなどでページ分割境界が変わる可能性。ただし `splitCommentIntoPages(charsPerPage = 1200)` が CSS とは独立なので、ページ数計算と乖離しない
- **対症療法であることの自覚**: 真の iOS 26 quirk の原因（UIViewPrintFormatter / WKWebView の内部実装変更）は解明されていない。iOS 27 以降で挙動が変わる可能性は残る
- 実 PDF レベルの自動検証（CI で iOS 実機 PDF を生成して空白ページ数をカウントする等）は引き続き存在しない。手動 SOP に依存

### Follow-ups（後でやる宿題）

- [ ] **マージ前必須**: iOS 26.2.1 実機で写真 0/1/2/3/5/10 × standard/large × A4/Letter の **24 ケース**を生成し、PyMuPDF で `/Count == calculatePageCount(...)` を検証
- [ ] **マージ前必須**: Android (SH-M25) で同条件を生成し、リグレッションがないことを確認
- [ ] **マージ後**: TestFlight 即日配布、iOS 26 端末で再現テスト（@doooooraku 確認）
- [ ] **マージ後**: ストアレビュー監視を 2 週間継続、PDF 関連クレームの新規発生を検知
- [ ] **Phase 2 (再評価)**: Approach A（HTML 構造リファクタ + CSS Paged Media）を独立タスクとして検討。検証コストの大きさから、緊急性が薄れた段階で着手
- [ ] **将来の防御**: iOS 27 リリース後 2 週間以内に 24 ケース手動再検証する SOP を `docs/how-to/development/` に文書化する余地

---

## Acceptance / Tests（合否：テストに寄せる）

### 正（自動テスト）

- **Jest** `__tests__/pdfTemplate.test.ts`:
  - 既存 96 ケース（section 数不変条件）が green
  - 既存 7 ケース（ADR-0017 SSoT 不変条件）が green
  - **更新 1 ケース**（ADR-0009 + ADR-0018 defensive CSS）:
    - `expect(html).toContain('height: calc(var(--page-h) - 20mm)')`
    - `expect(html).not.toContain('height: calc(var(--page-h) - 1mm)')` ← リグレッション防止
    - `.page-footer` の `box-sizing: border-box` 維持
- **CI ジョブ**: `.github/workflows/ci.yml` の `pnpm verify` ステップ
  - 期待: `pnpm verify` (lint + type-check + test 256+ ケース + i18n:check + config:check) all green

### 手動チェック（PR マージ前 / TestFlight）

- **手順**:
  1. iOS 26.2.1 実機（TestFlight）で以下の **24 ケース**の PDF を生成:
     - レイアウト: standard / large
     - 用紙: A4 / Letter
     - 写真枚数: 0 / 1 / 2 / 3 / 5 / 10
     - 計 2 × 2 × 6 = 24 ケース
  2. 各 PDF を iOS Files / `pdfinfo` / PyMuPDF のいずれかで `/Count` を確認
  3. Android (SH-M25) で同条件を生成し、リグレッションがないことを確認

- **期待結果**:
  - iOS 26.2.1 全 24 ケースで `/Count == calculatePageCount(comment, photoCount, layout)` が成立
  - 写真ページの直後に空白ページがゼロ
  - 表紙の `pageCount` 表記と実体 PDF ページ数が一致
  - フッター "N/M" が各ページの下端に正しく配置
  - photo-no が画像右下の半透明 pill として視認可能（ADR-0017 の UX 維持）
  - Android で既存挙動から変化なし
  - iOS 18 系（手元にあれば）でも回帰なし

### 数値根拠の再現可能性

PyMuPDF 解析コマンド（誰でも再現可能）:

```python
import fitz
doc = fitz.open('path/to/exported.pdf')
print('Page count:', doc.page_count)
print('Producer:', doc.metadata.get('producer'))
for i, page in enumerate(doc):
    drs = page.get_drawings()
    page_rect = next(
        (d['rect'] for d in drs if 'rect' in d
         and 590 < d['rect'].width < 600
         and 800 < d['rect'].height < 850),
        None
    )
    if page_rect:
        print(f'Phys {i+1}: .page=({page_rect.x0:.1f},{page_rect.y0:.1f})-'
              f'({page_rect.x1:.1f},{page_rect.y1:.1f})')
```

期待出力（修正後の iOS 26 PDF）:
- 全物理ページで `.page` が y∈[0, 20pt] 範囲内から配置されている
- `.page` 高さが `~785pt`（A4）または `~733pt`（Letter）
- 物理ページの下端 (`842pt` A4 / `792pt` Letter) を超えない

---

## Rollout / Rollback（出し方/戻し方）

- **リリース手順への影響**: なし。CSS のみの変更で、依存追加・ストア申請メタデータ・DB スキーマに影響しない
- **配布手順**:
  1. PR を main にマージ
  2. EAS で iOS production build を即日生成（branch protection 一時緩和 → 即復元）
  3. TestFlight に配布、@doooooraku が iOS 26.2.1 端末で 24 ケース確認
  4. 問題なければ App Store Connect で本番リリース申請
- **ロールバック方針**: `git revert <merge_commit>` → push → CI 通過後 main に直マージ。CSS 数値のみの変更なのでロールバックも安全
- **検知方法**:
  - CI: `pnpm verify` が落ちれば即検出（特に `pdfTemplate.test.ts` の更新アサーション）
  - ユーザー報告: 次回 iOS リリース後、再び「空白ページが入る」報告があれば本 ADR を Re-evaluation し、Approach A (HTML 構造リファクタ) に格上げ

### Re-evaluation criteria（本 ADR を見直すべきトリガー）

以下のいずれかが満たされたら、本 ADR を Re-evaluation し ADR-0019 で再判断:

- iOS 26 minor 更新 (26.3+) で再度「空白ページ」報告が来る
- iOS 27 リリース後の手動 24 ケース検証で `/Count` 不一致が出る
- 別の iPhone モデル / 別の iPad で iOS 26 でも 20mm slack が不足する事例
- ストアレビューで PDF 不安定クレーム ≥3 件（2 週間以内）
- Pro 解約理由で「PDF が壊れる」が ≥5%

---

## Links（関連リンク：正へ寄せる）

- 実装: `src/features/pdf/pdfTemplate.ts`（`buildCss()` 内 `.page` rule）
- テスト: `__tests__/pdfTemplate.test.ts`（`buildPdfHtml — defensive CSS for iOS WebKit print (ADR-0009 + ADR-0018)` describe ブロック）
- SSoT: `docs/reference/pdf_template.md`（`.page` ルール）
- 関連 ADR:
  - ADR-0002（PDF フォント, 旧）
  - **ADR-0009**（`.page` slack 1mm + footer border-box）— 本 ADR が拡張する
  - ADR-0013（PDF hang resilience）
  - ADR-0015（PDF font strategy shift）
  - ADR-0016（WebView pool 累積受容）
  - **ADR-0017**（`.photo-no` SSoT 復元）— 本 ADR の前提条件
- lessons: `docs/reference/lessons.md`（PDF生成 > 2026-04-09 セクション）
- 参照 PDF: `docs/reference/9B946DF5-C930-4175-A2BF-0C54AAC200AA.pdf`（iOS 26.2.1 で生成、空白ページ +5）
- package.json: `expo-print@~15.0.8`
- CI: `.github/workflows/ci.yml`

---

## Notes（メモ：任意）

### slack 数値の根拠

| 項目 | 値 | 出典 |
|---|---|---|
| iOS 26 観測 offset | 54.2pt | PyMuPDF 実測 (Phys 2 の `.page.y0`) |
| pt → mm 換算 | 19.13mm | 54.2 ÷ 2.835 |
| 安全マージン | 1mm | ユーザー承認 (2026-04-09) |
| 採用 slack | 20mm | 19 + 1 |
| A4 物理ページ高 | 297mm = 842pt | — |
| A4 `.page` 高 | 277mm = 785pt | 297 - 20 |
| A4 余裕 | 0.88mm = 2.5pt | 842 - (785 + 54.2) |
| Letter 物理ページ高 | 279mm = 792pt | — |
| Letter `.page` 高 | 259mm = 733pt | 279 - 20 |
| Letter 余裕 | 1.45mm = 4.1pt | 792 - (733 + 54.2) |

### ADR-0009 との関係

本 ADR は ADR-0009 を `Superseded` にしない。ADR-0009 の slack 設計思想（`.page` を `@page` より物理的に小さくして subpixel 丸めを吸収する）は依然として正しく、本 ADR はその **数値を iOS 26 の挙動に合わせて拡大** したもの。両 ADR は積層的に機能する。ADR-0009 の Notes 末尾に本 ADR へのクロスリファレンスを追記する。

### ADR-0017 との関係

本 ADR は ADR-0017 を `Superseded` にしない。ADR-0017 の SSoT 不変条件（`.photo-no` が `.photo-frame` の内側 absolute）は本 ADR でも前提となっている。`pdfTemplate.test.ts` の SSoT 不変条件テストはそのまま green であることを確認済み。

### iOS 26 quirk の真因（推定、未確定）

実装レベルで iOS 26 が `break-after: page` 後の `.page` を物理ページ y=54.2pt から配置する根本原因は、本 ADR では特定していない。可能性の高い候補:

1. iOS 26 の `WKWebView.viewPrintFormatter()` が返す `UIViewPrintFormatter` のデフォルト `contentInsets` または `perPageContentInsets` が iOS 18 から変更された
2. iOS 26 の `UIPrintPageRenderer` が CSS `break-after: page` を解釈する際、ページ境界に「safe area」を予約するようになった
3. iOS 26 の Quartz PDF Context (`Quartz PDFContext` producer) が PDF 生成時に独自の top inset を挿入する

**これらの真因解明は本 ADR の Follow-up (Phase 2) として保留**。緊急ホットフィックスとしての本対応は真因に依存せず動作する。

### 写真サイズ縮小率の試算

| 項目 | 旧 (-1mm) | 新 (-20mm) | 差 |
|---|---|---|---|
| `.page` 高さ | 296mm | 277mm | -6.4% |
| `.page-inner` 高さ (= - 24mm padding) | 272mm | 253mm | -7.0% |
| `.page-main` 高さ (= - 10mm footer - 6mm gap) | 256mm | 237mm | -7.4% |
| photo-grid 高さ | 256mm | 237mm | -7.4% |
| 1 写真スロット (standard, 2 写真/ページ) | 125mm | 115.5mm | -7.6% |
| 1 写真スロット (large, 1 写真/ページ) | 256mm | 237mm | -7.4% |

縮小率は全体で 7〜7.6% に収まる。許容範囲。

### 本 ADR の自己テスト（リグレッション防止）

`pdfTemplate.test.ts` に追加した assertion `expect(html).not.toContain('height: calc(var(--page-h) - 1mm)')` により、誤って旧値に戻されたら CI が即落ちる。さらに ADR-0017 の SSoT 不変条件テスト（`.photo-no` 内側 absolute）も維持されているため、複数の構造ドリフトに対する CI セーフティネットが積層している。
