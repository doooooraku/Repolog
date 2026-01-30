import type { ConfigContext, ExpoConfig } from 'expo/config';

import 'dotenv/config';

const BILLING_PERMISSION = 'com.android.vending.BILLING';

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
      supportsRTL,
      forcesRTL,
    },
    plugins: pluginsWithLocalization,
  };
};
