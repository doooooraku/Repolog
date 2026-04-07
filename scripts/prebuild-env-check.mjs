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

let easOutput;
try {
  easOutput = execSync(
    'npx eas-cli env:list production --json --non-interactive',
    { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' },
  );
} catch (err) {
  const msg = String(err.stderr ?? err.message ?? err).split('\n')[0];
  if (isCI) {
    console.error(
      `\n\x1b[31m✗ EAS env:list failed in CI:\x1b[0m ${msg}\n`,
    );
    console.error(
      '  Make sure EXPO_TOKEN is valid and the eas-cli is reachable.\n',
    );
    process.exit(1);
  }
  console.warn(
    `  \x1b[33m⚠ Could not run eas env:list (skipping):\x1b[0m ${msg}`,
  );
  process.exit(0);
}

let easVars;
try {
  easVars = JSON.parse(easOutput);
} catch (err) {
  if (isCI) {
    console.error(
      '\n\x1b[31m✗ Could not parse eas env:list JSON output:\x1b[0m',
      err.message,
    );
    process.exit(1);
  }
  console.warn(
    '  \x1b[33m⚠ Could not parse eas env:list output (skipping)\x1b[0m',
  );
  process.exit(0);
}

// eas env:list --json returns an array of variable objects.  Field naming
// has historically been { name, value, ... }.  Be defensive about the shape.
const easMap = {};
if (Array.isArray(easVars)) {
  for (const v of easVars) {
    if (v && typeof v === 'object' && v.name) {
      easMap[v.name] = v.value ?? '';
    }
  }
}

const easMissing = keysToCheck.filter(
  (key) => !easMap[key] || String(easMap[key]).trim() === '',
);

if (easMissing.length > 0) {
  const fatal = isCI;
  const color = fatal ? '\x1b[31m' : '\x1b[33m';
  const mark = fatal ? '✗' : '⚠';
  console.error(
    `\n${color}${mark} EAS server-side env check ${fatal ? 'failed' : 'warning'}: missing/empty keys:\x1b[0m\n`,
  );
  for (const key of easMissing) {
    console.error(`   - ${key}`);
  }
  console.error(
    '\n  Fix: npx eas-cli env:create --environment production\n' +
      '       (or update an existing variable via the Expo dashboard)\n',
  );
  if (fatal) process.exit(1);
} else {
  console.log('  \x1b[32m✓ EAS server-side env check passed\x1b[0m');
}
