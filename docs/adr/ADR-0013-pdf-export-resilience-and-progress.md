# ADR-0013: PDF 出力のハング対策、進捗表示、ホーム遷移

- Status: Accepted
- Date: 2026-04-08
- Deciders: @doooooraku
- Related: `src/features/pdf/pdfService.ts` / `src/features/pdf/pdfTemplate.ts` / `app/reports/[id]/pdf.tsx` / `__tests__/pdfService.test.ts` / `docs/reference/lessons.md` / ADR-0009 / ADR-0012

---

## Context（背景：いま何に困っている？）

ユーザーから次の 3 シナリオで PDF 出力ボタンが永久スピナーになるバグ報告を受けた:

1. **連続 3 回目** の PDF 出力（写真 10 枚程度・Free / Pro 問わず）でスピナーが止まらない
2. **写真 40 枚（Pro）** で同じ症状。ただし**端末ストレージを空けると 40 枚は通った**
3. **写真 70 枚** は編集画面 → PDF プレビュー直行だと hang。「**いったん保存→ホームに戻る→保存済レポートをタップ→PDFプレビュー→出力**」の手順を踏めば成功する

スクリーンショット（21:11 〜 21:17 / Pixel 8a）では、PDF プレビュー画面が空白のまま「PDF 出力」ボタンが 6 分以上スピナーで固まったままだった。

### 困りごと

- Pro ユーザー（最も大事な顧客層）が課金特典である「無制限出力」を行使できない → リファンド・解約リスク
- ユーザー側の復旧手段が **アプリを kill するしかない** → 中途半端な temp PDF が残る
- ADR-0012 で導入した「PDF 出力成功直後のレビュー依頼」が **永遠に発火しない** → ストア評価向上施策が破綻
- 「PDF が作れないアプリ」という SNS 拡散リスク

### 根本原因（3 層モデル）

**L1: タイムアウト不在**
`Print.printToFileAsync` (`expo-print`) は OS 側で hang した場合 **resolve も reject もせずに** Promise が孤児化する。`pdfService.ts` には Promise.race ベースのタイムアウトが無く、`pdf.tsx` の `handleExport` の `finally` ブロックが永遠に走らないため `setExporting(false)` が呼ばれない。

**L2: メモリ圧迫（編集画面 + プレビュー WebView + Print エンジンの 3 層共存）**
`router.push('/reports/[id]/pdf')` で PDF プレビューを開いても、編集画面はナビゲーションスタックに **生きたまま** 残る。編集画面は 70 枚の `expo-image` ビットマップキャッシュ + 写真追加時の中間 state を抱えており、その上に PDF プレビュー WebView (~100-150MB) と Print エンジンが追加で WebView を起動するため、native heap が枯渇する。「保存 → 再オープン」が効くのは、編集画面が unmount されて L2 の最大要因が消えるから。

**L3: ストレージ圧迫**
`expo-image-manipulator` は temp JPEG を `cacheDirectory` に書き出して読み戻す方式。`Print.printToFileAsync` も temp PDF を書く。空き容量が少ないと書き込みが進まず hang し得る。ユーザーが「ストレージを空けたら 40 枚は通った」と報告したのがこの裏付け。

### 制約/前提

- HTML / CSS の構造は **ADR-0009 で固定** されており触らない（写真ページ後の空白ページ修正の保護対象）
- PDF 生成は単一の整合的な PDF を返す必要がある（分割出力 → 結合は許容しない）
- 19 言語サポートを維持し、`...baseEn` フォールバックには頼らない（lessons 2026-03-27 ルール）
- expo-print / expo-print の WebView 実装には手を入れない（外部 SDK）

---

## Decision（決めたこと：結論）

PDF 出力パイプラインに **4 層の防御** を入れる:

1. **動的タイムアウト**: `Print.printToFileAsync` を `Promise.race` で `30秒 + 1秒 × 写真数` 上限に縛る。タイムアウトしたら `PdfHangError` を throw し、既存の OOM/blank PDF リトライチェーン（full → reduced → tiny）に hang も乗せる。フォールバック切替前に **300ms の sleep** を挟んで native heap が落ち着く時間を確保する。
2. **メモリ強制解放**: `handleExport` 開始時に `setPreviewHtml(null)` + `expo-image` の `Image.clearMemoryCache()` を呼び、WebView 解放待ちを 100ms → **350ms** に延長する。
3. **出力成功後のホーム遷移**: `router.dismissAll()`（フォールバック: `router.replace('/(tabs)')`）でナビゲーションスタック全体をリセットし、編集画面 + プレビュー画面の両方を確実に unmount する。これによって **次回出力時のメモリが必ずクリーンな状態から始まる**（70 枚 hang シナリオの恒久対策）。
4. **ストレージ事前チェック**: `LegacyFileSystem.getFreeDiskStorageAsync()` で空き容量が **100MB 未満なら `PdfStorageLowError` を即 throw** し、ユーザーに明示的なエラー Alert を表示。リトライしても改善しないのでフォールバックには載せない。

