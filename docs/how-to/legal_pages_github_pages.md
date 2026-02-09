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
- `docs/index.html` (root redirect)

## 4. Configure GitHub Pages once

Run this command:

```bash
gh api -X POST \
  -H "Accept: application/vnd.github+json" \
  /repos/doooooraku/Repolog/pages \
  -f source[branch]=gh-pages \
  -f source[path]=/
```

If Pages is already configured, update with:

```bash
gh api -X PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/doooooraku/Repolog/pages \
  -f source[branch]=gh-pages \
  -f source[path]=/
```

## 5. Sync legal files to `gh-pages`

`gh-pages` should contain only static legal pages so Jekyll does not parse the whole `docs/` tree.

```bash
git worktree add /tmp/repolog-gh-pages gh-pages
mkdir -p /tmp/repolog-gh-pages/privacy /tmp/repolog-gh-pages/terms
cp docs/index.html /tmp/repolog-gh-pages/index.html
cp docs/privacy/index.html /tmp/repolog-gh-pages/privacy/index.html
cp docs/terms/index.html /tmp/repolog-gh-pages/terms/index.html
git -C /tmp/repolog-gh-pages add .
git -C /tmp/repolog-gh-pages commit -m "docs: sync legal pages"
git -C /tmp/repolog-gh-pages push origin gh-pages
```

## 6. App config linkage

Legal URLs are read from `app.config.ts` via Expo `extra`:

- `LEGAL_PRIVACY_URL`
- `LEGAL_TERMS_URL`

Defaults point to the URLs in section 2.

## 7. Optional override for staging

You can override URLs with env vars:

```bash
LEGAL_PRIVACY_URL=https://example.com/privacy \
LEGAL_TERMS_URL=https://example.com/terms \
pnpm start
```

## 8. Review checklist

- `https://doooooraku.github.io/Repolog/privacy/` returns HTTP 200
- `https://doooooraku.github.io/Repolog/terms/` returns HTTP 200
- Settings screen opens both links
- App Store Connect Privacy Policy URL is set
- Google Play Data safety URL is set
