# プロダクト戦略（Repolog）
> Diátaxis: Explanation（Why / 価値・スコープの境界・判断基準）

---

## 0. この文書の役割（最重要）
この「プロダクト戦略」は、Repologの **価値** と **スコープ境界** と **判断基準** を固定するための文書です。  
実装や運用で迷ったときに「戻ってくる地図」です。

### 0-1. 読むと分かること
- Repologは **誰のための** 何のアプリか
- v1.x（当面）で「**やること / やらないこと**」の境界
- 仕様が増えた時に「それは今やるべき？」を決める判断基準
- 収益の柱（今 / 次）と、やってはいけない収益設計
- 重大なリスクと恒久策（運用設計を含む）

### 0-2. この文書に「書くこと / 書かないこと」
**書くこと（この文書が守る領域）**
- 変わりにくい「不変条件（Principles）」
- 価値（Value Proposition）と対象ユーザー
- スコープ境界（Non-goals含む）
- 成功指標（KPIの定義と優先）
- 収益モデルの骨格（今/次）
- 重大なリスクと恒久策（運用設計を含む）

**書かないこと（ズレやすいので別へ）**
- 依存関係の細部 → **正はコード（package.json / lock / CI）**
- 実装手順やコマンド一覧 → **docs/how-to/**（運用手順）
- 画面ごとのUIの細部 → **Figma（正）＋必要ならReferenceに最小限**
- 「なぜそう決めたか」の議論の経緯 → **docs/adr/**（意思決定ログ）
- 合否判定の条件 → **テスト**

> 例外：ユーザー要望により、このファイル末尾に「PDFテンプレ（HTML）」と「検証コマンド（最小）」を付録として置く。  
> ただし、後で docs/how-to/ と docs/reference/ に分離していく前提。

---

## 1. Repologとは（1行で）
**「現場で撮った写真とコメントを、A4/Letter縦の“提出に強いPDFレポート”に一発でまとめるアプリ」**

---

## 2. 価値（ユーザーに起きる良い変化）
### 2-1. 価値のコア
Repologのコア価値は「PDFが作れる」ではなく、  
**“提出に強い・揉めない”形に、証拠（写真）を欠けさせず整える** ことです。

### 2-2. ユーザーの状態変化（Before→After）
- Before：写真がアルバムに散らばる／LINEで送り合う／口頭説明が増える／誰が見ても同じ体裁にならない
- After：レポート名・日時・位置（任意）・天気・コメント・写真が **同じ形式のPDF** で出せる → 伝達ミスが減る／再提出が減る／保存がラク


### 2-3. 追加価値：提出がない日も“見返す理由”を作る（手帳タイムライン）
Repologは「提出用PDF」だけだと、**提出が無い日はアプリを開かなくなる**リスクがあります。  
そこでHomeを **“手帳みたいに見返せるタイムライン”** にして、日常の再訪理由を作ります。

- **探しやすい**：日付区切り＋検索＋レポート名フィルタで、昔のレポートがすぐ出る
- **振り返れる**：最近のレポート／ピン留め／“この週”まとめで、確認が速い
- **現場会話がラク**：小さくても **Photo番号（例：Photo 12）** があると、「この写真」の指差しができる
- **提出しなくても価値**：写真・コメントの“証拠”が時系列に残る＝メモ帳兼ログブックになる


---

## 3. 対象ユーザー（誰のため？）
### 3-1. メインターゲット（最優先）
- **個人〜小規模**の現場担当（建設・設備・保守・点検・清掃・店舗巡回など）
- 「会社から“写真付き報告書をPDFで出して”と言われる」立場の人
- PCが得意でなくても、スマホだけで完結したい人

### 3-2. サブターゲット（次）
- フリーランス／個人事業（検収・作業報告が必要）
- 学校・サークル・イベント運営（記録を提出したい）

### 3-3. 対象外（v1.xでは狙わない）
- 企業の承認フロー（上長承認・電子署名・ワークフロー・権限管理）
- 複雑なチェックリストや帳票（フォームビルダー）
- クラウド前提の共同編集（ログイン必須で複数人）

---

## 4. 体験設計の原則（不変条件）
### 原則P1：現場で迷わせない（入力は最小）
- 「作る → 撮る → コメント → PDF」までを短い導線に固定
- 追加情報は“任意”を基本（位置情報など）

### 原則P2：証拠写真は欠けさせない（揉めない）
- 写真は **切り抜かない（contain）**、縦横比は維持  
- 枠に収まるように縮小し、余白は白でOK（世界向けに読みやすい）

### 原則P3：出力はA4/Letter縦の“提出フォーマット”
- A4/Letter縦対応（v1.x、初期はA4）  
- 章や写真がページ途中で切れにくいレイアウト（ただし長文コメントは例外扱い）

### 原則P4：無料でも“試せる”、でも課金理由は明快
- Freeでも **プレビューは無制限**
- ただし「大きく（1枚）」での **出力** はPro限定（プレビューで価値体験→納得課金）

### 原則P5：保存はOSに委ねる（勝手に保存しない）
- 生成後は **OSの保存先選択UI** を出して終わる（完了モーダルは不要）
- 端末内の勝手フォルダ作成に依存しない（iOS/Androidの現代仕様と相性が悪い）

### 原則P6：プライバシーを尊重（位置情報ON/OFF）
- 設定で位置情報をON/OFFできる
- OFFなら権限要求しない／PDFの位置・住所は「-」
- ONなら **レポート作成時の1発目だけ自動取得**（以後はユーザー操作で再取得）
- 緯度経度は **小数点以下5桁** に丸め、その値を保存・表示・PDFに使う
- 住所は **端末言語で逆ジオコーディング**して初期入力（ユーザーが編集可）
- ONでも精度が悪い／取得不能なら「-」に倒す（“嘘っぽい数字”を出さない）

### 原則P7：18言語で文字化けしない
- 中/日/韓を含む多言語で崩れない文字選び
- 画面崩れは“仕様”ではなく“バグ”扱い


### 原則P8：見返し導線をHomeに固定（手帳体験）
- Homeは“提出の入口”ではなく **“ログブックの棚”**：タイムラインで迷子にさせない
- 日付区切り・検索・レポート名フィルタ・ピン留めで「探せる→見返せる」
- 提出が無い日でも開く理由（記録の再確認／共有前チェック）を作る

---

## 5. スコープ境界（v1.xの線引き）
### 5-1. v1.xで必ず守るコア
**レポート（1現場=1レポート）**
- 作成・編集・削除
- レポート名（ReportName）
- コメント（改行/絵文字OK、4000文字制限、残り文字数表示）
- 位置情報（ON/OFF、ONなら初回自動取得＋手動再取得、取得できない時は「-」）
- 住所（Lat/Lngの逆ジオコーディング。初期値は自動、ユーザーが編集可能）
- 天気（アイコン選択→PDFは翻訳文字列で表記）

**写真**
- 撮影（複数枚）
- 追加（端末アルバムから取り込み）
- 削除
- 順番変更（ドラッグ&ドロップ等）

**PDF**
- A4/Letter縦（初期はA4）
- プレビュー
- エクスポート（保存先は毎回OSに選ばせる）
- レイアウト：標準（2枚/ページ上下） / 大きく（1枚/ページ）
  - Free：プレビューでは「大きく」も選択可、出力は標準のみ
  - Pro：出力も「大きく」可、さらにテンプレ拡張の余地

**収益**
- Free/Pro分岐
- サブスク（月/年）＋買い切り
- Pro価値：写真無制限、PDF無制限、テンプレ/表紙/ロゴ、透かしOFF、広告なし

**バックアップ**
- 端末内のインポート/エクスポート（OSのファイル選択UIを流用）
- 基本は `manifest.json` + `photos/`（＋安全のため最小メタ追加：後述）

### 5-2. v1.xで「やらない」こと（明確に捨てる）
- アカウント/ログイン、クラウド同期（v1.xは端末完結）
- チーム共有、権限管理、承認フロー
- 電子署名、OCR、AI自動分類
- 任意用紙サイズ（A4/Letter以外）、横向き、細かい帳票カスタム（A4/Letter縦に固定）

---

## 6. 収益モデル（今 / 次）
### 6-1. 収益の柱（ロードマップ）
**今（v1.x）**：サブスクリプション（Pro）＋買い切り  
**次（必要になったら）**：法人向け（チーム機能/承認/クラウド）

### 6-2. 価格（採用済み：USD）
- 月額：$1.99  
- 年額：$19.99（2ヶ月分お得）  
- 買い切り：$39.99  

### 6-3. Free/Proの制限ポイント（揉めない設計）
**Free**
- 1レポート：写真10枚まで
- PDF出力：月5回まで
- PDFプレビュー：無制限
- レイアウト：プレビューでは「大きく（1枚）」可、出力は「標準（2枚）」のみ
- 透かし：表紙のみ（右下に薄く “Created by Repolog”）
- 広告：表示（体験を壊さない最小）

**Pro**
- 写真：無制限（ただし“重いPDF”対策は画質設計で担保）
- PDF出力：無制限
- レイアウト：標準/大きく（1枚） 出力可
- テンプレ：表紙/ロゴ/テーマなど拡張
- 透かしOFF
- 広告なし

**課金導線（仕様として固定）**
- Freeが「大きく（1枚）」でプレビュー → 出力押下時に  
  「このレイアウトはPro限定」モーダル  
  - [標準（2枚）で出力する]（親切）  
  - [Proにアップグレード]（課金）

---

## 7. 成功指標（KPI）と優先順位
### 7-1. 北極星（North Star）
**「1週間で“PDF出力”まで到達したユーザー数」**  
（＝Repologの価値が発動したユーザー数）

### 7-2. 重要KPI（優先順）
1) PDF出力成功率  
2) D1/D7/D30 継続率（= 提出がない日も開くか）  
3) Homeでの“見返し”発生率（週1回以上、過去レポート閲覧した割合）  
4) 週あたりのレポート作成数  
5) Free→Pro転換率（特に“プレビュー→出力”のCVR）  
6) 出力時間（中央値/95%）  
7) ストア評価（☆、レビュー内容）

---

## 8. 多言語（18言語）方針（不変条件）
### 8-1. 対応言語コード（正）
- en：英語
- ja：日本語
- fr：フランス語
- es：スペイン語
- de：ドイツ語
- it：イタリア語
- pt：ポルトガル語
- ru：ロシア語
- zhHans：中国語（簡体字）
- zhHant：中国語（繁体字）
- ko：韓国語
- th：タイ語
- id：インドネシア語
- vi：ベトナム語
- hi：ヒンディー語
- tr：トルコ語
- pl：ポーランド語
- sv：スウェーデン語

### 8-2. 多言語運用の約束
- 文言追加/変更は「キー追加→全言語に最低限の値→不足はIssue化」
- PDF内のラベル（Report/Created at/Weather/Photos/Pages 等）は必ず翻訳文字列を使う
- 画面崩れ/文字化けは最優先で直す

---

## 9. 仕様が生き続けるための“分離”設計（超重要）
- **本文（この文書）**：Why（価値・境界・判断基準）
- **ADR**：大きな意思決定（例：Free/Pro境界、PDF仕様、位置情報ポリシー）
- **テスト**：受け入れ条件（PDF構成、文字数制限、Free制限、エラー時挙動）

---

## 10. 主要リスク（リスクアセスメント）
### R1. PDFが重くて送れない/保存に失敗する
- 恒久策：
  - PDFに入れる前に写真を縮小・圧縮（品質/容量のバランスを固定）
  - 50枚超えは事前警告：
    - タイトル：写真枚数が多いです
    - 本文：50枚を超えています。PDF作成に数分かかる場合があります。続けますか？
    - ボタン：[作成する] / [戻る]

### R2. OSの保存仕様（iOS/Android）と衝突する
- 恒久策：OS標準UIを使う（Android=SAF / iOS=Files）

### R3. 文字化け（CJK）/フォント問題
- 恒久策：CJKで実機検証＋フォールバック設計（OSフォント）

### R4. 位置情報・プライバシーで怒られる
- 恒久策：設定で明示ON/OFF、OFFは権限要求しない

---

## 11. 分析（3C / PEST / STP / 4P / ポジショニング / 5フォース）
### 11-1. 3C分析
- Customer：提出PDFが必要、体裁統一したい、証拠欠けはNG
- Competitor：B2B検査SaaS（高機能/高単価）、汎用ノート/スキャン（無料代替）
- Company：提出特化・導線最短・多言語・即決価格

### 11-2. PEST分析
- 規制：位置情報/写真の扱い（オプトイン）
- 経済：現場は個人負担もある → 低価格は強い
- 社会：スマホ完結・リモート共有が標準
- 技術：ストレージ制約強化 → OS標準UIが安全

### 11-3. STP分析
- Target：個人〜小規模で“提出PDFが毎回必要”な層
- Positioning：高機能SaaSではなく「提出PDFを最短で作る軽量ツール」

### 11-4. 4P分析
- Product：A4/Letter縦提出、コメント、写真（欠けない）、OS保存、バックアップ
- Price：$1.99 / $19.99 / $39.99
- Place：App Store / Google Play（18言語ASO）
- Promotion：PDF例のスクショ＋無料プレビューで価値体験

### 11-5. 5フォース（簡易）
- 代替品が強い → 体験の速さ・簡単さで勝つ
- 乗り換えが簡単 → 品質（出力成功率）を最優先で守る

---

## 12. Mobbinで参考にするアプリ（見るべき画面）
**“提出”と“手帳タイムライン”の両方を参考にするのがコツです。**

- 日記/フォトログ（Day One / Journey / Google Photos）
  - **タイムラインの見返し**、日付区切り、検索、ピン留め、空状態（初回の教育）
- Notes系（Apple Notes / Google Keep / Notion）
  - 一覧→詳細→編集、**検索/フィルタ**、並べ替え、メタ情報の見せ方
- スキャン/提出系（Adobe Scan / Microsoft Lens）
  - 取り込み→プレビュー→PDF書き出し、共有/保存の導線
- 現場検査/建設系（SafetyCulture / Fieldwire / Procore / Raken など）
  - 写真添付UI、レポートの“提出体験”、履歴（ログ）と出力導線の両立

---

# 付録A：PDF仕様（実装が迷わない最終案）
## A-1. 用紙・形式
- 用紙：A4/Letter（縦、初期はA4）
- 日付：`YYYY-MM-DD HH:mm`（端末ローカル）
- ファイル名：
  - レポート名あり：`YYYYMMDD_HHMM_<ReportName>_Repolog.pdf`
  - レポート名なし：`YYYYMMDD_HHMM_Repolog.pdf`

## A-2. ページ構成
- 1ページ目：表紙（Cover）
  - Title：翻訳（例：Repolog Report）
  - レポート名：ユーザー入力（翻訳不要）
  - 作成日時：端末ローカル
  - 住所：逆ジオコーディングで初期入力（端末言語）。取得不可は `-`
  - 位置：`Lat/Lng: 35.68950, 139.69170`（小数5桁に丸め。取得不可は `-`）
  - 天気：翻訳文字列（例：晴れ / Rain）
  - 写真枚数：翻訳（例：50 photos）
  - ページ数：翻訳（例：27 pages）
  - Free透かし：表紙のみ、右下に薄く `Created by Repolog`
- 2ページ目〜：コメントページ（Comment）
  - コメントのみ（長文なら複数ページは許容）
- コメント終了後：写真ページ
  - 標準：1ページ2枚（上下）
  - 大きく：1ページ1枚
  - 写真はcontain、切り抜き禁止、枠からはみ出さない
  - 付与情報：極小で `Photo 12`、下部に `3/27` のような総ページ付き

---

# 付録B：PDF HTMLテンプレ（A4/Letter・縦）
## B-1. HTML（そのまま実装に貼れる形）
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

## B-2. CSS
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

/* タイトルは中央（ここは“世界的にも違和感が少ない”） */
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

