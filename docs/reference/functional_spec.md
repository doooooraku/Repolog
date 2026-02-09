# Repolog 機能設計書（functional_spec.md）

- 対象アプリ：**Repolog**
- 版：v0.1（MVP〜v1.0想定）
- 更新日：2026-01-24（JST）
- 前提：React Native（Expo想定） / 19言語対応 / 端末ローカル完結（サーバーなし）

---

## 0. この文書の目的

この文書は、Repolog を **「迷わず実装できる粒度」**まで機能仕様へ落とし込むための設計書です。  
「画面で何ができるか」「押したら何が起きるか」「制限・例外・エラー時はどうするか」を、実装とQAが同じ解釈で進められるように定義します。

- 参照元：添付テンプレの構成をベースに再構成（機能ID・UI・DoDの考え方など）  
- 参照すべき上位文書：product_strategy.md / basic_spec.md

## 対応言語（固定・19言語）
en（英語） / ja（日本語） / fr（フランス語） / es（スペイン語） / de（ドイツ語） / it（イタリア語） / pt（ポルトガル語） / ru（ロシア語） / zh-Hans（中国語・簡体字） / zh-Hant（中国語・繁体字） / ko（韓国語） / th（タイ語） / id（インドネシア語） / vi（ベトナム語） / hi（ヒンディー語） / tr（トルコ語） / nl（オランダ語） / pl（ポーランド語） / sv（スウェーデン語）

---

## 1. 用語（超重要：言葉のズレを防ぐ）

- **レポート（Report）**：1回の記録の単位。写真（複数）＋メタ情報＋コメントを束ねたもの。
- **写真（Photo）**：レポートに紐づく画像。順番（order）を持つ。
- **表紙（Cover）**：PDF 1ページ目。提出に強い要約ページ。
- **標準レイアウト（Standard）**：PDF写真ページが「1ページ2枚（上下2段）」。
- **大きく（Large）**：PDF写真ページが「1ページ1枚」。**Proのみ出力**（Freeはプレビューのみ可）。
- **PDFプレビュー**：PDFを生成して画面で確認すること（保存はしない）。
- **PDF出力（エクスポート）**：OSの保存先選択UIを開き、ユーザーが保存先を選んで保存すること。
- **ピン留め（Pinned）**：重要レポートを先頭に固定して探しやすくする機能。
- **Free/Pro**：課金プラン。Freeは広告あり・機能制限あり。Proは制限解除＋広告なし。

---

## 2. 目的ユーザーと「痛み（課題）」の再確認

### 2.1 主要ターゲット（入口が尖る）
- 現場／点検／保全／検品などで **写真を“証拠”として残す必要がある人**
- 例：一人親方、設備点検、工務店、原状回復、納品前検品、工場保全、消防点検

### 2.2 痛み（何がつらい？）
- カメラロールに埋もれて **後で見つからない**
- 「いつ・どこ・どの現場」の説明が必要なのに **毎回入力が面倒**
- 提出用の体裁（PDF）に整えるのが **手間**
- 提出がなくても「見返す理由」が弱いと **継続しない**

### 2.3 Repologが解決する（どうラクにする？）
- 撮影直後に **入力欄がほぼ埋まっている**（時刻／レポート名（前回）／天気／位置）
- Homeのタイムラインで **手帳みたいに**見返せる（提出が無い日でも価値）
- 重要レポートは **ピン留め**して即アクセス
- PDFは **A4/Letterで崩れない**・提出に強い（表紙＋コメント＋写真）

---

## 3. プラン仕様（課金・制限ポイント：揉めないための定義）

### 3.1 価格（USD）
- Free：基本機能（広告あり）
- 月額：$1.99
- 年額：$19.99（約2ヶ月分お得）
- 買い切り：$39.99

### 3.2 Freeの制限（MVP採用）
- 1レポート **10枚まで**
- PDF出力 **月5回まで**
- PDFプレビュー：**無制限**
- 透かし：**表紙のみ**（右下に薄く `Created by Repolog`）

### 3.3 Proの価値（ユーザーが即理解できる言い方）
- 写真：無制限
- PDF：無制限
- PDFレイアウト：**大きく（1枚）出力可能**
- 表紙テンプレ／表紙のロゴ／透かしOFF（将来の拡張項目）
- 広告なし
- （将来）テンプレ入力・表紙プリセット・会社ロゴなどを追加して「Proの伸びしろ」にする

