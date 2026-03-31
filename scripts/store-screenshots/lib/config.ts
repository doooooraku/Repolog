import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Store target sizes
// ---------------------------------------------------------------------------

export interface StoreSize {
  readonly width: number;
  readonly height: number;
}

/** iPhone 6.9" — mandatory for App Store */
export const APPLE_SIZE: StoreSize = { width: 1320, height: 2868 };

/** Phone — standard for Google Play (9:16) */
export const GOOGLE_SIZE: StoreSize = { width: 1080, height: 1920 };

export const STORE_SIZES: Record<string, StoreSize> = {
  apple: APPLE_SIZE,
  google: GOOGLE_SIZE,
};

// ---------------------------------------------------------------------------
// Raw screenshot crop values (Maestro on Pixel 8a: 720 x 1520)
// ---------------------------------------------------------------------------

/** Pixels to remove from top (Android status bar in Demo Mode) */
export const CROP_TOP = 56;

/** Pixels to remove from bottom (Android gesture bar) */
export const CROP_BOTTOM = 32;

// ---------------------------------------------------------------------------
// Screen filename <-> marketing-text key mapping
// ---------------------------------------------------------------------------

export const SCREEN_MAP = [
  { key: 'screen1' as const, filename: '01_home.png' },
  { key: 'screen2' as const, filename: '02_editor_top.png' },
  { key: 'screen3' as const, filename: '03_editor_bottom.png' },
  { key: 'screen4' as const, filename: '04_pdf_preview.png' },
] as const;

export type ScreenKey = (typeof SCREEN_MAP)[number]['key'];

// ---------------------------------------------------------------------------
// Locale code -> raw screenshot directory name
// ---------------------------------------------------------------------------

export const LOCALE_DIR_MAP: Record<string, string> = {
  en: 'en_English',
  ja: 'ja_日本語',
  fr: 'fr_Français',
  es: 'es_Español',
  de: 'de_Deutsch',
  it: 'it_Italiano',
  pt: 'pt_Português',
  ru: 'ru_Русский',
  'zh-Hans': 'zh-Hans_简体中文',
  'zh-Hant': 'zh-Hant_繁體中文',
  ko: 'ko_한국어',
  hi: 'hi_हिन्दी',
  id: 'id_Indonesia',
  th: 'th_ไทย',
  vi: 'vi_Tiếng-Việt',
  tr: 'tr_Türkçe',
  nl: 'nl_Nederlands',
  pl: 'pl_Polski',
  sv: 'sv_Svenska',
};

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SCRIPTS_DIR = path.resolve(__dirname, '..');
export const PROJECT_ROOT = path.resolve(SCRIPTS_DIR, '../..');
export const RAW_DIR = path.join(PROJECT_ROOT, 'screenshots/raw');
export const STORE_DIR = path.join(PROJECT_ROOT, 'screenshots/store');
export const FONTS_DIR = path.join(PROJECT_ROOT, 'assets/fonts');
