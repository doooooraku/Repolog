#!/usr/bin/env node
/**
 * Pre-build environment variable check.
 *
 * Verifies that critical API keys are present before starting a production
 * or preview build.  Without these keys the binary will ship with empty
 * strings and features like in-app purchases will silently fail at runtime.
 *
 * Two layers of checks:
 *   1. Local .env file — catches local-build mistakes
 *   2. EAS server-side env:list — catches the real source of truth that
 *      `eas build` will inject. Only runs when EXPO_TOKEN is set (CI or
 *      authenticated developer machine).
 *
 * Usage:
 *   node scripts/prebuild-env-check.mjs          # check all keys
 *   node scripts/prebuild-env-check.mjs android   # check Android keys only
 *   node scripts/prebuild-env-check.mjs ios       # check iOS keys only
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const platform = (process.argv[2] ?? 'all').toLowerCase();

const KEYS = {
  android: ['REVENUECAT_ANDROID_API_KEY'],
  ios: ['REVENUECAT_IOS_API_KEY'],
};

const keysToCheck =
  platform === 'all'
    ? [...KEYS.android, ...KEYS.ios]
    : KEYS[platform] ?? [...KEYS.android, ...KEYS.ios];

// ---------------------------------------------------------------------------
// Layer 1: local .env check
// ---------------------------------------------------------------------------
const missing = keysToCheck.filter(
  (key) => !process.env[key] || process.env[key].trim() === '',
);

if (missing.length > 0) {
  console.error(
    '\n\x1b[31m✗ Pre-build check failed: missing required environment variables:\x1b[0m\n',
  );
  for (const key of missing) {
    console.error(`   - ${key}`);
  }
  console.error(
    '\n  Set them in .env or EAS environment variables before building.\n',
  );
  process.exit(1);
}

console.log('\x1b[32m✓ Pre-build env check passed (local .env)\x1b[0m');

// ---------------------------------------------------------------------------
// Layer 2: EAS server-side env:list check
// ---------------------------------------------------------------------------
// This is the real source of truth for `eas build` (--local or cloud).  We
// only run it when EXPO_TOKEN is set so it doesn't break developer machines
// without an authenticated EAS CLI.
const isCI = process.env.CI === 'true';

if (!process.env.EXPO_TOKEN) {
  console.log(
    '  ℹ Skipping EAS server-side env check (no EXPO_TOKEN in environment)',
  );
  process.exit(0);
}

console.log('  Checking EAS server-side environment variables (production)...');

// eas-cli is installed globally in CI via `npm install -g eas-cli`.  Locally
// we fall back to `npx eas-cli` so developers without a global install still
// get a best-effort check.
const easBin = process.env.CI === 'true' ? 'eas' : 'npx --yes eas-cli';

// The eas-cli env:list signature has shifted across versions.  As of the
// latest CLI, env:list does NOT accept --non-interactive (it's only valid
// on env:create and a few others) — passing it produces "Nonexistent flag:
// --non-interactive".  Try the bare forms in order.
const candidates = [
  `${easBin} env:list production`,
  `${easBin} env:list --environment production`,
  `${easBin} env:list`,
];

function dumpDiagnostic(label, err) {
  console.error(`  --- diagnostic (${label}) ---`);
  if (err.status !== undefined) console.error(`  exit status: ${err.status}`);
  if (err.signal) console.error(`  signal: ${err.signal}`);
  const stdoutText = err.stdout ? String(err.stdout).trim() : '';
  const stderrText = err.stderr ? String(err.stderr).trim() : '';
  if (stdoutText) {
    console.error('  stdout:');
    for (const line of stdoutText.split('\n')) console.error(`    ${line}`);
  }
  if (stderrText) {
    console.error('  stderr:');
    for (const line of stderrText.split('\n')) console.error(`    ${line}`);
  }
  if (!stdoutText && !stderrText && err.message) {
    console.error(`  message: ${err.message}`);
  }
  console.error('  --- end diagnostic ---');
}

let easOutput = null;
const attempts = [];
for (const cmd of candidates) {
  try {
    easOutput = execSync(cmd, {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    console.log(`  (using: ${cmd})`);
    break;
  } catch (err) {
    attempts.push({ cmd, err });
  }
}

if (easOutput === null) {
  console.error('\n\x1b[31m✗ EAS env:list failed (all candidate forms exhausted)\x1b[0m');
  for (const { cmd, err } of attempts) {
    dumpDiagnostic(cmd, err);
  }
  if (isCI) {
    console.error('\n  Make sure EXPO_TOKEN is valid and the eas-cli is reachable.\n');
    process.exit(1);
  }
  console.warn('  \x1b[33m⚠ Skipping (local mode, not fatal)\x1b[0m');
  process.exit(0);
}

// Loose substring check: eas-cli's default tabular output never reveals the
// secret value, so we can only verify existence by name.  This intentionally
// guards the "key not registered at all" failure mode rather than the
// "key registered but empty" mode (which is much rarer in practice).
const easMissing = keysToCheck.filter((key) => !easOutput.includes(key));

if (easMissing.length > 0) {
  const fatal = isCI;
  const color = fatal ? '\x1b[31m' : '\x1b[33m';
  const mark = fatal ? '✗' : '⚠';
  console.error(
    `\n${color}${mark} EAS server-side env check ${fatal ? 'failed' : 'warning'}: keys not registered:\x1b[0m\n`,
  );
  for (const key of easMissing) {
    console.error(`   - ${key}`);
  }
  console.error(
    '\n  Fix: npx eas-cli env:create --environment production\n' +
      '       (or update an existing variable via the Expo dashboard)\n',
  );
  console.error('  Raw env:list output (for debugging):');
  for (const line of easOutput.split('\n')) console.error(`    ${line}`);
  if (fatal) process.exit(1);
} else {
  console.log('  \x1b[32m✓ EAS server-side env check passed\x1b[0m');
}
