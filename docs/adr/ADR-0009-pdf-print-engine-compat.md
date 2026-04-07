# ADR-0009: PDF 印刷エンジン互換性方針 — `.page` を `@page` より微小に小さくする防衛的設計

- Status: Accepted
- Date: 2026-04-07
- Deciders: @doooooraku
- Related: Issue #286 / `src/features/pdf/pdfTemplate.ts` / `docs/reference/pdf_template.md` / `__tests__/pdfTemplate.test.ts` / `docs/reference/lessons.md`

---

## Context（背景：いま何に困っている？）

Repolog は `expo-print` の `Print.printToFileAsync` を使い、HTML+CSS テンプレートを WebView 印刷エンジンにレンダリングして PDF を生成する。テンプレートでは A4/Letter 縦の用紙サイズに合わせて、各ページを `<section class="page">` で表現し、`.page` に明示的な `height: var(--page-h)`（= 297mm or 279mm）を指定して 1 セクション = 1 PDF ページの 1:1 マッピングを取っている。

2026-04-07 にユーザーから「iOS で出力された PDF の写真ページ直後に空白ページが挿入される」というバグが報告された（#286）。実体 PDF を 5 ファイル全て確認したところ:

| OS / レイアウト | 写真 | 期待ページ数 | 実体ページ数 |
|---|---|---|---|
| Android 標準 | 5枚 | 4 | 4 ✅ |
| Android コメント | 5枚 | 6 | 6 ✅ |
| iOS 標準 | 2枚 | 2 | **3** ❌ |
| iOS コメント | 1枚 | 2 | **3** ❌ |
| iOS コメント | 2枚 | 3 | **5** ❌ |

iOS の余分な空白ページには `<footer class="page-footer">` の `X/Y` ページ番号文字列だけが描画されており、本来 flex 末尾にあるべきフッターが次の PDF ページに押し出されていることが判明した。表紙・コメント分割ページでは発生せず、**写真ページでだけ**発生していた。

### 困りごと

- iOS ユーザー全員に対して常時発生する見た目バグ（紙の浪費・取引先への体裁不良）
- 表紙の「ページ数」表示と実体 PDF ページ数が乖離（信頼性を損なう）
- PR #285 で導入したばかりの「PDF 出力成功直後にレビュー依頼を表示」(ADR-0012) と最悪のタイミングで衝突

### 制約/前提

- `expo-print` の WebView 印刷エンジンは iOS=WKWebView+UIPrintPageRenderer / Android=Chromium ベース。両者の subpixel 丸め吸収挙動は異なる
- 実 PDF を CI で生成して検証する仕組みは macOS + 実機/シミュ必須のため運用上難しい
- PDF テンプレートは `docs/reference/pdf_template.md` を Single Source of Truth (SSoT) として `src/features/pdf/pdfTemplate.ts` に実装している
- フッターを下端固定するためフレックスカラム + 親の明示的高さ指定が必要

### 根本原因（技術詳細）

`.page` の高さが `@page` サイズと完全一致しており、`.photo-grid { height: 100% }` が `.page-main` を埋め尽くすため、`.page-inner` 内の flex 配分にサブピクセル丸めを吸収するスラックがゼロ。

```
.page (height: 297mm, padding: 12mm box-border) → .page-inner (height: 273mm)
  ├─ .page-main (flex: 1) — .photo-grid {height:100%} で完全に埋まる
  ├─ gap: 6mm
  └─ .page-footer (height: 10mm + padding-top: 2mm + border-top: 1px = 12.265mm)

273mm を CSS px へ変換すると約 1031.81 px (273 × 3.7795)。
各要素の整数 px 丸めで累積誤差が +0.2〜+0.5 px 発生し得る。
iOS WebKit はこの 0.5px overflow を「次ページに送る」と判定し、
flex 末尾の .page-footer 単体を新ページに押し出す。
Android Chromium は同じ overflow を吸収して同一ページに収める。
```

---

## Decision（決めたこと：結論）

