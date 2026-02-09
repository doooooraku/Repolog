import { Linking } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_PRIVACY_URL = 'https://doooooraku.github.io/Repolog/privacy/';
const DEFAULT_TERMS_URL = 'https://doooooraku.github.io/Repolog/terms/';

export type LegalLinks = {
  privacyUrl: string;
  termsUrl: string;
};

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

const resolveUrl = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (!isHttpUrl(trimmed)) return fallback;
  return trimmed;
};

export function getLegalLinks(extra?: Record<string, unknown>): LegalLinks {
  const expoConfig = Constants.expoConfig ?? Constants.manifest;
  const configExtra = ((expoConfig as { extra?: Record<string, unknown> } | null)?.extra ??
    {}) as Record<string, unknown>;
  const source = extra ?? configExtra;

  return {
    privacyUrl: resolveUrl(source.LEGAL_PRIVACY_URL, DEFAULT_PRIVACY_URL),
    termsUrl: resolveUrl(source.LEGAL_TERMS_URL, DEFAULT_TERMS_URL),
  };
}

export async function openExternalLink(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
