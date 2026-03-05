export const ALL_PDF_FONT_KEYS = [
  'latin',
  'jp',
  'sc',
  'tc',
  'kr',
  'thai',
  'devanagari',
] as const;

export type PdfFontKey = (typeof ALL_PDF_FONT_KEYS)[number];

export type PdfFontSelectionDecision = {
  selectedFontKeys: PdfFontKey[];
  strategy: 'lang_based' | 'lang_plus_content' | 'all_fonts';
  reason: 'lang_match' | 'additional_scripts_found' | 'unsupported_script_fallback';
};

// Primary: language setting determines base font set
const LANG_TO_FONTS: Record<string, PdfFontKey[]> = {
  ja: ['latin', 'jp'],
  ko: ['latin', 'kr'],
  'zh-Hans': ['latin', 'sc'],
  'zh-Hant': ['latin', 'tc'],
  hi: ['latin', 'devanagari'],
  th: ['latin', 'thai'],
};

const DEVANAGARI_REGEX = /[\u0900-\u097F]/u;
const THAI_REGEX = /[\u0E00-\u0E7F]/u;
const HANGUL_REGEX = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/u;
const HIRAGANA_KATAKANA_REGEX = /[\u3040-\u30FF]/u;
const CJK_UNIFIED_REGEX = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u;
const FULLWIDTH_FORM_REGEX = /[\uFF00-\uFFEF]/u;

export function detectPdfScriptSubset(text: string, localeHint?: string): PdfFontKey[] {
  const selected = new Set<PdfFontKey>(['latin']);

  if (DEVANAGARI_REGEX.test(text)) {
    selected.add('devanagari');
  }
  if (THAI_REGEX.test(text)) {
    selected.add('thai');
  }
  if (HANGUL_REGEX.test(text)) {
    selected.add('kr');
  }
  if (HIRAGANA_KATAKANA_REGEX.test(text)) {
    selected.add('jp');
  }
  if (CJK_UNIFIED_REGEX.test(text) || FULLWIDTH_FORM_REGEX.test(text)) {
    addCjkByLocale(selected, localeHint);
  }

  return ALL_PDF_FONT_KEYS.filter((key) => selected.has(key));
}

function addCjkByLocale(selected: Set<PdfFontKey>, localeHint?: string) {
  if (localeHint === 'ja') {
    selected.add('jp');
    return;
  }
  if (localeHint === 'zh-Hans') {
    selected.add('sc');
    return;
  }
  if (localeHint === 'zh-Hant') {
    selected.add('tc');
    return;
  }
  // Cannot disambiguate CJK without locale — load all three
  selected.add('jp');
  selected.add('sc');
  selected.add('tc');
}

const SUPPORTED_CODEPOINT_RANGES: readonly (readonly [number, number])[] = [
  [0x0000, 0x024f],
  [0x0300, 0x036f],
  [0x0900, 0x097f],
  [0x0e00, 0x0e7f],
  [0x1100, 0x11ff],
  [0x2000, 0x206f],
  [0x20a0, 0x20cf],
  [0x2100, 0x214f],
  [0x2190, 0x21ff],
  [0x2200, 0x22ff],
  [0x2460, 0x24ff],
  [0x3000, 0x303f],
  [0x3040, 0x30ff],
  [0x3130, 0x318f],
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xac00, 0xd7af],
  [0xf900, 0xfaff],
  [0xff00, 0xffef],
  [0x1e00, 0x1eff],
];

export function containsUnsupportedScripts(text: string): boolean {
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint == null) continue;
    if (!inRanges(codePoint, SUPPORTED_CODEPOINT_RANGES)) {
      return true;
    }
  }
  return false;
}

function inRanges(
  codePoint: number,
  ranges: readonly (readonly [number, number])[],
) {
  return ranges.some(([start, end]) => codePoint >= start && codePoint <= end);
}

type SelectPdfFontKeysInput = {
  lang: string;
  text?: string;
};

export function selectPdfFontKeys(input: SelectPdfFontKeysInput): PdfFontSelectionDecision {
  const baseFonts = LANG_TO_FONTS[input.lang] ?? ['latin' as PdfFontKey];

  if (!input.text) {
    return {
      selectedFontKeys: baseFonts,
      strategy: 'lang_based',
      reason: 'lang_match',
    };
  }

  // Fallback: if text contains scripts none of our fonts support, load all
  if (containsUnsupportedScripts(input.text)) {
    return {
      selectedFontKeys: [...ALL_PDF_FONT_KEYS],
      strategy: 'all_fonts',
      reason: 'unsupported_script_fallback',
    };
  }

  // Secondary: scan report text for scripts beyond the base language
  const contentFonts = detectPdfScriptSubset(input.text, input.lang);
  const merged = new Set<PdfFontKey>([...baseFonts, ...contentFonts]);
  const mergedKeys = ALL_PDF_FONT_KEYS.filter((key) => merged.has(key));

  if (mergedKeys.length > baseFonts.length) {
    return {
      selectedFontKeys: mergedKeys,
      strategy: 'lang_plus_content',
      reason: 'additional_scripts_found',
    };
  }

  return {
    selectedFontKeys: baseFonts,
    strategy: 'lang_based',
    reason: 'lang_match',
  };
}
