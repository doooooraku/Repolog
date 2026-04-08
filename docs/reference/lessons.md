# Lessons Learned

## ドキュメント管理

### 2026-03-09: docs/README.md のファイルマップ更新漏れ
- **状況**: dev_vs_preview_builds.md, scrcpy_screen_mirror.md 等を追加したが docs/README.md のファイルマップに反映されていなかった
- **根本原因**: 新規ドキュメント追加時に「影響を受ける他の文書」を確認するチェックリストがなかった
- **ルール**: 新しいドキュメントを追加したら、必ず docs/README.md のファイルマップを更新する

### 2026-03-09: v2.0 summary.md のカテゴリ分類退行
- **状況**: v1 (debug_session.sh) のセッション分析ではエラーをOOM/PDF/ReactNativeJS/FATAL等にカテゴリ分類していたが、v2.0 (debug_workflow.sh) では総カウントのみに簡略化された
- **根本原因**: v1のカテゴリ分類ロジックが外部ドキュメントに記録されておらず、v2.0設計時に参照されなかった
- **ルール**: 既存機能を新バージョンで置き換える際、機能の棚卸しを行い、意図的な削除と見落としを区別する

### 2026-03-09: レガシー参照の更新漏れ
- **状況**: android_debug.md Section 8 が debug_session.sh（レガシー）のみを参照し、v2.0 の debug_workflow.sh への導線がなかった
- **根本原因**: 新機能実装のTODOに「既存ドキュメントの整合性チェック」が含まれていなかった
- **ルール**: DOD (Definition of Done) に「関連ドキュメントのクロスリファレンス確認」を含める

---

## デバッグワークフロー

### Android logcat の False Positive パターン
- monitor_repolog.sh で学んだ、無視すべきシステムログ:
  - Finsky (Google Play): VerifyApps パッケージスキャン
  - FullBackup_native: Android バックアップデータ計測
  - installd: キャッシュパージ / ストレージ管理
  - PFTBT/Backup: バックアップ転送エラー（クォータ超過）
  - ActivityManager: プロセスライフサイクル (bkup, prev, empty, cch)
  - NxpTml/WifiStaIfaceHidlImpl: ハードウェア I/O エラー（NFC, WiFi）

### Dev Build + Metro が自動スクショに必須な理由
- `__DEV__` ガード付きの `[NAV]` ログは Dev Build + Metro 接続時のみ出力
- Preview/Production ビルドでは Hermes のデッドコード除去で完全に消える
- Preview APK でのデバッグ時は `--no-auto-screenshot` フラグを使う

### WSL2 ADB_SERVER_SOCKET 問題
- `.bashrc` が mirrored networking モードでルーター IP を `ADB_SERVER_SOCKET` に設定
- これが adb の通信を妨害する
- 回避策: `env -u ADB_SERVER_SOCKET adb` で変数を無効化
- `debug_common.sh` で `ADB="env -u ADB_SERVER_SOCKET adb"` として中央管理

---

## テーマ・カラーシステム

### 2026-03-23: textOnPrimary ダークモードのコントラスト不足
- **状況**: ダークモードで `primaryBg` が `#ecedee`（ほぼ白）に反転するが、`textOnPrimary` が `#ffffff` のまま → コントラスト比 1.08:1 でほぼ見えない
- **根本原因**: ライトモードを先にデザインした際、`textOnPrimary` を `primaryBg` と連動させ忘れた。`primaryText` は正しく `#111214` だったが、同じ用途の `textOnPrimary` は更新漏れ
- **ルール**:
  1. ダークモード追加時は全てのカラートークンペアのコントラスト比を検証する（WCAG AA: 4.5:1以上）
  2. 同じ意味のトークンが2つ存在する場合はバグの温床。将来的に統一を検討する
  3. ハードコードされた色（rgba直書き）はテーマトークンに置き換える

---

## PDF生成

### 2026-03-23: PRAGMA user_version 未設定によるマイグレーション二重実行
- **状況**: 新規インストール後、アプリプロセスが再起動すると全DB操作が失敗する（写真追加、保存、データ読込、PDF）
- **根本原因**: `if (version !== SCHEMA_VERSION)` の条件が新規インストール時に常にfalseになり、`PRAGMA user_version` が設定されない。次回起動時にversion=0から全マイグレーション再実行 → schemaV3（ALTER TABLE ADD COLUMN）が「duplicate column name」エラー
- **なぜ既存v1/v2では問題にならなかったか**: CREATE TABLE IF NOT EXISTS は冪等（何度実行しても安全）だが、ALTER TABLE ADD COLUMN は非冪等（2回目でエラー）
- **ルール**:
  1. `PRAGMA user_version` は条件なしで常に設定する
  2. ALTER TABLE マイグレーションは必ず冪等にする（カラム存在チェックを入れる）
  3. マイグレーション追加時は「アプリ再起動」のシナリオでテストする

### 2026-03-23: PDF画像の二重圧縮による品質低下
- **状況**: photoService.ts で 1600px に縮小 → pdfTemplate.ts でさらに 600px に縮小 → 実質 82 DPI でボヤける
- **根本原因**: OOM防止のために保守的な設定値にしていたが、実使用で品質不足が顕在化
- **ルール**: PDF画像設定変更時は必ずDPI（= ピクセル数 ÷ 印刷サイズ）を計算して品質を検証する。目標は 150 DPI 以上

### 2026-03-23: Promise.all でのメモリピーク
- **状況**: `Promise.all(chunk.map(...))` で同一ページの画像を並列処理 → メモリピークが2倍
- **ルール**: 大きなバイナリデータ（画像のbase64等）を扱う場合は逐次処理（`for...of`）を使う

### 2026-04-09 (Phase 1 計測結果): PDF フォント埋め込みが Android WebView で silent failure (Issue #292 調査)

- **状況**: PR #291 で attempt 1 が毎回 `blank PDF` で失敗することを確認した Issue #292 の根本調査。PR #293 で構造化診断ログ（`buildPdfFontCss`/`buildPdfHtml`/`printHtml`/`assertPdfLooksValid` の 4 箇所に cssBytes/htmlBytes/sizeBytes を出力）を追加し、Pixel 8a 実機で 4 シナリオ（日本語 × standard/A4、日本語 × large/A4、日本語 × large/Letter、中国語簡体 × standard/A4）を計測
- **実測データ（主要値）**:
  - **日本語 (latin + jp)**: fontCssBytes = 15,518,956 (~14.8 MB), totalHtmlBytes ≈ 17-18 MB, attempt 1 結果 PDF = **681 bytes** (blank), attempt 2 成功
  - **中国語簡体 (latin + jp + sc)**: fontCssBytes = 39,215,504 (~37.4 MB), totalHtmlBytes = 40,942,486 (~39 MB), attempt 1 結果 PDF = **681 bytes** (blank), attempt 2 成功
  - **共通**: HTML サイズが 17 MB でも 39 MB でも、失敗 PDF は **同じ 681 bytes**。1 〜 2.6 秒で素早く失敗 (hang ではない)
