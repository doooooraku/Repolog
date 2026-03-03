/**
 * i18n-check.mjs — CI/ローカルで使う i18n 品質ゲート
 *
 * 何をするか:
 *   en.ts（基準言語）に対して 2 つのアサーションを実行する。
 *   1. unused keys  = 0  （コードから参照されないキーがない）
 *   2. missing keys = 0  （コードが参照するキーが全て定義されている）
 *
 * なぜ必要か:
 *   - 未使用キーはデッドコード。翻訳コストを無駄にし、メンテナンスを妨げる。
 *   - 欠落キーは実行時に翻訳が表示されないバグを引き起こす。
 *   - このスクリプトが CI に入っていれば、PR がマージされる前に自動で検出される。
 *
 * 使い方:
 *   node scripts/i18n-check.mjs       # 基準言語 en.ts をチェック
 *   pnpm i18n:check                   # package.json 経由で同じこと
 *
 * 終了コード:
 *   0 = パス（問題なし）
 *   1 = 失敗（unused または missing が 1 件以上）
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// i18n-audit.mjs を実行して JSON レポートを取得
const auditJson = execSync(
  `node ${path.join(ROOT, 'scripts/i18n-audit.mjs')} en --inventory --json`,
  { cwd: ROOT, encoding: 'utf8' },
);
const report = JSON.parse(auditJson);

let failed = false;

// Gate 1: 未使用キーが 0 であること
if (report.unusedCandidates.length > 0) {
  console.error(
    `FAIL: ${report.unusedCandidates.length} unused i18n key(s) in en.ts`,
  );
  for (const key of report.unusedCandidates) {
    console.error(`  - ${key}`);
  }
  failed = true;
}

// Gate 2: 欠落キーが 0 であること
if (report.missingUsed.length > 0) {
  console.error(
    `FAIL: ${report.missingUsed.length} missing used key(s) in en.ts`,
  );
  for (const key of report.missingUsed) {
    console.error(`  - ${key}`);
  }
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(
  `i18n check passed (${report.usedKeysInApp} used, 0 unused, 0 missing)`,
);
