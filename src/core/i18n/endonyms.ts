import type { Lang } from './i18n';

/**
 * Each language's self-referential name (endonym).
 * Sentence-cased for display. Verified against Unicode CLDR data.
 * Platform conventions applied (e.g. "Bahasa Indonesia" per iOS/Android).
 */
export const ENDONYMS: Record<Lang, string> = {
  en: 'English',
  ja: '日本語',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  ko: '한국어',
  th: 'ไทย',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  hi: 'हिन्दी',
  tr: 'Türkçe',
  nl: 'Nederlands',
  pl: 'Polski',
  sv: 'Svenska',
} as const;
