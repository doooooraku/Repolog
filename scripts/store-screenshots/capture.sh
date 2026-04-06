#!/usr/bin/env bash
# ─── Google Play スクリーンショット撮影スクリプト ─────────────────
#
# Maestro を使って Store 用スクリーンショットを自動撮影する。
#
# 使い方 (日本語パイロット):
#   ./scripts/store-screenshots/capture.sh ja
#
# 使い方 (全言語):
#   ./scripts/store-screenshots/capture.sh
#
# 前提条件:
#   1. SCREENSHOT_MODE=1 でビルドした APK がインストール済み
#   2. 該当言語のバックアップデータがアプリにインポート済み
#   3. ADB が接続済み
#   4. Maestro がインストール済み (maestro --version で確認)
# ────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/screenshots/raw"
FLOW_FILE="$PROJECT_ROOT/maestro/flows/store-screenshots.yaml"

# WSL2環境ではADB_SERVER_SOCKETをunsetする必要がある場合がある
ADB="${ADB:-adb}"

# 引数チェック
TARGET_LOCALE="${1:-}"

if [ -n "$TARGET_LOCALE" ]; then
  LOCALES=("$TARGET_LOCALE")
  echo "=== Store Screenshot Capture (single locale: $TARGET_LOCALE) ==="
else
  LOCALES=(
    "en" "ja" "fr" "es" "de" "it" "pt" "ru"
    "zh-Hans" "zh-Hant" "ko" "hi" "id" "th" "vi" "tr" "nl" "pl" "sv"
  )
  echo "=== Store Screenshot Capture (all ${#LOCALES[@]} locales) ==="
fi

echo ""

# Demo Mode ON
echo "--- Setting up ADB Demo Mode ---"
"$SCRIPT_DIR/demo-mode.sh" on
echo ""

# 撮影ループ
for locale in "${LOCALES[@]}"; do
  echo "========================================="
  echo "  Capturing: $locale"
  echo "========================================="

  # 出力ディレクトリを作成
  locale_output="$OUTPUT_DIR/$locale"
  mkdir -p "$locale_output"

  # Maestro でスクリーンショット撮影
  # --test-output-dir: スクショの保存先
  maestro test \
    --test-output-dir="$locale_output" \
    "$FLOW_FILE" \
    || echo "  WARNING: Maestro flow failed for $locale"

  echo "  Done: $locale"
  echo ""
done

# Demo Mode OFF
echo "--- Restoring ADB Demo Mode ---"
"$SCRIPT_DIR/demo-mode.sh" off
echo ""

# 結果表示
total=$(find "$OUTPUT_DIR" -name "*.png" 2>/dev/null | wc -l || echo "0")
echo "=== Complete ==="
echo "  Screenshots saved to: $OUTPUT_DIR"
echo "  Total files: $total"
