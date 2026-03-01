# PDF HTMLテンプレート（A4/Letter縦 / 崩れない最小構成）- Single Source of Truth

> **このファイルがPDFテンプレートの唯一の正（Single Source of Truth）です。**
> 他の仕様書（basic_spec.md / functional_spec.md / product_strategy.md）からはリンクで参照してください。
> テンプレートを変更するときは **このファイルだけ** を更新します。

- 目的: 実装者が「このまま組めば崩れない」状態にするための"骨格テンプレ"
- 注意: ここでは **レイアウトとルール** を固定する。装飾（色・フォントサイズ微調整）はFigma側で詰める
- 関連: `docs/reference/basic_spec.md`（F-06）/ `docs/reference/functional_spec.md`（F-05）/ `docs/adr/ADR-0002-pdf-fonts.md`

---

## 1. HTML

```html
<!doctype html>
<html lang="{{lang}}" dir="{{dir}}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{reportName}}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <!-- =========================
       Page 1: Cover
       - コメントが短い場合のみ表紙に載せる（isCommentOnCover=true）
       ========================= -->
  <section class="page cover">
    <div class="page-inner">

      <div class="page-main">
        <!-- レポート名（タイトル） -->
        <h1 class="report-title">{{reportName}}</h1>

        <!-- メタ情報（左寄せではなく start 寄せにする：RTLでも自然） -->
        <div class="meta-grid">
          <div class="meta-k">{{t.createdAt}}</div>   <div class="meta-v">{{createdAt}}</div>
          <div class="meta-k">{{t.reportName}}</div>  <div class="meta-v">{{reportNameOrDash}}</div>
          <div class="meta-k">{{t.address}}</div>     <div class="meta-v">{{addressOrDash}}</div>
          <div class="meta-k">{{t.location}}</div>    <div class="meta-v">{{latLngOrDash}}</div>
          <div class="meta-k">{{t.weather}}</div>     <div class="meta-v">{{weatherTextOrDash}}</div>
          <div class="meta-k">{{t.photoCount}}</div>  <div class="meta-v">{{photoCount}} {{t.photos}}</div>
          <div class="meta-k">{{t.pageCount}}</div>   <div class="meta-v">{{pageCount}} {{t.pages}}</div>
        </div>

        <!-- コメント：短ければ表紙に載せる（溢れるなら生成側でfalseにしてコメントページへ） -->
        {{#if isCommentOnCover}}
        <div class="comment-block no-break">
          <h2 class="section-title">{{t.comment}}</h2>
          <div class="comment-text">{{commentText}}</div>
        </div>
        {{/if}}
      </div>

      <!-- フッター（ページ番号） -->
      <footer class="page-footer">
        <span></span>
        <span>1/{{pageCount}}</span>
      </footer>

      <!-- Free透かし：表紙のみ（仕様） -->
      {{#if isFree}}
      <div class="watermark">Created by Repolog</div>
      {{/if}}

    </div>
  </section>


  <!-- =========================
       Page 2..: Comment pages
       - isCommentOnCover=false の場合に出力する想定
       - 生成側で commentPages を「ページ分割済み」で渡す
       commentPages: [{ pageNo: 2, text: "..." }, ...]
       ========================= -->
  {{#each commentPages}}
  <section class="page comment-page">
    <div class="page-inner">

      <div class="page-main">
        <h2 class="section-title">{{../t.comment}}</h2>
        <div class="comment-text">{{text}}</div>
      </div>

      <footer class="page-footer">
        <span></span>
        <span>{{pageNo}}/{{../pageCount}}</span>
      </footer>

    </div>
  </section>
  {{/each}}


  <!-- =========================
       Photo pages (Standard: 2 photos / page)
       photoPages2: [
         { pageNo: 3, a:{src,index}, b:{src,index} or null }, ...
       ]
       ========================= -->
  {{#if isStandardLayout}}
    {{#each photoPages2}}
    <section class="page photo-page standard">
      <div class="page-inner">

        <div class="page-main">
          <div class="photo-grid two">
            <!-- A -->
            <div class="photo-slot">
              <div class="photo-frame">
                <img class="photo" src="{{a.src}}" alt="" />
                <div class="photo-no">Photo {{a.index}}</div>
              </div>
            </div>

            <!-- B（無ければ空枠にしてレイアウトを崩さない） -->
            {{#if b}}
            <div class="photo-slot">
              <div class="photo-frame">
                <img class="photo" src="{{b.src}}" alt="" />
                <div class="photo-no">Photo {{b.index}}</div>
              </div>
            </div>
            {{else}}
            <div class="photo-slot empty"></div>
            {{/if}}
          </div>
        </div>

        <footer class="page-footer">
          <span></span>
          <span>{{pageNo}}/{{../pageCount}}</span>
        </footer>

      </div>
    </section>
    {{/each}}
  {{/if}}


  <!-- =========================
       Photo pages (Large: 1 photo / page)
       photoPages1: [
         { pageNo: 3, p:{src,index} }, ...
       ]
       ========================= -->
  {{#if isLargeLayout}}
    {{#each photoPages1}}
    <section class="page photo-page large">
      <div class="page-inner">

        <div class="page-main">
          <div class="photo-grid one">
            <div class="photo-slot">
              <div class="photo-frame">
                <img class="photo" src="{{p.src}}" alt="" />
                <div class="photo-no">Photo {{p.index}}</div>
              </div>
            </div>
          </div>
        </div>

        <footer class="page-footer">
          <span></span>
          <span>{{pageNo}}/{{../pageCount}}</span>
        </footer>

      </div>
    </section>
    {{/each}}
  {{/if}}

</body>
</html>
```