# 付録C：実装方針（Expo / React Native）
- PDF生成：`expo-print` の `printToFileAsync({ html })`
- 保存先選択：
  - Android：Storage Access Framework（Expo FileSystemのSAF経由）
  - iOS：共有シート（Save to Filesをユーザーが選択）
- アルバム追加：`expo-image-picker` / `expo-media-library`

---

# 付録D：検証コマンド（最小）※後でdocs/how-toへ分離推奨
- `expo start`（`npm run dev` / `npm run start`）：開発サーバ起動
- `expo run:android`：Androidビルドして起動
- `expo run:ios`：iOSビルドして起動
- `expo prebuild`：ネイティブプロジェクト生成
- `tsc --noEmit`（`npm run type-check`）：型チェックのみ
- `eslint .`（`npm run lint`）：Lintチェック

---

## 参考資料（一次情報中心）
- Expo Print: https://docs.expo.dev/versions/latest/sdk/print/
- Expo FileSystem: https://docs.expo.dev/versions/latest/sdk/filesystem/
- Expo Sharing: https://docs.expo.dev/versions/latest/sdk/sharing/
- Expo ImagePicker: https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Expo MediaLibrary: https://docs.expo.dev/versions/latest/sdk/media-library/
- Expo Location（位置情報/逆ジオコーディング）: https://docs.expo.dev/versions/latest/sdk/location/
- Expo Localization（端末言語取得）: https://docs.expo.dev/versions/latest/sdk/localization/
- Android Storage（SAF / Scoped Storage）: https://developer.android.com/training/data-storage/shared/documents-files
- MDN（CSS Paged Media / @page）: https://developer.mozilla.org/en-US/docs/Web/CSS/@page
- MDN（object-fit: contain）: https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
- SafetyCulture（PDF/Word出力の説明例、価格ページ例）: https://help.safetyculture.com/  / https://www.safetyculture.com/pricing/


