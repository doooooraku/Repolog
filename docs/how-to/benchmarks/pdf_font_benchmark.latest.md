# PDF Font Benchmark (Issue #72 / #101)

- Benchmarked at (UTC): 2026-02-15T06:21:49.891Z
- Node: v20.19.6
- Platform: linux/x64
- Iterations per scenario: 7
- Sample image: `assets/images/icon.png`
- Sample image raw bytes: 393493
- Sample image data URI bytes: 524682

## Summary

| Scenario | Strategy | Fonts | Font payload (MB, base64) | Estimated PDF input (MB) | Cold total (ms) | Warm median (ms) |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Short text / low photo count | all_fonts | 7 | 66.93 | 68.93 | 83.94 | 33.19 |
| Short text / low photo count | script_subset | 1 | 2.61 | 4.61 | 6.19 | 1.14 |
| Photo heavy / same language | all_fonts | 7 | 66.93 | 106.96 | 63.35 | 32.31 |
| Photo heavy / same language | script_subset | 1 | 2.61 | 42.64 | 4.77 | 1.12 |
| Multilingual scripts / medium photo count | all_fonts | 7 | 66.93 | 72.94 | 64.62 | 32.69 |
| Multilingual scripts / medium photo count | script_subset | 5 | 29.14 | 35.15 | 29.53 | 14.76 |

## Delta (script_subset vs all_fonts)

| Scenario | Font payload reduction | Estimated input reduction | Warm median speedup |
| --- | ---: | ---: | ---: |
| Short text / low photo count | 96.1% | 93.3% | 96.6% |
| Photo heavy / same language | 96.1% | 60.1% | 96.5% |
| Multilingual scripts / medium photo count | 56.5% | 51.8% | 54.9% |

## Notes

- This benchmark measures the font embedding path and estimated PDF input size.
- Estimated size uses one fixed sample image payload for repeatability.
- Real device PDF size/time still depends on actual photo content and native print engine behavior.