- **決定**: PDF テンプレートの `.page` の高さを `@page` のサイズより常に微小（1mm）に小さく設定し、加えて `.page-footer` に `box-sizing: border-box` を強制することで、印刷エンジンの subpixel 丸め誤差を吸収する物理的なスラックを 3.265mm 確保する。
- **適用範囲**: PDF 生成全レイアウト（standard / large）× 全用紙サイズ（A4 / Letter）× 全表示モード（preview / 本生成 / OOM フォールバック含む）

具体的な CSS:

```css
.page {
  width: var(--page-w);
  height: calc(var(--page-h) - 1mm);  /* 1mm のスラック */
  box-sizing: border-box;
  padding: var(--page-pad);
  ...
}

.page-footer {
  height: var(--footer-h);
  box-sizing: border-box;  /* 外形高を 10mm に固定し追加 2.265mm のスラック */
  ...
}
```

---

## Decision Drivers（判断の軸）

1. **クロスエンジン安定性**: iOS WebKit / Android Chromium 両方の境界条件で同じ HTML が同じページ数になることを保証する
2. **保守コスト**: CSS の最小修正で済み、HTML 構造・JS ロジック・依存追加が不要
3. **検出可能性**: 修正後も同様のリグレッションを CI で検出できる仕組みを併設する
4. **デザイン一貫性**: 紙面上の視覚的変化が視認不能（0.5mm 未満のずれ）であること
5. **将来拡張耐性**: 写真ページに新しい要素（キャプションサイズ変更等）を追加してもスラックが余裕を持って吸収する

---

## Alternatives considered（他の案と却下理由）

### Option A: `page-break-after` / `break-after` 宣言を片方だけに統一
- **概要**: `.page` の二重宣言（`break-after: page` と `page-break-after: always`）を `page-break-after: always` のみに減らす
- **良い点**: CSS が綺麗になる
- **悪い点**: subpixel 丸めの根本問題は残る。iOS WebKit と Android Chromium の挙動差は破棄宣言の数では解決しない
- **却下理由**: 実体 PDF で確認した「footer overflow」の物理的原因に対処できない

### Option B: `.page` から explicit `height` を撤廃し、フッターを `position: absolute` に
- **概要**: `.page` の `height` を削除、`@page` のサイズだけに任せる。`.page-footer` を `position: absolute; bottom: ...` で底に貼る
- **良い点**: 高さ計算自体が不要になり、subpixel 問題が消える
- **悪い点**: CSS 全体の構造改変が必要。`.page-inner` の flex column 構成を捨てる必要があり、コメント本文の動的高さ・写真グリッドのレスポンシブ高さの再設計が必要。リグレッションリスクが大きい
- **却下理由**: スコープ過大。同じ効果を最小修正で達成できる

### Option C: 後加工で空白ページを削除（pdf-lib 等）
- **概要**: `expo-print` で生成後、`pdf-lib` で空白ページを検出して削除する
- **良い点**: HTML/CSS を触らない
- **悪い点**: 新規依存追加・正常な短いページの誤検知リスク・パフォーマンス劣化・「対症療法」で根本原因が残る
- **却下理由**: 技術的負債を増やす

### Option D: テンプレ全面書き換え（単一フロー + `break-before: page`）
- **概要**: `<section class="page">` を全廃し、表紙・コメント・写真をすべて単一フローで流し、CSS の `break-before: page` でセクションごとに改ページ
- **良い点**: 長期的に最も綺麗
- **悪い点**: 全面書き換え。フッターを `@page { @bottom-right { content: counter(page) } }` で実装する必要があるが、`expo-print` の WebKit 印刷エンジンが CSS Paged Media の `@page` 内 margin-box を完全サポートしているか不明
- **却下理由**: スコープ過大、検証コスト過大

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）

- iOS で生成された PDF の構造が Android と完全一致する
- 表紙の「ページ数」表示と実体 PDF ページ数が乖離しない
- 写真ページに新しい要素（より大きな `photo-no` / 多行 caption / アイコン等）を追加しても、3.265mm のスラックが吸収する余裕がある
- ユニットテスト (`__tests__/pdfTemplate.test.ts`) で構造不変条件が CI に固定され、将来 CSS をいじってもリグレッションを検出できる
- lessons.md に経緯が残るので、別の Claude/開発者が同じ罠を踏まない

