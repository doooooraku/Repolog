#!/usr/bin/env bash
# 残り17言語のスクリーンショットを一括撮影するスクリプト
set -euo pipefail

export PATH="$HOME/.nvm/versions/node/v22.21.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.maestro/bin:$HOME/.android/sdk/platform-tools"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ADB="env -u ADB_SERVER_SOCKET adb"
INJECT_SCRIPT="$SCRIPT_DIR/inject-locale.mjs"
FLOW="$PROJECT_ROOT/maestro/flows/store-screenshots.yaml"
RAW_DIR="$PROJECT_ROOT/screenshots/raw"

LOCALES=(fr es de it pt ru zh-Hans zh-Hant ko hi id th vi tr nl pl sv)

echo "=== Capturing ${#LOCALES[@]} languages ==="
echo ""

# ベースDBをプル（1回だけ）
$ADB shell am force-stop com.dooooraku.repolog
$ADB exec-out run-as com.dooooraku.repolog cat files/SQLite/repolog.db > /tmp/repolog_base.db
$ADB exec-out run-as com.dooooraku.repolog cat databases/RKStorage > /tmp/RKStorage_base.db
echo "Base DBs pulled"

SUCCESS=0
FAIL=0

for locale in "${LOCALES[@]}"; do
  echo ""
  echo "========================================="
  echo "  [$((SUCCESS + FAIL + 1))/${#LOCALES[@]}] Processing: $locale"
  echo "========================================="

  # 1. データ注入
  node "$INJECT_SCRIPT" "$locale" || { echo "SKIP: inject failed for $locale"; FAIL=$((FAIL+1)); continue; }

  # 2. アプリ停止 & DB差し替え
  $ADB shell am force-stop com.dooooraku.repolog
  $ADB push /tmp/repolog_out.db /data/local/tmp/repolog.db >/dev/null
  $ADB shell run-as com.dooooraku.repolog cp /data/local/tmp/repolog.db files/SQLite/repolog.db
  $ADB push /tmp/RKStorage_out.db /data/local/tmp/RKStorage.db >/dev/null
  $ADB shell run-as com.dooooraku.repolog cp /data/local/tmp/RKStorage.db databases/RKStorage

  # 3. Demo Mode ON
  $ADB shell am broadcast -a com.android.systemui.demo -e command enter >/dev/null
  $ADB shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1000 >/dev/null
  $ADB shell am broadcast -a com.android.systemui.demo -e command battery -e plugged false -e level 100 >/dev/null
  $ADB shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4 >/dev/null
  $ADB shell am broadcast -a com.android.systemui.demo -e command network -e mobile show -e datatype lte -e level 4 >/dev/null
  $ADB shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false >/dev/null

  # 4. アプリ起動（deeplink経由でMetroに接続）
  $ADB shell am start -a android.intent.action.VIEW \
    -d "exp+repolog://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" \
    com.dooooraku.repolog >/dev/null 2>&1
  /usr/bin/sleep 12

  # 5. Maestro撮影
  locale_dir="$RAW_DIR/$locale"
  /usr/bin/rm -rf "$locale_dir"
  /usr/bin/mkdir -p "$locale_dir"

  if env -u ADB_SERVER_SOCKET maestro test \
    --test-output-dir="$locale_dir" \
    "$FLOW" >/dev/null 2>&1; then

    # スクショを正しい位置に移動
    if [ -d "$locale_dir/screenshots" ]; then
      /usr/bin/mv "$locale_dir/screenshots/"*.png "$locale_dir/" 2>/dev/null || true
    fi
    SUCCESS=$((SUCCESS+1))
    echo "  ✅ $locale done"
  else
    FAIL=$((FAIL+1))
    echo "  ❌ $locale FAILED"
  fi
done

# Demo Mode OFF
$ADB shell am broadcast -a com.android.systemui.demo -e command exit >/dev/null 2>&1

echo ""
echo "========================================="
echo "  Complete: $SUCCESS success, $FAIL failed"
echo "  Total screenshots: $(find "$RAW_DIR" -maxdepth 2 -name '*.png' -not -path '*/2026-*' | wc -l)"
echo "========================================="
