#!/bin/bash
# =============================================================================
# debug_session.sh
# =============================================================================
# 役割: デバッグセッションの一括管理。
#       start → 操作 → stop の流れで、ログ・画像・動画・メモリ情報を
#       1つのセッションフォルダに自動収集する。
#
# 使い方:
#   bash scripts/debug_session.sh start        # セッション開始
#   bash scripts/debug_session.sh stop         # セッション終了・収集
#   bash scripts/debug_session.sh status       # 稼働状態の確認
#   bash scripts/debug_session.sh start --no-record  # 録画なしで開始
#
# 前提条件:
#   - adb が PATH に通っていること（WSL2 ラッパーでOK）
#   - スマホがUSB接続され、USBデバッグが許可されていること
#
# セッション成果物（stop 時に自動生成）:
#   docs/reference/Debug/session_YYYYMMDD_HHMMSS/
#   ├── before.png       操作前スクリーンショット
#   ├── after.png        操作後スクリーンショット
#   ├── logcat.log       セッション中の全ログ
#   ├── recording.mp4    画面録画（--no-record 時は省略）
#   ├── meminfo.txt      メモリ使用量
#   └── summary.md       セッション概要（Claude Code 分析用）
# =============================================================================

set -uo pipefail

# --- 定数 -------------------------------------------------------------------
PACKAGE="com.dooooraku.repolog"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEBUG_DIR="$PROJECT_ROOT/docs/reference/Debug"
SESSION_FILE="/tmp/repolog_debug_session"
DEVICE_RECORDING_PATH="/sdcard/repolog_debug_recording.mp4"

# --- 色定義 -----------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

# --- 共通: デバイスチェック ---------------------------------------------------
check_device() {
  if ! command -v adb &>/dev/null; then
    error "adb が見つかりません"
    exit 1
  fi

  local status
  status=$(adb devices 2>/dev/null | grep -v "List" | grep -v "^$" | head -1)
  if [ -z "$status" ]; then
    error "デバイスが接続されていません"
    exit 1
  fi
  if echo "$status" | grep -q "unauthorized"; then
    error "USBデバッグが許可されていません"
    exit 1
  fi
  echo "$status" | awk '{print $1}'
}

# --- 共通: スクリーンショット -------------------------------------------------
take_screenshot() {
  local output_path="$1"
  env -u ADB_SERVER_SOCKET adb exec-out screencap -p > "$output_path" 2>/dev/null
  if [ -s "$output_path" ]; then
    info "スクリーンショット: $output_path"
  else
    warn "スクリーンショット取得失敗: $output_path"
    rm -f "$output_path"
  fi
}

# =============================================================================
# start: セッション開始
# =============================================================================
cmd_start() {
  local do_record=true
  for arg in "$@"; do
    case "$arg" in
      --no-record) do_record=false ;;
    esac
  done

  # 既存セッションのチェック
  if [ -f "$SESSION_FILE" ]; then
    warn "既にセッションが実行中です"
    cat "$SESSION_FILE"
    echo ""
    warn "先に stop するか、不要なら $SESSION_FILE を削除してください"
    exit 1
  fi

  local device_id
  device_id=$(check_device)

  # セッションフォルダ作成
  local timestamp
  timestamp=$(date +%Y%m%d_%H%M%S)
  local session_dir="$DEBUG_DIR/session_${timestamp}"
  mkdir -p "$session_dir"

  info "セッション開始: session_${timestamp}"
  info "デバイス: $device_id"
  info "保存先: $session_dir/"

  # ログバッファクリア
  adb logcat -c 2>/dev/null || true

  # 初期スクリーンショット
  take_screenshot "$session_dir/before.png"

  # logcat バックグラウンド開始
  env -u ADB_SERVER_SOCKET adb logcat -v threadtime > "$session_dir/logcat.log" 2>/dev/null &
  local logcat_pid=$!
  info "logcat 開始 (PID: $logcat_pid)"

  # 画面録画バックグラウンド開始
  local record_pid=""
  if [ "$do_record" = true ]; then
    adb shell screenrecord --time-limit 180 "$DEVICE_RECORDING_PATH" &
    record_pid=$!
    info "画面録画 開始 (PID: $record_pid, 上限: 3分)"
  else
    info "画面録画: スキップ (--no-record)"
  fi

  # アプリの PID を記録
  local app_pid
  app_pid=$(adb shell pidof -s "$PACKAGE" 2>/dev/null || echo "")

  # セッション情報をファイルに保存
  cat > "$SESSION_FILE" <<EOF