# 付録E：画面設計図（テキスト・ワイヤーフレーム）※Figma化前の叩き台
> 目的：実装者/デザイナー/現場ユーザーが “同じ絵” を見られるようにする。  
> 表現：モノクロの箱（レイアウト）＋最低限の文言のみ。

---

## E-0. 画面一覧（IA）
1. Home（レポート一覧）
2. Report Editor（レポート編集：メタ＋コメント＋写真管理）
3. Photo Sort（写真並び替え：全画面/専用）
4. PDF Preview（レイアウト選択＋プレビュー＋出力）
5. Settings（位置情報ON/OFF、言語、プラン、バックアップ）
6. Backup（エクスポート/インポート）

---

## E-1. Home（レポート一覧）
**狙い：提出が無い日でも“見返す理由”がある Home**
- Homeは「提出の入口」ではなく **“手帳みたいに見返す棚”**（ログブック）
- 片手操作・屋外・手袋を想定 → タップターゲット大きめ／操作は最小
- 迷子防止 → **日付区切り + 総量が分かる**（週・月のまとまり）

**ワイヤー（手帳タイムライン案）**
- [AppBar] Repolog   (右：🔍 検索 / ⚙ Settings)
- [フィルタChip] すべて｜ピン留め｜今週｜レポート名（選択）
- [タイムラインリスト]
  - **日付ヘッダ**：2026-01-22（Thu）
  - **行（1レポート）**
    - 左：縦ドット＋細い線（タイムライン軸）
    - 中：小サムネ（先頭写真）  □  （無い場合はプレースホルダ）
    - 右：情報ブロック
      - Title: レポート名: 横浜第3ビル
      - Sub: 15:30 / Photos 12 / Pages 7（PDF出力済みならバッジ）
      - 右端：⋯（複製/削除）
      - 角：📌（ピン留め）
