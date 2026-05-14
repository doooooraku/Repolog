#!/usr/bin/env node
/**
 * Post-build verification script.
 *
 * For APK / AAB / IPA build artifacts, this script:
 *   1. Verifies required API keys are embedded in assets/app.config (not empty).
 *   2. Greps the JS bundle for forbidden marker strings that should NOT exist
 *      in the latest build (canary against shipping stale code).
 *   3. (Android only, with --stamp-sha) renames the artifact to include the
 *      current short git SHA so the build artifact is traceable to a commit.
 *
 * Exits with code 1 if any check fails so CI / build scripts can catch it.
 *
 * Usage:
 *   node scripts/postbuild-verify.mjs <path-to-apk-aab-or-ipa> [--stamp-sha]
 *   node scripts/postbuild-verify.mjs dist/repolog-production.aab --stamp-sha
 *   node scripts/postbuild-verify.mjs dist/repolog-preview-local.apk
 *   node scripts/postbuild-verify.mjs Repolog.ipa
 *
 * Forbidden-string canary list: see FORBIDDEN_BUNDLE_STRINGS below.
 * Add a new entry whenever a PR removes a user-visible string that must
 * never re-appear in shipped builds.
 */
import { readFileSync, renameSync, existsSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { resolve, extname, dirname, basename, join } from 'node:path';
import { execSync } from 'node:child_process';

// ---------------------------------------------------------------------------
// Platform-specific required keys (embedded in assets/app.config)
// ---------------------------------------------------------------------------
const REQUIRED_KEYS_ANDROID = [
  'REVENUECAT_ANDROID_API_KEY',
  'REVENUECAT_IOS_API_KEY',
];

const REQUIRED_KEYS_IOS = [
  'REVENUECAT_IOS_API_KEY',
];

// Keys to display for informational purposes (always shown)
const INFO_KEYS = [
  'IAP_DEBUG',
  'SCREENSHOT_MODE',
  'ADMOB_ANDROID_BANNER_ID',
  'ADMOB_IOS_BANNER_ID',
];

// ---------------------------------------------------------------------------
// Forbidden bundle strings — canary against shipping stale builds.
//
// Each entry is a string that MUST NOT appear inside the JS bundle of a
// freshly built artifact.  These are typically i18n keys, component names,
// or constants that were removed in a recent PR.  If the string is found,
// the artifact contains an old build of the JS bundle (Metro / EAS cache
// issue, prebuild skip, or wrong source tree) and must NOT be uploaded.
//
// To add an entry: write the string + the PR/commit that removed it.
// To remove an entry: only after confirming the string is no longer
// referenced anywhere in the codebase.
// ---------------------------------------------------------------------------
const FORBIDDEN_BUNDLE_STRINGS = [
  // Removed in PR #299 (commit 7ced68e, 2026-04-08): progress bar UI was
  // deleted from app/reports/[id]/pdf.tsx and the i18n key was removed from
  // all 19 locales.  If this key shows up again, the build is stale or
  // someone re-introduced the progress bar without updating this list.
  'pdfGeneratingProgress',
];

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const stampSha = args.includes('--stamp-sha');
const archivePath = args.find((a) => !a.startsWith('--'));

if (!archivePath) {
  console.error('Usage: node scripts/postbuild-verify.mjs <path-to-apk-aab-or-ipa> [--stamp-sha]');
  process.exit(1);
}

const absPath = resolve(process.cwd(), archivePath);
const ext = extname(absPath).toLowerCase();
const isIOS = ext === '.ipa';
const isAndroid = ext === '.aab' || ext === '.apk';
const REQUIRED_KEYS = isIOS ? REQUIRED_KEYS_IOS : REQUIRED_KEYS_ANDROID;

let buf;
try {
  buf = readFileSync(absPath);
} catch {
  console.error(`\x1b[31m✗ File not found: ${absPath}\x1b[0m`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// ZIP scanner — finds the first Local File Header whose name matches the
// predicate and returns its decompressed contents.
//
// NOTE: this scanner only handles standard Local File Header storage
// (general purpose bit flag bit 3 = 0).  It does NOT handle Data Descriptor
// format (compSize=0 in LFH, sizes appear after compressed data).  Android
// APK/AAB use the standard format, so this is fine for them.  iOS IPA uses
// Data Descriptor for some entries — see lessons.md 2026-04-07 for why this
// script is no longer wired into the iOS pipeline.
// ---------------------------------------------------------------------------
function extractEntry(buffer, predicate) {
  let offset = 0;
  while (offset < buffer.length - 4) {
    // Local file header signature = 0x04034b50 (little-endian: 50 4B 03 04)
    if (
      buffer[offset] === 0x50 &&
      buffer[offset + 1] === 0x4b &&
      buffer[offset + 2] === 0x03 &&
      buffer[offset + 3] === 0x04
    ) {
      const compressionMethod = buffer.readUInt16LE(offset + 8);
      const compSize = buffer.readUInt32LE(offset + 18);
      const nameLen = buffer.readUInt16LE(offset + 26);
      const extraLen = buffer.readUInt16LE(offset + 28);
      const name = buffer.toString('utf8', offset + 30, offset + 30 + nameLen);

      if (predicate(name)) {
        const dataStart = offset + 30 + nameLen + extraLen;
        const compData = buffer.slice(dataStart, dataStart + compSize);

        if (compressionMethod === 0) return compData;
        if (compressionMethod === 8) return inflateRawSync(compData);

        throw new Error(`Unsupported compression method: ${compressionMethod}`);
      }

      offset = offset + 30 + nameLen + extraLen + compSize;
    } else {
      offset++;
    }
  }
  return null;
}

function extractAppConfig(buffer) {
  // Android: assets/app.config or base/assets/app.config
  // iOS IPA: Payload/AppName.app/assets/app.config (subject to Data Descriptor caveat)
  const entry = extractEntry(buffer, (name) => name.endsWith('assets/app.config'));
  return entry ? entry.toString('utf8') : null;
}

function extractJsBundle(buffer) {
  // Android Hermes bundle: base/assets/index.android.bundle
  const entry = extractEntry(buffer, (name) => name.endsWith('index.android.bundle'));
  return entry ? entry.toString('utf8') : null;
}

// ---------------------------------------------------------------------------

const raw = extractAppConfig(buf);
if (!raw) {
  console.error('\x1b[31m✗ assets/app.config not found in the archive.\x1b[0m');
  console.error('  This file should be present in any Expo-built APK, AAB, or IPA.');
  process.exit(1);
}

let config;
try {
  config = JSON.parse(raw);
} catch {
  console.error('\x1b[31m✗ assets/app.config is not valid JSON.\x1b[0m');
  process.exit(1);
}

const extra = config.extra ?? {};

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const platform = isIOS ? 'iOS' : 'Android';
console.log(`\n  Post-build verification (${platform}): ${archivePath}\n`);

const missing = [];

for (const key of REQUIRED_KEYS) {
  const value = extra[key];
  if (value && String(value).trim() !== '') {
    const masked = String(value).substring(0, 10) + '...';
    console.log(`  \x1b[32m✓\x1b[0m ${key} = ${masked}`);
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${key} = \x1b[31m(empty)\x1b[0m`);
    missing.push(key);
  }
}

console.log('');

for (const key of INFO_KEYS) {
  const value = extra[key];
  const display = value && String(value).trim() !== '' ? String(value) : '(empty)';
  console.log(`  ℹ ${key} = ${display}`);
}

console.log('');

if (missing.length > 0) {
  console.error(
    `\x1b[31m✗ Post-build check FAILED: ${missing.length} required key(s) missing.\x1b[0m`,
  );
  console.error('  The build artifact should NOT be uploaded to the store.');
  console.error('  Fix: ensure keys are set in EAS environment variables');
  console.error('        npx eas-cli env:list --environment production\n');
  process.exit(1);
}

console.log('\x1b[32m✓ Post-build check passed: all required keys are embedded.\x1b[0m\n');

// ---------------------------------------------------------------------------
// Forbidden bundle string check (Android only — see Data Descriptor caveat)
// ---------------------------------------------------------------------------
if (isAndroid && FORBIDDEN_BUNDLE_STRINGS.length > 0) {
  const bundle = extractJsBundle(buf);
  if (!bundle) {
    console.error(
      '\x1b[31m✗ Could not extract index.android.bundle from the artifact.\x1b[0m',
    );
    console.error('  Forbidden-string canary check skipped — please investigate.\n');
    process.exit(1);
  }

  const hits = [];
  for (const needle of FORBIDDEN_BUNDLE_STRINGS) {
    if (bundle.includes(needle)) hits.push(needle);
  }

  if (hits.length > 0) {
    console.error(
      `\x1b[31m✗ Forbidden bundle string(s) found — this build is STALE.\x1b[0m`,
    );
    for (const h of hits) console.error(`    • ${h}`);
    console.error('');
    console.error('  These strings should have been removed by recent PRs.');
    console.error('  The artifact contains an old JS bundle and must NOT be uploaded.');
    console.error('  Fix: clean the build cache and re-run the build.');
    console.error('        rm -rf node_modules/.cache android/.gradle ios/build');
    console.error('        pnpm build:android:aab:local\n');
    process.exit(1);
  }

  console.log(
    `\x1b[32m✓ Forbidden-string canary passed: 0 of ${FORBIDDEN_BUNDLE_STRINGS.length} forbidden marker(s) found in bundle.\x1b[0m\n`,
  );
}

// ---------------------------------------------------------------------------
// SHA stamping — rename the artifact to include the current short git SHA
// so a human can visually verify which commit a given file was built from.
// Only runs when --stamp-sha is passed and only for Android artifacts.
// ---------------------------------------------------------------------------
if (stampSha && isAndroid) {
  // Resolve the SHA from the project repo (process.cwd()), NOT from the
  // artifact's directory — the artifact may live anywhere (dist/, /tmp/, …).
  let shortSha;
  try {
    shortSha = execSync('git rev-parse --short HEAD', {
      cwd: process.cwd(),
      encoding: 'utf8',
    }).trim();
  } catch {
    console.error(
      '\x1b[33m⚠ --stamp-sha requested but git rev-parse failed; skipping rename.\x1b[0m\n',
    );
    process.exit(0);
  }

  const dir = dirname(absPath);
  const base = basename(absPath, ext);

  // If the file already has a SHA suffix that matches HEAD, do nothing.
  if (base.endsWith(`-${shortSha}`)) {
    console.log(`  Already stamped with current SHA: ${basename(absPath)}\n`);
    process.exit(0);
  }

  // Strip any pre-existing -<sha> suffix (7 lowercase hex chars) so we don't
  // end up with double suffixes when re-running.
  const cleanBase = base.replace(/-[0-9a-f]{7}$/i, '');
  const stampedName = `${cleanBase}-${shortSha}${ext}`;
  const stampedPath = join(dir, stampedName);

  if (existsSync(stampedPath) && stampedPath !== absPath) {
    console.log(
      `\x1b[33m⚠ ${stampedName} already exists; overwriting with the new build.\x1b[0m`,
    );
  }

  renameSync(absPath, stampedPath);
  console.log(`\x1b[32m✓ Stamped with commit SHA:\x1b[0m`);
  console.log(`    ${basename(absPath)} → ${stampedName}`);
  console.log('');
  console.log('  Upload this file to Play Console:');
  console.log(`    ${stampedPath}\n`);
}
