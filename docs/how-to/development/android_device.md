# Android 実機開発ガイド（総合リファレンス）

最終更新: 2026-02-27（JST）

USB 接続した Android 実機で Repolog を開発・テスト・デバッグするための
**包括的ガイド** です。全体像の理解から、日常の開発フロー、ログ取得、
トラブルシューティングまで網羅しています。

> **初心者向け:** 各コマンドには「意味」と「何をしているか」の解説を付けています。
> プログラミング経験がなくても読み進められるように書いています。

**関連ドキュメント:**

- [`android_ビルド手順.md`](./android_ビルド手順.md) — APK ビルド手順の詳細
- [`android_デバッグ手順.md`](./android_デバッグ手順.md) — logcat / pidcat の詳細
- [`testing.md`](./testing.md) — Jest / E2E テスト手順
- [`git_workflow.md`](./git_workflow.md) — Issue → PR → Merge のフロー

---

## 目次

0. [全体アーキテクチャ](#0-全体アーキテクチャ)
1. [インフラ基盤（WSL2 + Windows + ADB）](#1-インフラ基盤)
2. [2つの開発ワークフロー](#2-2つの開発ワークフロー)
3. [ワークフロー A: Metro 開発モード（日常）](#3-ワークフロー-a-metro-開発モード日常)
4. [ワークフロー B: APK 再ビルドモード](#4-ワークフロー-b-apk-再ビルドモード)
5. [ログ取得・デバッグ](#5-ログ取得デバッグ)
6. [React Native DevTools](#6-react-native-devtools)
7. [トラブルシューティング](#7-トラブルシューティング)
8. [設計判断と根拠](#8-設計判断と根拠)
9. [参考情報（一次情報）](#9-参考情報一次情報)

---

## 0. 全体アーキテクチャ

### システム構成図

```
┌──────────────────────────────────────────────────────────────────┐
│                      Windows 11 ホストマシン                       │
│                                                                  │
│  ┌──────────────────────────┐   ┌────────────────────────────┐  │
│  │      WSL2 (Ubuntu)       │   │   Windows 側               │  │
│  │                          │   │                            │  │
│  │  ┌──────────────────┐    │   │  ┌──────────────────────┐  │  │
│  │  │  Metro Bundler   │    │   │  │  adb.exe (ADB Server)│  │  │
│  │  │  (localhost:8081) │◄───┼───┼──┤  ポート 5037          │  │  │
│  │  │  JS バンドル配信  │    │   │  │                      │  │  │
│  │  └──────────────────┘    │   │  └──────────┬───────────┘  │  │
│  │          ▲               │   │             │ USB          │  │
│  │          │ コード変更     │   │             │              │  │
│  │  ┌──────┴──────────┐    │   │             │              │  │
│  │  │  ソースコード     │    │   │             │              │  │
│  │  │  (Repolog)       │    │   │             │              │  │
│  │  └─────────────────┘    │   │             │              │  │
│  │                          │   │             │              │  │
│  │  /usr/local/bin/adb ─────┼───┼──► adb.exe │              │  │
│  │  (symlink/wrapper)       │   │             │              │  │
│  └──────────────────────────┘   └─────────────┼──────────────┘  │
│                                               │                  │
└───────────────────────────────────────────────┼──────────────────┘
                                                │ USB ケーブル
                                    ┌───────────┴──────────────┐
                                    │   Android 実機            │
                                    │   (Pixel 8a)             │
                                    │                          │
                                    │  ┌────────────────────┐  │
                                    │  │  Repolog アプリ      │  │
                                    │  │  Metro ← localhost  │──┤
                                    │  │  :8081 (reverse)    │  │
                                    │  └────────────────────┘  │
                                    │                          │
                                    │  adb reverse により      │
                                    │  端末の localhost:8081 → │
                                    │  PC の localhost:8081    │
                                    │  にトンネルされている      │
                                    └──────────────────────────┘
```

### データの流れ（初心者向け解説）

1. **ソースコード**を WSL2 上で編集する
2. **Metro Bundler** がコード変更を検知し、JavaScript バンドルを再生成する
3. Android 実機上の **Repolog アプリ** が Metro から最新バンドルを取得する（ホットリロード）
4. アプリの **ログ** は USB ケーブル経由で WSL2 ターミナルに流れてくる

> **たとえ話:** Metro は「料理を作るキッチン」、USB は「料理を運ぶ通路」、
> スマホは「お客様のテーブル」。キッチンで料理（コード）を更新すると、
> 自動的にテーブル（スマホ）の料理も更新される。

---

## 1. インフラ基盤

### 1-1. なぜこの構成なのか？

WSL2 は Linux 環境だが、USB デバイスに直接アクセスできない（仮想マシンのため）。
そこで **Windows 側の ADB** を経由して、USB 接続されたスマホと通信する。

```
WSL2 の adb コマンド
  ↓ (実体は Windows の adb.exe を実行)
Windows の ADB Server (ポート 5037)
  ↓ (USB 経由でスマホと通信)
Android 実機
```

### 1-2. ADB symlink の仕組み

WSL2 から `adb` と打つと何が起きるか：

```bash
# adb コマンドの実体を確認
which adb
```

```
意味:
- which: 「adb というコマンドはどこにあるか」を調べる
- 結果が /usr/local/bin/adb なら → Windows 側の adb.exe を呼ぶ wrapper
- 結果が /home/doooo/android-sdk/platform-tools/adb なら → Linux 側の adb
```

**wrapper スクリプトの中身** (`/usr/local/bin/adb`):

```sh
#!/bin/sh
exec /mnt/c/Users/doooo/AppData/Local/Android/Sdk/platform-tools/adb.exe "$@"
```

```
意味:
- #!/bin/sh: 「このファイルはシェルスクリプトです」という宣言
- exec: 自分自身を置き換えて、指定したプログラムを実行する
- /mnt/c/...: WSL2 から見た Windows の C: ドライブのパス
- adb.exe: Windows 版の ADB コマンド本体
- "$@": このスクリプトに渡された引数をすべてそのまま転送する
```

> **初心者向け:** `/mnt/c/` は「Windows の C: ドライブを WSL2 から覗く窓」です。
> WSL2 は Linux だけど、`/mnt/c/` を通じて Windows のファイルやプログラムにアクセスできます。

### 1-3. ADB_SERVER_SOCKET（.bashrc の設定）

`.bashrc`（シェル起動時に自動実行される設定ファイル）に以下の設定がある：

```bash
# WSL から見た Windows ホストの IP アドレスを取得
export WSL_HOST=$(ip route | awk '/^default/ {print $3}')

# Linux の adb に「Windows 側の ADB サーバーを使え」と指示
export ADB_SERVER_SOCKET=tcp:$WSL_HOST:5037
```

```
意味:
- ip route: ネットワークの経路情報（どこを通って外に出るか）を表示
- awk '/^default/ {print $3}': 「default」行の3番目の値（ゲートウェイIP）を取り出す
  → これが WSL2 から見た Windows のIPアドレス
- export: この変数をすべてのプログラムから参照可能にする
- ADB_SERVER_SOCKET: ADB クライアントに「このアドレスの ADB サーバーを使え」と指示
- tcp:$WSL_HOST:5037: Windows の IP アドレスのポート 5037 に接続
```

> **重要:** この設定は **Linux 側の adb バイナリ** を使う場合に必要。
> symlink 経由で **Windows の adb.exe** を使う場合は不要
> （adb.exe は自動的に Windows 側のサーバーを使う）。
>
> 両方が PATH にある場合、`which adb` で確認し、
> 必要に応じて `env -u ADB_SERVER_SOCKET adb` で環境変数を無効化する。

### 1-4. ポートフォワーディング（adb reverse）

```bash
adb reverse tcp:8081 tcp:8081
```

```
意味:
- adb reverse: 「逆方向のトンネル」を作る
- tcp:8081 (1つ目): スマホ側のポート 8081
- tcp:8081 (2つ目): PC 側のポート 8081
- 効果: スマホが localhost:8081 にアクセスすると、
        USB ケーブル経由で PC の localhost:8081 に転送される
```

> **なぜ必要？** スマホとPCは別のマシン。スマホから見た `localhost` は
> スマホ自身を指す。Metro Bundler は PC で動いているので、スマホから
> Metro に到達するには「トンネル」が必要。`adb reverse` がそのトンネル。
>
> **たとえ話:** 「スマホの部屋の8081番ドアを開けると、
> PCの部屋の8081番ドアに繋がっている秘密の通路」を作る。

### 1-5. 接続確認チェックリスト

```bash
# 1. ADB コマンドの実体確認
which adb
# → /usr/local/bin/adb (Windows adb.exe wrapper) であることを確認

# 2. デバイス接続確認
adb devices
# → "SX3LHMA362304722  device" のように表示されれば OK
# → "unauthorized" なら スマホ側で許可ダイアログをタップ
# → 空なら USB ケーブル確認

# 3. ポートフォワーディング設定
adb reverse tcp:8081 tcp:8081
# → エラーなく完了すれば OK

# 4. ポートフォワーディング確認
adb reverse --list
# → "tcp:8081 tcp:8081" が表示される
```

```
意味:
- which adb: adb コマンドのパスを確認
- adb devices: 接続中のデバイス一覧を表示
- adb reverse tcp:8081 tcp:8081: ポートフォワーディングを設定
- adb reverse --list: 設定済みのフォワーディング一覧を表示
```

---

## 2. 2つの開発ワークフロー

日常開発では、変更内容に応じて **2つのワークフロー** を使い分ける。

### 判断フローチャート

```
コードを変更した
    │
    ▼
何を変更した？
    │
    ├── JavaScript / TypeScript のコード変更
    │   （画面UI、ロジック、スタイル、翻訳 など）
    │   → ワークフロー A: Metro 開発モード（数秒で反映）
    │
    ├── app.json / eas.json の変更
    │   → ワークフロー B: APK 再ビルド（5-15分）
    │
    ├── ネイティブライブラリの追加・削除
    │   （package.json に新しいネイティブモジュール追加）
    │   → ワークフロー B: APK 再ビルド
    │
    └── expo plugins / config plugins の変更
        → ワークフロー B: APK 再ビルド
```

> **初心者向け:** 「Metro 開発モード」は **9割以上の開発作業** で使う。
> APK 再ビルドが必要なのは、アプリの「骨格」を変えたときだけ。
> 画面やロジックの変更は Metro で即座に反映される。

### 具体例

| 変更内容 | ワークフロー | 理由 |
|---------|------------|------|
| ボタンの色を変えた | A: Metro | JS/スタイル変更 |
| 新しい画面を追加した | A: Metro | JS/TSX ファイル追加 |
| バグ修正（ロジック変更） | A: Metro | JS/TS 変更 |
| 翻訳テキストを追加した | A: Metro | JS オブジェクト変更 |
| `PDF_FONT_SUBSET_EXPERIMENT` を有効化 | B: APK | app.json (extra) 変更 |
| 新しいネイティブライブラリを追加 | B: APK | ネイティブコード変更 |
| アプリアイコンを変更 | B: APK | app.json (android.adaptiveIcon) 変更 |

---

## 3. ワークフロー A: Metro 開発モード（日常）

**所要時間:** コード変更 → スマホ反映まで 1-3 秒

### 手順

#### Step 1: Metro Bundler を起動する

```bash
cd /home/doooo/04_app-factory/apps/Repolog
npx expo start --clear
```

```
意味:
- cd: 作業ディレクトリを Repolog プロジェクトに移動
- npx: ローカルにインストールされたパッケージのコマンドを実行
- expo start: Expo の Metro Bundler を起動する
  Metro はソースコードを監視し、変更があると自動で再バンドルする
- --clear: キャッシュをクリアして起動（初回や設定変更後に使う）
  通常は --clear なしの `npx expo start` で OK
```

起動すると以下のような表示が出る：

```
Starting Metro Bundler
Logs for your project will appear below.

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
```

> **初心者向け:** Metro が起動したら、このターミナルは **開きっぱなし** にする。
> ここにアプリの `console.log` が表示される。

#### Step 2: ポートフォワーディングを設定する

**別のターミナル** を開いて実行（Metro のターミナルとは別）：

```bash
adb reverse tcp:8081 tcp:8081
```

```
意味:
- スマホの localhost:8081 → PC の localhost:8081 に転送
- これでスマホのアプリが Metro Bundler に接続できるようになる
```

> **補足:** この設定は USB を抜くとリセットされる。
> USB を挿し直したら再度実行する。

#### Step 3: スマホでアプリを起動する

スマホのホーム画面から Repolog アプリのアイコンをタップ。

起動すると自動的に Metro に接続し、最新のバンドルをダウンロードする。
Metro のターミナルに以下のようなログが流れる：

```
Android Bundling complete 1234ms
```

#### Step 4: コードを編集 → 自動反映

エディタでソースコードを変更して保存する。
Metro が変更を検知し、スマホ上のアプリに自動反映される（**Fast Refresh**）。

> **Fast Refresh とは:** ファイルを保存するだけで、アプリを再起動せずに
> 変更が即座に反映される仕組み。React のステート（状態）も保持される。
> 画面を閉じて開き直す必要はない。

#### Step 5: 手動リロード（必要な場合のみ）

Fast Refresh がうまく動かない場合：

- **Metro ターミナルで `r`** を押す → アプリ全体がリロードされる
- **スマホをシェイク** → Developer Menu → 「Reload」をタップ

### Metro 開発モードのまとめ

```
1. npx expo start           ← Metro 起動（1回だけ）
2. adb reverse tcp:8081 tcp:8081  ← ポート転送（1回だけ / USB 再接続時）
3. アプリ起動               ← スマホでタップ（1回だけ）
4. コード編集 → 保存         ← 以降はこの繰り返し（自動反映）
```

---

## 4. ワークフロー B: APK 再ビルドモード

**所要時間:** 5-15 分（マシンスペックによる）

ネイティブ設定（`app.json`, ネイティブライブラリ）を変更した場合に使用する。

### 手順

```bash
# 1. 品質チェック（CI と同じ順番）
pnpm lint && pnpm test && pnpm type-check

# 2. APK ビルド
pnpm build:android:apk:local

# 3. デバイスにインストール
pnpm install:device

# 4. アプリを起動してテスト
# → スマホでアプリアイコンをタップ
```

```
意味:
- pnpm lint: ESLint でコードスタイルと問題をチェック
- pnpm test: Jest でユニットテストを実行
- pnpm type-check: TypeScript で型エラーをチェック
- pnpm build:android:apk:local: EAS でローカル APK ビルド
  (内部で Gradle を使って Android ネイティブコードをコンパイル)
- pnpm install:device: adb install で USB 経由でスマホに APK を送信
```

> **詳細手順は** [`android_ビルド手順.md`](./android_ビルド手順.md) を参照。

---

## 5. ログ取得・デバッグ

### 5-1. ログ手段の使い分け

```
問題が起きた！
    │
    ▼
何が表示されている？
    │
    ├── JS のエラーメッセージ（赤い画面、Alert）
    │   → Metro コンソールを確認（最も簡単）
    │
    ├── 「Repologが停止しました」（アプリがクラッシュした）
    │   → adb logcat または monitor_repolog.sh
    │
    ├── 画面が固まった（ANR: Application Not Responding）
    │   → adb logcat -b crash で ANR 原因を確認
    │
    ├── 動作が遅い / メモリ不足の疑い
    │   → React Native DevTools の Memory パネル
    │   → adb shell dumpsys meminfo com.dooooraku.repolog
    │
    └── よくわからない / 原因不明
        → monitor_repolog.sh で自動監視しながら再現
```

### 5-2. Metro コンソール（最も簡単）

Metro を起動したターミナルに `console.log` の出力がリアルタイムで表示される。

```
[特徴]
- JS のログが自動的に表示される
- console.log, console.warn, console.error すべて見える
- ネイティブレイヤーのログは表示されない（logcat を使う）

[使い方]
- Metro ターミナルを見るだけ（何もしなくてOK）
```

### 5-3. pidcat（アプリ専用・色付きログ）

```bash
pidcat com.dooooraku.repolog
```

```
意味:
- pidcat: Android ログを色分けして見やすく表示するツール
- com.dooooraku.repolog: Repolog のパッケージ名（これだけをフィルタする）
- アプリのログだけが色付きで表示される（他のアプリのログは非表示）
- アプリが再起動しても自動で追跡を続ける
- Ctrl+C で停止
```

### 5-4. adb logcat（システムレベルログ）

```bash
# クラッシュログのみ表示
adb logcat -b crash -v threadtime
```

```
意味:
- adb logcat: Android のシステムログをリアルタイム表示
- -b crash: 「crash」バッファのみ表示（クラッシュ専用の記録領域）
- -v threadtime: 日時 + スレッドID + プロセスID 付きで表示
```

```bash
# エラーレベル以上のみ表示
adb logcat "*:E"
```

```
意味:
- "*:E": すべてのタグ（*）でエラー（E）以上のレベルだけ表示
- V(Verbose) < D(Debug) < I(Info) < W(Warning) < E(Error) < F(Fatal)
```

```bash
# Repolog プロセスのログだけ表示
adb logcat --pid=$(adb shell pidof -s com.dooooraku.repolog) -v threadtime
```

```
意味:
- --pid=: 特定のプロセスID のログだけ表示
- $(adb shell pidof -s com.dooooraku.repolog):
  → adb shell: スマホの中でコマンドを実行
  → pidof -s: 指定パッケージ名のプロセスID を取得
  → $(): コマンドの結果を埋め込む
- 結果: Repolog アプリのログだけが表示される
```

```bash
# React Native 関連のログだけ表示
adb logcat "*:S" ReactNative:V ReactNativeJS:V
```

```
意味:
- "*:S": すべてのタグをサイレント（非表示）にする
- ReactNative:V: React Native のブリッジログを Verbose レベルで表示
- ReactNativeJS:V: JavaScript 側のログを Verbose レベルで表示
- 結果: React Native に関係するログだけが見える
```

### 5-5. monitor_repolog.sh（自動クラッシュ監視）

```bash
# プロジェクトルートから実行
bash scripts/monitor_repolog.sh
```

```
意味:
- bash: シェルスクリプトを実行
- scripts/monitor_repolog.sh: Repolog 専用の自動監視スクリプト
- adb logcat を内部で実行し、クラッシュ・エラーキーワードを検出
- 検出時に自動で docs/reference/Debug/ にログファイルを保存
- 放置しておくだけでクラッシュが自動記録される
```

```bash
# オプション
bash scripts/monitor_repolog.sh --all    # 全ログ表示（大量に流れる）
bash scripts/monitor_repolog.sh --crash  # クラッシュバッファのみ
bash scripts/monitor_repolog.sh --help   # ヘルプ表示
```

**出力先:** `docs/reference/Debug/`

| ファイル | 内容 |
|---------|------|
| `crash_YYYYMMDD_HHMMSS.log` | クラッシュ行のみ |
| `full_YYYYMMDD_HHMMSS.log` | クラッシュ前後の全体ログ |

### 5-6. ログレベル早見表

| レベル | 記号 | 意味 | 例 |
|--------|------|------|-----|
| Verbose | V | 最も詳細な情報 | 関数の呼び出しトレース |
| Debug | D | 開発中のデバッグ情報 | 変数の値、処理フロー |
| Info | I | 通常の動作情報 | 「アプリ起動」「画面遷移」 |
| Warning | W | 注意が必要な状況 | 「非推奨APIの使用」 |
| Error | E | エラー（動作は継続） | 「ネットワーク接続失敗」 |
| Fatal | F | 致命的エラー（クラッシュ） | 「OutOfMemoryError」 |

---

## 6. React Native DevTools

Expo SDK 54 + Hermes エンジンで使える公式デバッグツール。
Chrome DevTools ベースの専用デバッガー。

### 6-1. 起動方法

Metro ターミナルで **`j`** キーを押す。

```
Metro 起動中のターミナル画面:
  › Press j │ open debugger     ← これ
  › Press r │ reload app
  › Press m │ toggle menu
```

ブラウザが開き、React Native DevTools が起動する。

### 6-2. 利用可能なパネル

| パネル | 用途 | いつ使う？ |
|--------|------|----------|
| **Console** | ログ閲覧、JS 式の実行 | `console.log` を見たいとき |
| **Sources** | ソースコード表示、ブレークポイント設定 | 変数の値をステップ実行で追いたいとき |
| **Network** | fetch/XHR リクエストの監視 | API 通信のデバッグ |
| **Memory** | ヒープスナップショット、メモリリーク検出 | メモリ不足の調査 |
| **Components** | React コンポーネントツリー、Props/State 表示 | UI の状態を確認したいとき |

### 6-3. よく使う操作

```
Console パネル:
- Ctrl+L: ログクリア
- フィルタ入力: 特定のログだけ表示

Sources パネル:
- Ctrl+P (Cmd+P): ファイル名でソースを開く
- 行番号クリック: ブレークポイント設置
- 右クリック → "Add conditional breakpoint": 条件付きブレークポイント

Components パネル:
- コンポーネントをクリック → Props と State が右側に表示
- 値を直接編集して動作を確認可能
```

---

## 7. トラブルシューティング

### 7-1. 接続系

| 症状 | 原因 | 対処 |
|------|------|------|
| `adb devices` が空 | USB 未接続 or USBデバッグ OFF | ケーブル確認 → 開発者オプション確認 |
| `unauthorized` と表示 | スマホで許可していない | スマホ画面の「USBデバッグを許可」をタップ |
| `adb: command not found` | PATH 未設定 | `which adb` で確認、symlink を再作成 |
| `more than one device` | 複数デバイス接続 | `adb -s SX3LHMA362304722 <コマンド>` でデバイスを指定 |
| `adb server version doesn't match` | ADB バージョン不一致 | Linux 側と Windows 側で同じバージョンにする |

### 7-2. Metro 接続系

| 症状 | 原因 | 対処 |
|------|------|------|
| アプリが起動しない / 白い画面 | Metro に接続できない | `adb reverse tcp:8081 tcp:8081` を再実行 |
| 「Unable to load script」 | Metro が起動していない or ポート転送切れ | Metro を `npx expo start` で起動、ポート転送を再設定 |
| Metro に接続中…が終わらない | ポート転送失敗 | `adb reverse --list` で確認、再設定 |
| 変更が反映されない | Fast Refresh が失敗 | Metro で `r` を押してフルリロード |
| 古いキャッシュが残っている | バンドルキャッシュ | `npx expo start --clear` でキャッシュクリア起動 |

### 7-3. ADB_SERVER_SOCKET 関連

| 症状 | 原因 | 対処 |
|------|------|------|
| `error: cannot connect to daemon` | ADB_SERVER_SOCKET が不正なIPを指している | `env -u ADB_SERVER_SOCKET adb devices` で確認 |
| `adb devices` で応答なし | .bashrc の WSL_HOST が間違っている | `echo $WSL_HOST` で IP 確認 |

```bash
# ADB_SERVER_SOCKET を一時的に無効化して実行
env -u ADB_SERVER_SOCKET adb devices
```

```
意味:
- env -u ADB_SERVER_SOCKET: 環境変数 ADB_SERVER_SOCKET を
  一時的に削除（unset）した状態で後続のコマンドを実行
- adb devices: その状態でデバイス一覧を表示
- これで繋がるなら、ADB_SERVER_SOCKET の値が問題
```

### 7-4. ビルド系

| 症状 | 原因 | 対処 |
|------|------|------|
| Gradle ビルド失敗 | Android SDK / Java 不足 | `echo "$ANDROID_HOME"` と `java -version` で確認 |
| APK インストール失敗 | 署名の不一致 | `adb uninstall com.dooooraku.repolog` → 再インストール |
| prebuild 反映漏れ | ネイティブ設定変更未反映 | `npx expo prebuild --platform android` を実行 |

---

## 8. 設計判断と根拠

### Q1. なぜ usbipd-win ではなく symlink 方式？

| 観点 | symlink (採用) | usbipd-win |
|------|---------------|------------|
| セットアップ | `ln -s` 1行 | winget install + bind + attach |
| 追加ソフト | なし | usbipd-win パッケージ必要 |
| 安定性 | WSL interop に依存（安定） | 大ファイル転送時に BSOD 報告あり |
| 対象 | ADB のみ | 任意の USB デバイス |
| メンテナンス | ほぼ不要 | Windows Update で再設定が必要な場合あり |

**判断:** ADB だけ使えれば十分なので、シンプルな symlink 方式を採用。

### Q2. なぜ NAT モードで ADB_SERVER_SOCKET を設定？

WSL2 の NAT モードでは、WSL2 と Windows は **異なる IP アドレス** を持つ。
Linux 側の `adb` が Windows 側の ADB サーバーに接続するには、
Windows の IP を指定する必要がある。

ただし、現在は symlink 方式で Windows の `adb.exe` を直接実行しているため、
`ADB_SERVER_SOCKET` は厳密には不要。`.bashrc` の設定は Linux 側
`adb` バイナリを使う場合のフォールバック。

> **将来の選択肢:** WSL2 をミラードネットワーキングモードに変更すると、
> Windows と WSL2 が `localhost` を共有し、IP 解決が不要になる。
> 設定: `%UserProfile%/.wslconfig` に `[wsl2] networkingMode=mirrored` を追加。

### Q3. なぜ Expo Dev Client を使わないのか？

| 観点 | 現在の方式（APK ビルド） | Dev Client |
|------|----------------------|------------|
| 初回セットアップ | `pnpm build:android:apk:local` | 同じ |
| JS 変更時 | Metro ホットリロード（同じ） | Metro ホットリロード（同じ） |
| ネイティブ変更時 | APK 再ビルド → 再インストール | 同じ |
| 利点 | シンプル、追加依存なし | ランチャーUI、EAS Update 対応 |

**判断:** 現状のワークフローで十分機能している。Dev Client は
EAS Update（OTA 配信）を使う段階で導入を検討。

---

## 9. 参考情報（一次情報）

### Expo / React Native 公式

- [Expo: View logs](https://docs.expo.dev/workflow/logging/)
- [Expo: Debugging runtime issues](https://docs.expo.dev/debugging/runtime-issues/)
- [Expo: Debugging and profiling tools](https://docs.expo.dev/debugging/tools/)
- [Expo: Local app development](https://docs.expo.dev/guides/local-app-development/)
- [Expo: Build APKs for Android](https://docs.expo.dev/build-reference/apk/)
- [Expo: Development builds introduction](https://docs.expo.dev/develop/development-builds/introduction/)
- [React Native: DevTools](https://reactnative.dev/docs/react-native-devtools)
- [React Native: Debugging native code](https://reactnative.dev/docs/debugging-native-code)
- [React Native: Profiling](https://reactnative.dev/docs/profiling)

### Microsoft / WSL2 公式

- [WSL: Connect USB devices](https://learn.microsoft.com/en-us/windows/wsl/connect-usb)
- [WSL: Accessing network applications](https://learn.microsoft.com/en-us/windows/wsl/networking)
- [WSL: Advanced settings (.wslconfig)](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)

### Android 公式

- [Android: ADB command-line tool](https://developer.android.com/tools/adb)
- [Android: logcat](https://developer.android.com/tools/logcat)

### コミュニティ

- [usbipd-win (GitHub)](https://github.com/dorssel/usbipd-win)
- [React Native app in WSL2 (Gist)](https://gist.github.com/bergmannjg/461958db03c6ae41a66d264ae6504ade)
- [pidcat (GitHub)](https://github.com/JakeWharton/pidcat)
