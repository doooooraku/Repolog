# scrcpy 画面ミラーリング・スクリーンショット手順

最終更新: 2026-03-02（JST）

USB 接続した Android 実機の画面を PC モニターにリアルタイム表示し、
スクリーンショットや画面録画を取得するための運用手順です。

想定:
- WSL2 から Windows 側の scrcpy / ADB を経由してデバイス通信
- USB デバッグ有効化済み
- `adb devices` で `device` と表示される状態

---

## 0. 全体像

```
[Pixel 8a] --USB-- [Windows]
                     ├── scrcpy.exe（画面ミラーリング・録画）
                     └── adb.exe（スクリーンショット・デバイス操作）
                          ↑
                   [WSL2 ラッパー]
                     ├── ~/.local/bin/scrcpy → scrcpy.exe
                     └── /usr/local/bin/adb  → adb.exe
```

| ツール | 用途 | コマンド例 |
|--------|------|-----------|
| `scrcpy` | 画面ミラーリング（リアルタイム表示） | `scrcpy` |
| `scrcpy --record` | 画面録画（MP4保存） | `scrcpy --record=demo.mp4` |
| `adb exec-out screencap` | スクリーンショット撮影 | `adb exec-out screencap -p > screenshot.png` |

---

## 1. 前提（インストール済みの構成）

### 1-1. Windows 側

```
C:\Users\doooo\tools\scrcpy\
├── scrcpy.exe       ← 本体（v3.3.4）
├── scrcpy-server    ← Android 側に自動転送されるサーバー
├── SDL2.dll         ← 画面描画ライブラリ
├── avcodec-61.dll   ← 映像コーデック
├── avformat-61.dll
├── avutil-59.dll
├── swresample-5.dll
├── libusb-1.0.dll
└── ...
```

> **注意**: 同梱の `adb.exe` は削除済み。
> Android SDK の `adb.exe`（`C:\Users\doooo\AppData\Local\Android\Sdk\platform-tools\`）を
> scrcpy が自動参照するため、ADB バージョン競合を防止している。

### 1-2. WSL2 側

```
~/.local/bin/scrcpy    ← ラッパースクリプト（→ scrcpy.exe を呼ぶ）
/usr/local/bin/adb     ← 既存ラッパー（→ adb.exe を呼ぶ）
```

ラッパーの中身（adb と同じパターン）:

```sh
#!/bin/sh
exec /mnt/c/Users/doooo/tools/scrcpy/scrcpy.exe "$@"
```

### 1-3. 動作確認

```bash
# scrcpy のバージョン確認（デバイス接続不要）
scrcpy --version
# → scrcpy 3.3.4

