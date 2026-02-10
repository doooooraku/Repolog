---

# ADR-0008: AdMob配信前にUMP同意を必須化し、審査前チェックを標準手順にする

- Status: Accepted
- Date: 2026-02-10
- Deciders: @doooooraku / Codex
- Related: Issue #73 / ADR-0003 / constraints

---

## Context（背景）
- ADR-0003 で「FreeのみAdMobバナー、Proは広告ゼロ」を採用済み。
- ただし Follow-up の「EEA同意フロー」「審査前チェック」が未実施で、法域要件に対する運用が不十分だった。
- UMP は起動ごとの同意情報更新を前提にしており、更新前に広告配信すると審査/配信リスクが残る。

---

## Decision（決定）
- Freeで広告を表示する前に、`AdsConsent.gatherConsent()` を毎回起動時に実行する。
- `consentInfo.canRequestAds === true` のときだけ Mobile Ads SDK を初期化し、バナーを描画する。
- `privacyOptionsRequirementStatus === REQUIRED` の場合に備えて、Privacy options の再選択導線を用意できる実装（service API）を持つ。
- Expo Config Plugin で `delayAppMeasurementInit=true` を有効化し、同意完了前の計測初期化を遅延させる。

---

## Decision Drivers（判断軸）
- 広告配信の法域要件（EU/EEA）を満たしつつ、Proの広告ゼロ保証を維持する。
- 「同意失敗時に広告を出さない」安全側の挙動を優先する。
- 実装負荷を増やしすぎず、既存の `react-native-google-mobile-ads` API で完結させる。

---

## Alternatives considered（代替案）

### Option A: 同意確認前でも広告初期化を進める
- 良い点：実装が単純、広告表示率が下がりにくい
- 悪い点：同意前配信のリスクが残る
- 却下理由：運用/審査リスクが高い

### Option B: EEAを自前判定して地域別分岐
- 良い点：細かい制御が可能
- 悪い点：判定誤差・保守コストが高い
- 却下理由：UMPの公式フローに寄せる方が安全

### Option C: EEA想定時は広告配信を全面停止
- 良い点：法域リスクは低い
- 悪い点：収益への影響が大きい
- 却下理由：Free収益柱の要件に反する

---

## Consequences（結果）

### Positive
- 同意要件を満たすまで広告を出さないため、審査/配信停止リスクを下げられる。
- 同意フローの運用手順を build how-to に組み込める。

### Negative
- 同意失敗時は広告表示が抑制され、短期収益が下がる可能性がある。
- Privacy options UI（ユーザー再選択導線）の画面実装は別途必要。

### Follow-ups
- [ ] Settings画面に「広告のプライバシー設定」導線を追加する Issue を起票
- [ ] 実機で EEA デバッグ地理 + テスト端末IDを使った確認を CI/Runbook に追加

---

## Acceptance / Tests（合否）
- Free:
  - UMP同意完了で `canRequestAds=true` の場合のみバナー表示
  - `canRequestAds=false` の場合はバナー非表示
- Pro:
  - 既存方針どおり広告コンポーネントをマウントしない
- 運用:
  - Android/iOS build how-to に審査前チェックを追加

---

## Rollout / Rollback
- Rollout:
  - app config に AdMob同意関連 env を追加し、EEAデバッグ検証を先に実施
  - 同意未完了時に広告非表示となる挙動を手動確認してから配信
- Rollback:
  - 問題発生時は `AdBanner` マウントを無効化して広告配信停止
  - 併せて本ADRの変更をrevert可能

---

## Links（一次情報）
- Issue: #73
- ADR-0003: `docs/adr/ADR-0003-admob-banner.md`
- Invertase docs（EU consent）:
  - https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent
- Google UMP:
  - Android: https://developers.google.com/admob/android/next-gen/privacy
  - iOS: https://developers.google.com/admob/ios/privacy
- AdMob EU User Consent Policy:
  - https://support.google.com/admob/answer/7666519?hl=en