### 3.4 課金導線（必ず“逃げ道”を用意）
- Freeで「大きく」を選んで **出力しようとした時**
  - モーダル：`このレイアウトはPro限定です。`
  - ボタンA：`標準（2枚）で出力する`（親切）
  - ボタンB：`Proにアップグレード`（課金画面）
- Freeで **10枚を超えて追加**しようとした時
  - モーダル：`Freeは1レポート10枚までです。`
  - ボタンA：`削除して続ける`
  - ボタンB：`Proにアップグレード`
- Freeで **月5回のPDF出力上限**に達した時
  - モーダル：`今月のPDF出力上限に達しました。`
  - ボタンA：`プレビューだけする`（継続導線）
  - ボタンB：`Proにアップグレード`

---

## 4. 情報設計（画面構成と遷移）

> “迷わない”ことが最重要。画面数は増やさず、ボタンの意味を固定します。

### 4.1 画面一覧（最小）
- **S-01 Home（タイムライン）**
- **S-02 レポート作成（撮影）**
- **S-03 レポート編集（メタ情報・コメント・写真一覧）**
- **S-04 写真並べ替え／削除／追加（編集内サブ）**
- **S-05 PDFプレビュー**
- **S-06 課金（Paywall）**
- **S-07 設定（言語、位置情報ON/OFF、購入復元、バックアップ）**
- **S-08 バックアップ（エクスポート／インポート）**

### 4.2 主要導線
- Home → レポート作成（＋ボタン）
- Home → レポート詳細（カードタップ）→ 編集 → PDFプレビュー/出力
- Home → 検索／フィルタ → 絞って探す
- 設定 → 課金 → Pro
- 設定 → バックアップ → Export/Import

---

## 5. データ設計（ローカル完結）

### 5.1 保存場所
- DB：端末ローカルDB（SQLite等）にメタ情報（レポート、タグ、ピンなど）を保存
- 画像：アプリ管理領域にコピーして管理（元画像の削除や権限変更に耐える）
- PDF：**永続保存しない**（生成→保存先選択UI→ユーザー保存／アプリ側は一時ファイルを後で掃除）

### 5.2 データモデル（例）
#### Report
- id: string（UUID）
- createdAt: ISO string（端末ローカル）
- updatedAt: ISO string
- reportName: string（空可）
- weather: enum（sunny/rainy/cloudy/snowy/none）
- locationEnabledAtCreation: boolean（レポート作成時点のON/OFF）
- lat: number | null
- lng: number | null
- latLngCapturedAt: ISO string | null
- address: string | null
- addressSource: enum（auto/manual）
- addressLocale: string | null
- comment: string（最大4000文字）
- tags: string[]（複数）
- pinned: boolean
- photos: Photo[]（順序あり）

#### Photo
- id: string
- reportId: string
- localUri: string（アプリ領域）
- width/height: number（PDFレイアウト計算用）
- createdAt: ISO string（撮影時刻）
- order: number（0..n）

---

# F-01 レポート作成（撮影・アルバム追加）

## 目的
「撮る」行動を最短化し、撮影直後の入力コストを最小にする。

## 仕様
- 新規レポートは **撮影開始時に作る**（途中離脱でも下書きとして残る）
- 写真追加方法（MVP）
  1) カメラ撮影  
  2) 端末アルバムから追加（複数選択可）

## UI（超具体）

### 写真の削除・順番変更（編集内）
- 編集画面（S-03）に写真一覧（グリッド or リスト）を表示
- 各写真に操作：
  - 削除（ゴミ箱）
  - ドラッグ＆ドロップで並べ替え（order更新）
  - 追加（＋）→ カメラ or アルバム
- ルール：
  - 先頭写真（order=0）がHomeのサムネになる
  - PDFは order の順に並ぶ（証拠性のため“勝手に並べ替えない”）

- S-02（撮影）にボタン：
  - `撮影`（シャッター）
  - `アルバムから追加`
  - `次へ`（編集画面へ）

## 受け入れ条件（Acceptance Criteria）
- [ ] 撮影すると写真がレポートに追加され、編集画面へ遷移できる
- [ ] アルバムから複数枚を選び、レポートに追加できる
- [ ] Freeは 10枚を超えて追加できない（超える場合は課金モーダル）
- [ ] Proは無制限に追加できる（ただし後述の>50警告は出力時）

---

# F-02 レポート編集（メタ情報・コメント・タグ・位置・天気）

## 目的
提出に必要な情報を「迷わず」埋められる。自動入力→必要なら編集。

