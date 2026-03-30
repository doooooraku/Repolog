# Repolog 改善検討（ユーザーフィードバック反映）

- 作成日: 2026-03-08
- 対象要望:
  1. 写真の長押し並び替えが「勝手に上へ行く」
  2. PDFプレビューが見切れて全体像が見えない
  3. PDF出力で白紙ファイルが出る
- 対象証拠:
  - 画像添付（写真リスト並び替え時の挙動）
  - `C:\Users\doooo\Downloads\20260307_2111_カンフル剤_Repolog.pdf`
  - `C:\Users\doooo\Downloads\20260307_2111_カンフル剤_Repolog (1).pdf`
  - `.debug-sessions/session_20260307_211041/logcat.log`

---

## 1. 先に結論（やるべきか）

結論: **3件とも改善必須**。

- 並び替え: ユーザー操作の中核でストレスが大きい
- プレビュー見切れ: 内容確認できず、誤出力リスク増
- 白紙PDF: 成果物が壊れるため最優先

---

## 2. 事実（調査結果）

### 2.1 白紙PDFの実体

対象PDFを解析すると、以下の状態だった。

- ファイルサイズ: **681 bytes**
- PDF内部:
  - `Creator (Chromium)`
  - `Producer (Skia/PDF m145)`
  - `3 0 obj <</Length 0>> stream ... endstream`

判定:
- 1ページはあるが、**描画コンテンツが0バイト**。
- 「保存時に壊れた」のではなく、**生成された時点で空**の可能性が高い。

### 2.2 並び替え挙動

現行実装:
- `NestableScrollContainer` + `NestableDraggableFlatList`
- `autoscrollSpeed=150`
- 親スクロールと子ドラッグが同時に動きやすい構成

影響:
- 長押し時に自動スクロールが強く効き、意図しない位置へ移動しやすい。

### 2.3 PDFプレビュー見切れ

現行実装:
- WebViewにHTMLを直接表示
- A4/Letterの固定サイズレイアウト（mm）

影響:
- 端末幅との比率で初期表示がズレ、全体像確認がしづらい。

---

## 3. 改修方針（今回適用）

### 3.1 写真並び替え

- ドラッグ中は親スクロールを止める
- `autoscrollSpeed` を下げる（暴走抑止）
- `dragItemOverflow=false` で暴れを抑える
- アクティブ時スケールを `1.03 -> 0.98` に変更（沈み込み表現）

### 3.2 PDFプレビュー

- WebViewへ初期フィットJSを注入
- ページ幅を端末幅に合わせて自動ズーム
- Androidでズーム操作を有効化
- `RNCWebView borderRadius` 警告を回避するためラッパーViewで角丸制御

### 3.3 白紙PDF対策

- 生成PDFサイズの妥当性チェックを追加（小さすぎるPDFを異常判定）
- 異常時は保存せず破棄し、段階フォールバックで再試行
  - full
  - reduced images + no custom fonts
  - tiny images + no custom fonts

---

## 4. 波及範囲

### 4.1 直接修正

- `src/features/reports/ReportEditorScreen.tsx`
- `app/reports/[id]/pdf.tsx`
- `src/features/pdf/pdfService.ts`
- `src/features/pdf/pdfTemplate.ts`

### 4.2 間接影響

- UX: 並び替え操作感、プレビュー確認性
- 失敗率: 白紙PDFの流出抑止
- 性能: 低メモリ時のフォールバック挙動

---

## 5. リスクアセスメント

| リスク | 可能性 | 影響 | 対策 |
|---|---|---|---|
| 自動ズームで表示崩れ | 中 | 中 | 画面幅基準で再計算、手動ズーム許可 |
| 並び替え感度が鈍くなる | 低 | 中 | `autoscroll` 値を段階調整可能に残す |
| 妥当PDFを誤検知して再試行 | 低 | 中 | 閾値は控えめ（1024 bytes） |
| 生成時間増加 | 中 | 低 | フォールバックは異常時のみ |

---

## 6. 5 Whys（白紙PDF）

1. なぜ白紙になる？
- 生成されたPDFの描画ストリームが空（Length 0）。

2. なぜ空ストリームが生成される？
- 生成過程で描画が成立せず、成功扱いで返っている可能性。

3. なぜ検知できなかった？
- 生成結果の妥当性チェック（サイズ/内容）が無かった。

4. なぜ妥当性チェックが無かった？
- 「失敗時は例外が飛ぶ」前提に依存していた。

5. なぜ前提が崩れた？
- Android WebView/Chromium系では空PDFを返すケースがありうる。

恒久策:
- 生成直後の品質ゲート（サイズ下限、必要なら将来は構文検査）を標準化。

---

## 7. 代替案比較

| 案 | 内容 | メリット | デメリット | 推奨 |
|---|---|---|---|---|
| A | 現行のまま微調整だけ | 実装小 | 根本再発しやすい | 低 |
| B | 今回採用: UI制御 + プレビューfit + 空PDF検知再試行 | 効果と工数のバランス良 | 多少複雑化 | **高** |
| C | PDF生成を全面リプレース | 根本改善余地大 | 工数/リスク大 | 中長期 |

---

## 8. 次に行うこと（推奨）

1. 実機で以下を回帰確認
- 並び替え（上方向/下方向/端付近）
- プレビュー（A4/Letter、標準/大きく）
- PDF出力（少枚数/多枚数）

2. 白紙PDF検知のログを収集
- 異常時のサイズ・端末状態・枚数をIssueへ蓄積

3. しきい値最適化
- `MIN_REASONABLE_PDF_BYTES` を実測に合わせて調整

---

## 9. 初心者向けコマンド解説

| コマンド | 役割 | ポイント |
|---|---|---|
| `ls -la <dir>` | ファイル一覧を詳しく表示 | `-l` 詳細、`-a` 隠しファイル含む |
| `rg -n "文字" <path>` | 高速検索 | `-n` 行番号付き |
| `xxd -l 512 file.pdf` | バイナリ先頭を16進表示 | PDFヘッダや構造確認に有効 |
| `strings -n 4 file.pdf` | 文字列だけ抽出 | `Length 0` などを見つけやすい |
| `pnpm lint` | 静的チェック | 文法/規約違反を検出 |
| `pnpm test` | 自動テスト実行 | 回帰を防ぐ |
| `gh issue create ...` | GitHub Issue作成 | 1課題1Issueで管理 |
| `gh pr create ...` | GitHub PR作成 | 変更理由と検証結果を紐づける |

---

## 10. 参考一次情報

- Expo Print: https://docs.expo.dev/versions/latest/sdk/print/
- Expo ImagePicker（selectionLimit=0 は上限なし）: https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Android Memory Overview: https://developer.android.com/topic/performance/memory-overview
- react-native-webview props: https://github.com/react-native-webview/react-native-webview/blob/master/src/WebViewTypes.ts
- react-native-draggable-flatlist README: https://github.com/computerjazz/react-native-draggable-flatlist/blob/main/README.md

注記:
- WebView/Chromiumの空PDF事象は実測（対象PDF解析）に基づく。
- 追加で端末別再現を継続し、必要なら恒久策（生成方式再設計）へ進む。
