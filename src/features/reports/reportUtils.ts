import type { AddressSource, WeatherType } from '@/src/types/models';

export const MAX_COMMENT_CHARS = 4000;

export const countCommentChars = (text: string) => Array.from(text).length;

export const clampComment = (text: string, max = MAX_COMMENT_CHARS) => {
  if (countCommentChars(text) <= max) return text;
  return Array.from(text).slice(0, max).join('');
};

export const remainingCommentChars = (text: string, max = MAX_COMMENT_CHARS) =>
  Math.max(0, max - countCommentChars(text));

export const roundCoordinate = (value: number | null, digits = 5) => {
  if (value === null || Number.isNaN(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const splitTagInput = (value: string) =>
  value
    .split(/[\n,]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

export const normalizeTags = (tags?: string[]) => {
  if (!tags) return [];
  const seen = new Set<string>();
  const normalized: string[] = [];
  tags.forEach((tag) => {
    if (typeof tag !== 'string') return;
    const token = tag.trim();
    if (token.length === 0) return;
    const key = token.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push(token);
  });
  return normalized;
};

const weatherValues: WeatherType[] = ['none', 'sunny', 'cloudy', 'rainy', 'snowy'];

export const normalizeWeather = (value: string | WeatherType): WeatherType => {
  if (weatherValues.includes(value as WeatherType)) return value as WeatherType;
  return 'none';
};

const addressSources: AddressSource[] = ['auto', 'manual', 'none'];

export const normalizeAddressSource = (
  value?: string | AddressSource | null,
): AddressSource | null => {
  if (value == null) return null;
  if (addressSources.includes(value as AddressSource)) return value as AddressSource;
  return null;
};
