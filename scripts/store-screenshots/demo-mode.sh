#!/usr/bin/env bash
# ─── ADB Demo Mode 制御スクリプト ───────────────────────────────
#
# ステータスバーを「クリーンな状態」にする/元に戻す。
# Google が公式提供するステータスバー偽装機能。
#
# 使い方:
#   ./scripts/store-screenshots/demo-mode.sh on     # Demo Mode ON
#   ./scripts/store-screenshots/demo-mode.sh off    # Demo Mode OFF
#
# 前提: ADB が接続済みのデバイス/エミュレータがあること
# ────────────────────────────────────────────────────────────────

set -euo pipefail

# WSL2環境ではADB_SERVER_SOCKETをunsetする必要がある場合がある
ADB="${ADB:-adb}"

demo_on() {
  echo ">>> ステータスバーをクリーンアップ中..."

  # Demo Mode を許可
  $ADB shell settings put global sysui_demo_allowed 1

  # Demo Mode に入る
  $ADB shell am broadcast -a com.android.systemui.demo -e command enter

  # 時刻を 10:00 に固定
  $ADB shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1000

  # バッテリー 100%、非充電
  $ADB shell am broadcast -a com.android.systemui.demo -e command battery -e plugged false -e level 100

  # WiFi 最大強度
  $ADB shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4

  # モバイル通信 最大強度 + LTE
  $ADB shell am broadcast -a com.android.systemui.demo -e command network -e mobile show -e datatype lte -e level 4

  # 機内モードアイコン非表示
  $ADB shell am broadcast -a com.android.systemui.demo -e command network -e airplane hide

  # 通知を全て非表示
  $ADB shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false

  echo ">>> Demo Mode ON (10:00 / 100% / WiFi+LTE max / 通知なし)"
}

demo_off() {
  echo ">>> ステータスバーを元に戻し中..."
  $ADB shell am broadcast -a com.android.systemui.demo -e command exit
  echo ">>> Demo Mode OFF"
}

case "${1:-}" in
  on)  demo_on  ;;
  off) demo_off ;;
  *)
    echo "Usage: $0 {on|off}"
    exit 1
    ;;
esac
