# ADR-0012: PDF出力成功直後にアプリ内レビュー依頼（OS標準）を表示する

- Status: Accepted
- Date: 2026-04-07
- Deciders: @doooooraku
- Related: Issue #284 / `docs/explanation/product_strategy.md` §7-2 / `docs/reference/constraints.md` §1（Local-first）

---

## Context

Repolog の重要KPI #7 として `docs/explanation/product_strategy.md:211` に「ストア評価（☆、レビュー内容）」が掲げられている一方、アプリ側にはレビューを依頼する仕組みが**一切なかった**:

- `expo-store-review` 未導入、`StoreReview.requestReview()` 呼び出しゼロ
- 設定画面に「アプリを評価する」導線なし
- `src/core/i18n/locales/en.ts` には過去に検討された `// --- Review (7-day streak) ---` という空のコメントだけが残っていた

結果として、星評価は不満を抱いたユーザーの自発投稿だけで形成されやすく、ASO（App Store Optimization）で不利になる構造だった。

ローカル完結（`docs/reference/constraints.md` §1-1）を維持したまま、ユーザーが**コア価値を体験した直後（ハッピーモーメント）**にレビュー依頼を出す軽量な仕組みが必要と判断した。

---

## Decision

- **PDF 出力成功直後**（`recordExport()` 完了直後）に、`expo-store-review` の OS 標準ダイアログを条件付きで呼ぶ。
- 条件:
  - **Free ユーザー**: 累計 PDF 出力 **4 回目** で 1 度だけ
  - **Pro ユーザー** : 累計 PDF 出力 **20 回目** で 1 度だけ
  - 1 ユーザーあたり生涯**最大 2 回**（Free フラグと Pro フラグを `useSettingsStore` で独立管理）
- **自前モーダルや前段プレ確認は置かない**（Apple Review Guideline の "review gating" 議論を回避し、OS 標準 UI を素直に呼ぶ）。
- 適用範囲: v1.x 以降のすべてのリリース。

---

## Decision Drivers

1. **ハッピーモーメントで聞く**: PDF 出力成功は Repolog のコア価値が発動した瞬間であり、ユーザー満足度が最も高いと推定される自然な接点。
2. **Local-first を一切壊さない**: `expo-store-review` は OS API のラッパーで、ネットワーク通信ゼロ・PII 送信ゼロ。`docs/reference/constraints.md` §1-1〜1-3 と整合。
3. **実装コスト最小**: コアコード変更は 5 ファイル（うち新規 2）、i18n キー追加ゼロ（OS が言語を自動選択）、SQLite マイグレーション不要、prebuild 不要。
4. **保守性**: 純粋関数 `shouldRequestReview()` を切り出すことで境界条件を Jest で網羅でき、デグレを防げる。
5. **ストア審査リスクの最小化**: Apple HIG / Google Play ポリシーに従い、誘導文言・対価付与・カスタム評価UI偽装をすべて回避。

---

## Alternatives considered

### Option A: 自前プレ確認モーダル → 分岐
「Repolog はお役に立っていますか？」と先にアプリ側で聞き、Yes のときだけ OS API を呼ぶ。
- 良い点: 不満ユーザーをガス抜きでき、平均星評価が上がりやすい。
- 悪い点:
  - 19 言語ぶんの翻訳キーが 6〜10 個増える（i18n 工数大）
  - 自前 React モーダルの実装・保守コスト増
  - Apple のガイドライン上「review gating」と解釈されるリスクが指摘されている
- 却下理由: コスト対効果が悪い。Apple HIG の精神に反する。後で必要になれば追加できる。

### Option B: 設定画面に「アプリを評価する」エントリのみ追加（受動）
PDF 出力時の自動プロンプトはやらず、設定画面のメニューからユーザーが任意に開く。
- 良い点: 完全に受動で副作用ゼロ。
- 悪い点: コンバージョン率が極端に低い（KPI 改善寄与が薄い）。
- 却下理由: KPI #7 改善の目的を達成できない。**ただし将来この導線を追加することは禁止しない**（別 PR で検討する余地あり）。

### Option C: 自前カスタム UI のみ（OS 標準を使わない）
完全自前のモーダルから外部リンクでストアページに飛ばす。
- 良い点: デザイン自由度が高い。
- 悪い点: OS 側のレートリミット管理（iOS の年間 3 回上限など）を自分で実装する必要がある。コンバージョン率が低い。Apple HIG の推奨と外れる。
- 却下理由: 不採用。

