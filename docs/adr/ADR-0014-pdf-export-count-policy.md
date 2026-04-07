# ADR-0014: PDF 出力回数の計上ポリシーと reentrancy guard の ref 化

- Status: Accepted
- Date: 2026-04-08
- Deciders: @doooooraku
- Related: Issue #289 / ADR-0012 / ADR-0013 / `app/reports/[id]/pdf.tsx` / `src/features/pdf/pdfService.ts` / `docs/reference/lessons.md`

---

## Context（背景：いま何に困っている？）

ユーザーから 2026-04-07 に以下のバグ報告を受けた（iOS TestFlight 実機）:

> iOS 端末で、Free プランの PDF 出力が **5 回目の押下で「今月の上限に達しました」が出てしまい 5 回目が出力できない**。Android では 6 回目で表示されるのが想定。

再現環境: TestFlight ビルド、アンインストール → 再インストール直後、5 回連続で PDF 出力ボタン押下（5 件の新規レポートそれぞれで 1 回ずつ）。5 回目で `pdfExportLimitTitle` / `pdfExportLimitBody` のダイアログが表示されて出力不可。

### 困りごと

- Free ユーザーが **constraints §2-2「PDF出力 月5回まで」の権利を 1 回分ロスしている**
- iOS だけ Android と体験が異なる（プラットフォーム整合性の破綻）
- App Store レビューで「Android 版より制限が厳しい」と低評価を付けられるリスク
- Free → Pro 転換 KPI (`docs/explanation/product_strategy.md` §7 KPI #5) に悪影響

### 原因の 2 層モデル

原因調査で、単一のバグではなく **2 つの独立した欠陥が重なった結果**だと判明した。

**L1: React state ベースの reentrancy guard が同一 tick 内の 2 連発火を取りこぼす**

`app/reports/[id]/pdf.tsx` の `handleExport` 冒頭には以下の guard があった:

```ts
const [exporting, setExporting] = useState(false);

const handleExport = async () => {
  if (!reportId) return;
  if (exporting) return;       // ← 同一 render の closure を見る
  setExporting(true);           // ← 次 render までこの値は反映されない
  // ...
};
```

React の `setState` は**同期的には反映されない**。同一 JS event loop tick 内で `handleExport` が 2 回呼ばれた場合、2 つ目の呼び出しは前 render の閉じた `exporting === false` を見てしまい、guard を素通りする。

この現象は以下で起きやすい:
- iOS Fabric (New Architecture) の Pressable は特定条件で onPress を連続 2 回発火する報告がある
- `app.json` の `experiments.reactCompiler: true`（React Compiler 実験フラグ）は auto-memoize を行い、event handler の closure が想定外のタイミングで参照される

結果、1 つの押下で `recordExport` が 2 回走る事象が発生し得る。4 回の正常押下で exports テーブルに 5 レコードが入り、5 回目の事前チェック `count >= 5` でブロックされた。

**L2: iOS 共有シートの cancel/share を区別できない**

`src/features/pdf/pdfService.ts:exportPdfFile` の iOS 分岐は:

```ts
await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
return true;  // ← 共有でもキャンセルでも常に true
```

`expo-sharing` の iOS 実装は `UIActivityViewController.completionWithItemsHandler` の
`(activityType, completed, returnedItems, error)` を JS 層に伝えない（[expo/expo#5713](https://github.com/expo/expo/issues/5713)、[forums.expo.dev](https://forums.expo.dev/t/detect-if-canceled-or-closed-the-sharing-shareasync/24368)）。そのため `recordExport` は
「保存成功後」に置かれているのに、実際には「共有シートを閉じた時点で必ず走る」挙動になっていた。Android の SAF は `permissions.granted` で区別できるためこの差は iOS 特有。

### 制約/前提

- `docs/reference/constraints.md` §1-1（Local-first: 外部通信なし）を破らない
- `docs/reference/constraints.md` §2-2「Free PDF出力 月5回まで」の数値は据え置き
- 新しい SDK / ネイティブモジュール追加は避ける（prebuild 構成を安定させる）
- 19 言語サポート（i18n キー追加なし）
- ADR-0013 の resilience 設計（timeout / fallback / progress / `router.dismissAll()`）を破らない
- ADR-0012 の review prompt ロジック（4 回目・20 回目発火）を破らない

---

## Decision（決めたこと：結論）

### 決定 1: `handleExport` の reentrancy guard を `useRef` ベースに置換する

同期的に読み書きできる `useRef<boolean>` を使い、state flush を待たずに二重呼び出しを即座にブロックする:

```ts
const exportingRef = useRef(false);

const handleExport = async () => {
  if (!reportId) return;
  if (exportingRef.current) return;
  exportingRef.current = true;
  setExporting(true);
  try {
    // ...
  } finally {
    setExporting(false);
    exportingRef.current = false;  // guard 解放
  }
};
```

### 決定 2: PDF 出力回数の計上タイミングを「**PDF 生成成功時**」に変更する

`recordExport` / `countAllExports` / `maybeRequestReview` の呼び出しを、`exportPdfFile`（共有 UI）の **前**に移動する。意味論:

- **旧**: 「1 回の出力 = 保存先 UI での成功確認」（iOS は実際には区別不能で「シート閉じた時」）
- **新**: 「1 回の出力 = PDF ファイルが生成完了した時」

この結果、iOS / Android 両プラットフォームで**完全に同じ条件**で計上される。共有シートのキャンセル・ハング・Android SAF の拒否などの戻り値差異を全て吸収する。

### 決定 3: 診断 `console.warn` を一時的に追加する

`handleExport` 冒頭と `recordExport` 直前に以下を 1 行ずつ追加:

```ts
console.warn('[PDF] handleExport invoked', new Date().toISOString());
console.warn('[PDF] recordExport called', new Date().toISOString());
```

次回 TestFlight ビルドで実機ログを取り、「1 回の押下で 1 回ずつ出ているか」を裏取りする。想定通りなら **次の PR で両方削除する**。
`src/services/reviewPromptService.ts` が同様の `console.warn('[ReviewPrompt] ...')` パターンを既に採用しているため、運用一貫性もある。

### 適用範囲

- v1.x 以降すべて（`expo-sharing` の iOS 実装が変わらない限り恒久）

---

## Decision Drivers（判断の軸）

1. **クロスプラットフォーム整合性**: iOS と Android で同じ権利（月5回）が実質同じに行使できること
2. **最小侵襲**: コード変更は `pdf.tsx` 1 ファイル・十数行。新しい SDK / ネイティブモジュール不要
3. **リスク低減**: ref guard は React の基本パターンで、State Management の新設より安全
4. **運用デバッグ性**: 診断ログで原因を実機で直接確認できる（仮説確定）
5. **ADR-0013 との整合**: resilience 設計の `router.dismissAll()` フローと喧嘩しない

---

## Alternatives considered（他の案と却下理由）

### Option A（採用一部）: ref guard のみ（計上タイミングは据え置き）

- 概要: L1 だけ直す。iOS の共有シートキャンセル混入（L2）は放置
- 良い点: 変更がさらに小さい
- 悪い点: iOS 特有の「シート閉じたら消費」挙動が残り、クロスプラットフォーム差が完全には解消しない
- 却下理由: **不完全**。採用した A + B の組み合わせの方が defense-in-depth になる

### Option B: iOS 専用の `UIActivityViewController` をネイティブモジュールで自作

- 概要: `expo-sharing` をやめ、Expo Modules API で iOS の `completionWithItemsHandler` 結果を JS まで渡す
- 良い点: 「保存成功だけ計上」が iOS でも可能になる
- 悪い点:
  - ネイティブコード + Podfile + prebuild 構成が複雑化
  - 他のアプリ（backupService の zip 共有）と挙動が分岐する
  - Expo SDK アップグレード時の保守コストが増える
- 却下理由: ROI が悪い。`expo-sharing` 側で上流修正される見込みが立ってから検討する

### Option C: Free 月次カウンタを `count > 5` に緩和（+1 の cushion）

- 概要: `if (count >= 6)` にして 1 回分の余裕を持たせる
- 良い点: 1 行で終わる
- 悪い点: constraints §2-2「月5回まで」と矛盾。Android でも 6 回できるようになる
- 却下理由: 仕様破壊。採用しない

### Option D: iCloud Backup から SQLite を除外する（`NSURLIsExcludedFromBackupKey`）

- 概要: uninstall/reinstall で過去の exports が復元される可能性を潰す
- 良い点: 「復元された旧 exports」起源のバグを防げる
- 悪い点: **ユーザーのレポートデータ全体が iCloud Backup から外れる**。端末買い替え時にデータ損失
- 却下理由: ユーザー体験の悪化がバグ修正より致命的。Repolog 独自のバックアップ機能（ADR-0004）があるが、ユーザーが自発的に取らない限りデータは失われる

### Option E: `router.dismissAll()` に依存して「1 押下 = 1 画面 mount」を強制

- 概要: 現状 ADR-0013 で既に `dismissAll()` が入っているので、2 回目の押下は新しい component instance になり、ref も state も new になる → double-fire は起こらないはず
- 良い点: 追加コードゼロ
- 悪い点: 同一 render 内での double-fire が起きたら防げない（同じ instance）。Pressable の rapid double-fire は render unmount より高速に起こり得る
- 却下理由: 防御の第一線として不十分。決定 1 の ref guard を追加することで両方カバーする

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）

- iOS / Android で月次カウンタの意味論が完全一致
- Pressable の rapid double-fire に強くなる（将来の RN upgrade や Pressable の実装変更にも耐性）
- `recordExport` が失敗しても共有シートは開く（旧実装と同じ挙動を維持）
- 変更は `pdf.tsx` 1 ファイルのみ。SQLite スキーマ変更なし、マイグレーション不要
- 新規依存ゼロ、i18n キー追加ゼロ、ストア申告メタデータへの影響ゼロ

### Negative（辛い/副作用）

- **意味論の変更**: 共有シートを**キャンセル**しても 1 回消費される（旧: Android だけ消費されなかった）。ユーザーから「保存していないのに減った」というクレームが稀に来る可能性あり → 文言更新で明示
- **Pro ユーザーのレビュー依頼閾値**（ADR-0012）: Pro 20 回目の発火タイミングが、共有シートキャンセルも含む「生成回数」に変わる。ほぼ影響ないが ADR-0012 の Notes で明示
- **診断 `console.warn` が本番ログに出続ける**: 次 PR で削除予定。それまでは Xcode Console / Android logcat にノイズが出る

### Follow-ups（後でやる宿題）

- [ ] 次 TestFlight 検証（v1.0.1-rc.1）で「1 押下 = 1 recordExport」を実機ログで確認する
- [ ] 確認が取れたら、次 PR で `console.warn` を削除する
- [ ] `src/features/pdf/pdfService.ts:exportPdfFile` の iOS 分岐は `return true` 固定のままで良いか次の整理時に再検討
- [ ] Jest で expo-sqlite を mock する基盤整備（Repository 層の境界値テスト追加のため）。今回は scope 外

---

## Acceptance / Tests（合否：テストに寄せる）

### 自動テスト

- **Jest**: `__tests__/pdfExportGuard.test.ts`（新規）
  - ref ベース guard が同一 tick 内の 5 並列呼び出しを 1 回に抑制すること
  - 逐次呼び出しは全て成功すること
  - throw しても ref が finally で解放されること
  - （参考）state ベース guard では同一 tick の 2 回目も通ってしまうこと
- **pnpm verify**（lint + type-check + jest + i18n:check + config:check）が緑
- 既存 `__tests__/reviewPromptService.test.ts` は変更なし、そのまま緑

### 手動チェック（実機）

**iOS (TestFlight v1.0.1-rc.1)**:
1. アプリをアンインストール → 再インストール
2. レポート 5 件を作成し、それぞれで PDF 出力 → Files に保存
3. **5 回目の押下が通過すること**を確認
4. 6 回目の押下で「今月の上限に達しました」ダイアログが出ることを確認
5. 共有シートを意図的にキャンセルしても、**生成済みの 1 回は消費されている**ことを確認
6. Xcode の Console.app で `[PDF] handleExport invoked` と `[PDF] recordExport called` が**ボタン押下 1 回につきそれぞれ 1 回ずつ**出ていることを確認
7. レビュー依頼ダイアログは TestFlight では**表示されない**（Apple 仕様）ことを確認

**Android (Pixel 8a)**:
- リグレッションなし。5 回保存 → 6 回目ブロック
- 4 回目で Google Play In-App Review ダイアログ表示
- SAF キャンセルしても生成済みの 1 回は消費される（新ポリシー）

---

## Rollout / Rollback（出し方/戻し方）

- **リリース手順への影響**: なし。通常の PR マージ → タグ push → `build-ios-testflight.yml` が TestFlight に自動提出
- **ロールバック方針**: `git revert` 1 コミットで戻せる。戻すと L1 / L2 両方のバグが復活する
- **検知方法**:
  - Xcode Console.app で `[PDF] handleExport invoked` のログ行数 vs 実際の押下回数
  - ユーザーから「5 回目で上限が出る」という新規報告がゼロであること
  - Google Play / App Store レビューに「月5回のはずが実質4回」という不満が新規投稿されないこと

---

## Links

- Issue: #289
- constraints: `docs/reference/constraints.md` §1-1 / §2-2
- reference: `docs/reference/basic_spec.md` §5
- ADR-0012: `docs/adr/ADR-0012-in-app-review-trigger.md`（レビュー依頼閾値の定義）
- ADR-0013: `docs/adr/ADR-0013-pdf-export-resilience-and-progress.md`（PDF 出力パイプラインの前段設計）
- lessons: `docs/reference/lessons.md`「iOS 固有 API 仕様」節
- code: `app/reports/[id]/pdf.tsx:handleExport`
- tests: `__tests__/pdfExportGuard.test.ts`
- expo-sharing iOS 制約: [expo/expo#5713](https://github.com/expo/expo/issues/5713) / [forums.expo.dev](https://forums.expo.dev/t/detect-if-canceled-or-closed-the-sharing-shareasync/24368)
- React Compiler: `app.json` の `experiments.reactCompiler: true`

---

## Notes

- Plan agent の検証で「Pressable の常時 double-fire なら 3 回目でブロックされるはず」と指摘を受けた。実際のユーザー報告（5 回目でブロック）と整合させるには「たまに double-fire する」前提が必要。これは診断ログで確証を取るまで仮説扱い
- ADR-0013 で追加された `router.dismissAll()` は、**成功後の次の押下**を新しい component instance に隔離する効果はあるが、**同一 handler 呼び出し内での double-fire**は防げない。ref guard がそこを補完する
- constraints §2-2 と basic_spec §5 は本 ADR と同時に同期更新する（脚注追加）。SSoT の不整合を残さない
