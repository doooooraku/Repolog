# Repolog Debug総合分析（ログ・動画・画像）

- 作成日: 2026-03-07
- 対象: `docs/reference/Debug/` 配下の成果物（2026-02-28〜2026-03-07）
- 目的: 「何ができていて、何ができていないか」を事実で整理し、改善を Issue / PR につなげる

---

## 1. 先に結論（小学生向けに短く）

1. できていること
- レポート作成・編集・写真追加・PDFプレビューまでは動く。
- 軽いケースでは操作完了できる。

2. できていないこと（重要）
- **PDF出力が重いケースで失敗**する（`OutOfMemoryError`）。
- デバッグ要約が「本当の不具合」と「端末側ノイズ」を混ぜてしまい、判断がぶれる。

3. 最優先の改善
- **PDF出力のメモリ設計を直す**（画像処理・ページ分割・再試行戦略）。
- **デバッグ証拠の必須項目をテンプレ化**して、再現性を上げる。

---

## 2. 調査対象（事実）

### 2.1 セッション別の結果

| セッション | 主な状況 | PDF出力 | OOM | メモリ状況（TOTAL PSS） | 判定 |
|---|---|---:|---:|---:|---|
| `session_20260303_155916` | 画面録画あり。主要操作が進む | 失敗ログなし | 0 | 280,394 KB | ほぼ正常 |
| `session_20260303_202757` | 録画ファイル欠落（要約は録画あり表示） | 失敗ログなし | 0 | 260,555 KB | 判定保留 |
| `session_20260304_142212` | スプラッシュ後にホームへ戻る | 4 | 6 | `meminfo` 取得不可（プロセス不在） | 失敗 |
| `session_20260305_165833` | 短時間スモーク | 0 | 0 | 247,159 KB | 正常 |
| `session_20260305_170602` | 短時間スモーク | 0 | 0 | 219,217 KB | 正常 |
| `session_20260305_170625` | 失敗ダイアログ確認 | 10 | 15 | 874,328 KB | 失敗 |
| `session_20260305_192553` | PDFプレビューから出力失敗 | 8 | 13 | 1,450,599 KB | 失敗 |
| `session_20260307_211041` | 編集画面まで確認（録画欠落） | 0 | 0 | 557,247 KB | 要追加試験 |

補足:
- HEIC警告（`Unsupported mime image/vnd.android.heic`）は複数セッションで反復。
- `summary.md` の「エラー関連行」は端末ノイズを大量に含む（真の不具合件数ではない）。

### 2.2 代表ログ（一次証拠）

- `session_20260305_170625/logcat.log`
  - `OutOfMemoryError` が連続発生。
  - `E ReactNativeJS: '[PDF] Generation failed:' ... ExpoPrint.printToFileAsync ... code: 'ERR_UNEXPECTED'`
- `session_20260305_192553/logcat.log`
  - `OutOfMemoryError`（約95MB級、最大190MB級の割当失敗）。
  - `E ReactNativeJS: '[PDF] Export failed:' ... printToFileAsync ...`
- `session_20260304_142212/meminfo.txt`
  - `No process found for: com.dooooraku.repolog`（途中でプロセス消失）。

### 2.3 画像/動画から読み取れる事実

- 成功系（`session_20260303_155916/recording.mp4`）: 作成→編集→PDFプレビュー→設定まで流れが進む。
- 失敗系（`session_20260305_170625/recording.mp4`）:
  - PDF生成スピナー反復
  - 「PDFの出力に失敗しました」表示
  - 最終的にホーム画面へ離脱
- 直近（`session_20260307_211041/after.png`）:
  - 編集画面での表示確認はあるが、録画欠落で出力完了の裏取りは不十分。

---

## 3. なぜ失敗したか（複数仮説→検証）

### 3.1 仮説A: 画像を全件base64化して巨大HTMLに詰め、メモリ急増

コード根拠:
- `src/features/pdf/pdfTemplate.ts`
  - `fileToDataUri()` で画像を base64 化（`readAsStringAsync(..., base64)`）
  - `buildPhotoPages()` で全画像を `slots.join('')` し、`buildPdfHtml()` で1本のHTML文字列化

評価:
- base64 は仕様上 4/3 膨張（RFC 4648）。
- 文字列連結時の一時コピーでピークメモリが増える。
- OOMログ（95MB級）と整合。

### 3.2 仮説B: Printエンジン側のページ描画バッファでもメモリ圧迫

観測:
- 割当失敗サイズが約95MB〜190MB。
- ページ描画の多重バッファ想定と近い値になる。

簡易試算（ARGB_8888で4byte/px）:

