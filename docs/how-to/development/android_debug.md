# Android デバッグ・ログ取得手順
最終更新: 2026-02-27（JST）

USB 接続した Android 実機から、WSL2 環境でクラッシュログや
動作状況を取得・解析するための運用手順です。

想定:
- WSL2 から Windows 側の ADB を経由してデバイス通信
- USB デバッグ有効化済み
- `adb devices` で `device` と表示される状態

---

## 0. 全体像

```
[スマホ] --USB-- [Windows ADB] --WSLインターオプ-- [WSL2ターミナル]
                                                     ├── logcat（リアルタイム監視）
                                                     ├── pidcat（アプリ専用ログ）
                                                     └── monitor_repolog.sh（自動保存）
```

| ツール | 用途 | コマンド例 |
|--------|------|-----------|
| `adb logcat` | 全ログ/クラッシュ確認 | `adb logcat -b crash -v threadtime` |
| `pidcat` | アプリ専用・色付きログ | `pidcat com.dooooraku.repolog` |
| `monitor_repolog.sh` | クラッシュ自動検出・保存 | `bash scripts/monitor_repolog.sh` |

---

## 1. 事前準備（初回のみ）

### 1-1. Windows 側の ADB

`android_ビルド手順.md` の事前準備で Android SDK を導入済みなら ADB も入っている。
確認:

```powershell
# PowerShell で
adb version
# → Android Debug Bridge version 1.0.41 のように表示されれば OK
```

### 1-2. スマホの USB デバッグ有効化

1. 設定 → 端末情報 → **ビルド番号を 7 回タップ**
2. 設定 → 開発者向けオプション → **USB デバッグ ON**
3. USB 接続時に「USB デバッグを許可しますか？」→ **許可**

### 1-3. WSL2 から ADB 接続確認

```bash
adb devices
# → SX3LHMA362304722  device  のように表示されれば OK
# → "unauthorized" なら スマホ側で許可ダイアログを確認
```

### 1-4. pidcat インストール（初回のみ）

```bash
# GitHub から直接取得
curl -sL https://raw.githubusercontent.com/JakeWharton/pidcat/master/pidcat.py \
  -o ~/.local/bin/pidcat
chmod +x ~/.local/bin/pidcat

# shebang を python3 に修正（WSL2 は python3 のみ）
sed -i 's|python -u|python3 -u|' ~/.local/bin/pidcat

# 確認
pidcat --help
```

---

## 2. リアルタイムログ監視

### 2-1. pidcat（推奨：最も簡単）

```bash
# Repolog のログだけを色付きで表示
pidcat com.dooooraku.repolog
```

アプリが再起動しても PID を自動追跡する。Ctrl+C で停止。

### 2-2. logcat 直接使用

```bash
# クラッシュログのみ
adb logcat -b crash -v threadtime

# Repolog プロセスのログだけ
adb logcat --pid=$(adb shell pidof -s com.dooooraku.repolog) -v threadtime

# エラー以上のレベルだけ
adb logcat "*:E"

# ファイルに保存しながら表示
adb logcat -b crash -v threadtime 2>&1 | tee crash_$(date +%Y%m%d_%H%M%S).log
```

### 2-3. 自動クラッシュ監視スクリプト

```bash
# プロジェクトルートから実行
bash scripts/monitor_repolog.sh

# オプション:
#   (引数なし)  クラッシュ・エラー自動検出＆保存（推奨）
#   --all       全ログ表示
#   --crash     クラッシュバッファのみ
#   --help      ヘルプ
```

クラッシュ検出時に `docs/reference/Debug/` にログが自動保存される。

---

## 3. クラッシュ発生時の調査手順

### 3-1. 直前のログを確認

```bash
# 最新 500 行をダンプ
adb logcat -d -t 500 -v threadtime > recent.log
```

### 3-2. バグレポート取得（包括的）

```bash
# OS レベルの全情報を ZIP で保存（30 秒〜2 分かかる）
adb bugreport ./repolog_bugreport.zip
```

### 3-3. メモリ・画面状態の確認

```bash
# メモリ使用量
adb shell dumpsys meminfo com.dooooraku.repolog

# アクティビティスタック
adb shell dumpsys activity activities | grep -A 5 "repolog"

# フレームレート
adb shell dumpsys gfxinfo com.dooooraku.repolog
```

---

## 4. ワイヤレス ADB（USB 不要の代替手段）

Android 11 以降で利用可能。USB ケーブルなしでログ取得できる。

```bash
# 1. スマホ: 設定 → 開発者向けオプション → ワイヤレスデバッグ → ON
# 2. 「ペア設定コードによるデバイスのペア設定」をタップ
# 3. 表示された IP:ポート と 6 桁コードを使用

adb pair 192.168.X.X:XXXXX    # ペアリング（初回のみ）
adb connect 192.168.X.X:XXXXX  # 接続（ポート番号はペアリング時と異なる）

# 以降は USB 接続時と同じコマンドが使える
pidcat com.dooooraku.repolog
```

---

## 5. ログレベル早見表

| レベル | 記号 | 意味 | 色（pidcat） |
|--------|------|------|-------------|
| Verbose | V | 最も詳細 | 灰色 |
| Debug | D | デバッグ情報 | 青 |
| Info | I | 通常情報 | 緑 |
| Warning | W | 警告 | 黄色 |
| Error | E | エラー | 赤 |
| Fatal | F | 致命的エラー（クラッシュ） | 赤太字 |

---

## 6. トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| `adb devices` が空 | USB 接続されていない | ケーブル確認、別のポート試行 |
| `unauthorized` | デバッグ未許可 | スマホ画面で「許可」をタップ |
| `adb: command not found` | PATH 未設定 | `echo 'export PATH=$PATH:/mnt/c/…/platform-tools' >> ~/.bashrc` |
| pidcat が動かない | python3 未対応 | shebang を `python3` に修正 |
| ログが流れない | アプリ未起動 | スマホで Repolog を起動 |
| `more than one device` | 複数デバイス接続 | `adb -s <SERIAL> logcat` で指定 |

---

## 参考: ログ保存先

| 種類 | 保存先 |
|------|--------|
| 自動保存（monitor_repolog.sh） | `docs/reference/Debug/` |
| 手動保存 | プロジェクトルート（任意） |
| バグレポート | 指定したパス |