## 自動入力（撮影直後に埋める）
- 作成日時：端末ローカル `YYYY-MM-DD HH:mm`
- レポート名：**前回入力値を自動セット**（編集可）
- 天気：アイコンで手動（☀️🌧️☁️❄️ + none）
- 位置（Lat/Lng）：ONの時のみ **1発目を自動取得** し、PDFに載せる
- 住所：Lat/Lng 取得後に **端末言語で逆ジオコーディング** し初期入力（編集可）

## 位置情報 ON/OFF（プライバシー）
- 設定に `位置情報をPDFに含める` トグルを用意
  - OFF：位置権限を要求しない／レポートのLat/Lngは null／PDFは `-`
  - ON：許可がある時だけ取得。取得失敗時も `-`
  - ON時はレポート作成時に **初回のみ自動取得**（以後はユーザーの再取得操作）
- 表記は10進数、小数点以下5桁に丸め
  - 例：`35.68950, 139.69170`
  - 取得できない場合：`-`

## 住所（位置連動）
- Lat/Lng 取得後に逆ジオコーディングし、住所欄へ初期入力
- **ユーザー編集を許可**（自動入力は“下書き”扱い）
- 取得できない場合：`-`

## コメント
- 複数行OK／絵文字OK
- 最大4000文字（超えたら入力を止める）
- 文字数カウントは **Array.from** を推奨（絵文字ズレ事故を減らす）

## タグ
- 複数タグ（文字列）
- 入力支援：最近使ったタグの候補表示

## 受け入れ条件
- [ ] レポート名が前回値で埋まり、ユーザーが編集できる
- [ ] 天気が4種+なしから選べる（PDFには翻訳文字列で出る）
- [ ] コメント4000文字で入力が止まる（残り文字数表示）
- [ ] 位置情報がOFFなら権限要求なし＆PDFは `-`
- [ ] 位置情報ONでも取得できない場合は `-`
- [ ] 位置情報ONの初回でLat/Lngが自動取得される
- [ ] 住所が自動入力され、ユーザーが編集できる

---

# F-03 Home（タイムライン：手帳体験）

## 目的
提出がない日でも「見返す理由」がある。継続動機になる。

## 表示
- 日付グルーピング（例：2026-01-24）
- レポートカード内容（最小）
  - 先頭写真サムネ（1枚）
  - レポート名（空なら `—`）
  - 作成日時（HH:mm）
  - 天気（アイコン）
  - ピン留め状態

## 操作
- カードタップ：レポート詳細（編集）へ
- 長押し or スワイプ：
  - ピン留め/解除
  - 削除（確認ダイアログ必須）

## 受け入れ条件
- [ ] タイムラインが縦スクロールで見返せる
- [ ] ピン留めはHome上部に固定表示（“探すコスト”を減らす）
- [ ] 削除は取り消し不能のため確認が必須

---

# F-04 検索・フィルタ（見つける機能）

## 目的
「大量に溜まっても探せる」ことが価値。提出の直前に効く。

## 検索（全文）
- 対象：レポート名 / コメント / タグ
- 方式：前方一致＋部分一致（実装はDB依存）

## フィルタ
- 期間（from/to）
- レポート名（候補から選ぶ＋検索入力）
- タグ（複数）
- ピン留めのみ

## 受け入れ条件
- [ ] レポート名/コメント/タグで検索できる
- [ ] 期間/レポート名/タグで絞り込める
- [ ] 条件を複数組み合わせても破綻しない

---

# F-05 PDFプレビュー & 出力（A4/Letter / 崩れない / 世界向け）

## 目的
「そのまま提出できる」PDFを、誰でも迷わず作れる。

## PDFの基本ルール（あなたの決定）
- 用紙：A4 / Letter（縦）
- 用紙サイズはタブで切り替え（A4が初期表示）
- 選択した用紙サイズがプレビューと出力に反映される
- 画像：**比率維持＋contain**（切り抜き禁止）
- 画像が大きい：枠に収まるよう縮小、余白は白
- ページ構成：
  1) 表紙（Cover）
  2) コメントページ（コメントのみ。長ければ複数ページ）
  3) 写真ページ（写真のみ＋ページ番号＋Photo番号）
- レイアウト：
  - 標準：1ページ2写真（上下2段）
  - 大きく：1ページ1写真（Pro出力のみ／Freeはプレビュー可）
- ページ番号：`3/27` のように総ページ付き
- 写真番号：`Photo 12` を極小で隅に（会話で指しやすい）