- [FAB] ＋ 新規レポート

**タイムラインアイコン案（Homeタブ等に使う）**
- “縦ドット（時系列）＋小さな写真枠” ＝ **スクロールで見返す手帳体験** を直感で伝える
- 既存アイコンで代用するなら：**timeline / history / view_agenda** 系（最終はブランドに合わせて自作推奨）

**推奨（あると強い）**
- 空状態：イラスト＋「＋で新規作成」＋「サンプルPDFを見る」（教育）
- “最近使った現場”が上に来る並び（デフォ）
- レポート詳細へ入らずに把握できる“軽い情報”（写真数・作成日時・ピン）だけ出す

---

## E-2. Report Editor（レポート編集：メタ＋コメント＋写真管理）
**PM視点：**
- ここが「価値の中心」。入力は最小、写真管理は強い。

**ワイヤー（スクロール1画面に収めるが、セクション分け）**
- [AppBar] レポート名: 横浜第3ビル   (右：PDF)
- [Section: 基本情報]
  - レポート名入力（必須）
  - 作成日時（自動、編集不可 or 任意）
  - 位置情報：ON/OFF（トグル）  ※OFFなら権限要求しない／ON時は初回自動取得
  - 住所：自動入力（端末言語）＋編集可／再取得ボタン
  - 天気：☀️🌧️☁️❄️（選択、PDFは翻訳文字列）
