# ADR-0017: PDF 写真ページ空白挿入の再発と SSoT 復元 — `.photo-no` を `.photo-frame` 内 absolute に戻す

- Status: Accepted
- Date: 2026-04-08
- Deciders: @doooooraku
- Related: ADR-0009 / `src/features/pdf/pdfTemplate.ts` / `__tests__/pdfTemplate.test.ts` / `docs/reference/pdf_template.md` / `docs/reference/lessons.md`

---

## Context（背景：いま何に困っている？）

ユーザーから 2026-04-08 に「iOS で出力した PDF の写真ページ直後に空白ページが入る」という報告を受けた。提供された 6 ファイル（iOS 18.6.2 で生成、producer=`iOS Version 18.6.2`）を PyMuPDF で構造解析した結果:

| PDF | 写真 | レイアウト | /Count | 期待 | 実体 | 余分 |
|---|---|---|---|---|---|---|
| FB4CEFBB | 1 | large | 3 | 2 | **3** | +1 |
| 1DBCADC4 | 1 | large | 3 | 2 | **3** | +1 |
| 28E952B2 | 1 | large | 3 | 2 | **3** | +1 |
| E8238A87 | 1 | large | 3 | 2 | **3** | +1 |
| 0AF75288 | 1 | large | 3 | 2 | **3** | +1 |
| 727934C1 | 70 | large | 141 | 71 | **141** | **+70** |

各空白ページのコンテンツを `page.get_text('dict')` で読むと、`<footer class="page-footer">` の `N/M` テキストだけがページ最上端 (y=4pt) に描画されており、本来あるべき写真ページの末尾フッターが次の物理ページに押し出されたと判明した。**ADR-0009 が修正したはずの "iOS WebKit subpixel フッター押し出し" 現象が再発している**。

### 困りごと

- iOS ユーザー全員 × 全レポート × 全写真ページに発生する致命的不具合
- Pro の `large` レイアウト（1 写真/ページ）では PDF ページ数が **2 倍** に膨らみ、取引先送信時に体裁崩壊
- 表紙の `pageCount` 表記（"71 ページ"）と実体ページ数（141）が完全乖離 → アプリの数値表示への信頼を毀損
- ADR-0012（PDF 出力直後のレビュー依頼）が「壊れた PDF」直後に発火する最悪 UX
- **ADR-0009 で「修正済み」とラベルされた既知不具合の再発** という意味で、ADR の信頼性そのものを損なう

### 制約/前提

- HTML / CSS の構造変更は ADR-0009 / ADR-0013 / ADR-0015 / ADR-0016 の防御層と整合する必要がある
- `expo-print` の WebView 印刷エンジン（iOS=WKWebView, Android=Chromium）には手を入れない
- 19 言語サポートを維持
- `docs/reference/pdf_template.md` を Single Source of Truth (SSoT) として尊重する
- 実 PDF の自動検証手段は CI に存在しない（macOS + 実機/シミュ必須）

### 真因（コミット単位で特定）

`git log -p --follow src/features/pdf/pdfTemplate.ts` を辿った結果:

