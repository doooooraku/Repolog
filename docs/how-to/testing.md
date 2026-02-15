

# docs/how-to/testing.md


# Testing（CIと同じようにテストして、落ちたら直す）
この文書は **How-to（やり方）** です。  
「なぜこのテストが必要か」は Explanation / ADR 側に寄せます。  
ここでは **“どうやってテストを回して合否を見るか”** だけを扱います。

---

## 0. この文書はいつ使う？
- PRを出す前（最低限ここに書いてあるテストを通す）
- CIが落ちたとき（どこを見て、どう再現するか）
- 受け入れ条件を「実行できる仕様」に寄せたいとき（テストを追加したいとき）
- バックアップImport/Export障害を切り分けるとき（`docs/how-to/backup_restore.md`）

---

## 1. まず「どこが正（source of truth）か」を固定する
### 1.1 正（source of truth）
- **CIで実行される順番**：`.github/workflows/ci.yml`
- **実行コマンドの定義**：`package.json` → `scripts`

Repolog の scripts（例）：
- `pnpm lint`
- `pnpm type-check`
- `pnpm test`
- `pnpm test:e2e`（Maestro smoke）
- `pnpm i18n:audit -- <locale>`（翻訳フォールバック監査）

> How-to は「コマンド暗記」より  
> **“ここを見れば最新版”** を固定してリンクする方がズレません。

---