# ADB でデバイス接続確認
adb devices
# → SX3LHMA362304722  device
```

---

## 2. 日常開発：画面を見ながらコーディング

### 2-1. 基本起動

```bash
scrcpy
```

Pixel 8a の画面が Windows デスクトップにウィンドウとして表示される。
ウィンドウ内でマウス操作・キーボード入力が可能。

### 2-2. 推奨オプション付き起動

```bash
scrcpy --max-fps=60 --max-size=1080 --turn-screen-off --stay-awake
```

| オプション | 意味 |
|-----------|------|
| `--max-fps=60` | フレームレート上限を 60fps に制限。PC負荷を抑えつつ滑らかに表示 |
| `--max-size=1080` | 解像度の長辺を 1080px に縮小。Pixel 8a の実解像度（2400x1080）のまま だと不必要に重い |
| `--turn-screen-off` | スマホの物理画面を消す。PC で見えれば十分なのでバッテリー節約 |
| `--stay-awake` | 画面は消すがスリープしない。スリープすると scrcpy が切断される |

### 2-3. キーボードショートカット（scrcpy ウィンドウ内）

`MOD` はデフォルトで **左 Alt キー**。

| ショートカット | 動作 |
|---------------|------|
| `MOD + b` | 戻る（Back ボタン） |
| `MOD + h` | ホーム |
| `MOD + s` | アプリ切替（Recent） |
| `MOD + Shift + m` | メニューキー（Expo Dev Menu 表示に使える） |
| `MOD + n` | 通知パネルを開く |
| `MOD + Shift + n` | 通知パネルを閉じる |
| `MOD + o` | スマホ画面 OFF 切替 |
| `MOD + ↑ / ↓` | 音量 上 / 下 |
| `Ctrl + c`（ターミナル） | scrcpy 終了 |

### 2-4. Expo Dev Menu を開く

scrcpy 経由ではシェイクジェスチャーが使えないため、ADB コマンドで代替する:

```bash
adb shell input keyevent 82
```

> `keyevent 82` = メニューキー。React Native / Expo の開発者メニューが開く。

---

## 3. スクリーンショット撮影

### 3-1. 基本コマンド

```bash
env -u ADB_SERVER_SOCKET adb exec-out screencap -p > screenshot.png
```

| パーツ | 意味 |
|--------|------|
| `env -u ADB_SERVER_SOCKET` | 環境変数 ADB_SERVER_SOCKET を一時的に無効化（WSL2 固有の問題を回避） |
| `adb exec-out` | バイナリデータをそのまま受け取る（`shell` だと改行コード変換で画像が壊れる） |
| `screencap -p` | スマホ画面を PNG 形式でキャプチャ |
| `> screenshot.png` | ローカルファイルに保存 |

### 3-2. タイムスタンプ付きで保存

```bash
env -u ADB_SERVER_SOCKET adb exec-out screencap -p > "screenshot_$(date +%Y%m%d_%H%M%S).png"
```

> ファイル名例: `screenshot_20260302_143022.png`

### 3-3. プロジェクト内に保存（Issue/PR 添付用）

```bash
env -u ADB_SERVER_SOCKET adb exec-out screencap -p > docs/reference/Debug/screenshot_$(date +%Y%m%d_%H%M%S).png
```

> `docs/reference/Debug/` はクラッシュログの自動保存先としても使用されている。

---

## 4. 画面録画

### 4-1. 録画しながら表示

```bash
scrcpy --record=demo.mp4 --max-fps=30 --max-size=720
```

| オプション | 意味 |
|-----------|------|
| `--record=demo.mp4` | MP4 ファイルに録画。拡張子で形式が自動決定（.mp4 or .mkv） |
| `--max-fps=30` | 録画は 30fps で十分。ファイルサイズ節約 |
| `--max-size=720` | 720p で GitHub Issue 添付に十分な画質 |

Ctrl+C でscrcpy を終了すると録画ファイルが保存される。

### 4-2. バックグラウンド録画（表示なし）

```bash
scrcpy --no-playback --no-window --record=background.mp4
```

| オプション | 意味 |
|-----------|------|
| `--no-playback` | PC への画面表示をしない |
| `--no-window` | ウィンドウすら出さない |

Ctrl+C で停止。

### 4-3. 見るだけモード（操作しない）

```bash
scrcpy --no-control
```

> デモ中の誤操作防止に。マウス・キーボード入力がスマホに送られない。

---

## 5. その他の便利機能

### 5-1. スマホ画面 OFF で PC 操作のみ

```bash
scrcpy --turn-screen-off
```

> バッテリー消費を抑えつつ、PC 上でのみ操作可能。

### 5-2. 画面回転のロック

```bash
scrcpy --lock-video-orientation=0
```

> `0`=縦固定、`1`=左横、`2`=逆縦、`3`=右横

### 5-3. ワイヤレス接続（USB なし）

USB 接続した状態で:

```bash
scrcpy --tcpip
```

> scrcpy が自動的にスマホの IP を検出し、TCP/IP モードに切り替える。
> 完了後、USB ケーブルを抜いても動作する。
> ただし遅延は USB より大きくなる。

ワイヤレス時の推奨設定:

```bash
scrcpy --tcpip --video-bit-rate=4M --max-fps=30 --max-size=720
```

### 5-4. 複数デバイスの場合

```bash
scrcpy --serial=SX3LHMA362304722
```

> `--serial` でデバイスを指定。`adb devices` で確認したシリアル番号を使う。

---

## 6. scrcpy の更新手順

1. [GitHub Releases](https://github.com/Genymobile/scrcpy/releases) から最新の `scrcpy-win64-vX.Y.Z.zip` をダウンロード
2. `C:\Users\doooo\tools\scrcpy\` に上書き展開
3. 同梱の `adb.exe`, `AdbWinApi.dll`, `AdbWinUsbApi.dll` を削除
4. `scrcpy --version` で確認

> WSL2 ラッパーの書き換えは不要（パスにバージョン番号が含まれないため）。

---

## 7. トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| scrcpy 起動時に「adb が見つからない」 | PATH に adb.exe がない | Android SDK の platform-tools が PATH に含まれているか確認 |
| ミラーリング開始後 Metro 接続が切れる | ADB サーバーの再起動 | 同梱 adb.exe が残っていないか確認。削除済みなら問題なし |
| ウィンドウが真っ黒 | WSL2 内で Linux 版 scrcpy を起動している | WSL2 ラッパー経由で Windows 版 scrcpy.exe を呼んでいるか確認 |
| `scrcpy: command not found` | ラッパー未作成 or PATH に `~/.local/bin` がない | `which scrcpy` で確認 |
| スクリーンショットが 0 バイト | `exec-out` ではなく `shell` を使っている | `adb exec-out screencap -p` を使う |
| スクリーンショットの画像が壊れる | ADB_SERVER_SOCKET の影響 | `env -u ADB_SERVER_SOCKET adb exec-out screencap -p` を使う |

---

## 参考

- scrcpy GitHub: https://github.com/Genymobile/scrcpy
- scrcpy ショートカット一覧: https://github.com/Genymobile/scrcpy/blob/master/doc/shortcuts.md
- scrcpy 録画: https://github.com/Genymobile/scrcpy/blob/master/doc/recording.md
- ADB screencap: https://developer.android.com/tools/adb