加えて UX 改善として:

5. **単一プログレスバー**: 0% → 100% の単一パーセンテージ表示を出力ボタン地に重ねる。内部的には写真処理フェーズが 0-80%、印刷フェーズが 80-95%（擬似タイマー）、完了時に 100% スナップ。**段階別ラベルは出さない** —ユーザーには「あと何 % で終わるか」だけ見せる。
6. **`finally` 内の `loadPreview()` 自動再呼び出しを廃止**: 出力後はホーム遷移するため再描画不要。連続出力時のメモリ累積を断つ。

### 適用範囲

- すべての PDF 出力経路（standard / large × A4 / Letter × Free / Pro）
- iOS / Android 両プラットフォーム

---

## Decision Drivers（判断の軸）

1. **再現するハングを 100% 撲滅する** — 「最悪でもエラー Alert で停まる」ことを保証
2. **ユーザーが「いつ終わるかわかる」** — 進捗バーで残量が見える
3. **ADR-0009 を壊さない** — HTML / CSS 構造には一切触らない
4. **依存追加ゼロ** — `expo-print` / `expo-image-manipulator` / `expo-file-system` / `expo-image` / `expo-router` の既存 API のみで完結
5. **多層防御** — 1 つの対策が外れても他の層で救える

---

## Alternatives considered（他の案と却下理由）

### Option A: タイムアウトのみ追加（最小修正）

- 概要: `printHtml` を `Promise.race` でラップするだけ。メモリ・ホーム遷移・ストレージは触らない
- 良い点: 変更ファイル数が少ない
- 悪い点: 70 枚シナリオが直らない（メモリ圧迫が残るため、リトライしてもまた hang する）。「保存 → 再オープン」の手動回避策をコード化しないと根本治療にならない
- 却下理由: ユーザーが報告した 3 シナリオのうち最も難しい「70 枚 / 編集画面直行」を救えない

### Option B: PDF 生成をワーカー / Reanimated worklet に切り出す

- 概要: 画像処理 + HTML 構築を別スレッド化し、UI スレッドへ進捗を流す
- 良い点: UI スレッドの応答性が向上
- 悪い点: `react-native-worklets` 上で `ImageManipulator` / `expo-print` が動作する保証がない。実装難度・検証コストが高い
- 却下理由: スコープ過大、スコープに対するリターンが不明

### Option C: HTML 構築を分割 → `pdf-lib` で結合

- 概要: 写真ページを N 枚ずつ別 PDF に分割生成し、`pdf-lib` で結合する
- 良い点: 一度に持つ画像 base64 を最大 N 枚に制限でき、ピークメモリが下がる
- 悪い点: `pdf-lib` の新規依存追加・結合バグの新規温床・ADR-0009 の `@page` 構造を分割すると subpixel スラックが各 PDF 単位で再評価される→空白ページ再発リスク
- 却下理由: ADR-0009 を壊すリスクが高く、依存追加も避けたい

### Option D: PDF 生成を専用全画面モーダルに分離

- 概要: 「PDF 生成中」モーダル画面を別途作り、その中で進捗 + キャンセル禁止を完結させる
- 良い点: メンタルモデルがクリーン
- 悪い点: 新規画面・新規ナビゲーション設計・新規 i18n が必要。本質的にはアプローチ B と同程度のスコープ
- 却下理由: 同等効果を本決定の小さい変更で達成できる

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）

- ハング撲滅の多層防御により、3 シナリオすべてが期待通りに完了 or 明示エラーで停まる
- 出力後のホーム遷移により、ユーザーの「次に何をすればいいか分からない」体験が消える
- メモリ強制解放により、連続出力でも安定して動く
- 進捗バーで「いつ終わるか」が常に見える
- ADR-0012 のレビュー依頼が落ち着いたタイミング（ホーム遷移後）に出るので自然
- ADR-0009 の CSS 修正には一切触らないため、写真ページ後の空白ページ問題は維持された状態で安全

