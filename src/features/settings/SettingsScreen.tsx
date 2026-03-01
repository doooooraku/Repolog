import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation, type Lang, type TranslationKey } from '@/src/core/i18n/i18n';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useProStore } from '@/src/stores/proStore';
import { getLegalLinks, openExternalLink } from '@/src/services/legalService';
import { showAdPrivacyOptionsForm } from '@/src/services/adService';
import { useAppTheme } from '@/hooks/useAppTheme';

const LANGUAGE_OPTIONS: { code: Lang; labelKey: TranslationKey }[] = [
  { code: 'en', labelKey: 'languageNameEn' },
  { code: 'ja', labelKey: 'languageNameJa' },
  { code: 'fr', labelKey: 'languageNameFr' },
  { code: 'es', labelKey: 'languageNameEs' },
  { code: 'de', labelKey: 'languageNameDe' },
  { code: 'it', labelKey: 'languageNameIt' },
  { code: 'pt', labelKey: 'languageNamePt' },
  { code: 'ru', labelKey: 'languageNameRu' },
  { code: 'zh-Hans', labelKey: 'languageNameZhHans' },
  { code: 'zh-Hant', labelKey: 'languageNameZhHant' },
  { code: 'ko', labelKey: 'languageNameKo' },
  { code: 'th', labelKey: 'languageNameTh' },
  { code: 'id', labelKey: 'languageNameId' },
  { code: 'vi', labelKey: 'languageNameVi' },
  { code: 'hi', labelKey: 'languageNameHi' },
  { code: 'tr', labelKey: 'languageNameTr' },
  { code: 'nl', labelKey: 'languageNameNl' },
  { code: 'pl', labelKey: 'languageNamePl' },
  { code: 'sv', labelKey: 'languageNameSv' },
];

const toLangTestId = (code: string) => code.toLowerCase().replace(/-/g, '_');

