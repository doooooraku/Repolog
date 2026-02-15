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

type LocaleHint = 'ja' | 'zh-Hans' | 'zh-Hant';

type SelectPdfFontKeysInput = {
  text: string;
  localeHint?: string;
  subsetExperimentEnabled: boolean;
};

export type PdfFontSelectionDecision = {
  selectedFontKeys: PdfFontKey[];
  strategy: 'all_fonts' | 'script_subset';
  reason:
    | 'experiment_disabled'
    | 'script_subset'
    | 'unsupported_script_fallback';
};

const DEVANAGARI_REGEX = /[\u0900-\u097F]/u;
const THAI_REGEX = /[\u0E00-\u0E7F]/u;
const HANGUL_REGEX = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/u;
const HIRAGANA_KATAKANA_REGEX = /[\u3040-\u30FF]/u;
const CJK_UNIFIED_REGEX = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u;
const FULLWIDTH_FORM_REGEX = /[\uFF00-\uFFEF]/u;

function normalizeLocaleHint(localeHint?: string): LocaleHint | null {
  if (localeHint === 'ja' || localeHint === 'zh-Hans' || localeHint === 'zh-Hant') {
    return localeHint;
  }
  return null;
}

function addCjkSubsetByLocale(
  selected: Set<PdfFontKey>,
  localeHint: LocaleHint | null,
) {
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

  // Locale alone cannot disambiguate CJK safely, so use broad CJK fallback.
  selected.add('jp');
  selected.add('sc');
  selected.add('tc');
}

export function detectPdfScriptSubset(text: string, localeHint?: string): PdfFontKey[] {
  const selected = new Set<PdfFontKey>(['latin']);
  const normalizedLocale = normalizeLocaleHint(localeHint);

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
    addCjkSubsetByLocale(selected, normalizedLocale);
  }

  return ALL_PDF_FONT_KEYS.filter((key) => selected.has(key));
}

function inRanges(
  codePoint: number,
  ranges: readonly (readonly [number, number])[],
) {
  return ranges.some(([start, end]) => codePoint >= start && codePoint <= end);
}

const SUPPORTED_CODEPOINT_RANGES: readonly (readonly [number, number])[] = [
  [0x0000, 0x024f], // Basic Latin + Latin-1 + Latin Extended A/B + punctuation
  [0x0300, 0x036f], // Combining marks
  [0x0900, 0x097f], // Devanagari
  [0x0e00, 0x0e7f], // Thai
  [0x1100, 0x11ff], // Hangul Jamo
  [0x2000, 0x206f], // General punctuation
  [0x20a0, 0x20cf], // Currency symbols
  [0x2100, 0x214f], // Letterlike symbols
  [0x2190, 0x21ff], // Arrows
  [0x2200, 0x22ff], // Math operators
  [0x2460, 0x24ff], // Enclosed alphanumerics
  [0x3000, 0x303f], // CJK symbols and punctuation
  [0x3040, 0x30ff], // Hiragana + Katakana
  [0x3130, 0x318f], // Hangul compatibility Jamo
  [0x3400, 0x4dbf], // CJK Extension A
  [0x4e00, 0x9fff], // CJK unified
  [0xac00, 0xd7af], // Hangul syllables
  [0xf900, 0xfaff], // CJK compatibility ideographs
  [0xff00, 0xffef], // Halfwidth/fullwidth forms
  [0x1e00, 0x1eff], // Latin extended additional
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

export function selectPdfFontKeys(input: SelectPdfFontKeysInput): PdfFontSelectionDecision {
  if (!input.subsetExperimentEnabled) {
    return {
      selectedFontKeys: [...ALL_PDF_FONT_KEYS],
      strategy: 'all_fonts',
      reason: 'experiment_disabled',
    };
  }

  if (containsUnsupportedScripts(input.text)) {
    return {
      selectedFontKeys: [...ALL_PDF_FONT_KEYS],
      strategy: 'all_fonts',
      reason: 'unsupported_script_fallback',
    };
  }

  return {
    selectedFontKeys: detectPdfScriptSubset(input.text, input.localeHint),
    strategy: 'script_subset',
    reason: 'script_subset',
  };
}
