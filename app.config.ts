import type { ConfigContext, ExpoConfig } from 'expo/config';

import 'dotenv/config';

const BILLING_PERMISSION = 'com.android.vending.BILLING';
const ADMOB_TEST_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const ADMOB_TEST_APP_ID_IOS = 'ca-app-pub-3940256099942544~1458002511';

const SUPPORTED_LOCALES = [
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
  'sv',
];

const toBoolean = (value?: string) =>
  value === '1' || value === 'true' || value === 'TRUE';

const ensurePlugin = (plugins: ExpoConfig['plugins'] = [], name: string, config?: unknown) => {
  const exists = plugins.some((plugin) => {
    if (Array.isArray(plugin)) return plugin[0] === name;
    return plugin === name;
  });
  if (exists) return plugins;
  return config ? [...plugins, [name, config]] : [...plugins, name];
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const permissions = config.android?.permissions ?? [];
  const nextPermissions = permissions.includes(BILLING_PERMISSION)
    ? permissions
    : [...permissions, BILLING_PERMISSION];

  const supportsRTL = toBoolean(process.env.SUPPORTS_RTL);
  const forcesRTL = toBoolean(process.env.FORCES_RTL);

  const admobAndroidAppId = process.env.ADMOB_ANDROID_APP_ID ?? ADMOB_TEST_APP_ID_ANDROID;
  const admobIosAppId = process.env.ADMOB_IOS_APP_ID ?? ADMOB_TEST_APP_ID_IOS;

  const pluginsWithLocalization = ensurePlugin(
    config.plugins,
    'expo-localization',
    {
      supportedLocales: {
        ios: SUPPORTED_LOCALES,
        android: SUPPORTED_LOCALES,
      },
    },
  );

  const pluginsWithAdMob = ensurePlugin(
    pluginsWithLocalization,
    'react-native-google-mobile-ads',
    {
      androidAppId: admobAndroidAppId,
      iosAppId: admobIosAppId,
    },
  );

  return {
    ...config,
    android: {
      ...config.android,
      permissions: nextPermissions,
    },
    extra: {
      ...config.extra,
      REVENUECAT_IOS_API_KEY: process.env.REVENUECAT_IOS_API_KEY ?? '',
      REVENUECAT_ANDROID_API_KEY: process.env.REVENUECAT_ANDROID_API_KEY ?? '',
      IAP_DEBUG: process.env.IAP_DEBUG ?? '0',
      ADMOB_ANDROID_BANNER_ID: process.env.ADMOB_ANDROID_BANNER_ID ?? '',
      ADMOB_IOS_BANNER_ID: process.env.ADMOB_IOS_BANNER_ID ?? '',
      supportsRTL,
      forcesRTL,
    },
    plugins: pluginsWithAdMob,
  };
};
