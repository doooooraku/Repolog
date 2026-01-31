import { Platform } from 'react-native';
import Constants from 'expo-constants';
import mobileAds, { TestIds } from 'react-native-google-mobile-ads';

let initialized = false;

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

function getExtraValue(key: string) {
  const expoConfig = Constants.expoConfig ?? Constants.manifest;
  const extra = (expoConfig as any)?.extra ?? {};
  return extra?.[key];
}

export function getBannerUnitId(): string | null {
  if (!isNative) return null;
  if (__DEV__) return TestIds.ADAPTIVE_BANNER;

  const key = Platform.OS === 'android' ? 'ADMOB_ANDROID_BANNER_ID' : 'ADMOB_IOS_BANNER_ID';
  const value = getExtraValue(key);
  if (!value || typeof value !== 'string') return null;
  if (!value.trim()) return null;
  return value;
}

export async function initializeAds(): Promise<void> {
  if (!isNative) return;
  if (initialized) return;
  await mobileAds().initialize();
  initialized = true;
}
