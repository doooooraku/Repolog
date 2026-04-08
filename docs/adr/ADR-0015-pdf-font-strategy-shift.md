---

# ADR-0015: PDF はシステムフォント運用に切り替える（ADR-0002 Supersede）

- Status: Accepted
- Date: 2026-04-09
- Deciders: @doooooraku
- Related: Issue #292 / PR #293 (Phase 1 計測 + 観測性) / PR #291 (進捗バー monotonic クランプ) / PR #290 (iOS 月次カウンタ) / ADR-0002 (Superseded) / ADR-0005 / ADR-0009 / ADR-0013

---

## Context（背景：いま何に困っている？）

- **現状**: Repolog の PDF 出力は `pdfService.ts` のフォールバックチェーン
  (full quality → reduced → tiny) で生成している。Phase 1 の実機計測
  (PR #293 / Pixel 8a) により **attempt 1 (`skipFontEmbedding: false`) が
  毎回 blank PDF (681 bytes) を返している** ことが確定した。
  - 日本語レポート (latin + jp): `fontCssBytes ≈ 14.8 MB` / `totalHtmlBytes ≈ 17-18 MB`
  - 中国語簡体 (latin + jp + sc): `fontCssBytes ≈ 37.4 MB` / `totalHtmlBytes ≈ 39 MB`
  - いずれも 1〜2.6 秒で同じ 681 bytes を返す silent failure（hang でも OOM でもない）
- **困りごと**:
  - ユーザーは常に attempt 2 (`imagePreset: 'reduced'` = 800/1000 px @ quality 0.65)
    の**画質劣化版 PDF** を受け取っている。`pdfImageConfig.test.ts` の「150 DPI 以上」
    目標が実質的に破綻している（A4 standard で約 109 DPI）
  - Repolog の Pro 課金の核心価値「高画質の提出用 PDF」が毀損されている
  - lessons.md 2026-04-09 Follow-up に「画質劣化版 PDF が常時配信されている可能性」
    と明記された既知の劣化だが、ADR-0002 の「フォント埋め込みで固定」前提に
    縛られて Phase 2 方針の決定が保留状態だった
- **根本原因**: `@font-face { src: url('data:font/ttf;base64,...') }` を含む
  15-40 MB の HTML を `Print.printToFileAsync` に渡すと、Android Chromium
  印刷エンジンがフォント処理に失敗し中身のない最小 PDF を返す。HTML サイズが
  2.4 倍違っても失敗サイズは同じ 681 bytes なので「境界超過」ではなく
  「data URI `@font-face` 自体の処理失敗」が疑わしい（SDK 53→54 の Chromium
  バージョンアップで厳格化された可能性）
- **制約/前提**:
  - `docs/reference/constraints.md`: 19 言語対応・提出に強い PDF
  - ADR-0009: 写真ページの subpixel スラック（iOS WebKit 対策）は維持する
  - ADR-0013: フォールバックチェーン (hang / OOM / blank の多層防御) は維持する
  - 依存追加ゼロ（`expo-print` / `expo-image-manipulator` / `expo-file-system`
    の既存 API のみで完結させる）

---

## Decision（決めたこと：結論）

- **決定**: PDF 生成のすべての経路で **カスタムフォント埋め込みを使用せず、
  OS のシステムフォントで描画する**
  1. `pdfService.ts` の attempt 1 options に `skipFontEmbedding: true` を追加
  2. 画像は attempt 1 の仕様を維持（`imagePreset` undefined → standard 1200px /
     large 1600px @ quality 0.80）
  3. 19 言語の描画は `pdfFontStack` の system font fallback
     (`system-ui, -apple-system, Segoe UI, Arial, sans-serif`) に委譲する
  4. ADR-0002「PDF は Noto Sans 系フォントを埋め込みで固定する」を **Superseded**
     に変更する
- **適用範囲**: v1.x 以降の全 PDF 出力経路（standard / large × A4 / Letter ×
  Free / Pro、iOS / Android）

---

## Decision Drivers（判断の軸：何を大事にした？）

- **Driver 1 — 画質の即時回復（Pro 課金の核心価値）**: Pro ユーザーは「高画質の
  提出用 PDF」のために課金しており、劣化版が常時配信されている状態は最優先で
  止める必要がある
- **Driver 2 — 依存追加ゼロ**: Phase 1 lessons で挙がっていた「ビルド時フォント
  サブセット化 (pyftsubset)」は build 系の新規依存・CI 統合・future SDK での
  再発リスクを抱える。**シンプルに埋め込みをやめる**方がロバスト
- **Driver 3 — ユーザー要求との整合**: 2026-04-09 の確認で「attempt 2 (=
  システムフォント) のフォント表示で問題なし。画質だけ attempt 1 に戻したい」
  と明言された
- **Driver 4 — OS 標準フォントのカバレッジ**: Android 7+ / iOS は CJK / 欧文 /
  アラビア / ヘブライ等の主要言語を OS 標準フォントで描画できる
  （Android: Roboto + Noto CJK system / iOS: SF Pro + Hiragino Sans 等）
- **Driver 5 — ロールバック容易性**: コード修正は 1 ファイル 1 行。問題があれば
  `git revert` 即戻し可能

---

## Alternatives considered（他の案と却下理由）

### Option A: ビルド時フォントサブセット化（pyftsubset / subset-font）

- 概要: Noto Sans 系フォントをコードポイントでサブセット化し、各ファミリを
  1-2 MB に圧縮（cssBytes を現状の 14-37 MB から < 3 MB に抑制）して
  `@font-face` 埋め込みを維持する
- 良い点: 「全端末で同一見た目」という ADR-0002 の価値を維持できる
- 悪い点:
  - Python toolchain (`pyftsubset`) or Node toolchain (`subset-font`) の
    ビルド時統合が必要
  - CI に subset ビルドジョブを追加する必要
  - 将来の SDK アップグレードで Chromium 印刷エンジンの境界条件が再度変化した
    場合、同じ問題が再発する脆弱性
  - Variable font の axis 削減が CJK で見た目に影響する可能性
- 却下理由: ユーザーが「フォント不要」と明言しているため、この複雑性は過剰
  （Phase 1 lessons の Phase 2 方針として挙げていたが、ユーザー確認で不採用
  に確定）

### Option B: 本 ADR（attempt 1 に `skipFontEmbedding: true` を追加）

- 採用

### Option C: フォント asset (`assets/fonts/*.ttf`) と `pdfFonts.ts` を
同時削除

- 概要: Option B に加えて、dead code になる `pdfFonts.ts` /
  `pdfFontSelection.ts` / `assets/fonts/Noto*.ttf` / `pdf-font-benchmark.mjs`
  / 関連テストを**本 PR でまとめて削除**する
- 良い点: APK/AAB サイズが削減される（Noto Sans 系 Variable フォント 7 個分）
- 悪い点:
  - 動作確認前の削除はロールバック時に asset 復元が必要で、リスクが大きい
  - 実装変更（1 行）と削除作業（10+ ファイル）を同一 PR に混ぜると
    「失敗時の切り分け」が難しくなる（失敗が font 削除側なのか skip 側なのか
    判別困難）
- 却下理由: **リスク分離原則**。本 ADR では Option B に限定し、削除は
  Phase 2b フォローアップ PR で実機確認後にまとめて実施する

### Option D: HTML 構築を分割 → `pdf-lib` で結合

- 概要: ADR-0013 で既に却下済み
- 却下理由: ADR-0009 の subpixel スラック保護が壊れるリスク、依存追加

### Option E: `file://` URI での @font-face 参照

- 概要: data URI ではなく file URI で font を参照
- 却下理由: コミット `88b0bd9` で revert 済み。Android WebView が
  `file://` をブロックするため動作しない

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）

- Issue #292 のクローズ: attempt 1 が 100% 成功するようになる
- PDF の画質が 1200/1600 px @ quality 0.80 に戻る（A4 standard で 164 DPI、
  large で 219 DPI、150 DPI 目標を満たす）
- `totalHtmlBytes` が 17-18 MB → 数百 KB に激減し、副次効果として**高速化**
  （HTML 文字列の GC コスト + Print エンジンへの IPC 転送コストが大幅に減る）
- フォールバックチェーン (reduced / tiny) が本来の役割（OOM / hang 時の
  安全弁）に戻る。これまで「全ユーザーがフォールバックを踏んでいた」
  異常事態が解消する
- Phase 2 lessons の「ビルド時フォントサブセット化」という大工事を不要にし、
  **1 行修正**で根治
- iOS / Android で挙動が統一される（両方とも system font に）

### Negative（辛い/副作用）

- **OS 間・端末間で字形が微妙に異なる**: ADR-0002 の「提出先でも同じ見た目」
  という価値を部分的に放棄する。ただし Repolog の現場報告書用途では受け取り側
  が印刷するケースが多く、画質 >>> フォント字形一致の重要度という判断
- **古い Android 端末で一部言語の豆腐化リスク**: 特にタイ語・デーヴァナーガリー
  等、OS 標準フォントのカバレッジが弱い言語では `pdfFontStack` が sans-serif に
  最終フォールバックしたときに □□□ になる可能性がある。手動 QA で検出する
- **dead code が残る**: `src/features/pdf/pdfFonts.ts` / `pdfFontSelection.ts`
  / `assets/fonts/Noto*.ttf` / `scripts/pdf-font-benchmark.mjs` /
  `__tests__/pdfFontSelection.test.ts` が本番経路から呼ばれなくなる。
  Phase 2b follow-up PR で削除予定

### Follow-ups（後でやる宿題）

- [ ] **Phase 2b PR**: 以下を削除
  - `src/features/pdf/pdfFonts.ts`
  - `src/features/pdf/pdfFontSelection.ts`
  - `assets/fonts/NotoSans*-Variable.ttf` × 7 (+ `assets/fonts/licenses/OFL.txt`)
  - `scripts/pdf-font-benchmark.mjs`
  - `docs/how-to/testing/pdf_font_benchmark.md`
  - `docs/reports/benchmarks/pdf_font_benchmark.latest.md`
  - `__tests__/pdfFontSelection.test.ts` / `__tests__/pdfWarningI18n.test.ts`
    のフォント関連部分
  - `app.json` の `PDF_FONT_SUBSET_EXPERIMENT: "1"` flag
    （2026-04-09 時点で `app.config.ts` / `src/` / `scripts/` から grep でも
    一切参照されていない **dead config** と確認済み）
  - `docs/how-to/testing/testing.md` / `docs/how-to/development/android_device.md`
    の `PDF_FONT_SUBSET_EXPERIMENT` 関連記述
- [ ] 多言語 PDF スナップショット QA を `docs/how-to/workflow/google_play_release.md`
  / `ios_testflight_release.md` のリリースチェックリストに追加
- [ ] ADR-0013 Follow-ups に「各 attempt を強制発動する dev モード」を追加
  （フォールバック経路を本番品質として継続検証する仕組み）
- [ ] `docs/reference/lessons.md` に「外部 SDK の境界条件で発生した silent
  failure は、実装の前提そのものを見直す機会になる」という学びを恒久化

---

## Acceptance / Tests（合否：テストに寄せる）

- **正（自動テスト）**:
  - Jest: `__tests__/pdfService.test.ts` の新規ケース
    `'attempt 1 does not embed @font-face (system fonts only)'` が緑
    - `mockPrintToFileAsync` が 1 回のみ呼ばれる（フォールバック不発動）
    - `mockPrintToFileAsync.mock.calls[0][0].html` に `@font-face` と
      `data:font/ttf;base64` のいずれも含まれない
  - Jest: 既存の `pdfTemplate.test.ts`（96 ケース）・`pdfImageConfig.test.ts`
    （DPI 検証）・`pdfExportProgressClamp.test.ts`（monotonic クランプ）が
    全て緑のまま
  - CI: `pnpm verify` (= lint + type-check + test + i18n:check + config:check)
    が緑

- **手動チェック**（PR マージ前必須）:
  - 手順:
    1. Pixel 8a (Dev Build) で日本語レポート × 写真 10 枚を PDF 出力
    2. logcat で以下を確認:
       - `[PDF] buildPdfHtml: ... skipFontEmbedding=true cssBytes=0`
       - `[PDF] printHtml:` が 1 回のみ
       - `[PDF] assertPdfLooksValid: sizeBytes=N status=valid` (N ≫ 1024)
       - `[PDF] buildPdfFontCss` は出力されない
    3. 生成された PDF を開き、写真が鮮明（1200px 相当）であることを目視確認
    4. 多言語チェック: ja / en / zh-CN / zh-TW / ko / th / hi の 7 言語を
       レポート名・コメント・キャプションに入れて PDF 生成 → 豆腐化ゼロ
    5. 連続出力: 写真 10 枚 × 5 回連続で全回成功
    6. 大量写真: 40 枚 / 70 枚で出力成功
    7. iOS TestFlight で同じ 7 言語チェックを再現
  - 期待結果: 全ステップが成功し、どの言語でも豆腐化が発生しない

---

## Rollout / Rollback（出し方/戻し方）

- **リリース手順への影響**: なし。依存追加・ストア申請メタデータ・DB スキーマ・
  EAS env vars に一切影響しない
- **ロールバック方針**: `git revert <merge_commit>` → CI 通過後 main に戻す。
  変更が `pdfService.ts` の 1 箇所 + テスト + ドキュメントなので安全
- **検知方法**:
  - CI: `pnpm verify` が落ちれば即検出
  - リリース後: logcat の `[PDF] assertPdfLooksValid: status=blank` ログが
    出ていないこと。出ていれば attempt 1 が再び失敗している証拠で要調査
  - ユーザー報告: 「PDF の文字が □□□ になった」報告が出れば Phase 2b で
    その言語のみ部分埋め込みを復活させる検討に入る

---

## Links（関連リンク：正へ寄せる）

- 実装: `src/features/pdf/pdfService.ts`
- テスト: `__tests__/pdfService.test.ts`
- Phase 1 観測性: `src/features/pdf/pdfFonts.ts` / `pdfTemplate.ts` /
  `pdfService.ts` の `[PDF] ...` 構造化ログ (PR #293)
- lessons: `docs/reference/lessons.md` > PDF 生成 > 2026-04-09
- 関連 ADR: ADR-0002 (Superseded) / ADR-0005 (19 言語) / ADR-0009 (iOS subpixel) /
  ADR-0013 (resilience + progress)
- Issue: #292
- PR: #293 (Phase 1) / #291 (progress clamp)
- package.json: `expo-print@~15.0.8` / `expo-image-manipulator@~14.0.8` /
  `expo-file-system@~19.0.21`
- CI: `.github/workflows/ci.yml` (`pnpm verify`)
- 外部 docs: [expo-print](https://docs.expo.dev/versions/latest/sdk/print/) /
  [CSS font-family fallback](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family)

---

## Notes（メモ：任意）

- **ADR-0002 との関係**: ADR-0002 の「フォント埋め込みで提出先と同じ見た目を
  担保する」という価値観は 2026-01 時点で正しかったが、SDK 54 + Android
  Chromium の挙動変化で前提が崩れた。本 ADR は ADR-0002 を supersede し、
  「OS 間で字形が微妙に異なるのは許容する」方針に転換する
- **ADR-0005 (19 言語) との関係**: 「19 言語で文字化けしない」という価値は、
  フォント埋め込みから **OS 標準フォントのカバレッジ** に委譲する。手動 QA で
  検証する前提
- **ADR-0013 (resilience) との関係**: フォールバックチェーン
  (reduced / tiny) は引き続き OOM / hang 時の安全弁として機能する。
  attempt 2 / 3 にも `skipFontEmbedding: true` は既に適用されているため変更不要
- **進捗バー monotonic クランプ (PR #291) との関係**: `pdfExportProgressClamp.test.ts`
  の UI 層クランプは、attempt 1 が成功するようになっても「将来の回帰防護層」
  として残す
- **`pdfFontStack` の fallback 順序**: 先頭 7 個の `"Noto Sans"` / `"Noto Sans JP"`
  等は `@font-face` が無い状態では解決不能になり、ブラウザは自動的に
  `system-ui` → `-apple-system` → `Segoe UI` → `Arial` → `sans-serif` の
  順にフォールバックする。これは W3C CSS Fonts Module の仕様通りの挙動
- **一時的な dead code**: `pdfFonts.ts` / `pdfFontSelection.ts` / `assets/fonts/`
  は本 PR では残す（ロールバック容易性のため）。Phase 2b で削除予定