- [Section: コメント]
  - Multiline TextArea（残り文字数カウンタ：4000）
  - 例：「作業内容、異常、注意点…」
- [Section: 写真]
  - 2列グリッド（サムネ）
  - 各サムネ：右上に小さい×（削除）
  - [ボタン群]
    - 📷 撮影（Camera）
    - 🖼️ アルバム（Album）
    - ↕ 並び替え（Reorder）
- [下部固定（任意）]
  - 「保存」表示は不要（オート保存前提）。必要なら「保存済み」トースト。

**画像追加（アルバム）**
- OSのピッカーを開く（複数選択）
- 取り込み直後に縮小版生成（PDF用）

---

## E-3. Photo Sort（写真並び替え）
**現場ユーザー視点：**
- 直感で順番を変えたい（“前後関係”は報告に重要）
- ミスったら戻したい（Undo）

**ワイヤー**
- [AppBar] 写真の順番   (左：戻る / 右：完了)
- [グリッド] 3列 or 2列（端末幅で変える）
  - 長押しドラッグで移動
- [下部] Undo（直前の移動を戻す）

---

## E-4. PDF Preview（レイアウト選択＋プレビュー＋出力）
**デザイナー視点：**
- “大きく（1枚）”の良さを体感させる → 出力時に自然にProへ。

