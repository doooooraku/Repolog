

---

#  理想サイクル（全体像）


* **Explanation（Why / 価値と境界）**：`docs/explanation/product_strategy.md`
* **Reference（変わりにくい事実）**：

  * `docs/reference/constraints.md`（前提/制約の一枚岩）
  * `docs/reference/basic_spec.md`（基本仕様＝不変条件寄り）
  * `docs/reference/functional_spec.md`（機能仕様＝UI/状態/制約の“結論”だけ）
  * `docs/reference/glossary.md`（用語の正）
* **ADR（なぜそう決めたか）**：`docs/adr/ADR-*.md`（本文から理由を追い出す）
* **How-to（手順）**：

  * `docs/how-to/whole_workflow.md`（開発〜リリースの回し方）
  * `docs/how-to/git_workflow.md`（Issue~mergeの回し方）
  * `docs/how-to/testing.md`（テストの回し方。正はCI/package.jsonにリンク）
  * `docs/how-to/android_ビルド手順.md`（Androidビルド手順）
  * `docs/how-to/ios_ビルド手順.md`（iOSビルド手順）
  * `docs/how-to/legal_pages_github_pages.md`（法務ページ公開と運用）
* **合否（Acceptance Criteria）**：基本は **自動テスト（Jest）** ＋ 必要なら E2E（Maestro）
  → 「合格/不合格」を人の文章から機械に寄せる。
* **強制装置（Docs-as-code）**：Issue Forms / PRテンプレ / Required checks / CODEOWNERS
  → “やった気”を潰す仕組み。

---

# `docs/how-to/whole_workflow.md`（提案：全文）

> ※ あなたの「工程カード（トリガー/INPUT/OUTPUT/完了条件/担当…）」形式で書きます
> ※ “正を見る場所”を固定（package.json / CI / 公式Docs）して、写経を減らします

---

## 0. この文書の目的

Repolog を **「仕様→Issue→実装→テスト→PR→マージ→リリース」** のサイクルで回し続け、
**ドキュメントが古くならない（＝仕様が死なない）**状態を作る。

## 1. 参照する“正（ソース・オブ・トゥルース）”

* 実装の正：コード（`src/**`）
* コマンドの正：`package.json` の scripts
* CIで走るものの正：`.github/workflows/ci.yml`
* 仕様の正：

  * 価値/境界：`docs/explanation/product_strategy.md`
  * 前提/制約：`docs/reference/constraints.md`
  * 仕様（結論）：`docs/reference/basic_spec.md` / `docs/reference/functional_spec.md`
  * 用語：`docs/reference/glossary.md`
  * 理由：`docs/adr/ADR-*.md`
  * 合否：テスト（Jest）＋必要なら `maestro/**`（E2E）

---

## 工程カード一覧（作成→リリースまで）

### 工程W-01：課題の発見（価値の仮説づくり）

* **トリガーキー**：アイデア発生 / 苦情 / データ変化
* **作業内容**：
  誰の、どの困りごとを、どう良くするか（価値）と、やらないこと（境界）を決める。
* **INPUT**：Storeレビュー、利用ログ、競合観察、身近な不便
* **OUTPUT**：
  * `docs/explanation/product_strategy.md` の作成
  * `docs/reference/basic_spec.md` の作成/更新
  * `docs/reference/functional_spec.md` の作成/更新
  * `docs/reference/glossary.md`（用語が増える場合）

* **完了条件**：第三者が読んで「何を作る/作らない」が同じ理解になる
* **担当**：人間（あなた）

### 工程W-02：Issue作成（必須項目の強制）

* **トリガーキー**：W-01 完了 / バグ発生
* **作業内容**：Issue Forms で **“必須項目を埋めないとIssueが作れない”** 状態にする  
  さらに、Issue本文に **タスク分割（チェックリスト or サブIssue）** を書く
  - 小さければチェックリスト
  - 大きければサブIssue（親子で追える状態にする）
* **INPUT**：W-01で作成した.mdファイル、現象ログ、スクショ
* **OUTPUT**：GitHub Issue（bug / feature）
* **完了条件**：

  * 受け入れ条件が“テスト文”で書かれている
  * 参照先（constraints / glossary / basic_spec / functional_spec / ADR）がリンクされている
  * Issue本文に「タスク分割」がある（チェックリスト or サブIssue）
* **担当**：Codexで文章作成・成型

### 工程W-03：優先度付け（いまやる/やらない）

* **トリガーキー**：Issueが溜まった
* **作業内容**：Impact（効果）× Effort（手間）× Risk（危険）で並べ替え
* **INPUT**：Issue一覧
* **OUTPUT**：優先度（P0/P1/P2…）
* **完了条件**：次にやるIssueが1つ選べる
* **担当**：Codex

### 工程W-04：着手準備（ブランチ作成）

* **トリガーキー**：W-03で優先度の高いIssueの存在を確認
* **作業内容**：mainから作業ブランチを切る
* **INPUT**：Issue番号
* **OUTPUT**：ブランチ（例：`feature/123-admob-banner`）
* **完了条件**：ブランチがpushされ、CIが動く状態
* **担当**：Codex


### 工程W-05：仕様の“結論”を固める（必要なときだけ）

* **トリガーキー**：実装前に迷いがある / 仕様が増える
* **作業内容**：
  * 人間(あなた)に対話形式で分からない点について相談する
  * 不変条件 → `basic_spec`
  * 用語 → `glossary`
  * 前提/制約 → `constraints`
  * 理由（なぜ）→ ADR
    に分離して追記（本文を太らせない）