---

## 2. CSS

```css
/* =========================================
   A4/Letter / Print stable base
   - 仕様：A4/Letter縦、mm単位、写真はcontain（欠けない）
   ========================================= */

/* 用紙サイズは生成側で差し替える（A4 / letter） */
@page {
  size: {{paperSize}} portrait;
  margin: 0; /* 余白は .page の padding で管理（画面プレビューと一致させる） */
}

:root{
  /* A4: 210mm x 297mm / Letter: 216mm x 279mm */
  --page-w: {{pageWidthMm}};
  --page-h: {{pageHeightMm}};
  --page-pad: 12mm;

  --footer-h: 10mm;
  --gap: 6mm;
  --border: rgba(0,0,0,0.12);

  --text: #111;
  --muted: #666;
}

/* 画面上の背景（PDF/印刷では消す） */
html, body {
  margin: 0;
  padding: 0;
  color: var(--text);
  background: #f2f2f2;
}

/* 多言語フォント：Noto中心＋OS標準フォールバック
   PDF出力は Noto Sans 系を埋め込みで固定（ADR-0002 / assets/fonts）
   ※本気で崩れゼロを狙うなら、woff2を同梱して@font-faceで固定推奨（本文で説明） */
body {
  font-family:
    system-ui, -apple-system, "Segoe UI", Roboto,
    "Noto Sans",
    /* CJK */
    "Noto Sans JP", "Noto Sans CJK JP",
    "Noto Sans SC", "Noto Sans CJK SC",
    "Noto Sans TC", "Noto Sans CJK TC",
    "Noto Sans KR", "Noto Sans CJK KR",
    /* RTL / Indic / SEA（必要に応じて追加） */
    "Noto Naskh Arabic", "Noto Sans Arabic",
    "Noto Sans Devanagari",
    "Noto Sans Thai",
    Arial, sans-serif;

  font-size: 11pt;
  line-height: 1.35;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* 1ページ（用紙そのもの） */
.page {
  width: var(--page-w);
  height: var(--page-h);
  box-sizing: border-box;
  padding: var(--page-pad);
  background: #fff;

  margin: 14px auto;
  box-shadow: 0 6px 18px rgba(0,0,0,0.10);

  break-after: page;         /* 新仕様 */
  page-break-after: always;  /* 旧互換 */
}

/* 印刷時は影や背景を消して、ページを詰める */
@media print {
  html, body { background: #fff; }
  .page {
    margin: 0;
    box-shadow: none;
  }
}

/* ページ内レイアウト：上=本文、下=フッター */
.page-inner {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* 本文エリア（フッター分を自然に避ける） */
.page-main {
  flex: 1;
  min-height: 0; /* 長文でレイアウトが破綻しないため */
}

/* フッター（ページ番号） */
.page-footer {
  height: var(--footer-h);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 9pt;
  color: var(--muted);
  border-top: 1px solid rgba(0,0,0,0.08);
  padding-top: 2mm;
}

/* Free透かし：表紙のみ右下（仕様） */
.watermark {
  position: absolute;
  right: var(--page-pad);
  bottom: calc(var(--page-pad) + var(--footer-h));
  font-size: 9pt;
  color: rgba(0,0,0,0.25);
}

/* =========================
   Cover
   ========================= */

/* タイトルは中央（ここは"世界的にも違和感が少ない"） */
.report-title {
  text-align: center;
  font-size: 24pt;
  font-weight: 800;
  margin: 0 0 6mm 0;
  padding-bottom: 4mm;
  border-bottom: 2px solid rgba(0,0,0,0.75);
}

/* メタ情報：start寄せ（RTLでも自然）
   text-align:start は論理プロパティの考え方で安全（left固定より事故が少ない） */
.meta-grid {
  display: grid;
  grid-template-columns: 32mm 1fr;
  column-gap: 6mm;
  row-gap: 3mm;

  text-align: start;
  margin-bottom: 6mm;
}

.meta-k {
  font-weight: 700;
  color: #444;
}

.meta-v {
  font-weight: 600;
  overflow-wrap: anywhere; /* 住所や長い地名がはみ出さない */
  word-break: break-word;
}

/* コメントブロック（表紙に載せる場合）
   no-breakを併用して「ブロック途中での改ページ」を避ける */
.comment-block {
  margin-top: 6mm;
  padding: 5mm;
  border: 1px solid rgba(0,0,0,0.10);
  border-radius: 3mm;
  background: #fafafa;
}

/* 見出し */
.section-title {
  margin: 0 0 3mm 0;
  font-size: 13pt;
  font-weight: 800;
  color: #333;
  border-left: 5px solid rgba(0,0,0,0.65);
  padding-left: 3mm;
}

/* コメント本文：改行を保持（仕様の意図に合う） */
.comment-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: 11pt;
  line-height: 1.45;
}

/* 印刷時の改ページ制御（新旧両対応） */
.no-break {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* =========================
   Photos
   - 写真は欠けない（contain）
   ========================= */

.photo-grid {
  height: 100%;
  display: grid;
  gap: var(--gap);
}

/* 標準：2枚（上下） */
.photo-grid.two {
  grid-template-rows: 1fr 1fr;
}

/* 大きく：1枚 */
.photo-grid.one {
  grid-template-rows: 1fr;
}

.photo-slot {
  min-height: 0;
}

.photo-slot.empty {
  border: 1px dashed rgba(0,0,0,0.10);
  border-radius: 3mm;
}

/* 写真枠 */
.photo-frame {
  height: 100%;
  border: 1px solid var(--border);
  border-radius: 3mm;
  background: #fff;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
}

/* 画像：最重要（欠けない） */
.photo {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 仕様：切り抜き禁止/欠けない */
  display: block;
}

/* Photo番号：極小で隅（仕様） */
.photo-no {
  position: absolute;
  right: 2mm;
  bottom: 2mm;
  font-size: 8pt;
  color: rgba(0,0,0,0.70);
}
```

---

## 3. 画像の差し込み（推奨）

- `photoSrc` は次のどちらかで渡す
  - `data:` URL（推奨）：`data:image/jpeg;base64,....`
  - `https:` URL（外部）
- 端末ローカルの `file://` は環境によって表示できないことがあるため、PDFでは **base64埋め込み**を基本にする
- 実装では「縮小・圧縮した画像」を使う（容量と速度を安定させる）

---

## 4. 計算ルール（ページ数 / 写真番号）

- pageCount:
  - 表紙: 1
  - コメント: commentPagesCount（1以上）
  - 写真:
    - 標準（2枚/ページ）: `ceil(photoCount / 2)`
    - 大きく（1枚/ページ）: `photoCount`
- 写真番号（Photo 12）は **レポート内の順序（orderIndex）+1** を使う（PDF上の見た目と一致する）