| 条件 | 1ページ | 2ページ | 3ページ |
|---|---:|---:|---:|
| A4 300dpi | 33.2 MB | 66.4 MB | 99.6 MB |
| A4 400dpi | 59.0 MB | 118.0 MB | 177.0 MB |

評価:
- 95MBや190MB失敗は、単一原因ではなく「巨大HTML + 描画バッファ」の複合要因の可能性が高い。

### 3.3 仮説C: 画像正規化失敗時に元画像をそのまま保存し、重い素材が残る

コード根拠:
- `src/services/photoService.ts`
  - `persistAsset()` で `resizeIfNeeded()` 失敗時、`fallbackPath` に元ファイルをコピー。

評価:
- 正規化失敗時に大画像/HEIC由来の重いファイルが混ざると、PDF生成時のメモリ負荷が跳ねる。

### 3.4 仮説D: リトライ設計が実質同じ条件で再試行

コード根拠:
- `src/features/pdf/pdfService.ts`
  - attempt2 / attempt3 がどちらも `preview: true` で `buildPdfHtml()` を呼ぶ。

評価:
- 失敗条件を十分に変えず再試行しており、失敗反復の一因になりうる。

---

## 4. バイアス除去のための多視点レビュー

### 4.1 モバイル性能専門家の視点
- 端末のヒープ上限近傍で大きな連続割当が発生。
- JS側（base64文字列）とネイティブ側（描画バッファ）が同時に圧迫。
- 「1回で全部生成」より「段階生成」が安全。

### 4.2 React Native / Expo実装者の視点
- `ExpoPrint.printToFileAsync` はHTML→PDF変換だが、ローカル画像はbase64埋め込みが前提。
- ならば「埋め込み量の上限管理」と「ページ分割」が必要。

### 4.3 運用担当（SRE/QA）の視点
- `summary.md` のエラー集計はノイズ過多で、トリアージ効率を下げる。
- 「必須証拠セット（再現手順、logcat抜粋、meminfo、録画有無）」が必要。

### 4.4 現場ユーザー（利用者）の視点
- 作業後の最後（PDF出力）で失敗するのが最も痛い。
- 体感としては「保存ボタンが信用できない」状態。

### 4.5 非技術ユーザー（見るだけの人）の視点
- 失敗理由が難しい英語/内部語だと対処不能。
- 「写真が多すぎる可能性」「標準サイズに切替」などの案内が必要。

---

## 5. 進捗整理（できた / できていない）

### 5.1 できたこと
- レポートの基本CRUDは成立。
- 写真追加・並び確認・PDFプレビュー表示は再現できる。
- 設定画面遷移、Free/Pro UI分岐は画面上確認できる。

### 5.2 できていないこと
- 高負荷条件でのPDF出力成功率が不足。
- ログ分析の自動要約が「アプリ起因」と「システムノイズ」を分離しきれていない。
- セッション成果物の欠落（録画ファイルなし）を summary が正しく示さない。

### 5.3 なぜできていないか（要約）
- 生成方式がメモリピークを作りやすい。
- フォールバック戦略が実質同型で、失敗時の切替が弱い。
- デバッグ運用の入力品質（証拠構造化）が不足。

---

## 6. 5 Whys（5回以上）

対象問題: 「PDF出力が重いケースで失敗する」

1. なぜ失敗する？  
- `printToFileAsync` が `OutOfMemoryError` で落ちるから。

2. なぜOOMになる？  
- 画像base64文字列と描画処理でピークメモリが跳ねるから。

3. なぜピークが高い？  
- 全画像を1つのHTMLへ一括結合し、再試行でも条件差が小さいから。

4. なぜ一括結合のまま？  
- まず機能成立（出力可能）を優先し、負荷上限の設計が後回しになったから。

5. なぜ後回しになった？  
- デバッグ指標が「真の失敗率」より「ノイズ込みエラー件数」に寄っていたから。

6. なぜ指標が不十分？  
- Issueテンプレとセッション要約の必須項目が、再現性を担保する粒度まで定義されていなかったから。

恒久策:
- 生成方式を「段階処理 + 上限管理」に変更。
- デバッグテンプレを更新し、証拠粒度を標準化。

---

## 7. 改善案（複数案）

| 案 | 内容 | メリット | デメリット | 推奨度 |
|---|---|---|---|---|
| A: クイック対策 | 画像上限・品質をさらに下げる、枚数警告、OOM時UI誘導 | 実装が速い | 根本解決ではない | 中 |
| B: 本命（推奨） | ページ単位でHTML/PDFを分割生成し最後に結合。失敗時は段階的に縮小率を変更 | OOM耐性が最も高い、再現性が高い | 実装量が増える | **高** |
| C: サーバー生成 | 端末でなくサーバーでPDF作成 | 端末依存を減らせる | Local-first方針と衝突、運用コスト増 | 低 |

