# ADR-0010: iOS暗号化輸出コンプライアンスの設定

- Status: Accepted
- Date: 2026-03-23
- Deciders: @doooooraku
- Issue: #214

## Context

App Store Connectにビルドをアップロードすると、毎回「Missing Compliance」（暗号化コンプライアンス情報の未入力）が表示され、手動対応が必要。
米国輸出管理規則（EAR）に基づき、Appleは全アプリに暗号化の使用状況を申告させる。

## Decision

`app.json` の `expo.ios.config.usesNonExemptEncryption` を **`false`** に設定する。

## Rationale

Repologの暗号化プロファイルを全検索し、以下を確認した:

| 技術 | 暗号の種類 | EAR分類 |
|------|-----------|---------|
| HTTPS通信（RevenueCat, AdMob） | OS標準のTLS/SSL | 免除（Note 4） |
| expo-secure-store（Keychain） | OS標準のAES-256 | 免除（認証目的、Note 4(c)） |
| expo-sqlite | 暗号化なし（SQLCipher未使用） | 該当なし |
| PDF生成 | 暗号化なし | 該当なし |
| react-native-zip-archive（SSZipArchive） | AES-128/256 APIあり（バイナリ同梱）、アプリは非暗号zip/unzipのみ使用 | 免除（Note 4、マスマーケットZIP形式） |
| 独自暗号アルゴリズム | なし（コードベース全検索で0件） | 該当なし |

全ての暗号使用がEAR Category 5 Part 2 Note 4の免除対象に該当する。
2021年3月のBIS規則改正により、マスマーケット向けアプリの年次自己分類報告義務も廃止済み。

## Alternatives Considered

1. **`true` に設定し、Appleの審査フローで免除を申告**: 安全だが、毎回コンプライアンス書類の提出が必要（2営業日追加）。CI/CDとの相性が悪い。
2. **未設定のまま毎回手動対応**: 現状。自動化の敵。

## Re-evaluation Triggers

以下の変更があった場合、この決定を再評価する:
- SQLCipher、E2E暗号化、VPN暗号などの暗号化ライブラリ追加
- 独自の暗号アルゴリズム実装
- メディエーション広告ネットワーク追加（独自暗号を含む可能性）

## Consequences

- Positive: App Store Connect の「Missing Compliance」手動対応が不要になり、CI/CD自動提出が可能になる
- Negative: 暗号化ライブラリ追加時に再評価を忘れるとEAR違反リスク → CI検証（`pnpm config:check`）と Re-evaluation Triggers で防止
- Follow-up: `coding_rules.md §8.4` にライブラリ追加時の再評価ルールを追加済み

## Links

- `docs/how-to/development/ios_build.md` §4.5 — iOS提出前チェックリスト
- `docs/how-to/development/coding_rules.md` §8.4 — 暗号化ライブラリ追加時の再評価ルール
- `scripts/config-check.mjs` — CI自動検証スクリプト

## References

- [Apple: ITSAppUsesNonExemptEncryption](https://developer.apple.com/documentation/bundleresources/information-property-list/itsappusesnonexemptencryption)
- [Apple: Complying with Encryption Export Regulations](https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations)
- [BIS: Encryption Policy Guidance](https://www.bis.doc.gov/index.php/policy-guidance/encryption)
- [BIS: Note 4 to Category 5 Part 2](https://www.bis.doc.gov/index.php/documents/new-encryption/1657-note-4/file)
- [BIS 2021 Rule: Mass Market Reporting Eliminated](https://www.arnoldporter.com/en/perspectives/advisories/2021/04/doc-eliminates-mass-market-encryption-reporting)
- [Expo: app.json config](https://docs.expo.dev/versions/latest/config/app/)