### Option D（採用）: 直接 OS ダイアログ呼び出し（最小実装）
`StoreReview.requestReview()` を直接呼ぶ。閾値判定とフラグ管理だけアプリ側で行う。
- 採用理由: 上記 5 つの判断軸すべてで最良。

---

## Consequences

### Positive
- 「成功した時しか聞かれない」設計により、ユーザー体験への悪影響が最小化される。
- KPI #7（ストア評価）の改善が期待できる。
- 既存 PDF 出力フローへの侵入が 2 行で済む（fire-and-forget）。
- i18n 追加ゼロ、マイグレーション不要、ストア申告メタデータの更新不要。
- 純粋関数を切り出したことで境界条件を Jest で完全に押さえられる。

### Negative
- iOS の `SKStoreReviewController` には**年間最大 3 回**のハードリミットがあり、実際にダイアログが表示される保証はない（試行＝記録としてフラグを立てる方針で受容）。
- バックアップ復元ではフラグも `exports` カウントもリセットされるため、復元後は再び閾値到達時に試行が走る（OS 側の年間上限により実害は限定的）。
- Pro→Free にダウングレードして累計 20 を超えても、`isPro=false` なので Pro 用プロンプトは出ない（仕様として受容）。

### Follow-ups
- [ ] リリース後 4 週間、ストアレビュー本文と平均星評価を手動でモニタリングし、必要なら閾値を A/B 検討する。
- [ ] 将来的に設定画面へ「アプリを評価する」（受動エントリ）を追加するか検討する。
- [ ] 任意フィードバック導線（メーラーリンク等）の追加可否を別 ADR で検討する。

---

## Acceptance / Tests

- **正（自動テスト）**:
  - Jest: `__tests__/reviewPromptService.test.ts` で `shouldRequestReview()` の境界値（count=3/4/5/19/20、フラグ on/off、プラン跨ぎ）と `maybeRequestReview()` の副作用（OS API 利用可否、フラグセット、エラー握りつぶし）を網羅
  - `pnpm verify`（lint + type-check + jest + i18n:check + config:check）が通ること
- **手動チェック**（Pixel 8a 実機）:
  - 手順:
    1. アプリをアンインストール → 再インストール（カウンタリセット）
    2. レポートを 4 件作成し、それぞれで PDF 出力を成功させる
    3. 4 回目の出力直後に Google Play In-App Review ダイアログが表示されることを確認
    4. 5 回目の出力ではダイアログが出ないことを確認
  - 期待結果: 4 回目で 1 度だけ表示、それ以降は静か

---

## Rollout / Rollback

- **リリース手順への影響**: なし（ストア申告メタデータ・data-safety への影響なし）
- **ロールバック方針**: 万一トラブルが発生したら、`app/reports/[id]/pdf.tsx` の `void maybeRequestReview(...)` 行を削除すれば即座に無効化できる（関数自体はそのまま残せる）。完全撤去する場合は `pnpm remove expo-store-review` で依存も外せる。
- **検知方法**: ストアレビューを毎週手動で確認。star レーティングと負レビュー本文を観察。

---

## Links

- constraints: `docs/reference/constraints.md`（§1-1 Local-first、§1-3 PII を取得しない）
- product strategy: `docs/explanation/product_strategy.md` §7-2 KPI #7
- basic_spec: `docs/reference/basic_spec.md` §4.5 PDF 出力
- service: `src/services/reviewPromptService.ts`
- tests: `__tests__/reviewPromptService.test.ts`
- Issue: #284
- expo-store-review (公式): https://docs.expo.dev/versions/latest/sdk/storereview/
- Apple HIG (Ratings & Reviews): https://developer.apple.com/design/human-interface-guidelines/ratings-and-reviews
- Google Play In-App Review API: https://developer.android.com/guide/playcore/in-app-review

---

## Notes

- 24h 経過ガード等の追加条件は意図的に置かない（ユーザー指示）。最小設計で運用し、必要が出てから後付けする。
- 試行成否（実際にダイアログが表示されたか）はクライアント側では取得できないため、「呼び出した＝試行済み」としてフラグを立てる方針。