### Negative（辛い/副作用）

- フッター位置が紙面で約 0.5mm 上にずれる（視認不能）
- フッター内側の「ページ番号」テキストが約 2.265mm 上に移動（視認不能）
- 実 PDF レベルでの自動検証（CI で iOS 実機 PDF を生成して空白ページ数をカウントする等）は依然として存在しない。HTML 構造レベルの検証が CI のセーフティネット

### Follow-ups（後でやる宿題）

- [ ] 次回 SDK 54→55 アップグレード時に、`expo-print` / `expo-file-system` のメジャーバージョン変更に伴う CSS 印刷挙動のリグレッションがないか実機確認する
- [ ] iOS 実機での PDF 検証手順を `docs/how-to/testing/testing.md` に追記する（オプション）
- [ ] Android 実機 (Pixel 8a) で本修正後の PDF を再生成し、フッター位置のずれが視認不能であることを目視確認する

---

## Acceptance / Tests（合否：テストに寄せる）

- **正（自動テスト）**:
  - Jest: `__tests__/pdfTemplate.test.ts` の全ケースが green
    - 2 layouts × 2 papers × 6 photo counts × 4 comment lengths = 96 ケース
    - 各ケースで `<section class="page"` の出現数 = `calculatePageCount(comment, photoCount, layout)` を assertion
  - CI ジョブ: `.github/workflows/ci.yml` の `pnpm test` ステップ
- **手動チェック**（次回リリース前）:
  - 手順:
    1. iOS 実機（doooooraku の TestFlight）で写真2枚 / standard レイアウトの PDF を生成
    2. iOS 標準 Files アプリ or PDF ビューアでページ数を確認
    3. 同条件で大写真1枚 / large レイアウトの PDF も生成・確認
    4. Android (Pixel 8a) で同じ条件を生成し、差分がないことを確認
  - 期待結果: iOS / Android 両方で表紙の「ページ数」表示と実体 PDF ページ数が一致

---

## Rollout / Rollback（出し方/戻し方）

- **リリース手順への影響**: なし。CSS のみの変更で依存・ストア申請メタデータに影響しない
- **ロールバック方針**: `git revert <merge_commit>` → push → 自動 CI 通過後 main に直マージ。CSS 修正のみなのでロールバックも安全
- **検知方法**:
  - CI: `__tests__/pdfTemplate.test.ts` が fail すれば `<section class="page"` 数 と `calculatePageCount` のずれを即検出
  - ユーザー報告: 次回 iOS リリース後、再び「空白ページが入る」報告があれば 1mm を 2mm に増やす follow-up

---

## Links（関連リンク：正へ寄せる）

- constraints: `docs/reference/constraints.md`
- reference: `docs/reference/pdf_template.md`（SSoT）
- lessons: `docs/reference/lessons.md`（PDF生成 > 2026-04-07）
- Issue: #286
- PR: （マージ後に追記）
- 関連 ADR: ADR-0002 (PDF フォント), ADR-0011 (レイアウト無料開放)
- package.json: `expo-print@~15.0.8`
- CI: `.github/workflows/ci.yml`
- 実装: `src/features/pdf/pdfTemplate.ts:buildCss()`
- テスト: `__tests__/pdfTemplate.test.ts`

---

## Notes（メモ：任意）

- 本 ADR の番号 0009 は欠番だった枠を埋めるもの。前後の ADR-0008 (UMP), ADR-0010 (iOS暗号化) とは独立した意思決定
- 「3.265mm のスラック」の内訳:
  - `.page` 高さ -1mm = 1mm（`.page-inner` レベルのスラック）
  - `.page-footer` の outer height: 12.265mm → 10mm = 2.265mm（`.page-main` レベルのスラック）
- subpixel 丸め誤差の理論最大値は CSS px 単位で 1〜2 px 程度（mm 換算で 0.5mm 未満）なので、3.265mm のスラックは 6 倍以上の安全マージンを確保している
