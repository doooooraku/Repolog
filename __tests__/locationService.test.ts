// Mock native modules before any imports
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Keyboard: { dismiss: jest.fn() },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'ja', languageTag: 'ja-JP' }],
}));

jest.mock('localized-address-format', () => ({
  formatAddress: jest.fn((address: Record<string, unknown>) => {
    const country = address.postalCountry as string;
    const postalCode = address.postalCode as string | undefined;
    const adminArea = address.administrativeArea as string | undefined;
    const locality = address.locality as string | undefined;
    const lines = (address.addressLines ?? []) as string[];

    if (country === 'JP') {
      const parts: string[] = [];
      if (postalCode) parts.push(`〒${postalCode}`);
      if (adminArea) parts.push(adminArea);
      if (locality) parts.push(locality);
      parts.push(...lines);
      return parts.length > 0 ? [parts.join('')] : [];
    }

    if (country === 'US') {
      const result: string[] = [];
      if (lines.length > 0) result.push(lines.join(', '));
      const cityStateLine = [locality, adminArea, postalCode].filter(Boolean).join(', ');
      if (cityStateLine) result.push(cityStateLine);
      return result.length > 0 ? result : [];
    }

    const result: string[] = [];
    if (lines.length > 0) result.push(lines.join(', '));
    const rest = [locality, adminArea, postalCode].filter(Boolean).join(', ');
    if (rest) result.push(rest);
    return result.length > 0 ? result : [];
  }),
}));

import { stripCountryName, formatAddress } from '@/src/services/locationService';

describe('stripCountryName', () => {
  test('removes leading country with Japanese separator', () => {
    expect(stripCountryName('日本、〒150-0043 東京都渋谷区', '日本')).toBe(
      '〒150-0043 東京都渋谷区',
    );
  });

  test('removes trailing country with comma', () => {
    expect(stripCountryName('123 Main St, Springfield, Japan', 'Japan')).toBe(
      '123 Main St, Springfield',
    );
  });

  test('removes leading country with comma-space', () => {
    expect(stripCountryName('Japan, 150-0043, Tokyo', 'Japan')).toBe('150-0043, Tokyo');
  });

  test('does not remove country from middle of string', () => {
    expect(stripCountryName('日本橋1丁目, Tokyo', '日本')).toBe('日本橋1丁目, Tokyo');
  });

  test('returns original if country is null', () => {
    expect(stripCountryName('some address', null)).toBe('some address');
  });

  test('returns original if country is empty', () => {
    expect(stripCountryName('some address', '')).toBe('some address');
  });

  test('returns original if no match', () => {
    expect(stripCountryName('Tokyo, Shibuya', 'Japan')).toBe('Tokyo, Shibuya');
  });
});

describe('formatAddress', () => {
  test('returns null for null/undefined input', () => {
    expect(formatAddress(null)).toBeNull();
    expect(formatAddress(undefined)).toBeNull();
  });

  test('uses localized-address-format for JP on iOS', () => {
    const geo = {
      city: '渋谷区',
      country: '日本',
      district: null,
      isoCountryCode: 'JP',
      name: '道玄坂1丁目',
      postalCode: '150-0043',
      region: '東京都',
      street: '道玄坂',
      streetNumber: null,
      subregion: null,
      timezone: null,
      formattedAddress: null,
    };
    const result = formatAddress(geo as never);
    expect(result).not.toBeNull();
    expect(result).toContain('〒150-0043');
    expect(result).toContain('東京都');
    expect(result).toContain('渋谷区');
  });

  test('falls back to legacy format when isoCountryCode is missing', () => {
    const geo = {
      city: 'Shibuya',
      country: 'Japan',
      district: null,
      isoCountryCode: null,
      name: 'Dogenzaka',
      postalCode: '150-0043',
      region: 'Tokyo',
      street: 'Dogenzaka',
      streetNumber: null,
      subregion: null,
      timezone: null,
      formattedAddress: null,
    };
    const result = formatAddress(geo as never);
    expect(result).not.toBeNull();
    expect(result).toContain('Japan');
    expect(result).toContain('Tokyo');
  });

  test('returns null when all fields are empty', () => {
    const geo = {
      city: null,
      country: null,
      district: null,
      isoCountryCode: null,
      name: null,
      postalCode: null,
      region: null,
      street: null,
      streetNumber: null,
      subregion: null,
      timezone: null,
      formattedAddress: null,
    };
    expect(formatAddress(geo as never)).toBeNull();
  });
});