export default function SettingsScreen() {
  const router = useRouter();
  const { t, lang, setLang } = useTranslation();
  const { colors } = useAppTheme();
  const includeLocation = useSettingsStore((s) => s.includeLocation);
  const setIncludeLocation = useSettingsStore((s) => s.setIncludeLocation);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const restorePurchases = useProStore((s) => s.restore);

  const [showLanguages, setShowLanguages] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [openingAdPrivacyOptions, setOpeningAdPrivacyOptions] = useState(false);

  const currentLanguageLabel = useMemo(() => {
    const matched = LANGUAGE_OPTIONS.find((option) => option.code === lang);
    if (!matched) return lang;
    return t[matched.labelKey] ?? matched.code;
  }, [lang, t]);
  const legalLinks = useMemo(() => getLegalLinks(), []);

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const result = await restorePurchases();
      Alert.alert(result.hasActive ? t.restoreSuccess : t.restoreNotFound);
    } catch {
      Alert.alert(t.restoreFailed);
    } finally {
      setRestoring(false);
    }
  };

  const handleOpenLegal = async (url: string) => {
    const opened = await openExternalLink(url);
    if (!opened) {
      Alert.alert(t.legalOpenFailed);
    }
  };

  const handleOpenAdPrivacyOptions = async () => {
    if (openingAdPrivacyOptions) return;
    setOpeningAdPrivacyOptions(true);
    try {
      const shown = await showAdPrivacyOptionsForm();
      if (!shown) {
        Alert.alert(t.adPrivacyOptionsUnavailable);
      }
    } catch {
      Alert.alert(t.adPrivacyOptionsFailed);
    } finally {
      setOpeningAdPrivacyOptions(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.screenBgAlt }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.screenBgAlt }]} testID="e2e_settings_screen">
        <View style={styles.headerRow}>
          <Pressable testID="e2e_back_home" onPress={() => router.back()} style={[styles.backButton, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }]}>
            <Text style={[styles.backText, { color: colors.textSecondary }]}>{'‹'}</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t.settings}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.settingsSectionGeneral}</Text>
          <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t.languageChange}</Text>
          <Pressable
            testID="e2e_language_toggle"
            onPress={() => setShowLanguages((prev) => !prev)}
            style={styles.rowBetween}>
            <Text
              style={[styles.valueText, { color: colors.textPrimary }]}
              testID={`e2e_current_language_${toLangTestId(lang)}`}>{`${t.currentLanguage}: ${currentLanguageLabel}`}</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>{showLanguages ? '▲' : '▼'}</Text>
          </Pressable>
          {showLanguages && (
            <View style={[styles.optionList, { borderColor: colors.borderLight }]}>
              {LANGUAGE_OPTIONS.map((option) => {
                const active = option.code === lang;
                return (
                  <Pressable
                    key={option.code}
                    testID={`e2e_language_option_${toLangTestId(option.code)}`}
                    onPress={() => setLang(option.code)}
                    style={[styles.optionRow, { borderBottomColor: colors.borderLight }, active && { backgroundColor: colors.surfaceHighlight }]}>
                    <Text style={[styles.optionText, { color: colors.textSecondary }, active && { fontWeight: '600', color: colors.textPrimary }]}>
                      {t[option.labelKey] ?? option.code}
                    </Text>
                    {active && (
                      <Text
                        style={[styles.optionCheck, { color: colors.textPrimary }]}
                        testID={`e2e_language_selected_${toLangTestId(option.code)}`}>
                        ✓
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.theme}</Text>
          <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t.themeDesc}</Text>
          <View style={styles.themeRow}>
            {(['light', 'dark'] as const).map((mode) => {
              const active = themeMode === mode;
              const label = mode === 'light' ? t.themeLightLabel : t.themeDarkLabel;
              return (
                <Pressable
                  key={mode}
                  testID={`e2e_theme_${mode}`}
                  onPress={() => setThemeMode(mode)}
                  style={[
                    styles.themeOption,
                    { borderColor: colors.borderDefault, backgroundColor: colors.surfaceBg },
                    active && { borderColor: colors.primaryBg, backgroundColor: colors.surfaceHighlight },
                  ]}>
                  <Text style={[styles.themeOptionText, { color: colors.textSecondary }, active && { fontWeight: '600', color: colors.textPrimary }]}>
                    {label}
                  </Text>
                  {active && <Text style={[styles.optionCheck, { color: colors.textPrimary }]}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.settingsSectionPrivacy}</Text>
          <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t.includeLocationHelp}</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.valueText, { color: colors.textPrimary }]}>{t.includeLocationLabel}</Text>
            <Switch value={includeLocation} onValueChange={setIncludeLocation} />
          </View>
          <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t.adPrivacyOptionsHelp}</Text>
          <Pressable
            testID="e2e_open_ad_privacy_options"
            onPress={() => {
              void handleOpenAdPrivacyOptions();
            }}
            style={[styles.secondaryButton, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }, openingAdPrivacyOptions && styles.disabledButton]}
            disabled={openingAdPrivacyOptions}>
            {openingAdPrivacyOptions ? (
              <ActivityIndicator />
            ) : (
              <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>{t.adPrivacyOptionsAction}</Text>
            )}
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.settingsSectionPurchases}</Text>
          <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t.restoreDesc}</Text>
          <Pressable
            onPress={handleRestore}
            style={[styles.primaryButton, { backgroundColor: colors.primaryBg }, restoring && styles.disabledButton]}
            disabled={restoring}>
            {restoring ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{t.restore}</Text>
            )}
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.settingsSectionBackup}</Text>
          <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t.settingsBackupDesc}</Text>
          <Pressable onPress={() => router.push('/backup')} style={[styles.secondaryButton, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }]}>
            <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>{t.settingsBackupOpen}</Text>
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.legalSectionTitle}</Text>
          <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t.settingsLegalDesc}</Text>
          <Pressable
            onPress={() => {
              void handleOpenLegal(legalLinks.privacyUrl);
            }}
            style={[styles.secondaryButton, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }]}>
            <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>{t.legalPrivacyPolicyLabel}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void handleOpenLegal(legalLinks.termsUrl);
            }}
            style={[styles.secondaryButton, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }]}>
            <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>{t.legalTermsOfUseLabel}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  valueText: {
    fontSize: 13,
  },
  chevron: {
    fontSize: 12,
  },
  optionList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 13,
  },
  optionCheck: {
    fontSize: 12,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
