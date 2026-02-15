# Figma MCP（nodeId固定）実装プロンプトテンプレート

目的: Repologで、Figmaの「選択状態」に依存せず、`nodeId` を固定して安定実装する。

---

## 1. 前提
- CodexのMCPに `figma_local` が有効であること
- Figma DesktopでMCPサーバーが有効であること
- このリポジトリの技術スタック（Expo/React Native/TypeScript/Tamagui）を優先すること

---

## 2. Repologの固定nodeId（2026-02-15時点）
- Home: `17:352`
- ReportEditor（長い画面）: `17:436`
- Settings: `17:564`
- ReportEditor（短い画面）: `17:650`

注記:
- Figmaでフレームを作り直すと `nodeId` は変わることがあります。
- 変わった場合は `get_metadata` で最新IDを取り直してください。

---

## 3. 実装プロンプト（コピペ用）

### 3.1 新規実装（画面1枚）
```text
RepologのFigmaをnodeId固定で実装してください。

- MCPサーバー: figma_local
- 対象nodeId: 17:352
- 実装対象: Home画面
- 出力先候補: src/features/reports/ReportListScreen.tsx（既存構成を優先して判断）

実装手順:
1) figma_local.get_design_context(nodeId="17:352") を取得
2) figma_local.get_screenshot(nodeId="17:352") で見た目確認
3) 既存コードのUIパターン（Tamagui/テーマ/トークン）を調査
4) 既存構造に合わせて実装（勝手にTailwind導入しない）
5) 空/エラー/読み込み状態のUIを追加
6) 必要ならテストを追加・更新
7) 変更点と理由を報告

制約:
- Figma見た目の正を守る
- 直値を増やしすぎず、既存テーマ・定数を優先
- 既存の命名・責務分離を守る
```

### 3.2 既存画面の差分反映（UI改修）
```text
Repologの既存画面にFigma差分を反映してください（nodeId固定）。

- MCPサーバー: figma_local
- 対象nodeId: 17:564
- 対象画面: Settings
- 修正方針: 既存のロジックは維持し、UI差分のみを最小変更で反映

実施内容:
1) 現在コードを確認
2) figma_local.get_design_context(nodeId="17:564")
3) figma_local.get_screenshot(nodeId="17:564")
4) 差分一覧を先に提示（余白/サイズ/文言/状態）
5) 実装
6) lint/test実行
7) 差分サマリと未対応項目を明記
```

### 3.3 コンポーネント分割を含む実装
```text
RepologのReportEditorをnodeId固定で実装してください。

- MCPサーバー: figma_local
- 対象nodeId: 17:436

必須要件:
- 画面を1ファイル肥大化させず、再利用部品へ分割
- 例: Header / Section / Field / PhotoList / FooterButton
- i18nキーに置き換え可能な文言を整理
- 入力状態（loading/empty/error/disabled）を実装に含める

納品形式:
- 変更ファイル一覧
- 主要コンポーネント責務
- 将来の差分反映手順（どこを触ればよいか）
```

---

## 4. 解析プロンプト（実装前レビュー用）

```text
nodeId固定で、実装前のレビューだけ行ってください。

- MCPサーバー: figma_local
- 対象nodeId: 17:352

出力してほしいもの:
1) 画面を構成する主要ブロック
2) 再利用可能コンポーネント候補
3) 画面状態（通常/空/読み込み/エラー/オフライン）
4) アクセシビリティ上の注意点
5) 実装順序（小さいPRに分割した順番）
```

---

## 5. コマンドの意味（最小）
- `codex mcp list`
  - 登録済みMCPサーバー一覧を表示する。`figma_local` が `enabled` なら利用可能。
- `curl http://127.0.0.1:3845/mcp`
  - WSLからFigmaローカルMCPへの到達確認。`Invalid sessionId` は到達成功の目印。
- `pnpm lint`
  - コード規約違反の検出。
- `pnpm test`
  - 既存テストの回帰確認。
- `node scripts/update-figma-node-ledger.mjs --url "<Figma URL>" --screen "Home" --purpose "用途" --priority P1`
  - Figma URL から `fileKey` と `node-id` を抽出し、`docs/reference/UI_Figma/screen_node_ledger.md` を自動更新する。
  - `17-352` のような node-id は `17:352` へ正規化される。

---

## 6. URL入力→台帳更新の自動化（new）

```bash
node scripts/update-figma-node-ledger.mjs --url "https://www.figma.com/design/<fileKey>/<fileName>?node-id=17-352&m=dev" --screen "Home" --purpose "レポート一覧・検索・クイック操作" --priority P1
```

補足:
- `--screen` が同じ行は上書き更新される（重複行を作らない）。
- `--priority` は `P0/P1/P2/P3` を受け付ける。
- `--dry-run` を付けるとファイル更新せず抽出結果のみ表示する。

---

## 7. 運用ルール（事故防止）
- 「Figmaで現在選択中」依存を避け、`nodeId` を明示する。
- 1PR = 1画面または1コンポーネント群に絞る。
- Figma差分反映時は「未対応項目」を必ず残す。
- UI詳細はFigmaを正とし、仕様書へピクセル固定値を書きすぎない。
