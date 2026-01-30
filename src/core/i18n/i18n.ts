import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import baseEn, { type TranslationKey } from './locales/en';
import ja from './locales/ja';
import fr from './locales/fr';
import es from './locales/es';
import de from './locales/de';
import it from './locales/it';
import pt from './locales/pt';
import ru from './locales/ru';
import zhHans from './locales/zhHans';
import zhHant from './locales/zhHant';
import ko from './locales/ko';
import hi from './locales/hi';
import id from './locales/id';
import th from './locales/th';
import vi from './locales/vi';
import tr from './locales/tr';
import nl from './locales/nl';
import sv from './locales/sv';

const dictionaries = {
  en: baseEn,
  ja,
  fr,
  es,
  de,
  it,
  pt,
  ru,
  zhHans,
  zhHant,
  ko,
  hi,
  id,
  th,
  vi,
  tr,
  nl,
  sv,
} satisfies Record<string, Partial<Record<TranslationKey, string>>>;

export type Lang = keyof typeof dictionaries;

const isSupportedLang = (code?: string): code is Lang => {
  if (!code) return false;
  return code in dictionaries;
};

const normalizeLang = (
  rawCode?: string,
  tag?: string,
  script?: string | null,
  region?: string | null,
): Lang => {
  if (rawCode && isSupportedLang(rawCode)) return rawCode;

  const code = rawCode?.toLowerCase();
  const tagLower = tag?.toLowerCase();
  const regionUpper = region?.toUpperCase();

  if (code === 'zh' || tagLower?.startsWith('zh')) {
    const isHant =
      tagLower?.includes('hant') ||
      script === 'Hant' ||
      (regionUpper != null && ['TW', 'HK', 'MO'].includes(regionUpper));
    return isHant ? 'zhHant' : 'zhHans';
  }

  if (code === 'ms') return 'zhHans';

  if (code && isSupportedLang(code)) return code;

  return 'en';
};

const detectInitialLang = (): Lang => {
  try {
    const locales = Localization.getLocales();
    const primary = locales?.[0];
    return normalizeLang(
      primary?.languageCode,
      primary?.languageTag,
      primary?.languageScriptCode,
      primary?.regionCode,
    );
  } catch {
    return 'en';
  }
};

type I18nState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      lang: detectInitialLang(),
      setLang: (lang) => set({ lang: normalizeLang(lang) }),
    }),
    {
      name: 'app-template-i18n',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const normalized = normalizeLang(state.lang);
        if (state.lang !== normalized) {
          state.setLang(normalized);
        }
      },
    },
  ),
);

export function useTranslation() {
  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);
  const t = (key: TranslationKey) => dictionaries[lang][key] ?? baseEn[key] ?? key;
  return { t, lang, setLang };
}

export function setLang(lang: Lang) {
  useI18nStore.getState().setLang(lang);
}

export function getLang(): Lang {
  return useI18nStore.getState().lang;
}

export function tAll() {
  const lang = useI18nStore.getState().lang;
  return { ...baseEn, ...dictionaries[lang] };
}

export function t(key: TranslationKey) {
  const lang = useI18nStore.getState().lang;
  return dictionaries[lang][key] ?? baseEn[key] ?? key;
}

export { TranslationKey };
