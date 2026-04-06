# Repolog

Photo report PDF maker for field workers. Snap, comment, export — local-first, no account needed.

## Tech Stack

- **Framework**: Expo SDK 54 / React Native 0.81 (New Architecture)
- **UI**: Tamagui
- **State**: Zustand + React Query
- **Storage**: SQLite (reports) / AsyncStorage (settings) / SecureStore (sensitive)
- **Monetization**: RevenueCat (subscriptions) + AdMob (Free tier banner)
- **i18n**: 19 languages (LTR only)
- **CI/CD**: GitHub Actions (lint, test, type-check, i18n, config validation)

## Quick Start

```bash
pnpm install
npx expo prebuild
pnpm dev
```

See [docs/how-to/quickstart.md](docs/how-to/quickstart.md) for full setup guide.

## Documentation

All project documentation lives in [`docs/`](docs/README.md):

| Category | Path | Content |
|----------|------|---------|
| Why | `docs/explanation/` | Product strategy, value proposition |
| What | `docs/reference/` | Specs, constraints, glossary, PDF template |
| How | `docs/how-to/` | Build, release, test, i18n procedures |
| Decisions | `docs/adr/` | Architecture Decision Records (ADR-0001 ~ 0010) |
| Store | `docs/store-listing/` | Google Play / App Store listing assets |
| Reports | `docs/reports/` | Auto-generated audit & benchmark results |

## Project Structure

```
app/           Expo Router screens
src/
  features/    Feature modules
  stores/      Zustand stores
  core/        Shared logic
  services/    External I/O (PDF, backup, ads)
  db/          SQLite schema & queries
  ui/          Shared UI components
scripts/       Build, debug, i18n tools
maestro/       E2E test flows
```

### Rules of Conduct When Context Gets Tight (If You Start Panicking, Stop)

* Do not write code without reading the code first.
* Do not skip verification.
* Do not skip Plan mode.
* Use sub-agents to save context.
* If you can only finish halfway, stop.
* If you notice yourself getting flustered, say so explicitly.


## License

Proprietary. All rights reserved.