推奨:
- **Bを第一候補**、Aを先行ガードとして同時に入れる。

---

## 8. 影響範囲（波及）

### 8.1 コード波及
- `src/features/pdf/pdfTemplate.ts`: 画像埋め込み方式、ページ生成方式
- `src/features/pdf/pdfService.ts`: リトライ戦略、失敗時フォールバック
- `src/services/photoService.ts`: 正規化失敗時フォールバック、HEIC/大画像制御
- テスト: PDF生成・失敗系・境界値（枚数/画像サイズ）

### 8.2 docs / 運用波及
- `docs/reference/*`: PDF失敗時の仕様（ユーザー案内）
- `docs/how-to/*`: デバッグ手順、証拠収集手順
- `.github/*`: Issue/PR時の必須証拠項目

---

## 9. リスクアセスメント

| リスク | 発生確率 | 影響 | 早期検知 | 対策 |
|---|---|---|---|---|
| PDF失敗継続で離脱増加 | 高 | 高 | 失敗率メトリクス | 生成方式の段階化 |
| 画質低下への不満 | 中 | 中 | ユーザーフィードバック | 画質プリセット選択肢 |
| 改修で処理時間増 | 中 | 中 | P95出力時間 | バックグラウンド進捗表示 |
| テンプレ厳格化で起票負担増 | 低 | 低 | Issue記入率 | 必須項目を最小限に絞る |

---

## 10. 次にやること（優先順）

1. P0: PDF OOM対策（分割生成 + 実効フォールバック）
2. P1: 画像取り込みの正規化強化（HEIC含む）
3. P1: デバッグ要約のノイズ分離（App起因と端末起因）
4. P2: テンプレート改善（Issue/PR証拠の標準化）

---

## 11. 初心者向け: 使ったコマンドの意味

| コマンド | 何をする？ | よく使うオプションの意味 |
|---|---|---|
| `rg "文字" ファイル` | 高速に文字を探す | `-n`: 行番号表示 / `-c`: 件数だけ表示 |
| `sed -n '1,120p' file` | ファイルの一部だけ表示 | `-n`: 指定行だけ出す / `p`: print |
| `wc -l file` | 行数を数える | `-l`: line（行） |
| `ffprobe file.mp4` | 動画の長さ/情報を確認 | `-show_entries format=duration`: 再生時間だけ出す |
| `ffmpeg -vf "fps=... ,tile=..."` | 動画から一覧画像（コンタクトシート）を作る | `fps=1/8`: 8秒ごと抽出 / `tile=6x3`: 6列3行で並べる |
| `adb logcat -v threadtime` | Androidログを見る | `-v threadtime`: 日時・PIDつき表示 |
| `adb logcat -c` | 古いログを消してから計測開始 | `-c`: clear |
| `adb shell dumpsys meminfo <package>` | アプリのメモリ状況を取得 | `TOTAL PSS`: 実メモリ使用の目安 |
| `adb shell pidof -s <package>` | アプリPIDを取る | `-s`: 単一PIDだけ |
| `gh issue create ...` | GitHub IssueをCLIで作る | `--title`: タイトル / `--body-file`: 本文ファイル |
| `gh pr create ...` | GitHub PRをCLIで作る | `--fill`: テンプレ初期埋め |

---

## 12. 今回の推奨Issueセット

- Bug: PDF出力OOM（最優先）
- Improvement: 画像正規化失敗時の重画像フォールバック改善
- Improvement: デバッグ要約のノイズ分離
- Improvement: セッション成果物欠落の正確表示（録画有無）
- Improvement: 証拠テンプレ（Issue/PR）標準化

---

## 13. 一次情報（外部）

- Expo Print: https://docs.expo.dev/versions/latest/sdk/print/
- Expo ImagePicker: https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Expo ImageManipulator: https://docs.expo.dev/versions/latest/sdk/imagemanipulator/
- Expo FileSystem: https://docs.expo.dev/versions/latest/sdk/filesystem/
- Android Memory Overview: https://developer.android.com/topic/performance/memory-overview
- Android app memory management: https://developer.android.com/topic/performance/memory
- Android Vitals (LMK): https://developer.android.com/topic/performance/vitals/lmk
- Android loading large bitmaps: https://developer.android.com/topic/performance/graphics/load-bitmap
- adb/logcat command line: https://developer.android.com/tools/logcat
- RFC 4648 (Base64): https://www.rfc-editor.org/rfc/rfc4648

注記:
- 一部は「ドキュメントの仕様」と「実測ログ」を組み合わせた推論を含む。
- 推論箇所は、Issueで再現試験を通して確定させる。
