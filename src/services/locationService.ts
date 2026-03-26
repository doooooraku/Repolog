import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import { Platform } from 'react-native';
import { formatAddress as formatLocalizedAddress } from 'localized-address-format';

import { roundCoordinate } from '@/src/features/reports/reportUtils';

export type LocationResult = {
  lat: number;
  lng: number;
  latLngCapturedAt: string;
  address: string | null;
  addressLocale: string | null;
};

export type LocationFailureReason = 'permission' | 'unavailable' | 'error';

export type LocationResponse =
  | { ok: true; data: LocationResult }
  | { ok: false; reason: LocationFailureReason; error?: unknown };

const CJK_LANGUAGES = new Set(['ja', 'ko', 'zh']);

/**
 * Remove country name from the beginning or end of an address string.
 * Only removes when bounded by a separator (", " or "、" or leading/trailing).
 */
export function stripCountryName(address: string, country: string | null): string {
  if (!country || !address) return address;
  const trimmed = country.trim();
  if (!trimmed) return address;

  // Leading: "日本、..." or "Japan, ..."
  const leadingPatterns = [`${trimmed}、`, `${trimmed}, `, `${trimmed} `];
  for (const prefix of leadingPatterns) {
    if (address.startsWith(prefix)) {
      return address.slice(prefix.length).trim();
    }
  }

  // Trailing: "..., Japan" or "...、日本"
  const trailingPatterns = [`, ${trimmed}`, `、${trimmed}`];
  for (const suffix of trailingPatterns) {
    if (address.endsWith(suffix)) {
      return address.slice(0, -suffix.length).trim();
    }
  }

  return address;
}

/**
 * Build addressLines from Expo geocode fields.
 * Combines street, streetNumber, and name while deduplicating overlapping values.
 */
function buildAddressLines(geo: Location.LocationGeocodedAddress): string[] {
  const parts: string[] = [];

  const street = geo.street?.trim() ?? '';
  const streetNumber = (geo as Record<string, unknown>).streetNumber as string | null;
  const num = streetNumber?.trim() ?? '';
  const name = geo.name?.trim() ?? '';

  if (street && num && !street.includes(num)) {
    parts.push(`${street} ${num}`);
  } else if (street) {
    parts.push(street);
  }

  if (name && name !== street && !street.includes(name) && !name.includes(street)) {
    parts.push(name);
  } else if (name && !street) {
    parts.push(name);
  }

  return parts;
}

/**
 * Format address using localized-address-format library (Google libaddressinput data).
 * Returns a single-line string or null.
 */
function formatWithLibrary(geo: Location.LocationGeocodedAddress): string | null {
  const countryCode = (geo as Record<string, unknown>).isoCountryCode as string | null;
  if (!countryCode) return null;

  const lang = Localization.getLocales()?.[0]?.languageCode;
  const isCjk = lang != null && CJK_LANGUAGES.has(lang);
  const scriptType = isCjk ? 'local' : 'local';

  const lines = formatLocalizedAddress(
    {
      postalCountry: countryCode.toUpperCase(),
      administrativeArea: geo.region ?? undefined,
      locality: geo.city ?? undefined,
      dependentLocality: geo.district ?? undefined,
      postalCode: geo.postalCode ?? undefined,
      addressLines: buildAddressLines(geo),
    },
    scriptType,
  );

  if (lines.length === 0) return null;

  const joiner = isCjk ? ' ' : ', ';
  return lines.join(joiner);
}

/**
 * Legacy fallback: comma-separated address parts with CJK-aware ordering.
 */
function formatLegacy(geo: Location.LocationGeocodedAddress): string | null {
  const lang = Localization.getLocales()?.[0]?.languageCode;
  const isCjk = lang != null && CJK_LANGUAGES.has(lang);
  const parts = isCjk
    ? [geo.country, geo.postalCode, geo.region, geo.city, geo.name, geo.street]
    : [geo.street, geo.name, geo.city, geo.region, geo.postalCode, geo.country];
  const filtered = parts.filter((part) => typeof part === 'string' && part.trim().length > 0);
  if (filtered.length === 0) return null;
  return Array.from(new Set(filtered)).join(', ');
}

/**
 * Format address with hybrid approach:
 * 1. Android: use formattedAddress (Google pre-formatted) with country name stripped
 * 2. localized-address-format library (Google libaddressinput data)
 * 3. Legacy fallback (comma-separated)
 */
export const formatAddress = (value?: Location.LocationGeocodedAddress | null): string | null => {
  if (!value) return null;

  // Priority 1: Android formattedAddress (pre-formatted by Google Play Services)
  if (Platform.OS === 'android') {
    const formatted = (value as Record<string, unknown>).formattedAddress as string | null;
    if (formatted && formatted.trim().length > 0) {
      return stripCountryName(formatted.trim(), value.country);
    }
  }

  // Priority 2: localized-address-format library
  const libraryResult = formatWithLibrary(value);
  if (libraryResult) return libraryResult;

  // Priority 3: Legacy fallback
  return formatLegacy(value);
};

export async function getCurrentLocationWithAddress(): Promise<LocationResponse> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      return { ok: false, reason: 'permission' };
    }

    let position: Location.LocationObject | null = null;
    try {
      position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    } catch {
      position = await Location.getLastKnownPositionAsync({
        maxAge: 1000 * 60 * 5,
        requiredAccuracy: 100,
      });
    }

    if (!position) {
      return { ok: false, reason: 'unavailable' };
    }

    const lat = roundCoordinate(position.coords.latitude);
    const lng = roundCoordinate(position.coords.longitude);
    if (lat == null || lng == null) {
      return { ok: false, reason: 'unavailable' };
    }

    let address: string | null = null;
    let addressLocale: string | null = null;
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      address = formatAddress(geocode?.[0]);
      addressLocale = Localization.getLocales()?.[0]?.languageTag ?? null;
    } catch {
      address = null;
      addressLocale = null;
    }

    return {
      ok: true,
      data: {
        lat,
        lng,
        latLngCapturedAt: new Date().toISOString(),
        address,
        addressLocale,
      },
    };
  } catch (error) {
    return { ok: false, reason: 'error', error };
  }
}
