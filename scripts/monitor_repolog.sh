#!/bin/bash
# =============================================================================
# monitor_repolog.sh
# =============================================================================
# 役割: Repologアプリのクラッシュ・エラーをリアルタイム監視し、
#       異常検出時に自動でログファイルを保存するスクリプト
#
# 使い方:
#   bash scripts/monitor_repolog.sh          # 通常の監視（クラッシュ+エラー）
#   bash scripts/monitor_repolog.sh --all    # 全ログを表示（verbose）
#   bash scripts/monitor_repolog.sh --crash  # クラッシュログのみ
#
# 前提条件:
#   - adb が PATH に通っていること（WSL2からWindows ADB経由でOK）
#   - スマホがUSB接続され、USBデバッグが許可されていること
#   - adb devices で "device" と表示されること（"unauthorized" はNG）
#
# 停止方法: Ctrl+C
# =============================================================================

set -euo pipefail

# --- 設定 -------------------------------------------------------------------
# PACKAGE: 監視対象のAndroidアプリのパッケージ名
PACKAGE="com.dooooraku.repolog"

# LOG_DIR: クラッシュログの保存先ディレクトリ
# $(dirname "$0") = このスクリプトが置かれているフォルダ
# /../docs/reference/Debug = プロジェクトのdocs配下に保存
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/docs/reference/Debug"

# --- ヘルパー関数 -----------------------------------------------------------

# 色付き出力用の定数
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color（色リセット）

# info: 情報メッセージを表示（緑色）
info() {
  echo -e "${GREEN}[INFO]${NC} $*"
}

# warn: 警告メッセージを表示（黄色）
warn() {
  echo -e "${YELLOW}[WARN]${NC} $*"
}

# error: エラーメッセージを表示（赤色）
error() {
  echo -e "${RED}[ERROR]${NC} $*"
}

# --- 前提条件チェック -------------------------------------------------------

# adb コマンドが使えるかチェック
if ! command -v adb &>/dev/null; then
  error "adb が見つかりません"
  echo "  Windows側: winget install Google.PlatformTools"
  echo "  WSL2側:     echo 'export PATH=\$PATH:/mnt/c/platform-tools' >> ~/.bashrc"
  exit 1
fi

# デバイスが接続されているかチェック
DEVICE_STATUS=$(adb devices 2>/dev/null | grep -v "List" | grep -v "^$" | head -1)
if [ -z "$DEVICE_STATUS" ]; then
  error "Androidデバイスが接続されていません"
  echo "  1. USBケーブルでスマホを接続してください"
  echo "  2. スマホの「開発者向けオプション」→「USBデバッグ」をONにしてください"
  echo "  3. 「USBデバッグを許可しますか？」で「許可」をタップしてください"
  exit 1
fi

if echo "$DEVICE_STATUS" | grep -q "unauthorized"; then
  error "USBデバッグが許可されていません"
  echo "  スマホの画面に「USBデバッグを許可しますか？」と表示されているはずです"
  echo "  「許可」をタップしてください"
  exit 1
fi

DEVICE_ID=$(echo "$DEVICE_STATUS" | awk '{print $1}')
info "デバイス検出: $DEVICE_ID"

# --- モード選択 -------------------------------------------------------------

MODE="monitor"  # デフォルト: 監視モード（クラッシュ・エラーをキャプチャ）

case "${1:-}" in
  --all)
    MODE="all"
    info "モード: 全ログ表示"
    ;;
  --crash)
    MODE="crash"
    info "モード: クラッシュログのみ"
    ;;
  --help|-h)
    echo "使い方: $0 [--all|--crash|--help]"
    echo ""
    echo "  (引数なし)  クラッシュ・エラー監視モード（推奨）"
    echo "  --all       全ログ表示（verbose、大量のログが流れます）"
    echo "  --crash     クラッシュバッファのみ表示"
    echo "  --help      このヘルプを表示"
    exit 0
    ;;
esac

# --- ログ保存ディレクトリ作成 -----------------------------------------------

mkdir -p "$LOG_DIR"

# --- メイン処理 -------------------------------------------------------------

# Ctrl+C で終了する際のクリーンアップ
cleanup() {
  echo ""
  info "監視を終了しました"
  info "保存済みログ: $LOG_DIR/"
  exit 0
}
trap cleanup INT TERM

echo ""
echo "=============================================="
echo "  Repolog クラッシュ監視"
echo "=============================================="
echo "  パッケージ: $PACKAGE"
echo "  デバイス:   $DEVICE_ID"
echo "  ログ保存先: $LOG_DIR/"
echo "  停止: Ctrl+C"
echo "=============================================="
echo ""

case "$MODE" in
  all)
    # 全ログ: Repologのプロセスに絞って全レベル表示
    # --pid= でRepologプロセスのログだけに絞る
    APP_PID=$(adb shell pidof -s "$PACKAGE" 2>/dev/null || echo "")
    if [ -n "$APP_PID" ]; then
      info "Repolog PID: $APP_PID"
      adb logcat --pid="$APP_PID" -v threadtime
    else
      warn "Repologが起動していません。全ログから $PACKAGE をフィルタします"
      adb logcat -v threadtime | grep --line-buffered -i "$PACKAGE"
    fi
    ;;

  crash)
    # クラッシュバッファのみ表示
    # -b crash = クラッシュ専用バッファ
    # -v threadtime = 日時・スレッド情報付き
    info "クラッシュバッファを監視中..."
    adb logcat -b crash -v threadtime
    ;;

  monitor)
    # 監視モード: クラッシュを検出して自動保存
    info "クラッシュ・エラー監視を開始..."

    # ログバッファをクリア（古いログを除外）
    adb logcat -c 2>/dev/null || true

    CRASH_COUNT=0

    # crash + main バッファを監視
    adb logcat -b crash,main -v threadtime 2>/dev/null | while IFS= read -r line; do
      # Repologに関連するログ行かチェック
      if echo "$line" | grep -qi "$PACKAGE"; then
        # クラッシュ・エラーのキーワードを含むかチェック
        if echo "$line" | grep -qi "FATAL\|Exception\|Error\|ANR\|CRASH\|died\|killed"; then
          CRASH_COUNT=$((CRASH_COUNT + 1))
          TIMESTAMP=$(date +%Y%m%d_%H%M%S)

          echo ""
          echo -e "${RED}!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}"
          echo -e "${RED}  クラッシュ/エラー検出 #${CRASH_COUNT}${NC}"
          echo -e "${RED}  時刻: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
          echo -e "${RED}!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}"
          echo ""
          echo "$line"
          echo ""

          # クラッシュ行を専用ファイルに保存
          echo "=== Crash #${CRASH_COUNT} at $TIMESTAMP ===" >> "$LOG_DIR/crash_${TIMESTAMP}.log"
          echo "$line" >> "$LOG_DIR/crash_${TIMESTAMP}.log"

          # 現在のログバッファ全体をダンプ保存（クラッシュ前後の文脈がわかる）
          adb logcat -d -v threadtime > "$LOG_DIR/full_${TIMESTAMP}.log" 2>/dev/null

          info "ログ保存完了:"
          info "  クラッシュ: $LOG_DIR/crash_${TIMESTAMP}.log"
          info "  全体ログ: $LOG_DIR/full_${TIMESTAMP}.log"
          echo ""
        fi
      fi
    done
    ;;
esac