### Negative（辛い/副作用）

- プレビュー画面で連続して別レイアウト（例: A4 → Letter）の出力をしたいユーザーは、毎回ホーム → 該当レポート → プレビュー、と踏むことになる。これは UX のトレードオフだが、メモリ確実解放のメリットの方が大きいと判断
- 100MB しきい値が誤検知を起こす可能性がある（端末によって計測精度が違う）
- フォールバック切替の 300ms cooldown と擬似タイマー (80→95%) が常に挟まるので、写真数が少ないケースで体感が若干遅くなる可能性

### Follow-ups（後でやる宿題）

- [ ] 実機で 100 枚・150 枚の上限ベンチマークを取り、必要なら動的タイムアウトの係数を調整
- [ ] ストレージしきい値 100MB の検証（誤検知ゼロを確認）
- [ ] iOS 実機での動作確認（TestFlight 配布時）

---

## Acceptance / Tests（合否：テストに寄せる）

- **正（自動テスト）**:
  - Jest: `__tests__/pdfTemplate.test.ts` の既存 96 ケース + 新規 onProgress テスト 4 ケース
  - Jest: `__tests__/pdfService.test.ts` の新規 7 ケース
    - ストレージ事前チェック（< 100MB → throw / = 100MB → 続行 / API 失敗 → 続行）
    - hang フォールバック（全 attempt hang → throw / 1 回目 hang → 2 回目成功）
    - onProgress pass-through（写真数分のコールバック / 省略可能）
  - i18n:check が緑（19 言語に新規キー追加）
  - CI ジョブ: `.github/workflows/ci.yml` の `pnpm verify`

- **手動チェック**（PR マージ前）:
  - 手順:
    1. Pixel 8a (Dev Build) で写真 10 枚 × 連続 5 回出力 → すべて成功
    2. 写真 40 枚 / Pro で出力 → 進捗バー 0 → 100% / ホーム遷移
    3. 写真 70 枚 / 編集画面直行で出力 → 成功する（**最大確認ポイント**）
    4. ストレージを意図的に圧迫 → ストレージ不足 Alert が出る
  - 期待結果: 上記すべてが成功する

---

## Rollout / Rollback（出し方/戻し方）

- **リリース手順への影響**: なし。コードのみの変更で、依存追加・ストア申請メタデータ・DB スキーマに影響しない
- **ロールバック方針**: `git revert <merge_commit>` → push → CI 通過後 main に直マージ。コードのみの変更なのでロールバックも安全
- **検知方法**:
  - CI: `pnpm verify` が落ちれば即検出
  - ユーザー報告: 「PDF 出力が遅い / 進まない」報告が続けば 100MB しきい値や動的タイムアウト値を再検討

---

## Links（関連リンク：正へ寄せる）

- 実装: `src/features/pdf/pdfService.ts` / `src/features/pdf/pdfTemplate.ts` / `app/reports/[id]/pdf.tsx`
- テスト: `__tests__/pdfService.test.ts` / `__tests__/pdfTemplate.test.ts`
- ドキュメント: `docs/reference/lessons.md` (PDF 生成 > 2026-04-08 セクション)
- 関連 ADR: ADR-0002 (PDF フォント), ADR-0009 (subpixel スラック), ADR-0012 (レビュー依頼)
- package.json: `expo-print@~15.0.8`, `expo-image@~3.0.11`, `expo-router@~6.0.23`, `expo-file-system@~19.0.21`
- CI: `.github/workflows/ci.yml`
- 外部 docs: [expo-print](https://docs.expo.dev/versions/latest/sdk/print/) / [expo-router dismissAll](https://docs.expo.dev/router/reference/imperative-navigation/)

---

## Notes（メモ：任意）

- 進捗バーの 80→95% 擬似タイマーは「ユーザーには連続的な進捗が見えるべき」というユーザー要求に応えるための妥協。Print.printToFileAsync は内部進捗を返さないため、80% で止めると体感が悪い。タイマー間隔を写真数比例にしているのは「写真が多いほど印刷時間が長くなる」体感に合わせるため
- `Image.clearMemoryCache()` は `expo-image` の memory cache を解放する。disk cache は触らないので、編集画面に戻ったときに写真サムネが消えることはない（disk から再ロードされる）
- `router.dismissAll()` は expo-router 6 で利用可能（`node_modules/expo-router/build/imperative-api.d.ts` で確認済み）。失敗時は `router.replace('/(tabs)')` にフォールバックするが、通常はこの分岐に入らない