- **2026-03-23 / commit `963b7c7` (PR #208-#211 / #212)** が `<div class="photo-no">` を `<div class="photo-frame">` の **内側** から **外側** に出し、`.photo-slot` の flex sibling として in-flow に組み込んだ:

  ```diff
  - <div class="photo-frame">
  -   <img class="photo" src="..." />
  -   <div class="photo-no">${label}</div>
  - </div>
  + <div class="photo-frame">
  +   <img class="photo" src="..." />
  + </div>
  + <div class="photo-no">${label}</div>
  ```

  CSS も同 PR で:

  ```diff
  - .photo-slot { min-height: 0 }
  + .photo-slot { min-height: 0; display: flex; flex-direction: column }
  - .photo-frame { height: 100% }
  + .photo-frame { flex: 1; min-height: 0 }
  - .photo-no { position: absolute; right: 2mm; bottom: 2mm; color: rgba(0,0,0,0.70) }
  + .photo-no { text-align: right; padding-top: 1mm; padding-right: 2mm;
  +             font-size: 8pt; line-height: 1; color: #666 }
  ```

  PR #212 の意図は「写真番号を画像に被せず外側に配置する」UX 改善だったが、**`.photo-no` が in-flow に変わったことで 1 スロットあたり ~3.82mm の縦消費が発生**（1mm padding-top + 8pt × line-height:1 ≒ 2.82mm）。

- **2026-04-07 / commit `786d1c7` (PR #287)** が ADR-0009 として `.page` に `calc(var(--page-h) - 1mm)` の 1mm スラックを導入。`.page-footer` の border-box 圧縮と合わせて **3.265mm** の subpixel 吸収予算を確保した。**しかしこの時点で既に PR #212 のドリフトがマージ済みだったことを見落としていた**ため、ADR-0009 の slack 計算は SSoT (`docs/reference/pdf_template.md`) のゼロ in-flow 構造を前提に行われ、**現実の構造（in-flow 3.82mm/slot）には不足していた**:

  - standard layout (2 写真/ページ): 2 × 3.82mm = **7.64mm** 消費 > 3.265mm 予算
  - large layout (1 写真/ページ): 1 × 3.82mm = **3.82mm** 消費 > 3.265mm 予算

  → 両方とも slack を食い潰し、iOS WebKit の subpixel rounding が `.page-footer` を次の物理ページに押し出した。Android Chromium は同じ overflow を吸収するため発生しない（ADR-0009 の Context と同じ非対称性）。

### なぜ気付かれなかったか

- `__tests__/pdfTemplate.test.ts` は `<section class="page">` の **数** だけを assertion しており、`.photo-no` が `.photo-frame` の **内側か外側か** という構造ドリフトを検証していなかった
- `docs/reference/pdf_template.md` の SSoT は依然として旧構造を正としていたが、**SSoT と実装の乖離を機械的に検出する仕組みがなかった**
- ADR-0009 の手動チェックは「次回リリース前」に運用依存しており、本検証は実施されていなかった
- 結果として「ADR で防御の前提を文書化したのに、その前提が壊れたら何も鳴らない」状態が放置された

---

## Decision（決めたこと：結論）

**SSoT (`docs/reference/pdf_template.md`) を唯一の正として尊重し、`<div class="photo-no">` を `<div class="photo-frame">` の内側に戻す。`.photo-no` を `position: absolute; right: 2mm; bottom: 2mm` の overlay に復元することで、in-flow の縦消費を **3.82mm → 0mm** に戻し、ADR-0009 の slack budget を回復させる。**

加えて、PR #212 の UX 意図（番号が画像主題を隠さない・暗い写真でも視認可能）を **半透明白 pill 背景** で同時に実現する:

```css
.photo-no {
  position: absolute;
  right: 2mm;
  bottom: 2mm;
  font-size: 8pt;
  line-height: 1;
  color: #111;
  background: rgba(255,255,255,0.85);  /* 暗い写真でも読める */
  padding: 0.5mm 1.5mm;
  border-radius: 1mm;
}
```

加えて、構造ドリフト再発を CI で検出するため `__tests__/pdfTemplate.test.ts` に **SSoT 構造不変条件テスト**（`.photo-no` が `.photo-frame` の内側に存在し、`<div class="photo-frame">` の **直後ではない**）を 5 ケース + CSS ルール 2 ケース = 計 7 ケース追加する。

### 適用範囲

- すべての PDF 出力経路（standard / large × A4 / Letter × Free / Pro）
- iOS / Android 両プラットフォーム（修正は HTML/CSS のみ、ネイティブ層には触らない）

---

## Decision Drivers（判断の軸）

1. **根本治療**: 症状（フッター押し出し）ではなく真因（in-flow photo-no）に手当てする
2. **ADR-0009 を壊さない**: slack 計算（1mm + 2.265mm = 3.265mm）には一切触らず、その前提条件を回復させる
3. **SSoT との一致**: 実装が SSoT (`docs/reference/pdf_template.md`) を遵守する状態に戻す
4. **構造ドリフトの再発防止**: CI レベルで「`.photo-no` は `.photo-frame` の内側」を強制する
5. **PR #212 の UX 意図を尊重**: 番号の視認性を担保する半透明 pill を採用
6. **依存追加ゼロ**: `expo-print` / `expo-image` / 既存ライブラリの範囲内で完結
7. **影響範囲を最小化**: 触るのは `pdfTemplate.ts`（HTML 2 箇所 + CSS 1 ブロック）と `pdfTemplate.test.ts`（追加のみ）の 2 ファイル

---

## Alternatives considered（他の案と却下理由）

### Option A: スラック予算を物理的に拡大（`-1mm` → `-8mm`）

- **概要**: `.page { height: calc(var(--page-h) - 1mm) }` を `calc(var(--page-h) - 8mm)` 程度まで広げ、in-flow photo-no の 7.64mm を吸収する
- **良い点**: 1 行修正で済む。HTML 構造を触らない
- **悪い点**:
  - **症状を遠ざけるだけ**で真因（SSoT 逸脱）が残る。次回 photo-no や caption 周りを触ったらまた壊れる
  - 8mm の slack はフッター位置を 4mm 以上シフトさせ、**ADR-0009 の「視認不能 0.5mm 未満のずれ」基準を破る**
  - SSoT (`docs/reference/pdf_template.md`) との乖離が固定化される
  - 検出仕組みが追加されないため、別の構造変更で同じ罠に再び落ちる
- **却下理由**: 真因に対処しない対症療法。ADR-0009 の設計品質基準を破る

### Option B: photo-no を slot 直下に残し、`position: absolute; bottom: 0` で flex flow から抜く

- **概要**: `.photo-no { position: absolute; bottom: 0; right: 0 }` で photo-no を flex 配分から除外。`.photo-slot { display: flex }` は維持
- **良い点**: HTML を触らない
- **悪い点**:
  - photo-no が `.photo-slot` の coord 系で配置されるため、`.photo-frame` の枠からはみ出した位置に来る可能性（slot は frame + caption を含む）
  - 別の subpixel パターンを引き当てる懸念（特に caption 付き large レイアウト）
  - SSoT との乖離が残る
- **却下理由**: SSoT 復元より複雑かつ恩恵少ない

### Option C: 後加工で空白ページを削除（pdf-lib 等）

- **概要**: `expo-print` で生成後、`pdf-lib` で空白ページを検出して削除する
- **良い点**: HTML/CSS を触らない
- **悪い点**: ADR-0009 の Option C で既に却下済みの理由がそのまま当てはまる。新規依存追加・正常な短いページの誤検知リスク・パフォーマンス劣化・「対症療法」で根本原因が残る
- **却下理由**: 技術的負債を増やす

### Option D: caption も含めて `.photo-slot` を完全 grid 化し、frame と caption の固定領域を割り当てる

- **概要**: `.photo-slot { display: grid; grid-template-rows: 1fr auto }` で frame と caption の領域を厳密に分離
- **良い点**: caption あり large レイアウトの将来リスクも一緒に解消
- **悪い点**:
  - スコープ拡大。caption あり large レイアウトでの subpixel リスクは現状 **報告されていない**（今回の 6 ファイルは全て caption なし）
  - grid と flex の subpixel 挙動差を iOS WebKit で実機検証する必要があり検証コストが大きい
  - 1 PR で 2 つの問題を解決すると失敗時の切り分けが困難（lessons.md 2026-04-09 のリスク分離原則違反）
- **却下理由**: スコープ過大。caption 付き large レイアウトのリスクは Follow-up に分離する

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）

- iOS の写真ページ後の空白ページが消える（standard 1 photo: 3→2 ページ / large 70 photos: 141→71 ページ）
- 表紙の `pageCount` 表記と実体 PDF の `/Count` が一致
- ADR-0009 の slack budget が前提通り機能するようになる
- SSoT (`docs/reference/pdf_template.md`) と実装が一致する
- `pdfTemplate.test.ts` の構造不変条件テストにより、将来同じ罠に再び落ちることを CI で防げる
- PR #212 の UX 意図（番号が画像主題を隠さない・暗い写真でも視認可能）が半透明 pill で維持される
- `pdfService.ts` / `app/reports/[id]/pdf.tsx` / DB / i18n には一切影響しない

### Negative（辛い/副作用）

- photo-no の見た目が「画像右下にちょこんと載る半透明 pill」に変わる。PR #212 で導入された「画像の外に配置」スタイルからの視覚的退行ではあるが、半透明背景で読みやすさを担保
- caption あり large レイアウトの subpixel リスクは本 PR では解消しない（Follow-up 参照）
- 実 PDF レベルの自動検証（CI で iOS 実機 PDF を生成して空白ページ数をカウントする等）は引き続き存在しない。HTML 構造レベルの assertion が CI のセーフティネット

### Follow-ups（後でやる宿題）

- [ ] iOS 実機 (TestFlight) で写真 0/1/2/3/5/10 × standard/large × A4/Letter の 24 ケースを生成し、PyMuPDF で `/Count` == `calculatePageCount(...)` を検証
- [ ] caption あり large レイアウト 1〜3 枚で subpixel overflow が発生しないことを iOS 実機で確認。発生した場合は別 ADR で `.photo-caption` も `.photo-frame` 内に absolute で配置する案を検討
- [ ] `docs/reference/pdf_template.md` SSoT に「PR レビュー時は `pdfTemplate.ts` との diff を必ず確認」を運用ルールとして追記
- [ ] `.github/pull_request_template.md` に「PDF テンプレート変更時は SSoT との同期を確認」チェックボックスを追加（次 Sprint で検討）
- [ ] ADR-0009 の Notes に「PR #212 のドリフト → 本 ADR-0017 で復元」のクロスリファレンスを追記

---

## Acceptance / Tests（合否：テストに寄せる）

### 正（自動テスト）

- **Jest** `__tests__/pdfTemplate.test.ts`:
  - 既存 96 ケース（section count 不変条件）が green
  - 既存 1 ケース（ADR-0009 slack assertion）が green
  - **新規 7 ケース**（SSoT 構造不変条件）:
    1. `standard/1photo`: `.photo-no` が `.photo-frame` の direct sibling として現れない
    2. `standard/2photos`: 同上
    3. `standard/5photos`: 同上
    4. `large/1photo`: 同上
    5. `large/3photos`: 同上
    6. `.photo-no` CSS rule が `position: absolute` を含む
    7. `.photo-frame` CSS rule が `position: relative` を含む
- **CI ジョブ**: `.github/workflows/ci.yml` の `pnpm verify` ステップ
  - 実測（2026-04-08）: 20 suites / **256 tests** all pass / lint / type-check / i18n:check / config:check 全て green

### 手動チェック（PR マージ前 / TestFlight）

- **手順**:
  1. iOS 実機（@doooooraku TestFlight）で以下の 6 ケースの PDF を生成:
     - standard / A4 / 1 photo
     - standard / A4 / 2 photos
     - large / A4 / 1 photo
     - large / A4 / 3 photos
     - standard / Letter / 1 photo
     - large / Letter / 1 photo
  2. 各 PDF を iOS Files / `pdfinfo` / PyMuPDF のいずれかで `/Count` を確認
  3. Android (SH-M25) で同条件を生成し、リグレッションがないことを確認
- **期待結果**:
  - iOS 全ケースで `/Count == calculatePageCount(comment, photoCount, layout)` が成立
  - 写真ページの直後に空白ページがゼロ
  - 表紙の `pageCount` 表記と実体 PDF ページ数が一致
  - photo-no が画像右下の半透明 pill として視認可能
  - Android で既存挙動から変化なし

---

## Rollout / Rollback（出し方/戻し方）

- **リリース手順への影響**: なし。コードのみの変更で、依存追加・ストア申請メタデータ・DB スキーマに影響しない
- **ロールバック方針**: `git revert <merge_commit>` → push → CI 通過後 main に直マージ。HTML/CSS のみの変更なのでロールバックも安全
- **検知方法**:
  - CI: `pnpm verify` が落ちれば即検出（特に `pdfTemplate.test.ts` の SSoT 構造不変条件テスト）
  - ユーザー報告: 次回 iOS リリース後、再び「空白ページが入る」報告があれば caption-bearing シナリオの follow-up に進む

---

## Links（関連リンク：正へ寄せる）

- 実装: `src/features/pdf/pdfTemplate.ts`（`buildPhotoPages` の HTML + `buildCss` の `.photo-no` ブロック）
- テスト: `__tests__/pdfTemplate.test.ts`（`SSoT invariant` describe ブロック）
- SSoT: `docs/reference/pdf_template.md`
- 関連 ADR:
  - ADR-0002（PDF フォント, 旧）
  - ADR-0009（`.page` slack 1mm + footer border-box）— **本 ADR が前提条件を回復させる**
  - ADR-0013（PDF hang resilience）
  - ADR-0015（PDF font strategy shift）
  - ADR-0016（WebView pool 累積受容）
- lessons: `docs/reference/lessons.md`（PDF生成 > 2026-04-08 セクション）
- 真因コミット: `963b7c7` (PR #212, 2026-03-23)
- ADR-0009 が修正しようとした不具合の再発: 本 ADR
- package.json: `expo-print@~15.0.8`
- CI: `.github/workflows/ci.yml`

---

## Notes（メモ：任意）

- **ADR-0009 との関係**: 本 ADR は ADR-0009 を `Superseded` にしない。ADR-0009 の slack 設計は依然として正しく、本 ADR はその前提条件を **コードドリフトから守る** ための補強。両 ADR は積層的に機能する
- **半透明 pill の数値根拠**:
  - `background: rgba(255,255,255,0.85)`: 視認性のため 85% 不透明。100% だと画像を完全に隠すので避けた
  - `padding: 0.5mm 1.5mm`: テキストの周囲に小さな余白で読みやすさ向上
  - `border-radius: 1mm`: 角を取って視覚的に柔らかく
  - `color: #111`: 高コントラスト。`rgba(0,0,0,0.70)` だとライト pill 上で十分なコントラストが得られないため solid #111
- **caption あり large レイアウトの将来リスク**:
  - `.photo-caption` も flex sibling として `.photo-slot` 内に置かれており、原理的には `.photo-no` と同じ subpixel リスクを抱えている
  - ただし caption は **ユーザーが明示的に入力した時のみ**表示され、現状の Issue #298 で報告された 6 ファイルには含まれていない
  - リスクが顕在化した場合は別 ADR-0018 で対応する（caption を frame 内 absolute に配置 or slack を増量）
- **構造不変条件テストの設計選択**:
  - 「`</div>` の直後に `<div class="photo-no">` がある」という negative pattern を見るのが最も robust
  - alternative としては DOM パーサで木構造をたどる方法があるが、Jest 環境への jsdom 依存追加を避けるため正規表現で済ませた
  - HTML を `<` 区切りで読む簡易ステートマシンよりも regex の方が「フレーム閉じ → photo-no 開き」というシーケンスを捕まえやすい
- **テスト追加コスト**: 7 ケース追加で実行時間 +約 10ms。CI 全体のオーバーヘッドはほぼゼロ