## 表紙（必須項目）
- タイトル：`Repolog Report`（翻訳して表示）
- レポート名：ユーザー入力（翻訳不要）
- 作成日時：`YYYY-MM-DD HH:mm`
- 住所：逆ジオコーディング（端末言語）。取得できなければ `-`
- 位置：`Lat/Lng: 35.68950, 139.69170`（小数点以下5桁。取得できなければ `-`）
- 天気：翻訳文字列（例：晴れ / Rain）
- 写真枚数：`50 photos`（翻訳）
- ページ数：`27 pages`（翻訳）
- Free透かし：右下に薄く `Created by Repolog`（表紙のみ）

## コメントページ
- コメント欄のみ（翻訳ラベルは任意）
- コメントが長くてページを跨ぐのは許容
- セクション切れ（途中で切れる）の回避は努力するが、コメントは例外扱い

## 写真ページ
- 写真以外の情報は載せない（ページ番号・Photo番号のみ）
- 写真は欠けないことが最優先（contain）

## 50枚超え警告（出力時）
- 条件：写真が50枚を超え、ユーザーがPDF出力を押した時
- モーダル：
  - タイトル：`写真枚数が多いです`
  - 本文：`50枚を超えています。PDF作成に数分かかる場合があります。続けますか？`
  - ボタンA：`作成する（Generate）`
  - ボタンB：`戻る（Back）`（“キャンセル”より誤解が減る）


## PDF出力回数カウンタ（Free：月5回）
- 方式：`exportedAt` の履歴（または当月カウンタ）をローカルDBに保存
- 判定：端末ローカルの年月（例：2026-01）で集計
- リセット：月が変わったら自動で当月分を0扱い（ユーザー操作不要）
- タイムゾーン：端末ローカル基準（あなたの決定）

## Free/Pro とプレビューのUX（CVR狙い）
- プレビュー画面：
  - Freeでも `大きく（1枚）` を選択してプレビューできる
- 出力ボタン押下時：
  - Freeで `大きく` 選択なら、Pro誘導モーダル
    - `標準（2枚）で出力する` / `Proにアップグレード`

## 保存フロー（モーダル不要：あなたの決定）

## ローディング表示（必要な時だけ）
- PDF生成が **500msを超えそう**な場合のみ、画面中央に
  - スピナー（ぐるぐる）
  - テキスト：`PDFを作成中...`（翻訳）
- 500ms以内に終わるなら、チラつきを避けるため表示しない（体験が良くなる）

## 保存フロー（モーダル不要：あなたの決定）
- 出力ボタン → 生成（必要ならローディング） → **OSの保存先選択UI**
- 「保存完了」モーダルは出さない
  - 保存先選択UIが出た時点でユーザーは完了を理解できる

## ファイル名（あなたの決定）
- レポート名あり：`YYYYMMDD_HHMM_<ReportName>_Repolog.pdf`
- レポート名なし：`YYYYMMDD_HHMM_Repolog.pdf`
- ルール（安全のため）
  - 禁止文字（/ \ : * ? " < > |）は `_` に置換
  - 連続スペースは `_` に置換
  - 先頭末尾の空白はトリム
  - 長すぎる場合は ReportName を最大30文字に丸める（末尾 `…` はファイル名的に避け、単純切り捨て）


## PDF HTMLテンプレ（MVP：A4/Letterで崩れない最小構成）

> 方針：**HTML/CSSでA4/Letterを定義**し、画像は `object-fit: contain;` で「欠けない」ことを保証する。  
> 画像は「切り抜かない」「はみ出さない」「比率維持」。余白は白でOK。

### 1) HTML
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

### 2) CSS
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

### 3) 画像 src のルール（超重要）
- `{{photoSrc}}` は次のどちらかで渡す
  - `data:` URL（推奨）：`data:image/jpeg;base64,....`
  - `https:` URL（外部）
- 端末ローカルの `file://` は環境によって表示できないことがあるため、PDFでは **base64埋め込み**を基本にする

# F-06 収益化（課金・購入復元・広告）

## 課金
- サブスク（月/年）＋買い切り
- 購入復元（Restore Purchases）を設定に用意

## 広告
- Freeのみ表示
- Proは広告なし
- 表示位置（おすすめ）
  - Home：タイムラインの合間（頻度は控えめ）
  - 編集：基本は出さない（作業が止まると怒られやすい）

## 受け入れ条件
- [ ] Free/Proの権限が即時反映される（購入直後に制限解除）
- [ ] 復元ができる
- [ ] Proで広告が出ない

---

# F-07 バックアップ（Export / Import）

## 目的
端末紛失・機種変更でも「ユーザーが自分で守れる」。サーバー運用コストを持たない。

## 形式（あなたの方針）
- `manifest.json`
- `photos/`（写真ファイル群）
- PDFは含めない（再生成できるため）

