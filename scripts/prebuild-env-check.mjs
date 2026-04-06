#!/usr/bin/env node
/**
 * Pre-build environment variable check.
 *
 * Verifies that critical API keys are present before starting a production
 * or preview build.  Without these keys the binary will ship with empty
 * strings and features like in-app purchases will silently fail at runtime.
 *
 * Usage:
 *   node scripts/prebuild-env-check.mjs          # check all keys
 *   node scripts/prebuild-env-check.mjs android   # check Android keys only
 *   node scripts/prebuild-env-check.mjs ios       # check iOS keys only
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

console.log('\x1b[32m✓ Pre-build env check passed\x1b[0m');