* **INPUT**：Issue、既存docs
* **OUTPUT**：docs更新（必要なら）
* **完了条件**：「実装で迷わないレベルの“結論”」が残っている
* **担当**：人間（あなた）＋ Codex

### 工程W-06：実装（小さく刻む）

* **トリガーキー**：W-05完了
* **作業内容**：実装ルールに従って変更する（命名/設計/責務分離など）
* **INPUT**：Issue、設計結論
* **OUTPUT**：コード差分
* **完了条件**：ローカルで最低限の確認ができる
* **担当**：Codex


### 工程W-07：受け入れ条件をテストへ落とす（“合否を機械化”）

* **トリガーキー**：各Issueの実装完了後
* **作業内容**：Jestで判定できる形にする
* **INPUT**：Issueの受け入れ条件
* **OUTPUT**：`tests/**` 追加/更新
* **完了条件**：テストが落ちれば“何がダメか”が分かる
* **担当**：Codex
* **ポイント**：仕様本文に「合格条件の長文」を置くのではなく、**テストが合否を持つ**。

### 工程W-08：ローカルテスト

* **トリガーキー**：コミットを出す前
* **作業内容**：`tests/**` 実施
* **INPUT**：テストファイル
* **OUTPUT**：なし
* **完了条件**：テストがすべて通る
* **担当**：Codex

### 工程W-09：コミット→push（CIを回す）

* **トリガーキー**：W-08完了
* **作業内容**：Issue単位でコミットしpush
* **INPUT**：差分
* **OUTPUT**：GitHub上にブランチ
* **完了条件**：CIが動き、結果が見える
* **担当**：Codex


### 工程W-10：PR作成（レビューと強制）

* **トリガーキー**：プッシュ完了
* **作業内容**：PRテンプレに沿って提出し、レビュー依頼
* **INPUT**：Issue、差分、CI結果、PRテンプレ
* **OUTPUT**：PR
* **完了条件**：Required checks が全部通る（ブランチ保護で強制）
* **確認コマンド（GitHub CLI）**：
  `gh api repos/doooooraku/Repolog/branches/main/protection`
  - `required_status_checks.contexts` に `test` が含まれる
  - `required_pull_request_reviews.required_approving_review_count` が `1` 以上
  - `enforce_admins.enabled` が `true`
  - `allow_force_pushes.enabled` が `false`
  - `allow_deletions.enabled` が `false`
* **担当**：Codex

#### W-10 補足：承認レビューを満たす運用（Repolog）

最低1件の承認レビューを通すため、**write権限のレビュアー**を用意しておく。

```bash
# レビュアー権限確認（期待: "role_name":"write"）
gh api repos/doooooraku/Repolog/collaborators/husen21000/permission

# レビュアー側で承認
gh auth switch -u husen21000
gh pr review <PR番号> --approve --body "Reviewed and approved."

# 作業者アカウントへ戻す
gh auth switch -u doooooraku
```

### 工程W-11：マージ（mainに反映）

* **トリガーキー**：PR承認＋CI成功
* **作業内容**：マージ
* **INPUT**：PR
* **OUTPUT**：main更新
* **完了条件**：mainのCIが成功
* **担当**：Codex

### 工程W-11.5：仕様棚卸し（Spec → Issue への戻り）

* **トリガーキー**：W-11 完了
* **作業内容**：
  * 仕様書（product_strategy / constraints / *spec）をざっと読み直す
  * 「まだIssue化されていない作業」があれば Issue を追加する
* **INPUT**：mainの最新仕様書
* **OUTPUT**：追加Issue（必要な場合）
* **完了条件**：Issue化の漏れが無い／無ければ次工程へ
* **担当**：人間（あなた）＋ Codex

#### W-11.5 補足：Project監査の前提

Project v2 を `gh project` で監査するには `read:project` スコープが必要。

```bash
# 1) 現在の認証状態を確認
gh auth status

# 2) 対象アカウントへ切り替え（複数アカウント運用時）
gh auth switch -u doooooraku

# 3) github.com ホストに read:project を追加
gh auth refresh -h github.com -s read:project

# 取得確認
gh project list --owner doooooraku --format json
```

`gh issue view` が `projectCards` 関連エラーで失敗する場合は、gh CLI を更新する。  
更新が難しい環境では、次の API コマンドで Issue 本文/コメントを取得できる。

```bash
gh api repos/doooooraku/Repolog/issues/<Issue番号>
gh api repos/doooooraku/Repolog/issues/<Issue番号>/comments
```

### 工程W-12：リリース（EAS/Store手順に従う）

* **トリガーキー**：mainが安定 / 仕様書から作成するIssue/バグが無くなった
* **作業内容**：
  * `docs/how-to/android_ビルド手順.md`の実施
  * `docs/how-to/ios_ビルド手順.md`の実施
* **INPUT**：main、リリースノート、Storeメタ情報
* **OUTPUT**：TestFlight / Play内部テスト / 本番リリース
* **完了条件**：ストアの審査/配信が通る。
* **担当**：人間

---

## 2. Done（完了の定義：最小）

DoD（完了の定義）＝「ここまでできたら終わり」という約束。  
DoDに1つでも×があれば完了ではない（次の工程へ進めない）。

* CI（`.github/workflows/*.yml`）が全て成功
* PRテンプレのチェックが埋まっている（必要な docs / ADR / tests）
* 変更が constraints に触れるなら `docs/reference/constraints.md` も更新
* 仕様の“結論”が変わるなら `docs/reference/*spec*.md` を更新
* “なぜ”が増えたなら ADR を追加

---