## manifest.json 例（最低限＋安全のための追加）
- schemaVersion（将来互換）
- exportedAt（日時）
- appVersion（任意）
- reports（レポート一覧、各フィールド）
- photos（写真の並び順、ファイル名、width/height、createdAt）
- settings（位置情報ON/OFF、言語など最小限）
- tagHistory / reportNameHistory（入力支援の履歴。入れると復元時の体験が落ちない）

## 保存先
- PDF出力と同じく、OSのファイル選択仕組みを流用（ユーザーが保存先を選ぶ）
- Import は **append（追加）** を正とし、既存データを削除しない
- 競合時（同じ `report.id` / `photo.id`）は既存を優先し、重複側をスキップする

## 受け入れ条件
- [ ] Exportでzip（またはフォルダ）として保存できる
- [ ] Importで同じ状態を復元できる（並び順、ピン留め、タグも含む）
- [ ] schemaVersionが違う場合は丁寧なエラーを出す（壊さない）
- [ ] 同じバックアップを再Importしても重複登録しない（ID基準で冪等）
- [ ] Import失敗時は transaction rollback で既存データを壊さない

---

# F-08 設定（Settings）

- 言語：端末言語に追従（19言語）
- 位置情報をPDFに含める：ON/OFF
- 購入復元
- バックアップ：Export / Import
- 法的：プライバシーポリシー、利用規約

---

## 6. 多言語（19言語）設計の注意点（PDF含む）

### 6.1 翻訳対象（PDFの固定ラベル）
- Repolog Report / Report Name / Created / Address / Location / Lat/Lng / Weather / Photos / Pages / Created by Repolog / Photo
- 天気文字列（sunny/rainy/cloudy/snowy/none）

### 6.2 文字化け対策（重要）
- PDF（HTML）で使うフォントは **CJK対応**が必要
- 方針：
  - 可能なら **Noto Sans（CJK含む）**系を使う（ファイルサイズとの相談）
  - まずはOS標準フォントスタック（system-ui）で作り、CJKが崩れる端末が出たら調整

---

## 7. エラー設計（ユーザーに“次の手”を出す）

- 位置情報が取れない：`-` 表示（エラーで止めない）
- PDF生成に失敗：`PDFの作成に失敗しました。写真枚数を減らして再試行してください。`
- ストレージ権限/保存失敗：`保存先を選べませんでした。権限を確認してください。`
- バックアップ復元失敗：`バックアップ形式が違います（schemaVersion）。`

---

## 8. 実装メモ（Expo想定：必要ライブラリとコマンド例）

> ここは“実装の迷い”を減らすためのメモ。最終的な依存は別途 package.json に反映。

### 8.1 追加が必要になりやすいExpo SDK
- expo-print（HTML→PDF生成）
- expo-sharing（iOSで保存先選択を含む共有シート）
- expo-file-system（PDF一時保存・Androidで保存先選択の補助）
- expo-image-picker（アルバムから追加）
- expo-location（位置情報：ON時のみ）
- （任意）expo-ads-admob または Google Mobile Ads（広告）

### 8.2 コマンド（例）
```bash
npx expo install expo-print expo-sharing expo-file-system expo-image-picker expo-location
```
- `npx expo install ...`：いまのExpo SDKバージョンに合う依存関係でインストールするコマンド（互換事故を減らす）

```bash
npx expo start
```
- `expo start`：開発サーバー起動。端末のExpo Goやシミュレータから動作確認できる


---

## 10. レビュー＆反映ログ（多視点：反映済み）

- 現場運用者：`Photo番号`を追加 → 会話で指せるようにした（指示ミスが減る）
- QA：Free/Pro導線に“逃げ道”を必須化 → 怒られにくい課金設計
- デザイナー：PDFは情報を詰めすぎない → 写真ページは写真＋番号だけに固定
- セキュリティ：位置情報OFFなら権限要求しない → プライバシー事故を予防
- 運用（個人開発）：サーバー無しのバックアップを明文化 → OpExをゼロ近くに固定

---


## 11. 参考（一次情報）
- Expo Print（HTML→PDF）：https://docs.expo.dev/versions/latest/sdk/print/
- Expo Sharing（共有シート）：https://docs.expo.dev/versions/latest/sdk/sharing/
- Expo FileSystem（ファイル操作）：https://docs.expo.dev/versions/latest/sdk/filesystem/
- Expo ImagePicker（カメラ/アルバム）：https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Android Storage Access Framework：https://developer.android.com/training/data-storage/shared/documents-files
