import * as Location from 'expo-location';
import * as Localization from 'expo-localization';

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

const formatAddress = (value?: Location.LocationGeocodedAddress | null) => {
  if (!value) return null;
  const lang = Localization.getLocales()?.[0]?.languageCode;
  const isCjk = lang != null && CJK_LANGUAGES.has(lang);
  const parts = isCjk
    ? [value.country, value.postalCode, value.region, value.city, value.name, value.street]
    : [value.street, value.name, value.city, value.region, value.postalCode, value.country];
  const filtered = parts.filter((part) => typeof part === 'string' && part.trim().length > 0);
  if (filtered.length === 0) return null;
  return Array.from(new Set(filtered)).join(', ');
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