**ワイヤー**
- [AppBar] PDFプレビュー
- [Layout セグメント]
  - 標準（2枚） | 大きく（1枚）
- [プレビュー領域]
  - ページサムネ（横スワイプ or 縦スクロール）
- [下部固定ボタン]
  - 「PDFを出力」

**Freeで“大きく”選択中に出力**
- モーダル
  - タイトル：このレイアウトはPro限定です
  - 本文：標準（2枚）なら無料で出力できます
  - ボタンA：標準（2枚）で出力する
  - ボタンB：Proにアップグレード

**50枚超えで出力**
- モーダル
  - タイトル：写真枚数が多いです
  - 本文：50枚を超えています。PDF作成に数分かかる場合があります。続けますか？
  - ボタンA：作成する
  - ボタンB：戻る

---

## E-5. Settings（設定）
**法務/プライバシー視点：**
- 位置情報の扱いを“自分で選べる”のが安全。

**ワイヤー**
- [AppBar] 設定
- [セクション：一般]
  - 言語（Language）
  - 位置情報をPDFに含める（ON/OFF／ON時はレポート作成で初回自動取得）
- [セクション：プラン]
  - 現在のプラン表示
  - アップグレード（Pro）
  - 購入を復元（Restore）
- [セクション：バックアップ]
  - エクスポート
  - インポート
- [セクション：その他]
  - お問い合わせ
  - 利用規約 / プライバシーポリシー

---

## E-6. Backup（エクスポート/インポート）
**実装者視点：**
- 形式を固定して、将来も壊れない。

**エクスポート**
- `manifest.json` + `photos/` をZIP化（推奨）
- OSの保存先選択UIへ

**インポート**
- OSのファイル選択UIでZIP or manifest選択
- 取り込み後にサマリ表示（レポート数/写真数）


---

## 参考資料（一次情報・公式）
### 実装（Expo / React Native）
- Expo Print（HTML→PDF）：https://docs.expo.dev/versions/latest/sdk/print/
- Expo FileSystem（Android SAF含む）：https://docs.expo.dev/versions/latest/sdk/filesystem/
- Expo DocumentPicker（バックアップの読み込み等）：https://docs.expo.dev/versions/latest/sdk/document-picker/
- Expo ImagePicker（アルバムから追加）：https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Expo Location（位置情報/逆ジオコーディング）：https://docs.expo.dev/versions/latest/sdk/location/
- Expo Localization（端末言語）：https://docs.expo.dev/versions/latest/sdk/localization/

### PDF（CSS）
- MDN `@page`（用紙サイズ指定）：https://developer.mozilla.org/en-US/docs/Web/CSS/@page
- CSS Paged Media（仕様）：https://www.w3.org/TR/css-page-3/
- MDN `object-fit`（画像の欠け防止）：https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit

### OSの「保存先選択」一次情報
- Android：Storage Access Framework / Documents and other files：https://developer.android.com/training/data-storage/shared/documents-files
- Apple：UIDocumentPickerViewController（Filesへ書き出し）：https://developer.apple.com/documentation/uikit/uidocumentpickerviewcontroller

### UX参考（“手帳タイムライン”）
- Day One（Timeline/Photo/Map等の機能紹介）：https://dayoneapp.com/guides/features/
- Raken（現場向けレポート/写真報告の例）：https://www.rakenapp.com/