SESSION_DIR="$session_dir"
SESSION_TIMESTAMP="$timestamp"
DEVICE_ID="$device_id"
LOGCAT_PID="$logcat_pid"
RECORD_PID="${record_pid:-}"
APP_PID="${app_pid:-unknown}"
DO_RECORD="$do_record"
START_TIME="$(date +%s)"
START_TIME_HUMAN="$(date '+%Y-%m-%d %H:%M:%S')"
EOF

  echo ""
  echo -e "${BOLD}=============================================${NC}"
  echo -e "${BOLD}  Repolog デバッグセッション${NC}"
  echo -e "${BOLD}=============================================${NC}"
  echo -e "  セッション: session_${timestamp}"
  echo -e "  デバイス:   $device_id"
  echo -e "  アプリPID:  ${app_pid:-未起動}"
  echo -e "  logcat:     稼働中 (PID: $logcat_pid)"
  if [ "$do_record" = true ]; then
    echo -e "  画面録画:   稼働中 (上限3分)"
  else
    echo -e "  画面録画:   OFF"
  fi
  echo -e "  保存先:     $session_dir/"
  echo -e "${BOLD}=============================================${NC}"
  echo ""
  echo -e "${CYAN}  アプリを操作してください。${NC}"
  echo -e "${CYAN}  終わったら: bash scripts/debug_session.sh stop${NC}"
  echo ""
}

