# docs/how-to/legal_pages_github_pages.md

# Legal Pages on GitHub Pages (Privacy / Terms)

This document explains how Repolog publishes legal pages for store review.

## 1. Why this exists

- App Store / Google Play review needs a reachable Privacy Policy URL.
- Repolog also exposes Terms of Use for legal clarity.
- We host both on GitHub Pages to avoid extra domain cost in Phase 1.

## 2. Published URLs (Phase 1)

- Privacy Policy: `https://doooooraku.github.io/Repolog/privacy/`
- Terms of Use: `https://doooooraku.github.io/Repolog/terms/`

## 3. Source files

- `docs/privacy/index.html`
- `docs/terms/index.html`

## 4. Configure GitHub Pages once

Run this command:

```bash
gh api -X POST \
  -H "Accept: application/vnd.github+json" \
  /repos/doooooraku/Repolog/pages \
  -f source[branch]=main \
  -f source[path]=/docs
```

If Pages is already configured, update with:

```bash
gh api -X PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/doooooraku/Repolog/pages \
  -f source[branch]=main \
  -f source[path]=/docs
```

## 5. App config linkage

Legal URLs are read from `app.config.ts` via Expo `extra`:

- `LEGAL_PRIVACY_URL`
- `LEGAL_TERMS_URL`

Defaults point to the URLs in section 2.

## 6. Optional override for staging

You can override URLs with env vars:

```bash
LEGAL_PRIVACY_URL=https://example.com/privacy \
LEGAL_TERMS_URL=https://example.com/terms \
pnpm start
```

## 7. Review checklist

- `https://doooooraku.github.io/Repolog/privacy/` returns HTTP 200
- `https://doooooraku.github.io/Repolog/terms/` returns HTTP 200
- Settings screen opens both links
- App Store Connect Privacy Policy URL is set
- Google Play Data safety URL is set
