const SUPPORTED_LANG_CODES = [
  'en',
  'ja',
  'fr',
  'es',
  'de',
  'it',
  'pt',
  'ru',
  'zh-Hans',
  'zh-Hant',
  'ko',
  'hi',
  'id',
  'th',
  'vi',
  'tr',
  'nl',
  'pl',
  'sv',
] as const;

type SupportedLangCode = (typeof SUPPORTED_LANG_CODES)[number];

const canonicalByLower = SUPPORTED_LANG_CODES.reduce<Record<string, SupportedLangCode>>(
  (acc, code) => {
    acc[code.toLowerCase()] = code;
    return acc;
  },
  {},
);

const LEGACY_MAP: Record<string, SupportedLangCode> = {
  zhhans: 'zh-Hans',
  zhhant: 'zh-Hant',
};

const normalizeToken = (value: string) => value.replace(/_/g, '-').replace(/-/g, '').toLowerCase();

const toSupportedLangCode = (value?: string | null): SupportedLangCode | null => {
  if (!value) return null;
  const normalizedValue = value.replace(/_/g, '-').toLowerCase();
  const direct = canonicalByLower[normalizedValue];
  if (direct) return direct;
  return LEGACY_MAP[normalizeToken(value)] ?? null;
};

export type LangCode = SupportedLangCode;

export function normalizeLangCode(
  rawCode?: string | null,
  tag?: string | null,
  script?: string | null,
  region?: string | null,
): LangCode {
  const direct = toSupportedLangCode(rawCode);
  if (direct) return direct;

  const code = rawCode?.toLowerCase();
  const tagLower = tag?.replace(/_/g, '-').toLowerCase();
  const scriptLower = script?.toLowerCase();
  const regionUpper = region?.toUpperCase();

  if (code === 'zh' || tagLower?.startsWith('zh')) {
    const isHant =
      tagLower?.includes('hant') ||
      scriptLower === 'hant' ||
      (regionUpper != null && ['TW', 'HK', 'MO'].includes(regionUpper));
    return isHant ? 'zh-Hant' : 'zh-Hans';
  }

  if (code === 'ms') return 'zh-Hans';

  const primaryFromTag = tagLower?.split('-')[0];
  const fromTag = toSupportedLangCode(primaryFromTag);
  if (fromTag) return fromTag;

  const fromCode = toSupportedLangCode(code);
  if (fromCode) return fromCode;

  return 'en';
}

export function listSupportedLangCodes(): LangCode[] {
  return [...SUPPORTED_LANG_CODES];
}
