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
  'pl',
  'sv',
];

// Android aapt resource qualifiers cannot use raw script tags (e.g. zh-Hans).
// Use BCP47 "b+..." qualifiers for script variants.
const toAndroidLocaleQualifier = (locale: string): string => {
  if (locale === 'zh-Hans') return 'b+zh+Hans';
  if (locale === 'zh-Hant') return 'b+zh+Hant';
  return locale;
};

const ANDROID_SUPPORTED_LOCALES = SUPPORTED_LOCALES.map(toAndroidLocaleQualifier);

const toBoolean = (value?: string) =>
  value === '1' || value === 'true' || value === 'TRUE';

type ExpoPluginList = NonNullable<ExpoConfig['plugins']>;
type ExpoPluginEntry = ExpoPluginList[number];

const ensurePlugin = (plugins: ExpoPluginList = [], name: string, config?: unknown): ExpoPluginList => {
  const exists = plugins.some((plugin) => {
    if (Array.isArray(plugin)) return plugin[0] === name;
    return plugin === name;
  });
  if (exists) return plugins;
  if (config === undefined) {
    return [...plugins, name];
  }
  const pluginWithConfig: ExpoPluginEntry = [name, config];
  return [...plugins, pluginWithConfig];
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
  const admobConsentDebugGeography = process.env.ADMOB_CONSENT_DEBUG_GEOGRAPHY ?? '';
  const admobConsentTestDeviceIds = process.env.ADMOB_CONSENT_TEST_DEVICE_IDS ?? '';
  const delayAppMeasurementInit = !toBoolean(
    process.env.ADMOB_DISABLE_DELAY_APP_MEASUREMENT_INIT,
  );
  const userTrackingUsageDescription =
    process.env.ADMOB_USER_TRACKING_USAGE_DESCRIPTION ??
    'This identifier will be used to deliver relevant ads to Free plan users.';

  const pluginsWithLocalization = ensurePlugin(
    config.plugins,
    'expo-localization',
    {
      supportedLocales: {
        ios: SUPPORTED_LOCALES,
        android: ANDROID_SUPPORTED_LOCALES,
      },
    },
  );

  const pluginsWithBuildProps = ensurePlugin(
    pluginsWithLocalization,
    'expo-build-properties',
    {
      ios: {
        deploymentTarget: '15.5',
      },
    },
  );

  const pluginsWithAdMob = ensurePlugin(
    pluginsWithBuildProps,
    'react-native-google-mobile-ads',
    {
      androidAppId: admobAndroidAppId,
      iosAppId: admobIosAppId,
      delayAppMeasurementInit,
      userTrackingUsageDescription,
    },
  );

  return {
    ...config,
    name: config.name ?? 'Repolog',
    slug: config.slug ?? 'repolog',
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
      ADMOB_CONSENT_DEBUG_GEOGRAPHY: admobConsentDebugGeography,
      ADMOB_CONSENT_TEST_DEVICE_IDS: admobConsentTestDeviceIds,
      LEGAL_PRIVACY_URL:
        process.env.LEGAL_PRIVACY_URL ?? 'https://doooooraku.github.io/Repolog/privacy/',
      LEGAL_TERMS_URL:
        process.env.LEGAL_TERMS_URL ?? 'https://doooooraku.github.io/Repolog/terms/',
      supportsRTL,
      forcesRTL,
    },
    plugins: pluginsWithAdMob,
  };
};
