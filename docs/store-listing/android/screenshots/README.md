# Store Screenshots Capture Guide

## Requirements (Google Play)
- Min 2, max 8 screenshots per device type
- Aspect ratio: 16:9 or 9:16
- Min dimension: 320px, Max dimension: 3840px per side
- Format: PNG or JPEG (no alpha)

## Target Device
- Pixel 8a (SX3LHMA362304722)
- Resolution: 1080 x 2400

## Capture Command (WSL2)
```bash
env -u ADB_SERVER_SOCKET adb exec-out screencap -p > <filename>.png
```

## Required Screenshots (minimum 5)

| # | Screen | Mode | Language | Filename |
|---|--------|------|----------|----------|
| 1 | Home (with reports) | Light | JA | `01_home_light_ja.png` |
| 2 | Report Editor (filled) | Light | JA | `02_editor_light_ja.png` |
| 3 | PDF Preview (Standard) | Light | JA | `03_pdf_preview_light_ja.png` |
| 4 | Settings (theme section) | Light | JA | `04_settings_light_ja.png` |
| 5 | Home (dark mode) | Dark | JA | `05_home_dark_ja.png` |
| 6 | Home (with reports) | Light | EN | `06_home_light_en.png` |

## Capture Procedure

1. Install latest preview APK on device
2. Create 2-3 sample reports with photos, weather, location, comments
3. For each screenshot:
   - Navigate to the target screen
   - Run the screencap command
   - Verify the captured image
4. Repeat for Dark mode (Settings > Theme > Dark)
5. Repeat for English (Settings > Language > English)

## Notes
- Ensure status bar shows realistic time/battery
- Hide any notification bar items that might distract
- Use sample data that looks professional (construction/inspection context)