## 2. 最短ルート：まずは「CIと同じ4つ」
PR前に最低限これを通します（CIでも必ず走る）。

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm type-check
```

> `pnpm type-check` はアプリ本体を対象にします。  
> `docs/reference/UI_Figma` は「Figma由来の別コード束」なので、ルートの型検査から除外しています。  
> UI_Figma 側を編集したときは `docs/reference/UI_Figma` で個別に `npm run build` して確認します。

> もし「まだテストが1本も無い」状態なら  
> まずは **最低限のテストを1本追加**するのが本筋。  
> どうしても今は難しい場合だけ、**一時措置として**  
> `pnpm test -- --passWithNoTests` を使う（CIは `pnpm test` のまま）。  
> ※ テストが追加されたら **必ず元に戻す**

### コマンドの意味（初心者向け）

* `pnpm install --frozen-lockfile`

  * 依存関係（ライブラリ）を入れる
  * `--frozen-lockfile` は「lockfileと矛盾したら失敗する」安全モード
    → CIと同じ状態になりやすい
* `pnpm lint`

  * ESLintで「書き方のルール違反」を見つける（早い・安い）
* `pnpm type-check`

  * TypeScriptの型チェック（実行しなくてもバグを見つける）
* `pnpm test`

  * Jestで自動テスト（仕様の合否を機械が判定）

## 2.1 リリース前 実機チェックリスト（Android / iOS）
リリース候補（RC）を作る前に、最低限このチェックを実機で実施します。  
不具合が見つかったら、Issueに再現手順とスクリーンショットを添えて起票します。

- [ ] Homeから新規レポート作成導線が表示される（空状態・既存レポートありの両方）
- [ ] Settingsの `Include location` だけで位置情報ON/OFFを切り替えられる
- [ ] Report Editor に `Include location` トグルが重複表示されない
- [ ] 位置情報OFF時は権限要求されず、位置情報欄は `-` 表示になる
- [ ] 位置情報ON時は初回作成で自動取得され、`Refresh location` で再取得できる
- [ ] `Camera` で撮影した写真がPhotosに反映される
- [ ] `Library` で選択した写真がPhotosに反映される（複数選択時も確認）
- [ ] `PDF Preview` ボタンが視認しやすく、タップ可能である
- [ ] 写真0枚レポートでPDFプレビューが開き、異常な待機が発生しない
- [ ] 写真ありレポートでPDF出力でき、OS保存先選択UIが表示される
- [ ] Free制限（10枚上限 / 月5回上限 / Large出力制限）が仕様どおり動作する
- [ ] 明テーマ・暗テーマで主要テキストとボタン可読性に問題がない

---

## 3. E2E（必要なときだけ）：Maestro smoke

Repolog には E2E の入口として `test:e2e` が用意されています。
ただし **2026-02-10 以降、Maestro Smoke は必須マージ条件ではありません**（任意実行）。

```bash
pnpm test:e2e
```

### 3.1 何が起きる？

* Maestro が `maestro/flows/*.yml` を順番に実行する
  - `smoke.yml`（Home↔Settings）
  - `report-photo-edit.yml`（写真追加/並び替え/削除/再表示）
  - `settings-language-persistence.yml`（言語保持）
* アプリを起動して、主要導線の回帰を確認する

### 3.1.1 まず最初に直すべきこと（重要）
* `maestro/flows/*.yml` の `appId` が実アプリID（`com.dooooraku.repolog`）と一致しているか確認する
* E2Eで使う `testID` が実装側にあるか確認する（無ければ追加）

### 3.2 ここが注意（詰まりやすい）

* 端末/エミュレータが必要
* 初回は Maestro CLI のインストールが必要
  - 例: `curl -Ls \"https://get.maestro.mobile.dev\" | bash`
* CIでは条件付きで走る設定になっている場合がある（SecretsやAPKの有無）

### 3.3 GitHub Actions での自動実行（Maestro Smoke）

Repolog では `.github/workflows/maestro-smoke.yml` を用意し、  
毎日（JST 03:15）と手動実行で smoke フローを回せる。

```bash
# 手動でMaestro Smokeを起動
gh workflow run maestro-smoke.yml --repo doooooraku/Repolog

# 直近のMaestro Smoke実行を確認
gh run list --repo doooooraku/Repolog --workflow "Maestro Smoke" --limit 5

# 状態（queued / in_progress / completed）をJSONで確認
gh run view <run-id> --repo doooooraku/Repolog --json status,conclusion,createdAt,updatedAt,jobs

# 1件の詳細ログを確認
gh run view <run-id> --repo doooooraku/Repolog --log
```

コマンドの意味:
- `gh workflow run`: 指定workflowを手動起動
- `gh run list`: 実行履歴一覧を取得
- `gh run view --json`: キュー滞留か実行中かを機械的に確認
- `gh run view --log`: ステップ単位のログを表示

補足:
- workflow は `expo prebuild --platform android` で一時的に `android/` を生成
- `assembleRelease` で Metro 非依存の APK を作成し、Android Emulator 上で `maestro/flows/smoke.yml` を実行
- 安定化のため、`setup-java` の標準 Gradle cache と1回リトライを有効化
- `reactivecircus/android-emulator-runner` の `script` は行単位で実行されるため、分岐や変数共有が必要な処理は `bash -lc '<1行スクリプト>'` で包む
- `ORG_GRADLE_PROJECT_reactNativeArchitectures=x86_64` で、エミュレータ実行に不要なABIビルドを省略して時間を短縮
- Linux runner では `Enable KVM` ステップで `/dev/kvm` 権限を付与し、エミュレータ起動の失敗率を下げる
- `concurrency` で同一refの古い実行を自動キャンセルし、詰まりを減らす
- 成果物（`maestro-artifacts` 配下のJUnit/スクリーンショット/logcat と APK）は Actions Artifact に保存
- schedule 実行はデフォルトブランチ上で走る（`main` を正にする）

### 3.4 キュー滞留・停滞時の運用手順（Runbook）

1. まず状態確認（queued が長く続くか）

```bash
gh run list --repo doooooraku/Repolog --workflow "Maestro Smoke" --limit 10
gh run view <run-id> --repo doooooraku/Repolog --json status,conclusion,createdAt,updatedAt,jobs
```

2. 15分以上 `queued` のままなら、古い実行を止める

```bash
gh run cancel <run-id>
```

3. `main` で手動再実行する

```bash
gh workflow run maestro-smoke.yml --repo doooooraku/Repolog --ref main
```

4. それでも停滞する場合は、同時間帯の負荷を避けて再実行し、Issueに記録する

```bash
gh issue comment 77 --body "Run <run-id>: queued が15分以上継続。再実行時刻: <UTC/JST>。"
```

### 3.5 改善前後の所要時間を記録する（Issue #77 AC2）

1. 直近の `Maestro Smoke` 実行を JSON で取得する

```bash
gh run list \
  --repo doooooraku/Repolog \
  --workflow "Maestro Smoke" \
  --limit 10 \
  --json databaseId,headBranch,event,status,conclusion,createdAt,updatedAt,url
```

2. 期間秒を自動計算して比較用に整形する

```bash
gh run list \
  --repo doooooraku/Repolog \
  --workflow "Maestro Smoke" \
  --limit 10 \
  --json databaseId,headBranch,event,status,conclusion,createdAt,updatedAt,url \
  --jq '.[] | {
    runId: .databaseId,
    branch: .headBranch,
    event,
    status,
    conclusion,
    durationSec: ((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)),
    createdAt,
    updatedAt,
    url
  }'
```

3. 改善前後で最低3件ずつ比較し、Issueコメントへ残す（例）

```text
- before: [run-id / duration / conclusion] x3
- after : [run-id / duration / conclusion] x3
- diff  : success率と中央値の差
```

---

## 4. CIが落ちたときの「調査の順番」

落ちたら、焦らずこの順番で見ると速いです。

### 4.1 まず GitHub Actions のログを見る

* どのジョブが落ちた？（Lint / Type Check / Test / E2E）
* どのステップで落ちた？

### 4.2 ローカルで同じコマンドを叩いて再現

CIが落ちたステップだけを、まずローカルで叩く：

* Lintで落ちた → `pnpm lint`
* 型で落ちた → `pnpm type-check`
* Jestで落ちた → `pnpm test`
* E2Eで落ちた → `pnpm test:e2e`

---

## 5. 典型パターン別：直し方（超実用）

### 5.1 Lint（eslint）で落ちる

* よくある原因

  * unused 変数
  * import順
  * hooksの依存配列
* 対処

  1. エラー行を見る
  2. ルールに合わせて直す
  3. もう一回 `pnpm lint`

---

### 5.2 type-check（tsc）で落ちる（運用している場合）

* よくある原因

  * 型が合ってない
  * null/undefined を考慮してない
  * import先が間違ってる
* 対処

 1. 最初のエラーから直す（連鎖するから）
 2. 直したら `pnpm type-check`

---

### 5.3 Jest（pnpm test）で落ちる

* よくある原因

  * 期待値が変わった（仕様変更）
  * モック不足（依存が多い）
  * 非同期処理の待ち不足
* 対処

  1. 失敗しているテスト名を見る
  2. “何が期待で、実際は何だったか” を読む
  3. 仕様が正しいならテストを直す / 仕様が違うならコードを直す
  4. `pnpm test` 再実行

---

## 6. 翻訳レビュー（i18n）を回す（Issue #75 / #88）

### 6.1 最短コマンド
```bash
# 1) 対象言語のフォールバック監査（標準）
pnpm i18n:audit -- pl

# 2) 監査結果を保存（PR添付用）
pnpm i18n:audit -- pl --out docs/how-to/i18n_pl_fallback_audit.md

# 3) en.ts のキー棚卸し（使用中 / 未使用候補）
pnpm i18n:inventory
```

`pnpm i18n:inventory` は次と同じです。
```bash
pnpm i18n:audit -- pl --inventory --out docs/how-to/i18n_key_inventory.md
```

コマンドの意味:
- `pnpm i18n:audit`: `scripts/i18n-audit.mjs` を実行する
- `-- pl`: 監査対象の言語コード（例: `pl`, `ja`, `fr`）
- `--out <path>`: 監査結果を Markdown で保存する
- `--inventory`: `en.ts` キーを「使用中 / 未使用候補」に分類して出力する

### 6.2 監査成果物（正）
- `docs/how-to/i18n_pl_fallback_audit.md`
  - 対象言語で上書きされていないキー（フォールバック）を一覧化
- `docs/how-to/i18n_key_inventory.md`
  - `en.ts` の全キーを、次の3分類で一覧化
  - `Used Keys (Direct)`：`t.key` 参照
  - `Used Keys (Dynamic)`：`labelKey` / `t['key']` 参照
  - `Unused Candidates`：コード参照が見つからないキー

### 6.3 運用ルール（頻度 / 担当）
- 実行頻度：
  - i18n関連PRごと（必須）
  - 毎週1回（目安：月曜）
  - RCタグ作成前と本番タグ作成前
- 担当：
  - 実行者：該当PRの作者
  - レビュー責任：リリース担当（またはPRレビュアー）
- 記録：
  - PR本文に `i18n_pl_fallback_audit.md` と `i18n_key_inventory.md` のリンクを貼る

### 6.4 未使用候補キーの削除方針（段階削除）
1. `Unused Candidates` に3回連続で出現し、かつ対応Issue/実装予定が無いキーを削除候補にする
2. 削除は必ず専用Issueを立て、単独PRで実施する（機能変更PRと混ぜない）
3. 削除PRで `pnpm lint` / `pnpm test` / `pnpm type-check` を通す
4. 主要画面（Home / Report Editor / PDF / Settings / Backup / Paywall）を手動確認する
5. 問題が出たら削除PRをrevertする

### 6.5 判定時の注意
- `missing used keys` は「その言語で未上書き」を示し、即バグ確定ではない
- `languageName*` は全19言語キーを各localeで揃える（英語フォールバック運用はしない）
- `languageName*` が `missing used keys` に出た場合は P1 で修正する
- ただし、ユーザー表示で不自然な箇所は優先修正する

---

## 7. 「テスト仕様を実行できる仕様に近づける」と整合が保たれる理由（超かみ砕き）

※ここだけ少し Explanation っぽいけど、理解に必須なので最小限で。

### 7.1 たとえ話

* 仕様書が「ノート」だと、書き忘れる（更新漏れする）
* テストが「自動採点機」だと、間違うと必ず赤点（CIが落ちる）

つまり、

* 仕様（合格条件）をテストにすると
  **守れてない瞬間に“必ず止まる”**
  → “勝手に整合が保たれる” の正体はこれです

### 7.2 実務での形

* Issue の受け入れ条件（Acceptance Criteria）
  ↓
* Jest / Maestro のテスト
  ↓
* CI が自動で実行して合否を判定
  ↓
* 落ちたらマージできない（ブランチ保護）

---

## 8. 新しいテストを追加するときの最小ルール

* バグ修正：**再発防止のテスト** を1つ足す
* 機能追加：**受け入れ条件がチェックできるテスト** を足す
* E2E：壊れやすいので「本当に価値があるところ」だけ（スモークから）

### 8.1 Repologの検索/フィルタ回帰（#40で追加）

* `__tests__/reportListUtils.test.ts`
  - レポート名 / コメント / タグの検索一致
  - 期間（from/to）・タグ複数・ピン留めのみの組み合わせ判定
  - タグなし既存データでの非破綻
* `__tests__/reportUtils.test.ts`
  - タグ入力の分割（`,` / 改行）
  - trim・重複排除（大文字小文字違いを同一扱い）
* `__tests__/backupImportPlanner.test.ts`
  - Import append時の「追加/スキップ」判定
  - 不正な `reportId` 参照を含む写真の検知
  - 同一バックアップ再Import時の冪等性（重複しない）

### 8.2 バックアップ運用の確認（#74）

- 運用手順の正: `docs/how-to/backup_restore.md`
- append戦略の正: `docs/adr/ADR-0007-backup-import-append-strategy.md`
- 実装の正: `src/features/backup/backupService.ts`

最小コマンド:

```bash
pnpm test __tests__/backupImportPlanner.test.ts
```

確認観点:
- 既存データを削除しない
- 重複IDをスキップする
- 同一zip再Importで重複登録しない

---

## 9. UMP EEA 同意検証（Issue #93）

目的：
- EEA想定で同意フローが壊れていないかを、毎回同じ手順で確認する
- 常時CIではなく、`workflow_dispatch` で必要なときに手動実行する

### 9.1 ローカルで事前チェック（最短）

```bash
pnpm ump:consent:check -- \
  --platform android \
  --debug-geography EEA \
  --test-device-ids "TEST_DEVICE_1,TEST_DEVICE_2" \
  --out /tmp/ump-consent-checklist.md
```

コマンドの意味：
- `pnpm ump:consent:check`：
  - `scripts/ump-consent-check.mjs` を実行する
- `--platform`：
  - 検証対象プラットフォーム（`android` / `ios`）
- `--debug-geography`：
  - UMPのデバッグ地理（EEA検証では `EEA` を使う）
- `--test-device-ids`：
  - UMP検証対象の端末ID（カンマ区切り）
- `--out`：
  - チェックリストMarkdownの出力先

### 9.2 GitHub Actionsで手動実行（workflow_dispatch）

```bash
gh workflow run ump-consent-validation.yml \
  --repo doooooraku/Repolog \
  --ref main \
  --field platform=android \
  --field debug_geography=EEA \
  --field test_device_ids="TEST_DEVICE_1,TEST_DEVICE_2" \
  --field notes="Pre-release consent check"
```

コマンドの意味：
- `gh workflow run`：
  - 指定workflowを手動起動する
- `--repo`：
  - 実行対象リポジトリ
- `--ref main`：
  - `main` のコードで実行する
- `--field ...`：
  - `workflow_dispatch` の入力値を渡す

### 9.3 実行結果の確認

```bash
# 直近実行一覧
gh run list --repo doooooraku/Repolog --workflow "UMP Consent Validation" --limit 5

# 1件の詳細（JSON）
gh run view <run-id> --repo doooooraku/Repolog --json status,conclusion,jobs,url

# 1件のログ
gh run view <run-id> --repo doooooraku/Repolog --log

# artifact取得（必要時）
gh run download <run-id> --repo doooooraku/Repolog -D /tmp/ump-validation
```

コマンドの意味：
- `gh run list`：
  - 実行履歴と成功/失敗を確認
- `gh run view --json`：
  - ステータスやURLを機械的に確認
- `gh run view --log`：
  - 失敗箇所のログを読む
- `gh run download`：
  - `ump-consent-checklist.md` / `ump-consent-checklist.json` を取得

### 9.4 失敗時のログ確認ポイント（Runbook）

1. workflow summary で `passed: no` になったチェック項目を確認する
2. `ump-consent-checklist.json` の `failedChecks` を確認する
3. 実機側ログで `canRequestAds` と `privacyOptionsRequirementStatus` を確認する

Android（実機/エミュレータ）:
```bash
adb logcat -d | rg "AdsConsent|canRequestAds|privacyOptionsRequirementStatus|AdBanner"
```

iOS Simulator:
```bash
xcrun simctl spawn booted log stream \
  --predicate 'eventMessage CONTAINS "AdsConsent" OR eventMessage CONTAINS "canRequestAds"'
```

### 9.5 合否基準（AC対応）

- AC1（手順参照）：
  - この節（9章）を `docs/how-to/testing.md` に置く
- AC2（manual workflow）：
  - `.github/workflows/ump-consent-validation.yml` を `workflow_dispatch` で実行可能
- AC3（ログ確認ポイント）：
  - 9.4 の確認手順を固定

---

## 10. PDFフォント性能ベンチ（Issue #72）

目的:
- `ADR-0002` の Follow-up（フォント最適化検討 / 性能計測）を再実行可能にする
- 3条件（短文/多写真/多言語）で比較結果を残す

実験フラグ（Issue #101）:
- `PDF_FONT_SUBSET_EXPERIMENT=0`（既定）:
  - 本番挙動。7フォントを常時埋め込み
- `PDF_FONT_SUBSET_EXPERIMENT=1`:
  - script subset を試行
  - 未知スクリプト検出時は自動で all-fonts にフォールバック

最短コマンド:
```bash
pnpm pdf:font:benchmark
```

コマンドの意味:
- `pnpm`:
  - `package.json` の scripts を実行する
- `pdf:font:benchmark`:
  - `node --expose-gc scripts/pdf-font-benchmark.mjs` を実行する
- `--expose-gc`:
  - NodeのGC呼び出しを有効化し、cold run計測のノイズを減らす

成果物（デフォルト）:
- `docs/how-to/benchmarks/pdf_font_benchmark.latest.json`
- `docs/how-to/benchmarks/pdf_font_benchmark.latest.md`

追加オプション例:
```bash
node --expose-gc scripts/pdf-font-benchmark.mjs \
  --iterations 9 \
  --sample-image assets/images/icon.png \
  --out-json docs/how-to/benchmarks/pdf_font_benchmark.custom.json \
  --out-md docs/how-to/benchmarks/pdf_font_benchmark.custom.md
```

オプションの意味:
- `--iterations`:
  - シナリオごとの実行回数（1回目がcold、残りがwarm集計）
- `--sample-image`:
  - 1枚あたりの画像payload推定に使うファイル
- `--out-json` / `--out-md`:
  - 出力先ファイルを指定

補足:
- 計測の読み方と最新結果は `docs/how-to/pdf_font_benchmark.md` を正とする
- 採用/非採用の最終判断は `docs/adr/ADR-0002-pdf-fonts.md` を正とする

---

## 11. 最後のチェックリスト（PR前）

* [ ] `pnpm lint` OK
* [ ] `pnpm type-check` OK
* [ ] `pnpm test` OK
* [ ] 必要なら `pnpm test:e2e` OK
* [ ] 受け入れ条件が満たされた（PR本文に証拠を書く）
