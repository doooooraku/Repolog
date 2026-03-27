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

### Claude Code トリガーフレーズ
- 有効なフレーズ: 「デバッグセッションを分析して」「rebuild して」「Maestro スクショ付きで E2E テストして」
- 分析時は summary.md → app_logcat.log → screenshots/ の順に読むのが効率的
- before/after.png の視覚的比較が予想外の UI 変化の発見に有効
