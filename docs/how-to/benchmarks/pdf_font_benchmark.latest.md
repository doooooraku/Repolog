# PDF Font Benchmark (Issue #72)

- Benchmarked at (UTC): 2026-02-10T09:11:44.784Z
- Node: v18.20.8
- Platform: linux/x64
- Iterations per scenario: 7
- Sample image: `assets/images/icon.png`
- Sample image raw bytes: 393493
- Sample image data URI bytes: 524682

## Summary

| Scenario | Strategy | Fonts | Font payload (MB, base64) | Estimated PDF input (MB) | Cold total (ms) | Warm median (ms) |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Short text / low photo count | all_fonts | 7 | 66.93 | 68.93 | 91.37 | 32.78 |
| Short text / low photo count | script_subset | 1 | 2.61 | 4.61 | 3.56 | 1.03 |
| Photo heavy / same language | all_fonts | 7 | 66.93 | 106.96 | 61.30 | 33.16 |
| Photo heavy / same language | script_subset | 1 | 2.61 | 42.64 | 3.10 | 1.19 |
| Multilingual scripts / medium photo count | all_fonts | 7 | 66.93 | 72.94 | 61.24 | 31.64 |
| Multilingual scripts / medium photo count | script_subset | 5 | 29.14 | 35.15 | 29.52 | 14.34 |

## Delta (script_subset vs all_fonts)

| Scenario | Font payload reduction | Estimated input reduction | Warm median speedup |
| --- | ---: | ---: | ---: |
| Short text / low photo count | 96.1% | 93.3% | 96.8% |
| Photo heavy / same language | 96.1% | 60.1% | 96.4% |
| Multilingual scripts / medium photo count | 56.5% | 51.8% | 54.7% |

## Notes

- This benchmark measures the font embedding path and estimated PDF input size.
- Estimated size uses one fixed sample image payload for repeatability.
- Real device PDF size/time still depends on actual photo content and native print engine behavior.
