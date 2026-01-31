---

# ADR-0003: AdMobバナーはreact-native-google-mobile-adsで実装する

- Status: Accepted
- Date: 2026-01-31
- Deciders: @doooooraku / Codex
- Related: Issue #7 / PR #20 / constraints

---

## Context（背景：いま何に困っている？）
- 現状：Freeの収益柱が未実装で、AdMobバナーが必須。
- 困りごと：課金と同様に審査事故・UX劣化を避けたい。
- 制約/前提（リンク推奨）：
  - `docs/reference/constraints.md` 2-3（AdMobはFreeのみ、Proは広告ゼロ、テスト広告の使用、ID直書き禁止）

---

## Decision（決めたこと：結論）
- 決定：AdMobバナーは `react-native-google-mobile-ads` を採用し、Freeのみ表示、Proは非マウント。
- 適用範囲：S-01 Home（タイムライン下部）/ Freeのみ。

---

## Decision Drivers（判断の軸：何を大事にした？）
- SDKの保守性と実績（RN向けの主流）
- Proで広告ゼロを保証できる構成
- テスト広告/本番広告の切り替えがしやすい
- Expo環境でもConfig Pluginで運用可能

---

## Alternatives considered（他の案と却下理由）

### Option A: expo-ads-admob
- 概要：Expo提供のAdMobラッパーを利用
- 良い点：Expo標準に近い
- 悪い点：メンテ状況/機能差分の不確実性
- 却下理由：将来の保守性と機能拡張の観点で不利

### Option B: AdMob実装を後回し
- 概要：Free収益を一旦保留
- 良い点：開発速度は上がる
- 悪い点：収益柱が欠落し、制約に反する
- 却下理由：constraintsの必須要件に反する

---

## Consequences（結果：嬉しいこと/辛いこと/副作用）

### Positive（嬉しい）
- Freeで収益化が成立
- Proは広告ゼロを徹底できる

### Negative（辛い/副作用）
- SDK設定（App ID/審査/同意）が必要
- リリース時に広告IDの注入ミスが起きやすい

### Follow-ups（後でやる宿題）
- [ ] EU/EEA向け同意フロー（UMP等）の検討
- [ ] AdMob審査前チェックの整備（how-to）

---

## Acceptance / Tests（合否：テストに寄せる）
- 正（自動テスト）：
  - Jest：対象なし（UI/SDK実装）
- 手動チェック（必要なら最小限）：
  - 手順：FreeでHomeを開き、広告表示を確認 / Proで広告が出ないことを確認
  - 期待結果：Freeのみバナー表示、Proは非表示

---

## Rollout / Rollback（出し方/戻し方）
- リリース手順への影響：AdMob App ID/広告ユニットIDの環境注入が必要
- ロールバック方針：AdBannerコンポーネントを外して再リリース
- 検知方法：手動テスト/ストア審査

---

## Links（関連リンク：正へ寄せる）
- constraints: `docs/reference/constraints.md`（2-3）
- Issue: #7
- PR: #20
- package.json: `react-native-google-mobile-ads`
- External docs:
  - https://docs.page/invertase/react-native-google-mobile-ads
  - https://developers.google.com/admob/android/test-ads
  - https://developers.google.com/admob/ios/test-ads

---

## Notes（メモ：任意）
- 本番は環境変数で広告IDを注入し、開発はTest IDを使う。
