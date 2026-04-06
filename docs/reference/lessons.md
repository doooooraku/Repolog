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
- **根本原因**: .aab ビルド時に `.env` に `REVENUECAT_ANDROID_API_KEY` / `REVENUECAT_IOS_API_KEY` が未設定（空文字）だった。ビルド後にキーを追加したが、既にアップロード済みのバイナリには反映されない
- **診断方法**: APK の `assets/app.config` を抽出して `extra` フィールドを確認 → 空文字を確認。logcat で RevenueCat/BillingClient のログがゼロ → SDK未初期化を確認
- **ルール**:
  1. ビルドスクリプトに環境変数チェックを必ず入れる（`scripts/prebuild-env-check.mjs`）
  2. `.env` を変更したら必ずリビルドする（設定変更はバイナリに自動反映されない）
  3. ビルド後は `assets/app.config` の `extra` フィールドでAPIキーの埋め込みを検証する
  4. RevenueCat SDKのログが出ない場合は、APIキーの不在を最初に疑う

---

### Claude Code トリガーフレーズ
- 有効なフレーズ: 「デバッグセッションを分析して」「rebuild して」「Maestro スクショ付きで E2E テストして」
- 分析時は summary.md → app_logcat.log → screenshots/ の順に読むのが効率的
- before/after.png の視覚的比較が予想外の UI 変化の発見に有効
