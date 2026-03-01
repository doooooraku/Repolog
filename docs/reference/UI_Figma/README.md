# UI_Figma（Figma コードバンドル & 画面台帳）

Figma の **Product Strategy Document** からエクスポートしたコードバンドルと、
画面ごとの node-id を管理する台帳を置くディレクトリです。

- Figma file: `AZcZdn3LnIugwZlDvHdwls`
- 正は常に Figma 側。このディレクトリの HTML/CSS は参考実装。

---

## 主要ファイル

| ファイル | 内容 |
|---------|------|
| `screen_node_ledger.md` | 画面名 ↔ Figma node-id の対応表 |
| `src/guidelines/Guidelines.md` | UIガイドライン（色・タイポ・間隔） |
| `index.html` | Figma エクスポート HTML |

---

## 開発サーバー（UIプレビュー用）

```bash
cd docs/reference/UI_Figma
npm install
npm run dev
```

> このサーバーはアプリ本体とは独立です。Figma デザインの静的プレビューにのみ使います。
