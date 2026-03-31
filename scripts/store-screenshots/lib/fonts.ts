import * as path from 'node:path';
import { FONTS_DIR } from './config.js';

// ---------------------------------------------------------------------------
// Font file definitions
// ---------------------------------------------------------------------------

interface FontDef {
  /** File name inside assets/fonts/ */
  file: string;
  /** CSS font-family name */
  family: string;
}

const FONTS: Record<string, FontDef> = {
  latin: { file: 'NotoSans-Variable.ttf', family: 'Noto Sans' },
  jp: { file: 'NotoSansJP-Variable.ttf', family: 'Noto Sans JP' },
  sc: { file: 'NotoSansSC-Variable.ttf', family: 'Noto Sans SC' },
  tc: { file: 'NotoSansTC-Variable.ttf', family: 'Noto Sans TC' },
  kr: { file: 'NotoSansKR-Variable.ttf', family: 'Noto Sans KR' },
  thai: { file: 'NotoSansThai-Variable.ttf', family: 'Noto Sans Thai' },
  devanagari: {
    file: 'NotoSansDevanagari-Variable.ttf',
    family: 'Noto Sans Devanagari',
  },
};

// ---------------------------------------------------------------------------
// Locale -> required font keys
// ---------------------------------------------------------------------------

const LOCALE_FONTS: Record<string, string[]> = {
  ja: ['latin', 'jp'],
  ko: ['latin', 'kr'],
  'zh-Hans': ['latin', 'sc'],
  'zh-Hant': ['latin', 'tc'],
  hi: ['latin', 'devanagari'],
  th: ['latin', 'thai'],
};

function getFontKeysForLocale(locale: string): string[] {
  return LOCALE_FONTS[locale] ?? ['latin'];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build @font-face CSS rules for the given locale.
 * Uses file:// URLs pointing to the existing Variable TTFs in assets/fonts/.
 */
export function buildFontCss(locale: string): string {
  const keys = getFontKeysForLocale(locale);
  return keys
    .map((key) => {
      const font = FONTS[key];
      const absPath = path.resolve(FONTS_DIR, font.file);
      return `@font-face {
  font-family: '${font.family}';
  src: url('file://${absPath}') format('truetype');
  font-weight: 100 900;
  font-display: block;
}`;
    })
    .join('\n');
}

/**
 * Return the CSS font-family stack for the given locale.
 * Script-specific font comes first, then the base Latin font, then sans-serif.
 */
export function getFontStack(locale: string): string {
  const keys = getFontKeysForLocale(locale);
  const families = keys.map((k) => `'${FONTS[k].family}'`);
  // Ensure sans-serif fallback is last
  return [...families, 'sans-serif'].join(', ');
}