- **根本原因（更新版）**:
  1. HTML 全体サイズの単純な「境界超過」ではない（2.4 倍サイズ差でも同じ 681 bytes）
  2. `@font-face { src: url('data:font/ttf;base64,...') }` を含む HTML を `Print.printToFileAsync` に渡すと、Android Chromium 印刷エンジンが **フォントを処理できず、中身のない最小 PDF を生成して返す**
  3. attempt 2 (`skipFontEmbedding: true`) で成功するのは、data URI 付き `@font-face` が HTML から完全に消えるため
  4. `file://` URI も過去にコミット #88b0bd9 で revert 済み (Android WebView がブロック)
- **なぜ SDK 53 → 54 で顕在化したか (仮説)**: SDK 54 + expo-print 15 で Android Chromium のバージョンが上がり、data URI の処理閾値が厳格化された可能性。ADR / lessons に SDK アップグレード時の PDF 回帰テスト項目がなかったため検出遅れ
- **Phase 1 で追加した観測性 (PR #293)**:
  1. `[PDF] buildPdfFontCss: lang=xx strategy=xx fonts=[...] cssBytes=N`
  2. `[PDF] buildPdfHtml: layout=xx paperSize=xx photos=N ... cssBytes=N totalHtmlBytes=N`
  3. `[PDF] printHtml: htmlBytes=N paperSize=xx timeoutMs=N`
  4. `[PDF] assertPdfLooksValid: sizeBytes=N status=valid/blank threshold=N`
  - いずれも `__DEV__` ガード無しで production でも動作。ユーザー提供 logcat から類似問題を即特定できる
- **Phase 2 (次セッション) で実施する修正方針**:
  1. **ビルド時フォントサブセット化** (最有力): `pyftsubset`/`subset-font` で Noto Sans の不要グリフ + Variable axis を削り、各フォントを 1-2 MB に圧縮。cssBytes を現状の 1/10 以下（< 3 MB）に抑制
  2. **コードポイント外検出**: 既存の `containsUnsupportedScripts` 同等のロジックを流用し、サブセット外文字を検知したら attempt 2 (skipFontEmbedding=true) にフォールバック
  3. **数値目標**: JP の cssBytes ≤ 3 MB、totalHtmlBytes ≤ 5 MB、attempt 1 成功率 ≥ 95%
  4. **ADR-0015 起票**: 「PDF フォント境界条件と build-time subset 戦略」を新規 ADR として意思決定を記録
- **ルール**:
  1. **外部 SDK の境界条件は実機で計測する**。`scripts/pdf-font-benchmark.mjs` のような JS 側計算だけでは足りない。`expo-print` のような native 橋渡し API は「入力がどこまでなら動くか」を実機ログで確認する
  2. **SDK アップグレード時の回帰テストに PDF 生成を含める**。SDK 53→54 でフォント経路の挙動が変わった疑いがあるため、次回の SDK アップグレードでは「日本語 + 写真 5 枚の PDF 出力」を必須テスト項目に
  3. **観測性はゲートの一部**。本番ログに構造化情報（size/time/strategy）を残しておくことで、ユーザー報告時の切り分けが劇的に速くなる (PR #293 で Phase 1 完了)
  4. **ベンチマークに実機モードを追加する**。`pdf-font-benchmark` は純 JS の見積もりだけでなく、`expo-print` を実際に呼んで成功/失敗と実際の PDF バイト数を記録するモードを追加する (Phase 2 or 3 の宿題)

### 2026-04-09 (Phase 2 完了): PDF フォント埋め込みを廃止しシステムフォントに切替 (Issue #292 クローズ)

- **状況**: Phase 1 で確定した「attempt 1 が毎回 blank PDF」問題に対し、Phase 2 で採用する修正方針を決定・実装
- **採用しなかった案 (Phase 1 で第一候補だった方針)**: **ビルド時フォントサブセット化** (`pyftsubset`/`subset-font` で Noto Sans を 1-2 MB に圧縮)。却下理由はユーザー確認「attempt 2 のフォント表示で問題なし、画質だけ戻したい」。ビルド系の新規依存・CI 統合・将来の SDK アップグレード時の再発リスクを避ける
- **採用案 (ADR-0015)**: `pdfService.ts` の **attempt 1 options に `skipFontEmbedding: true` を追加**するだけの 1 行修正。画像は full quality (1200/1600 px @ quality 0.80) を維持し、19 言語の描画は `pdfFontStack` の `system-ui` / `-apple-system` / `Arial` 系フォールバック（= OS 標準フォント）に委譲する
- **意思決定**: `docs/adr/ADR-0015-pdf-font-strategy-shift.md` を新規作成し、ADR-0002「PDF は Noto Sans 系フォントを埋め込みで固定する」を **Superseded** に変更
- **追加した自動テスト**: `__tests__/pdfService.test.ts` に `'attempt 1 does not embed @font-face (system fonts only)'` を追加。`mockPrintToFileAsync` が 1 回だけ呼ばれること + 生成 HTML に `@font-face` と `data:font/ttf;base64` が含まれないことを assert
- **期待アウトカム（定量）**:
  - attempt 1 成功率 ≥ 95% (blank PDF が消える)
  - 画像 DPI: A4 standard で 164 DPI / large で 219 DPI (≥150 DPI 目標)
  - `totalHtmlBytes` が 17-18 MB → 数百 KB に激減 (副次効果：高速化)
  - フォールバックチェーン (reduced / tiny) は OOM / hang 時の安全弁として維持
- **Phase 2b 宿題 (別 PR)**: 本 PR で dead code になるファイルをまとめて削除して APK/AAB サイズを削減
  - `src/features/pdf/pdfFonts.ts` / `pdfFontSelection.ts`
  - `assets/fonts/NotoSans*-Variable.ttf` × 7 (+ `assets/fonts/licenses/OFL.txt`)
  - `scripts/pdf-font-benchmark.mjs` / `docs/how-to/testing/pdf_font_benchmark.md` / `docs/reports/benchmarks/pdf_font_benchmark.latest.md`
  - `__tests__/pdfFontSelection.test.ts` / `__tests__/pdfWarningI18n.test.ts` のフォント関連
  - `app.json` の `PDF_FONT_SUBSET_EXPERIMENT: "1"` flag (**dead config** — `app.config.ts` / `src/` / `scripts/` から一切参照されていないことを grep 確認済み)
  - `docs/how-to/testing/testing.md` / `docs/how-to/development/android_device.md` の `PDF_FONT_SUBSET_EXPERIMENT` 関連記述
- **学び（自己改善ループ）**:
  1. **観測性投資の ROI が極めて高い**: PR #293 の構造化ログ 4 点 (`cssBytes`/`htmlBytes`/`sizeBytes`/`strategy`) により、「どこで何が起きているか」が 1 セッションで特定できた。投資時間に対するリターンは実装工数の桁違い
  2. **「ユーザーに聞く」は立派な意思決定軸**: Phase 1 lessons で planned していたサブセット化の大工事 (1-2 週間) を、**ユーザーへの 1 行の確認** (「attempt 2 のフォント表示は問題ないですか？」) で回避できた。実装前にユーザー要求の本質を問い直す価値
  3. **ADR の前提が時間で崩れるのは自然なこと**: ADR-0002 (2026-01) の「フォント埋め込みで固定」という決定は当時正しかったが、SDK 54 + Android Chromium の挙動変化で前提が崩れた。ADR は Supersede 可能な生きたドキュメントとして扱う
  4. **リスク分離原則**: 1 行のコード修正と 10+ ファイルの dead code 削除を同一 PR に混ぜない。失敗時の切り分けが困難になる。本 PR では修正のみ、削除は Phase 2b に分離

### 2026-04-11: プログレスバーを廃止し hang 緩和（Issue #298）

- **状況**: PR #297 で Issue #296「80% 停滞」を修正し実機検証したところ、**ユーザーから「95% で 30 秒以上停滞する」と新たな報告**。logcat 解析で標準レイアウト + 写真 10 枚の場合 **attempt 1 (`full quality` = 画像 1200px @ 0.80) が `Print.printToFileAsync` で 40 秒 hang** することが判明。一方コメントレイアウト（写真 1 枚/ページ）+ 10 枚は attempt 1 が 0.95 秒で成功する。HTML サイズが 4.6 MB > 2.37 MB にもかかわらず大きい方が成功する反直感的挙動で、純粋なバイトサイズではなく **`photo-grid.two` の CSS grid 構造 × 大画像** が Android Chromium Print エンジンの何らかの閾値に引っかかる疑い。PR #295 (`skipFontEmbedding: true`) で解消したはずの attempt 1 問題が、blank PDF → hang という**違う症状で残留**していた
- **意思決定（ユーザー提案・同意ベース）**:
  1. **プログレスバーを廃止**。Decision 5 (0-100% 単一バー) と Decision 6 (`loadPreview()` 自動再呼び出し廃止) の後継決定として、PR #288 / #291 / #297 で積み上げてきた「写真処理 0-80% / 印刷 80-95% / 完了 100%」の多層フェーズ管理を **丸ごと削除**。実装・改修コストが hang 時の UX 改善に見合わない（95% 停滞は擬似タイマーでは根治できない）ため。代わりに ActivityIndicator + 静的メッセージ (`t.pdfGenerating` = "PDF作成中...") のみで応答性を示す
  2. **attempt 1 のタイムアウトを 10 秒でキャップ**（`ATTEMPT_1_TIMEOUT_CAP_MS = 10_000`）。正常経路の attempt 1 は写真 10 枚でも 1 秒以内に完了する実測値（logcat）に対して 10 倍の安全マージン。40 秒 hang を 10 秒で打ち切って reduced preset にフォールバック。attempt 2 以降は安全網として従来の動的タイムアウト (`30 + 1 × N`) を維持
- **効果**: 標準レイアウト + 10 枚 hang シナリオの合計待機時間が **44 秒 → 約 12 秒** に短縮。プログレスバーがないため停滞の視認もなくなり、ユーザーは「スピナーが回って静的メッセージが出ているから待てば終わる」という単純な期待値で使える
- **削除したコード / 設定**:
  - `app/reports/[id]/pdf.tsx`: `exportProgress` state、`startPrintPhaseTimer`/`stopPrintPhaseTimer`、擬似タイマー setInterval、monotonic clamp、onProgress callback
  - `src/features/pdf/pdfService.ts`: `onProgress` 引数
  - `src/features/pdf/pdfTemplate.ts`: `onProgress` type field + 発火ポイント（photo loop + 初期 0/total）
  - 19 ロケールファイル: `pdfGeneratingProgress` キー
  - `__tests__/pdfExportProgressClamp.test.ts`: 全 19 ケース（clamp 7 + timer 12）ファイル削除
  - `__tests__/pdfService.test.ts`: onProgress pass-through テスト
  - `__tests__/pdfTemplate.test.ts`: onProgress callback describe ブロック全体
  - `pdf.tsx` styles: `progressContent`/`progressText`/`progressTrack`/`progressFill`
- **追加したコード**:
  - `pdfService.ts`: `ATTEMPT_1_TIMEOUT_CAP_MS` 定数、`calculatePrintTimeoutMs(photoCount, attemptIndex)` の attempt-aware 化
  - `pdfService.test.ts`: attempt 1 キャップ検証 2 ケース（10 秒でフォールバック / attempt 2+ は 30+1×N を維持）
  - `pdf.tsx` styles: `exportingContent`/`exportingText`
- **未解決**: 根本原因（なぜ標準レイアウト 10 枚の 2.37 MB HTML が hang するのか）は Issue #298 で追跡継続。Phase 3a (発火閾値特定) / 3b (CSS isolation) / 3c (native 層観測) / 3d (修正) の計画は Issue #298 に記録
- **ルール**:
  1. **コストベースの意思決定を恐れない**。擬似進捗バーは ADR-0013 の時点では正しかったが、新たな hang バグの発見によって「バー自体が UX 問題を再現する」媒介になった。実装を守るより **ユーザー体験の単純化を優先する** 判断が正解の場合がある。「コードを削除する」ことは前進である
  2. **根本原因が不明でも、境界条件での緩和は可能**。40 秒 hang の根本原因を特定する前でも、正常経路の実測時間（1 秒以内）から 10 倍のマージンで上限を切ることで、ユーザー体感を 44 秒 → 12 秒に改善できる。「完璧な修正」を待たずに「十分に良い緩和」を出す価値
  3. **観測性への投資は複利で効く**。PR #293 で導入した構造化ログ（`[PDF] buildPdfHtml: ...` / `[PDF] printHtml: ...` / `[PDF] hang detected on attempt 1, retrying...`）が本 Issue の解析で決定的な役割を果たした。logcat 1 枚で `40.02 秒`の hang 時間と attempt 2 の成功が可視化された。**構造化ログは次のバグ調査でもそのまま使える資産**
  4. **レイヤード根本原因には順次対応する**。Issue #296 の修正 (PR #297) によって Issue #298 の根本原因が露出した。このパターンは「レイヤードバグ」と呼ぶべきで、1 回のリリースで全部解決しようとしない。**上層から剥がしていくアプローチ** が安全

### 2026-04-10: PDF 出力進捗バーが印刷フェーズ中 80% で 10 数秒停滞する（Issue #296）

- **状況**: ユーザー報告「写真 10 枚に各キャプションを入れて PDF プレビューから『PDFを作成』を押すと、進捗バーが 80% を維持したまま 10 数秒たってから PDF が作成される。80% でなにもなかったら不安を覚える」
- **再現条件**: 写真 10 枚 + 各写真にキャプション + PDF プレビュー → 「PDFを作成」タップ（Android / Pixel 8a）。attempt 1 が成功する通常経路でも発生
- **観測**:
  - 0% → 80% は 1〜2 秒で順調に到達（= 写真処理フェーズ `onProgress` は正常）
  - 80% → 80% が約 10 秒停止
  - 80% → 100% に一瞬で跳ぶ
- **根本原因**: `app/reports/[id]/pdf.tsx:handleExport` の **印刷フェーズ擬似タイマー起動位置が誤っていた**。タイマーは `await generatePdfFile(...)` の **後** に起動されていたが、`generatePdfFile` は内部で `buildPdfHtml`（写真処理 → `onProgress` で 0-80% 駆動）と `printHtml`（`Print.printToFileAsync` → 進捗ソースなし）を直列実行する。つまり `generatePdfFile` が resolve した時点で **印刷フェーズは既に終了**しており、タイマーは印刷中に一度も走っていなかった。ADR-0013 本文が定義した「80-95% は印刷フェーズの擬似タイマー」という UX 要件が、実装の **タイマー起動位置という 1 行のずれ**で破綻していた
- **なぜ気付かなかったか（5 層）**:
  1. ADR-0013 実装時、`handleExport` の逐次的な流れ（`await generatePdfFile` → 80% スナップ → タイマー起動）を文字どおりコードに落としたため、「タイマーを起動する時点では印刷は終わっている」ことに気付かなかった
  2. コードレビューで「タイマーの有効時間窓は await の前か後か」という async の時間軸視点でチェックされていなかった
  3. `pdfExportProgressClamp.test.ts` は clamp の純関数テストのみで、**時間軸に沿ったタイマー起動タイミングをカバーしていなかった**
  4. 手動 QA チェックリストに「進捗バーが一度も停止しないこと」（停止時間の上限）という定量項目がなかった
  5. ADR の Acceptance セクションに「要件 ↔ テスト ID の対応表」が存在せず、「bar が停滞しない」という本文要件がテスト項目に落ちていなかった
- **対策（実施済み・PR #297）**:
  1. `handleExport` 内に `startPrintPhaseTimer(photoCount)` ヘルパーを抽出（二重起動ガード付き）
  2. `onProgress` コールバック内で `processed >= total && total > 0` を検知した瞬間に起動。`printHtml` と並走する
  3. `generatePdfFile` 後の呼び出しは 0 枚レポート・例外経路用の安全ネットとして残す（冪等）
  4. tick 間隔を `Math.max(200, photoCount * 5)` → `Math.max(500, photoCount * 30)` に保守化し、95% 停滞も同時に軽減
  5. `__tests__/pdfExportProgressClamp.test.ts` に起動条件 4 + tick 間隔 3 + tick 進行 4 + integration 1 = 計 12 ケース追加
  6. ADR-0013 Notes セクションに 2026-04-10 補遺を追記
- **ルール**:
  1. **擬似進捗タイマーは監視対象フェーズの開始と同期して起動する**。対象フェーズが終わってから起動しては意味がない。「どの async 区間で動いていてほしいか」を実装時に言語化する
  2. **時間軸依存の UI ロジックはタイマー起動タイミングを純関数として検証する**。`shouldStart(processed, total)` のような境界条件を純関数テストでカバーする
  3. **UX 要件は定量項目で QA チェックリストに落とす**。「停滞しない」は「1.5 秒以上の停止がゼロ回」のように測定可能な形で書く
  4. **service 層の内部フェーズ境界を UI 層が観測する手段を設計時に検討する**。`generatePdfFile` のような多段 async 関数は、フェーズ境界を UI に露出するか（`onPhaseChange` など）、UI 側で観測可能なシグナル（`onProgress` の最終発火）を起動トリガに使う

### 2026-04-09: PDF 出力進捗バーがフォールバック時に逆戻りする

- **状況**: ユーザー報告「PDF プレビュー画面で出力ボタンを押すと、進捗バーが `0% → 80% → 0% → 80% → 完了` と逆戻りし、**全ての PDF 出力で同じ挙動**」。ADR-0013 で導入したばかりの進捗バーの UX 退行
- **根本原因**: ADR-0013 のフォールバックチェーン（full → reduced → tiny）下で attempt 1 が回復可能エラー（`PdfHangError` / `OutOfMemoryError` / `BlankPdfError`）を投げると、attempt 2 の `buildPdfHtml()` 冒頭で `input.onProgress?.(0, input.photos.length)` (`pdfTemplate.ts:521`) が再発火し、UI 層の進捗バー state が 80% → 0% にリセットされていた。ユーザー報告「全 PDF 出力で同じ」から、**この環境では attempt 1 が毎回失敗している**ことも確定（別 Issue で追跡）
- **なぜ気付かなかったか（5 層）**:
  1. ADR-0013 の設計時、「フォールバックは例外時のみ」前提で、attempt 跨ぎの `onProgress` 挙動が仕様化されていなかった
  2. `pdfService.test.ts` の onProgress pass-through テストは呼び出し回数しか見ておらず、**monotonic 性を検証していなかった**
  3. 手動 QA チェックリストに「進捗バーが 0 → 100 まで単調に進むか」の項目がなかった
  4. 「全 PDF 出力で attempt 1 が失敗する」という別の異常（本丸）の存在に気付く観測性がなかった（フォールバック発火率のログ/テレメトリが存在しない）
  5. そもそも「非同期進捗コールバックは monotonic non-decreasing であるべき」という設計原則がチームのコーディングルールに文書化されていなかった
- **対策（本 PR）**:
  1. `app/reports/[id]/pdf.tsx` の `handleExport` 内で `setExportProgress` を functional setState に変え、`(prev) => prev == null ? next : Math.max(prev, next)` で monotonic にクランプ
  2. 新規テスト `__tests__/pdfExportProgressClamp.test.ts`（7 ケース）で clamp ロジックを検証
  3. ADR-0013 Notes セクションに「進捗バーは UI 層でクランプ」方針を追記
- **Follow-up（別 Issue）**: attempt 1 が毎回失敗する根本原因を実機 Logcat で調査。`skipFontEmbedding: false` のフォント埋め込みが特定の条件で fail している疑いが最有力。本 PR の UX 修正で見た目は解決するが、**画質劣化版 PDF が常時配信されている可能性**があるため優先度は中〜高
- **ルール**:
  1. **進捗コールバックは常に monotonic non-decreasing を保証する**。多層リトライ/フォールバックと共存する UI 進捗は、上流で必ずクランプする
  2. **フォールバック発火率の観測性を持つ**。日常的にフォールバックが走っている異常事態を検知できる仕組み（ログ・ラウンドトリップ計測）を設計時に組み込む
  3. ADR-0013 の手動 QA チェックリストに「進捗バーが一度も後退しないこと」を追加する

### 2026-04-08: PDF 出力ハングの 3 層原因（ストレージ・メモリ・WebView 共存）

- **状況**: ユーザーから次の 3 シナリオで PDF 出力ボタンが永久スピナーになる報告:
  1. 連続 3 回目の出力（写真 10 枚）でスピナーが止まらない
  2. 写真 40 枚（Pro）でも同症状。**ストレージを空けたら 40 枚は通った**
  3. 写真 70 枚は編集画面 → PDF プレビュー直行だと hang。「保存 → ホームに戻る → 保存済をタップ → プレビュー → 出力」だと成功する
  - スクリーンショットでは PDF プレビューが空白のまま 6 分以上スピナーで停止
- **観測**: `handleExport` の `finally` ブロックで `setExporting(false)` が呼ばれていない＝try ブロックの `Print.printToFileAsync` が **resolve も reject もしていない (hang)** ことが確定
- **根本原因（3 層モデル）**:
  1. **L1: タイムアウト不在** — `Print.printToFileAsync` は OS で hang したとき Promise が孤児化する。`pdfService.ts` には Promise.race ベースのタイムアウトが無く、JS 側で永久ブロック
  2. **L2: メモリ圧迫** — `router.push` で PDF プレビューを開いても編集画面はナビスタックに**生きたまま**残る。編集画面が抱える 70 枚の `expo-image` ビットマップ + プレビュー WebView (~100-150MB) + Print エンジンが起動する追加 WebView の **3 層共存** で native heap が枯渇。「保存 → 再オープン」が効くのは編集画面が unmount されて L2 が消えるから
  3. **L3: ストレージ圧迫** — `expo-image-manipulator` と Print エンジンが temp ファイル書き込みを試みる際、空き容量が不足すると書き込みが進まず hang
- **なぜ気付かなかったか（5 層）**:
  1. 自動テストは HTML 構造レベル（`pdfTemplate.test.ts`）のみで、ランタイム / メモリ / 連続出力の振る舞いをカバーしていなかった
  2. 手動 QA は「単発出力 1 回」しか行っておらず、「連続 3 回」「40 枚」「70 枚」の負荷シナリオがチェックリストになかった
  3. `expo-print` を「壊れない外部 SDK」として暗黙に信頼し、「resolve も reject も来ない」第 3 の状態への防御策（タイムアウト）が設計時に想定されていなかった
  4. ストレージ容量という「OS リソース」が PDF 生成の前提条件であることが ADR / lessons に明文化されていなかった
  5. ナビゲーションスタックの「複数画面同時生存」がメモリ問題の温床になり得ることが、画面遷移の設計時に考慮されていなかった
- **対策（実施済み・ADR-0013）**:
  1. `pdfService.ts:printHtml` に `Promise.race([printToFileAsync, timeout])` でラップし、タイムアウトは `30秒 + 1秒 × 写真数` の動的計算
  2. タイムアウト発火時は `PdfHangError` を throw → 既存の OOM/blank PDF リトライチェーン（full → reduced → tiny）に乗せる。フォールバック切替前に 300ms sleep
  3. `pdf.tsx:handleExport` 開始時に `setPreviewHtml(null)` + `Image.clearMemoryCache()` を呼び、WebView 解放待ちを 100ms → 350ms に延長
  4. 出力成功後は `router.dismissAll()`（フォールバック `router.replace('/(tabs)')`）で**ナビゲーションスタック全体をリセット**し、編集画面 + プレビュー画面の両方を確実に unmount
  5. `LegacyFileSystem.getFreeDiskStorageAsync()` で空き 100MB 未満なら `PdfStorageLowError` を即 throw し、明示的な Alert 表示
  6. 出力ボタンを単一プログレスバー（0-100%）に置換。写真処理 0-80%、印刷フェーズ 80-95%（擬似タイマー）、完了で 100%。**段階別ラベルは出さず**「あと何 % で終わるか」だけ見せる
  7. `finally` 内の `loadPreview()` 自動再呼び出しを廃止（連続出力時のメモリ累積を断つ）
- **ルール**:
  1. **native bridge をまたぐ Promise には必ず `Promise.race` でタイムアウトをかける**。「resolve も reject も来ない」状態を JS 側で必ず検出できるようにする
  2. **複数画面が同時に生存することによるメモリ累積を意識する**。重い画面 (WebView, 大量画像) を持つ画面遷移では、前画面の unmount を強制する手段（`router.dismissAll` / `Image.clearMemoryCache`）を組み合わせる
  3. **OS リソース（ディスク空き容量・メモリ）は PDF / 画像処理の前提条件**。事前チェックして、不足なら明示的に止める。fallback で救おうとしない
  4. **UI 進捗は「ユーザーが理解できる単位」に集約する**。段階別の技術ラベルは出さず、単一パーセンテージで残量だけ伝える
  5. **PDF 出力のような重い経路は、連続実行・大量データの負荷シナリオを手動 QA チェックリストに必ず入れる**

---

### 2026-04-07: iOS WebKit print の subpixel overflow による空白ページ（#286）
- **状況**: iOS で `expo-print` 経由で出力した PDF において、写真ページ（standard / large 共通）の直後に必ず空白ページが挿入される。Android では発生しない。空白ページには `<footer class="page-footer">` の `X/Y` ページ番号文字列だけが描画されており、本来 flex 末尾にあるべきフッターが次の PDF ページに押し出されている
- **観測（実体PDF確認）**:
  - iOS 標準 / 写真2枚: 期待 2 → 実体 **3**（末尾に空白）
  - iOS コメント / 写真1枚: 期待 2 → 実体 **3**（末尾に空白）
  - iOS コメント / 写真2枚: 期待 3 → 実体 **5**（写真間と末尾に空白）
  - 表紙・コメント分割ページでは発生せず、**写真ページでだけ**発生
- **根本原因**: `pdfTemplate.ts:buildCss()` の `.page` ルールで `.page` の高さが `@page` サイズと完全一致しており、さらに `.photo-grid { height: 100% }` が `.page-main` を埋め尽くすため、サブピクセル丸めを吸収するスラックがゼロ。iOS WebKit (UIPrintPageRenderer + WKWebView) は累積 0.5px の overflow を「次ページに送る」と判定し、flex 末尾の `.page-footer` 単体を新ページに押し出す。Android Chromium 印刷エンジンは同じ overflow を吸収して同一ページに収める。さらに `.page-footer` 自身も `box-sizing` 未指定（default content-box）なので、`height: 10mm + padding-top: 2mm + border-top: 1px = 12.265mm` の outer height となり設計値より 2.265mm 大きく、スラックを更に圧迫していた
- **なぜ気付かなかったか（5層）**:
  1. Android では Chromium 印刷エンジンが subpixel 丸めを吸収するため同じ CSS で問題が顕在化しなかった
  2. 自動テストは `calculatePageCount` のロジックレベルだけで、`buildPdfHtml()` 出力 HTML の構造（`<section class="page"` 数）を検証していなかった
  3. iOS 実機テストはマニュアル中心で、ページ数差分まで毎リリースで確認するチェックリストになっていなかった
  4. CI で実 PDF を生成して検証する仕組みがなかった（macOS + 実機/シミュ必須のため難しい）
  5. SSoT (`pdf_template.md`) に「`.page` の高さが境界条件である」ことが明文化されていなかった
- **対策（実施済み）**:
  1. `pdfTemplate.ts:buildCss()` の `.page` を `height: calc(var(--page-h) - 1mm)` に変更（1mm のスラック）
  2. `.page-footer` に `box-sizing: border-box` を追加（footer の outer height を設計値 10mm に固定し 2.265mm のスラック追加）
  3. `__tests__/pdfTemplate.test.ts` を新規追加し、`<section class="page"` 数 = `calculatePageCount` を全レイアウト × 用紙 × 写真枚数 × コメント長で網羅検証
  4. SSoT (`docs/reference/pdf_template.md`) を同じ修正に同期し、理由をコメントで明記
  5. ADR-0009 で意思決定を恒久記録
- **ルール**:
  1. **PDF テンプレ CSS の `.page` の高さは `@page` のサイズより必ず小さく設定する**（subpixel 丸めの吸収余地を確保）
  2. **HTML 出力ロジックを変更したら、出力 HTML の構造不変条件をユニットテストで固定する**（snapshot か数値 assertion）
  3. **複数の印刷エンジンを跨ぐ CSS は、Chromium / WebKit 両方の境界条件を意識する**。一方で動いても他方で動く保証はない
  4. PDF テンプレ層の変更時は SSoT (`pdf_template.md`) と実装 (`pdfTemplate.ts`) の両方を必ず同時更新する

---

## Android 戻るジェスチャー

### 2026-03-26: predictiveBackGestureEnabled: true で全画面の戻るジェスチャーがアプリ終了になる
- **状況**: Android端末で左端スワイプバック（戻るジェスチャー）をすると、前の画面に戻らずアプリが閉じる。全画面で発生
- **根本原因**: `app.json` の `predictiveBackGestureEnabled: true` が `react-native-screens` v4 未対応の Predictive Back API を有効化。ジェスチャーがJSレイヤーをバイパスし、Activity終了として処理される
- **1次情報**: expo/expo#39092（OPEN）、react-native-screens Discussion #2540（OPEN）、RN#55211（OPEN）
- **ルール**:
  1. `react-native-screens` が Predictive Back を正式サポートするまで `predictiveBackGestureEnabled: false` を維持する
  2. 非同期処理中にバックで離脱されるリスクがある画面には `BackHandler`（Android）を追加し、カスタム `handleBack` を経由させる
  3. SDK/ライブラリアップグレード時に expo/expo#39092 の解決状況を確認する

### 2026-03-26: 非インタラクティブシェルで nvm Node 20 が PATH に含まれない
- **状況**: Claude Code の Bash 環境で `node -v` が v18 を返し、EAS ローカルビルドが `toReversed is not a function` で失敗する。`.bashrc` に `nvm use 20` 設定済みだが効かない
- **根本原因**: nvm.sh は非インタラクティブシェルで PATH を変更しない場合がある。apt インストールの `/usr/bin/node` (v18) が優先される
- **ルール**:
  1. `.bashrc` の nvm セクションに「nvm が PATH を変更しなかった場合のフォールバック」を追加する
  2. `echo "$PATH" | grep -q ".nvm/versions/node"` で nvm PATH の有無を検出し、なければ直接追加
  3. `.nvmrc` や `engines` フィールドは「警告」であり「強制」ではない。PATH 自体の設定が根本対策

### 2026-03-27: Claude Code Bash 環境で ANDROID_HOME / JAVA_HOME / Node PATH が未設定（再発 #244）
- **状況**: #234 で `.bashrc` にフォールバックを追加したが、Claude Code から `eas build --local` や `./gradlew assembleRelease` を実行すると再び失敗。`ANDROID_HOME` 未設定 → SDK not found、`node -v` → v18 → `toReversed is not a function`
- **根本原因（5 Whys）**:
  1. `.bashrc` が読み込まれない → Claude Code は「非インタラクティブ・非ログイン」シェルを実行するため `.bashrc`（インタラクティブ用）も `.profile`（ログイン用）も読み込まれない
  2. 前回の修正が `.bashrc` にのみ追加された → Claude Code がこの特殊な環境であることをテストで検証していなかった
  3. 追加要因: Gradle デーモンは初回起動時の PATH をキャッシュするため、手動 export 後もデーモン再起動なしでは反映されない（[gradle/gradle#10483](https://github.com/gradle/gradle/issues/10483)）
- **対策（実施済み）**: `.claude/settings.local.json` の `env` ブロックに `ANDROID_HOME`, `JAVA_HOME`, `ANDROID_SDK_ROOT`, `PATH`（Node 20 先頭）を設定
- **ルール**:
  1. **シェル初期化ファイルに依存しない**: 環境変数は `.bashrc` / `.profile` ではなく、ツール固有の設定（Claude Code の `settings.local.json` の `env`）で設定する
  2. **修正後は失敗コンテキストで検証する**: ターミナルで動いても Claude Code の Bash で動くとは限らない
  3. **Gradle ビルド前は `./gradlew --stop` + `--no-daemon`**: PATH 変更がデーモンにキャッシュされる問題を回避する
  4. **nvm バージョン更新時は `settings.local.json` も更新する**: `v20.19.6` がハードコードされているため、nvm で新しいパッチを入れたら env の PATH も更新が必要

---

## バックアップ機能

### 2026-03-27: authorName がバックアップに含まれていなかった（#251）
- **状況**: author_name カラムが DB v3 マイグレーションで追加されたが、BackupReport 型・エクスポートマッピング・インポート INSERT 文に反映されておらず、バックアップ→復元で作成者名が消失していた
- **根本原因**: DB スキーマ変更時にバックアップ処理への影響確認プロセスがなかった
- **ルール**:
  1. `reports` / `photos` テーブルにカラムを追加したら、必ず `BackupReport` / `BackupPhoto` 型と `backupService.ts` のエクスポート・インポート処理を更新する
  2. 新フィールドは Optional（`?`）で追加し、旧バックアップとの後方互換性を保つ
  3. スキーマバージョンは Optional フィールド追加だけなら据え置く（破壊的変更のみインクリメント）

### 2026-03-27: 日本語のみバックアップ画面の翻訳が欠けていた（#251）
- **状況**: バックアップ画面の 22 キーが ja.ts に未定義で英語フォールバック表示。他 18 言語は翻訳済み
- **根本原因**: `...baseEn` スプレッドで全キーが「存在」扱いになるため、i18n:check で検出できなかった
- **ルール**:
  1. 翻訳キーを新規追加したら、全 19 言語ファイルで明示的にオーバーライドされているか確認する
  2. `...baseEn` のフォールバックに頼らない（フォールバック=未翻訳と認識する）

### 2026-03-27: ユーザー向け文言に技術用語を含めていた（#251）
- **状況**: 設定画面・バックアップ画面の説明文に `manifest.json + photos/` というファイル名・ディレクトリ名が表示されていた
- **根本原因**: 開発者がバックアップの中身を正確に説明しようとして技術用語をそのまま使った
- **ルール**: ユーザーに表示する文言に技術用語（ファイル名、ディレクトリ名、JSON、スキーマ等）を含めない。内部構造の変更時に文言との不整合が生じる保守コストも考慮する

---

### 2026-03-31: ドキュメント棚卸（PR #264）
- **状況**: docs/ 配下が85ファイル・9,500行以上に膨張。UI_Figma/src/ に技術スタック不一致のWeb版参照実装が75ファイル放置。テンプレート3ファイルで同じ項目が3重重複。MEMORY.md に幻のスクリプト参照。
- **根本原因**: ドキュメント追加時の索引更新ルールがCIで強制されていない。AI生成ドキュメントが無制限に蓄積される仕組みだった。テンプレートがチーム開発規模を前提に設計されていた。
- **対処**: 75ファイル削除（-15,282行）、テンプレート64%削減（620→225行）、Debug成果物をgitignore化（-294MB）、生成レポートをdocs/reports/に分離
- **ルール**:
  1. AI生成ドキュメントは必ず技術スタック整合性を確認してからコミットする
  2. テンプレートはソロ開発の現実的な運用負荷に合わせて設計する（facebook/react-native: 15行のPRテンプレートが参考値）
  3. バイナリ成果物（PNG/MP4/ログ）はdocs/ではなくgitignore対象のディレクトリに保存する
  4. MEMORY.md の参照先は定期的に実ファイルの存在と照合する

### 2026-03-31: ドキュメント棚卸第2弾（PR #267）
- **状況**: PR #264 でファイル数を削減したが、内容レベルの精査が不十分。全65ファイル精読で44件の問題を発見。
  - CRITICAL: データ安全性申告が「No」だが実際はAdMob/RevenueCat経由でデータ共有あり。ストア掲載文の割引率「37%」が計算間違い（実際は約16%）
  - HIGH: F-xx/S-xx番号体系がbasic_specとfunctional_specで完全に異なる。データモデルのフィールド名がドキュメント↔コードで乖離。壊れたリンク多数
  - MEDIUM: 「CIは4ゲート」の記載が7箇所で不正確（実際は5ゲート）。ファイル移動後の参照未更新
- **根本原因**:
  1. ファイル移動/リネーム時に全参照の更新を確認するプロセスがない
  2. 仕様書のID体系（F-xx, S-xx）がドキュメント間で独立に設計され、統一されなかった
  3. CIゲート追加時に関連ドキュメントの更新が漏れた
- **ルール**:
  1. ファイルを移動/リネームしたら `grep -r "旧パス" docs/ .github/ scripts/ AGENTS.md` で全参照を確認する
  2. 仕様書では機能にID番号を振らない。機能名（「PDF生成」「バックアップ」等）で参照する
  3. CIゲートやスクリプトを変更したら、そのコマンドを記載している全how-toを更新する（`pnpm verify` 1コマンドに統一推奨）
  4. ストア掲載文の数値（割引率、制限数等）は計算を明記してレビューする
  5. コンプライアンス文書（データ安全性申告）は実装（app.config.ts, 依存関係）と照合する

---

## ビルド・環境変数

### 2026-04-06: RevenueCat APIキーがビルドに含まれず課金画面が全プラン「Unavailable」
- **状況**: クローズドテスト用 .aab をビルドしてGoogle Playにアップロードしたが、Paywall画面の全プランが「Unavailable」でボタンも反応しない。iOS・Android両方で発生
- **根本原因**: EAS local build（`eas build --local`）は `.gitignore` に従い `.env` を一時ビルドディレクトリにコピーしない。環境変数は EAS サーバーの environment 設定から注入されるが、RevenueCat の API キーが EAS production 環境に未登録だった。結果、`app.config.ts` の `process.env.REVENUECAT_ANDROID_API_KEY` が undefined → `?? ''` で空文字にフォールバック → バイナリに空文字が埋め込まれた
- **なぜ ADMOB は動いたか**: ADMOB のキーは EAS production 環境変数に登録済みだったため正常に注入された
- **診断方法**: APK の `assets/app.config` を抽出して `extra` フィールドを確認 → 空文字を確認。logcat で RevenueCat/BillingClient のログがゼロ → SDK未初期化を確認
- **ルール**:
  1. 新しい API キーを追加したら **3 箇所を同時更新**: `.env`（ローカル開発）、EAS 環境変数（`eas env:create --environment production`）、`.env.example`（チーム共有）
  2. ビルドスクリプトに環境変数チェックを必ず入れる（`scripts/prebuild-env-check.mjs`）
  3. ビルド後は `assets/app.config` の `extra` フィールドで API キーの埋め込みを検証する
  4. RevenueCat SDK のログが出ない場合は、API キーの不在を最初に疑う
  5. EAS ビルドログの「Environment variables loaded from ... environment on EAS」行で、必要な変数がリストされているか確認する

---

## 画像・ファイルパス

### 2026-04-06: Store更新後にレポートの全画像が表示不能
- **状況**: App Store / Google Play 経由でアプリを更新すると、更新前に保存した全画像がレポート上で表示されなくなる。画像エリアが黒いプレースホルダー、タップするとローディングスピナーが無限回転
- **根本原因**: `photos.local_uri` に**絶対パス**（`file:///var/mobile/Containers/Data/Application/UUID/Documents/repolog/reports/...`）を保存していた。iOSではStore更新時にコンテナUUIDが変更されうるため、DBの旧パスで画像ファイルを参照できなくなった。ファイル自体はディスク上に存在するが、パスが不一致
- **なぜ開発中に気づかなかったか**: `expo run:ios` や `eas build --local` → `adb install` による更新ではコンテナUUIDが変わらない。Store経由の更新でしか再現しない
- **対策（実施済み）**: DB v5 マイグレーションで `local_uri` を相対パス（`repolog/reports/...`）に変換。読み出し時に `FileSystem.documentDirectory` をプレフィックスして絶対パスに復元する設計に変更
- **ルール**:
  1. **ファイルシステムのパスをDBに保存するときは必ず相対パスを使う**（Apple公式も明記: 「アプリコンテナへの絶対パスを永続ストレージに保存してはいけない」）
  2. `photoPathUtils.ts` の `toRelativePath()` / `toAbsolutePath()` を通じてパス変換を行う
  3. リリース前にStore更新シナリオのテスト（旧バージョン→新バージョンアップデート後にデータが残っているか）を手動チェックリストに含める
  4. DBにファイルパスを含むカラムを追加する場合は、必ず相対パスで保存されることをレビューする

---

## CI/CD

### 2026-04-06: postbuild-verify.mjs がiOS IPA未対応でTestFlightパイプライン失敗
- **状況**: GitHub Actions の `Build iOS & Submit to TestFlight` ワークフロー初回実行時、IPAビルドは成功するがpostbuild-verify.mjsのステップで `assets/app.config not found` エラーが発生。TestFlightへの提出がブロックされた
- **根本原因**: postbuild-verify.mjs はAndroid APK/AAB用に設計され、`assets/app.config` と `base/assets/app.config` のみ検索していた。IPA内ではパスが `Payload/AppName.app/assets/app.config` であり不一致。加えて `REQUIRED_KEYS` にAndroid専用キーが含まれておりiOS検証時に不適切だった
- **対策（実施済み）**: (1) パスマッチを `endsWith('assets/app.config')` に変更しIPA対応 (2) ファイル拡張子でプラットフォーム判別し必須キーを切り替え (3) JSDoc・エラーメッセージをAPK/AAB/IPA対応に更新
- **ルール**:
  1. ビルド検証スクリプトを新プラットフォームのCIワークフローで使う前に、スクリプトのJSDocとコード内パスパターンを確認する
  2. プラットフォーム固有のCIステップは、対象プラットフォームのアーカイブ形式（APK/AAB/IPA）で事前にローカルテストする
  3. 必須チェックキーはプラットフォーム別に分離する（iOSビルドにAndroid APIキーは不要）

### 2026-04-07: postbuild-verifyをiOSパイプラインから撤去（自作ZIPパーサーの限界＋検証戦略の見直し）
- **状況**: 上記 2026-04-06 の修正後の初回実行（run 24036753240）でも依然として `assets/app.config not found` で失敗。実物 IPA を artifact からダウンロードして調査した結果、修正アプローチそのものが二重に外していたことが判明
- **根本原因（事実ベースで2層）**:
  1. **パス前提が間違っていた**: 前回の commit message は「IPA は `Payload/AppName.app/assets/app.config` に置く」と書いていたが、実際には Expo の `expo-constants` が iOS では `get-app-config-ios.sh` を介して `Payload/AppName.app/EXConstants.bundle/app.config` に置く（[公式スクリプト](https://github.com/expo/expo/blob/main/packages/expo-constants/scripts/get-app-config-ios.sh)）。前回の修正は実物 IPA を `unzip -l` で1度も確認せずに推測ベースで書かれていた
  2. **自作 ZIP パーサーが Data Descriptor 形式に未対応**: 仮に上記パスマッチを正しく直しても、IPA 内の `EXConstants.bundle/app.config` エントリは Local File Header の `compSize=0` ＋ general purpose bit flag bit 3 = ON（Data Descriptor 形式、PKWARE APPNOTE 4.4.4）で書かれており、自作の LFH ベース ZIP 走査ロジックは zlib `Z_BUF_ERROR: unexpected end of file` で必ず落ちる。Android の APK/AAB は普通の格納形式（`flags=0`）なので、Android では問題が顕在化していなかった
- **対策（実施済み）**:
  1. iOS パイプラインから postbuild-verify ステップを撤去（Android 用は package.json scripts でそのまま使用継続）
  2. `prebuild-env-check.mjs` に **EAS サーバー側の環境変数を直接確認する Layer 2** を追加（`eas env:list production --json --non-interactive` の出力をパース）。これは「ビルドが本当に拾う変数」を直接見る検証なので、postbuild の IPA 中身検証より信頼度が高い。CI 上 (`process.env.CI === 'true'`) でのみ fatal、ローカルでは warning
  3. iOS リリースワークフローから `pnpm verify` も撤去（PR の `ci.yml` で同等チェック済み。リリースワークフローは build & ship に専念）
- **ルール**:
  1. **ZIP 系アーカイブのパス前提を変更する変更は、必ず実物の `unzip -l` 出力を1回以上確認した証拠を PR 本文に貼る**。実機未確認の推測ベースの修正は禁止
  2. **自作 ZIP パーサーは Android (APK/AAB) でしか使わない**。iOS の IPA は `unzip -p` か yauzl 等の Central Directory ベースのライブラリ経由で読む（Data Descriptor 対応のため）
  3. **ビルドキー検証は「手元の .env」ではなく「実際にビルドが使う EAS 環境変数」を直接見る**。`.env` チェックは下位互換のために残してよいが、本物の検証はサーバー側 env:list を使う
  4. リリースワークフローは build & ship に絞り、品質チェックは PR ワークフロー（`ci.yml`）に集約する

---

## iOS 固有 API 仕様

### 2026-04-08: SKStoreReviewController は TestFlight 配布では表示されない（Issue #289）
- **状況**: PR #285 で `expo-store-review` を導入して累計 4 回目の PDF 出力直後にレビュー依頼を出す仕組みを入れたが、iOS TestFlight ビルドで**一度もダイアログが表示されない**ことが判明
- **根本原因**: Apple の公式仕様として `SKStoreReviewController.requestReview()` は **TestFlight 配布アプリではダイアログを一切表示しない**。これはアプリ側で回避する手段がない
- **一次情報**:
  - [Apple Developer Forums: Potential Issue with SKStoreReview](https://developer.apple.com/forums/thread/794961)
  - [Critical Moments: SKStoreReviewController Guide with Examples](https://criticalmoments.io/blog/skstorereviewcontroller_guide_with_examples)
  - [react-native-rate Issue #52: not showing up in testflight](https://github.com/KjellConnelly/react-native-rate/issues/52)
- **検証可能なビルド種別**: **App Store Production 配信版** または **Xcode dev ビルド**（`expo run:ios`）のみ
- **ルール**:
  1. iOS の `expo-store-review` / `SKStoreReviewController` の動作確認は **絶対に TestFlight で行わない**
  2. 新機能 ADR の Acceptance セクションには iOS / Android を別行で書き、iOS 側には「TestFlight で確認できないもの」を明示する
  3. TestFlight でしか検証環境がない機能は、ドキュメント注記を優先する（次善策を取らず、仕様として受容する）

### 2026-04-08: expo-sharing の iOS 実装は cancel/share を区別できない（Issue #289）
- **状況**: `src/features/pdf/pdfService.ts:exportPdfFile` が iOS で無条件 `return true` を返していたため、共有シートを閉じただけで `recordExport` が走り、Free ユーザーの月次上限が実質 1 回分少なくなる事例があった
- **根本原因**: `expo-sharing` の iOS 実装は `UIActivityViewController.completionWithItemsHandler` の `(activityType, completed, returnedItems, error)` を JS 層に伝えず、Promise を undefined で resolve するだけ。ユーザーが「共有」「キャンセル」のどちらを選んだかは判別不能
- **一次情報**:
  - [expo/expo Issue #5713: Status callback for share/cancel](https://github.com/expo/expo/issues/5713)
  - [Expo Forums: Detect if canceled or closed the Sharing.shareAsync](https://forums.expo.dev/t/detect-if-canceled-or-closed-the-sharing-shareasync/24368)
- **対策（実施済み）**: ADR-0014 で「計上タイミングを PDF 生成成功直後に前倒し」することで、保存 UI の戻り値に依存しない設計に変更
- **ルール**:
  1. iOS で「OS UI のキャンセルを検知する必要がある」機能は、`expo-sharing` 以外の API を検討する（`expo-document-picker` や自作ネイティブモジュール）
  2. もしくは、**戻り値に依存しない計上ポリシー**（生成時点・試行時点）を ADR で固定する
  3. Android の SAF (`StorageAccessFramework`) は `permissions.granted` で区別できる点を忘れずに仕様書に明記する

### 2026-04-08: React state ベース reentrancy guard は同一 tick 内の 2 連発火を取りこぼす（Issue #289）
- **状況**: `app/reports/[id]/pdf.tsx:handleExport` 冒頭に `if (exporting) return; setExporting(true);` があったが、iOS Fabric + React Compiler 環境で Pressable が急速 2 連発火した場合、2 つ目の呼び出しが前 render の closure を見て guard を素通りしてしまう
- **根本原因**: `setState` は同期的に反映されない。同一 JS event loop tick 内では closure の state 値は render 時点のスナップショット
- **対策（実施済み）**: `useRef<boolean>` ベースの guard に置換（ADR-0014）。`.current` への代入は同期的なので同一 tick 2 回目は即 return
- **一次情報（参考）**: React 公式「State as a Snapshot」 / React Compiler の auto-memoize 仕様
- **ルール**:
  1. **event handler 内の二重呼び出し防止に React state を使わない**。必ず `useRef` で同期的に guard する
  2. Pressable の `disabled={state}` プロパティも同じ理由で state flush 待ちの race window を持つため、state 単独では不十分
  3. try-catch-finally で ref の解放を保証する。早期 return でも finally は走るので安全
  4. 将来この pattern を捨てようとしたら `__tests__/pdfExportGuard.test.ts` が落ちる設計にしてある

---

### Claude Code トリガーフレーズ
- 有効なフレーズ: 「デバッグセッションを分析して」「rebuild して」「Maestro スクショ付きで E2E テストして」
- 分析時は summary.md → app_logcat.log → screenshots/ の順に読むのが効率的
- before/after.png の視覚的比較が予想外の UI 変化の発見に有効