# =============================================================================
# stop: セッション終了・成果物収集
# =============================================================================
cmd_stop() {
  if [ ! -f "$SESSION_FILE" ]; then
    error "実行中のセッションがありません"
    exit 1
  fi

  # セッション情報を読み込む
  # shellcheck disable=SC1090
  source "$SESSION_FILE"

  local device_id
  device_id=$(check_device 2>/dev/null || echo "disconnected")

  info "セッション停止: session_${SESSION_TIMESTAMP}"

  # logcat 停止
  if kill -0 "$LOGCAT_PID" 2>/dev/null; then
    kill "$LOGCAT_PID" 2>/dev/null || true
    wait "$LOGCAT_PID" 2>/dev/null || true
    info "logcat 停止"
  else
    warn "logcat は既に停止していました"
  fi

  # 画面録画 停止
  if [ "$DO_RECORD" = true ] && [ -n "${RECORD_PID:-}" ]; then
    if kill -0 "$RECORD_PID" 2>/dev/null; then
      kill "$RECORD_PID" 2>/dev/null || true
      wait "$RECORD_PID" 2>/dev/null || true
    fi
    # デバイス上の録画プロセスも停止
    adb shell pkill -2 screenrecord 2>/dev/null || true
    sleep 2

    # 録画ファイルをデバイスからPCに転送
    if adb shell ls "$DEVICE_RECORDING_PATH" &>/dev/null; then
      adb pull "$DEVICE_RECORDING_PATH" "$SESSION_DIR/recording.mp4" 2>/dev/null
      adb shell rm -f "$DEVICE_RECORDING_PATH" 2>/dev/null || true
      info "画面録画 取得完了: recording.mp4"
    else
      warn "画面録画ファイルが見つかりません（録画時間が短すぎた可能性）"
    fi
  fi

  # 最終スクリーンショット
  if [ "$device_id" != "disconnected" ]; then
    take_screenshot "$SESSION_DIR/after.png"

    # メモリ情報取得
    adb shell dumpsys meminfo "$PACKAGE" > "$SESSION_DIR/meminfo.txt" 2>/dev/null || true
    info "メモリ情報: meminfo.txt"
  fi

  # ログの行数をカウント
  local log_lines=0
  local error_lines=0
  if [ -f "$SESSION_DIR/logcat.log" ]; then
    log_lines=$(wc -l < "$SESSION_DIR/logcat.log")
    error_lines=$(grep -ci "error\|exception\|fatal\|crash" "$SESSION_DIR/logcat.log" || echo "0")
  fi

  # セッション経過時間
  local end_time
  end_time=$(date +%s)
  local duration=$(( end_time - START_TIME ))
  local duration_min=$(( duration / 60 ))
  local duration_sec=$(( duration % 60 ))

  # サマリーファイル作成
  cat > "$SESSION_DIR/summary.md" <<SUMMARY
# デバッグセッション: session_${SESSION_TIMESTAMP}

## 概要
| 項目 | 値 |
|------|-----|
| 開始時刻 | ${START_TIME_HUMAN} |
| 終了時刻 | $(date '+%Y-%m-%d %H:%M:%S') |
| 所要時間 | ${duration_min}分${duration_sec}秒 |
| デバイス | ${DEVICE_ID} |
| アプリPID | ${APP_PID} |

## 成果物
| ファイル | 説明 |
|---------|------|
| before.png | 操作前スクリーンショット |
| after.png | 操作後スクリーンショット |
| logcat.log | 全ログ (${log_lines} 行) |
| recording.mp4 | 画面録画 |
| meminfo.txt | メモリ使用量 |

## ログ概要
- 総行数: ${log_lines}
- エラー関連行: ${error_lines}

## エラー行の抽出（先頭20件）
\`\`\`
$(grep -i "error\|exception\|fatal\|crash" "$SESSION_DIR/logcat.log" 2>/dev/null | head -20 || echo "(なし)")
\`\`\`
SUMMARY

  info "サマリー: summary.md"

  # セッションファイル削除
  rm -f "$SESSION_FILE"

  echo ""
  echo -e "${BOLD}=============================================${NC}"
  echo -e "${BOLD}  セッション完了${NC}"
  echo -e "${BOLD}=============================================${NC}"
  echo -e "  所要時間:   ${duration_min}分${duration_sec}秒"
  echo -e "  ログ行数:   ${log_lines}"
  echo -e "  エラー行:   ${error_lines}"
  echo -e "  保存先:     $SESSION_DIR/"
  echo -e "${BOLD}=============================================${NC}"
  echo ""
  echo -e "${CYAN}  成果物一覧:${NC}"
  ls -lh "$SESSION_DIR/" 2>/dev/null | tail -n +2
  echo ""
}

# =============================================================================
# status: セッション状態の確認
# =============================================================================
cmd_status() {
  if [ ! -f "$SESSION_FILE" ]; then
    info "実行中のセッションはありません"
    exit 0
  fi

  # shellcheck disable=SC1090
  source "$SESSION_FILE"

  local now
  now=$(date +%s)
  local elapsed=$(( now - START_TIME ))
  local elapsed_min=$(( elapsed / 60 ))
  local elapsed_sec=$(( elapsed % 60 ))

  local logcat_status="停止"
  if kill -0 "$LOGCAT_PID" 2>/dev/null; then
    logcat_status="稼働中"
  fi

  local record_status="OFF"
  if [ "$DO_RECORD" = true ] && [ -n "${RECORD_PID:-}" ]; then
    if kill -0 "$RECORD_PID" 2>/dev/null; then
      record_status="稼働中"
    else
      record_status="停止（3分経過 or 終了）"
    fi
  fi

  local log_lines=0
  if [ -f "$SESSION_DIR/logcat.log" ]; then
    log_lines=$(wc -l < "$SESSION_DIR/logcat.log")
  fi

  echo ""
  echo -e "${BOLD}  デバッグセッション状態${NC}"
  echo -e "  セッション: session_${SESSION_TIMESTAMP}"
  echo -e "  経過時間:   ${elapsed_min}分${elapsed_sec}秒"
  echo -e "  logcat:     ${logcat_status} (${log_lines} 行)"
  echo -e "  画面録画:   ${record_status}"
  echo -e "  保存先:     $SESSION_DIR/"
  echo ""
}

# =============================================================================
# ヘルプ
# =============================================================================
cmd_help() {
  echo "使い方: $0 <command> [options]"
  echo ""
  echo "コマンド:"
  echo "  start [--no-record]  セッション開始（ログ収集・録画開始）"
  echo "  stop                 セッション終了（成果物を収集・保存）"
  echo "  status               セッションの稼働状態を表示"
  echo "  help                 このヘルプを表示"
  echo ""
  echo "典型的な使い方:"
  echo "  1. bash scripts/debug_session.sh start"
  echo "  2. （アプリを操作する）"
  echo "  3. bash scripts/debug_session.sh stop"
  echo "  4. docs/reference/Debug/session_*/ を確認"
}

# =============================================================================
# メイン
# =============================================================================
case "${1:-help}" in
  start)  shift; cmd_start "$@" ;;
  stop)   cmd_stop ;;
  status) cmd_status ;;
  help|--help|-h) cmd_help ;;
  *)
    error "不明なコマンド: $1"
    cmd_help
    exit 1
    ;;
esac
