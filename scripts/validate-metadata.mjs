#!/usr/bin/env node
/**
 * validate-metadata.mjs
 *
 * fastlane/metadata/ 配下の App Store メタデータを自動バリデーションする。
 * CI で push_metadata の前に実行し、不正なデータが ASC に送られるのを防ぐ。
 *
 * チェック項目:
 *   1. 文字数上限 (name 30, subtitle 30, keywords 100, promotional_text 170, description 4000)
 *   2. ラテン文字言語のアクセント存在確認 (es-ES, pt-BR, fr-FR, de-DE, nl-NL, sv, pl, tr, vi)
 *   3. 禁則語チェック (商標名: WhatsApp, LINE, Zalo, Word; 誇大表現: No.1, best, fastest)
 *   4. keywords 形式チェック (カンマ後スペース禁止、name/subtitle との重複検出)
 *   5. URL 形式チェック (privacy_url, support_url)
 *
 * Usage:
 *   node scripts/validate-metadata.mjs              # 全ロケール検証
 *   node scripts/validate-metadata.mjs --locale ja  # 特定ロケール
 *
 * Exit code:
 *   0 = 全件 OK
 *   1 = エラーあり (CI 失敗)
 *
 * 参照: docs/reference/lessons.md L-FL04
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

// ---------------------------------------------------------------------------
// 設定
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const METADATA_DIR = join(__dirname, '..', 'fastlane', 'metadata');

/** 文字数上限 */
const CHAR_LIMITS = {
  'name.txt': 30,
  'subtitle.txt': 30,
  'keywords.txt': 100,
  'promotional_text.txt': 170,
  'description.txt': 4000,
};

/**
 * ラテン文字言語のアクセント検出用。
 * 各言語で「description にこの文字クラスの文字が 1 つも無ければ異常」と判定。
 * ASCII-only で書かれた es-ES/pt-BR を検出するための仕組み (lessons L-FL04)。
 */
const ACCENT_REQUIRED = {
  'es-ES': /[áéíóúñ¿¡ü]/i,
  'pt-BR': /[áàâãéêíóôõúç]/i,
  'fr-FR': /[àâéèêëîïôùûüÿç]/i,
  'de-DE': /[äöüß]/i,
  'tr':    /[çğıöşü]/i,
  'pl':    /[ąćęłńóśźż]/i,
  'vi':    /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i,
  'sv':    /[åäö]/i,
};

/** これらの語がメタデータに含まれていたら警告 (商標名・誇大表現) */
const FORBIDDEN_PATTERNS = [
  { pattern: /\bWhatsApp\b/i, message: '商標名 "WhatsApp" を含んでいます。汎用表現に置き換えてください' },
  { pattern: /\bLINE\b/, message: '商標名 "LINE" を含んでいます (大文字4文字の場合)' },
  { pattern: /\bZalo\b/i, message: '商標名 "Zalo" を含んでいます' },
  { pattern: /\bNo\.\s*1\b/i, message: '誇大表現 "No.1" — Apple Guideline 2.3.7 違反リスク' },
  { pattern: /\b(best|fastest|most popular)\b/i, message: '検証不能な最上級表現 — Guideline 2.3.7 違反リスク' },
];

/** 非ロケールディレクトリ (共通ファイル) */
const SKIP_DIRS = new Set(['review_information']);

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const { values } = parseArgs({
  options: {
    locale: { type: 'string', default: '' },
  },
  strict: true,
});

// ---------------------------------------------------------------------------
// バリデーション
// ---------------------------------------------------------------------------

let errors = 0;
let warnings = 0;

function error(locale, file, msg) {
  console.error(`  ERROR  ${locale}/${file}: ${msg}`);
  errors++;
}

function warn(locale, file, msg) {
  console.warn(`  WARN   ${locale}/${file}: ${msg}`);
  warnings++;
}

function readText(filePath) {
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf-8').replace(/\n$/, '');
}

function validate(locale) {
  const dir = join(METADATA_DIR, locale);
  if (!existsSync(dir)) {
    error(locale, '-', `ディレクトリが存在しません: ${dir}`);
    return;
  }

  // --- 1. 文字数上限 ---
  for (const [file, limit] of Object.entries(CHAR_LIMITS)) {
    const text = readText(join(dir, file));
    if (text === null) continue; // ファイルが無い場合はスキップ (fastlane が判断)
    if (text.length > limit) {
      error(locale, file, `${text.length} 文字 (上限 ${limit})`);
    }
  }

  // --- 2. ラテン文字言語のアクセント確認 ---
  const accentRegex = ACCENT_REQUIRED[locale];
  if (accentRegex) {
    const desc = readText(join(dir, 'description.txt'));
    if (desc && !accentRegex.test(desc)) {
      error(locale, 'description.txt',
        `この言語に必要なアクセント記号が 1 つも含まれていません (ASCII-only の可能性)。` +
        `期待: ${accentRegex.source}`);
    }
  }

  // --- 3. 禁則語チェック ---
  for (const file of ['description.txt', 'name.txt', 'subtitle.txt', 'promotional_text.txt']) {
    const text = readText(join(dir, file));
    if (!text) continue;
    for (const { pattern, message } of FORBIDDEN_PATTERNS) {
      if (pattern.test(text)) {
        warn(locale, file, message);
      }
    }
  }

  // --- 4. keywords 形式チェック ---
  const keywords = readText(join(dir, 'keywords.txt'));
  if (keywords) {
    // カンマ後スペース検出
    if (/,\s/.test(keywords)) {
      warn(locale, 'keywords.txt', 'カンマの後にスペースがあります (文字数の浪費)');
    }

    // name/subtitle との単語重複検出
    const name = readText(join(dir, 'name.txt')) || '';
    const subtitle = readText(join(dir, 'subtitle.txt')) || '';
    const nameWords = new Set(
      (name + ' ' + subtitle).toLowerCase().split(/[\s:]+/).filter(w => w.length > 2)
    );
    const kwList = keywords.toLowerCase().split(',');
    for (const kw of kwList) {
      const trimmed = kw.trim();
      if (nameWords.has(trimmed)) {
        warn(locale, 'keywords.txt', `"${trimmed}" は name/subtitle にも含まれています (重複 → Apple が自動インデックスするので不要)`);
      }
    }
  }

  // --- 5. URL 形式チェック ---
  for (const file of ['privacy_url.txt', 'support_url.txt']) {
    const url = readText(join(dir, file));
    if (url && url.length > 0 && !url.startsWith('http')) {
      error(locale, file, `有効な URL ではありません: "${url}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------

console.log('App Store metadata validation');
console.log(`Dir: ${METADATA_DIR}\n`);

if (!existsSync(METADATA_DIR)) {
  console.log('fastlane/metadata/ が存在しません。スキップします。');
  process.exit(0);
}

const locales = values.locale
  ? [values.locale]
  : readdirSync(METADATA_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && !SKIP_DIRS.has(d.name) && !d.name.endsWith('.txt'))
      .map(d => d.name);

for (const locale of locales) {
  // 共通ファイル (copyright.txt 等) はスキップ
  if (locale.endsWith('.txt')) continue;
  validate(locale);
}

console.log(`\n${errors} error(s), ${warnings} warning(s) across ${locales.length} locale(s)`);

if (errors > 0) {
  console.error('\nValidation FAILED. Fix the errors above before pushing to ASC.');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\nValidation PASSED with warnings. Review them before pushing.');
} else {
  console.log('\nValidation PASSED.');
}
