/**
 * scripts/config-check.mjs
 *
 * Expo app.json / app.config.ts の必須設定を検証する。
 * 既存の i18n-check.mjs / ump-consent-check.mjs と同じパターン。
 *
 * 使い方:
 *   node scripts/config-check.mjs
 *   pnpm config:check
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Resolve Expo config ─────────────────────────────
// `--type public` is used for most checks (resolved + validated by Expo).
let config;
try {
  const raw = execSync('npx expo config --type public --json', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 30_000,
  });
  config = JSON.parse(raw);
} catch (err) {
  console.error('Failed to resolve Expo config:', err.message);
  process.exit(2);
}

// `ios.config` is stripped from `--type public` output (build-time only).
// Read app.json directly for fields that only exist in the raw config.
let appJson;
try {
  appJson = JSON.parse(readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
} catch (err) {
  console.error('Failed to read app.json:', err.message);
  process.exit(2);
}

// ── Expected values ─────────────────────────────────
const EXPECTED_IOS_BUNDLE_ID = 'com.dooooraku.repolog';
const EXPECTED_ANDROID_PACKAGE = 'com.dooooraku.repolog';

// ── Rules ───────────────────────────────────────────
const rules = [
  {
    key: 'ios.bundleIdentifier',
    label: 'iOS bundle identifier matches expected value',
    check: () => {
      const actual = config.ios?.bundleIdentifier;
      return {
        ok: actual === EXPECTED_IOS_BUNDLE_ID,
        actual: actual ?? '(not set)',
        hint: `expected "${EXPECTED_IOS_BUNDLE_ID}"`,
      };
    },
  },
  {
    key: 'android.package',
    label: 'Android package matches expected value',
    check: () => {
      const actual = config.android?.package;
      return {
        ok: actual === EXPECTED_ANDROID_PACKAGE,
        actual: actual ?? '(not set)',
        hint: `expected "${EXPECTED_ANDROID_PACKAGE}"`,
      };
    },
  },
  {
    key: 'ios.config.usesNonExemptEncryption',
    label: 'iOS encryption compliance is set to false (see ADR-0010)',
    check: () => {
      // Read from raw app.json because `expo config --type public` strips ios.config
      const val = appJson.expo?.ios?.config?.usesNonExemptEncryption;
      return {
        ok: val === false,
        actual: val === undefined ? '(not set)' : String(val),
        hint: 'set ios.config.usesNonExemptEncryption to false in app.json (see ADR-0010)',
      };
    },
  },
  {
    key: 'ios.privacyManifests',
    label: 'iOS privacy manifests are configured',
    check: () => {
      const pm = config.ios?.privacyManifests;
      const hasApiTypes =
        Array.isArray(pm?.NSPrivacyAccessedAPITypes) &&
        pm.NSPrivacyAccessedAPITypes.length > 0;
      return {
        ok: hasApiTypes,
        actual: hasApiTypes
          ? `${pm.NSPrivacyAccessedAPITypes.length} API type(s) declared`
          : '(not set)',
        hint: 'add ios.privacyManifests.NSPrivacyAccessedAPITypes to app.json (required by Apple)',
      };
    },
  },
];

// ── Execute rules ───────────────────────────────────
let failed = false;
for (const rule of rules) {
  const result = rule.check();
  const prefix = result.ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  const status = result.ok ? 'PASS' : 'FAIL';
  console.log(`${prefix} [${status}] ${rule.label}`);
  if (!result.ok) {
    console.log(`    actual: ${result.actual}`);
    if (result.hint) console.log(`    hint:   ${result.hint}`);
    failed = true;
  }
}

console.log();
if (failed) {
  console.error('Expo config check FAILED');
  process.exit(1);
} else {
  console.log('Expo config check passed');
}
