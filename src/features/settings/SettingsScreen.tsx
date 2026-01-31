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

import { useTranslation, type Lang, type TranslationKey } from '@/src/core/i18n/i18n';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useProStore } from '@/src/stores/proStore';

const LANGUAGE_OPTIONS: { code: Lang; labelKey: TranslationKey }[] = [
  { code: 'en', labelKey: 'languageNameEn' },
  { code: 'ja', labelKey: 'languageNameJa' },
  { code: 'fr', labelKey: 'languageNameFr' },
  { code: 'es', labelKey: 'languageNameEs' },
  { code: 'de', labelKey: 'languageNameDe' },
  { code: 'it', labelKey: 'languageNameIt' },
  { code: 'pt', labelKey: 'languageNamePt' },
  { code: 'ru', labelKey: 'languageNameRu' },
  { code: 'zhHans', labelKey: 'languageNameZhHans' },
  { code: 'zhHant', labelKey: 'languageNameZhHant' },
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

export default function SettingsScreen() {
  const router = useRouter();
  const { t, lang, setLang } = useTranslation();
  const includeLocation = useSettingsStore((s) => s.includeLocation);
  const setIncludeLocation = useSettingsStore((s) => s.setIncludeLocation);
  const restorePurchases = useProStore((s) => s.restore);

  const [showLanguages, setShowLanguages] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const currentLanguageLabel = useMemo(() => {
    const matched = LANGUAGE_OPTIONS.find((option) => option.code === lang);
    if (!matched) return lang;
    return t[matched.labelKey] ?? matched.code;
  }, [lang, t]);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t.settings}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.settingsSectionGeneral}</Text>
        <Text style={styles.sectionBody}>{t.languageChange}</Text>
        <Pressable
          onPress={() => setShowLanguages((prev) => !prev)}
          style={styles.rowBetween}>
          <Text style={styles.valueText}>{`${t.currentLanguage}: ${currentLanguageLabel}`}</Text>
          <Text style={styles.chevron}>{showLanguages ? '▲' : '▼'}</Text>
        </Pressable>
        {showLanguages && (
          <View style={styles.optionList}>
            {LANGUAGE_OPTIONS.map((option) => {
              const active = option.code === lang;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => setLang(option.code)}
                  style={[styles.optionRow, active && styles.optionRowActive]}>
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {t[option.labelKey] ?? option.code}
                  </Text>
                  {active && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.settingsSectionPrivacy}</Text>
        <Text style={styles.sectionBody}>{t.includeLocationHelp}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.valueText}>{t.includeLocationLabel}</Text>
          <Switch value={includeLocation} onValueChange={setIncludeLocation} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.settingsSectionPurchases}</Text>
        <Text style={styles.sectionBody}>{t.restoreDesc}</Text>
        <Pressable
          onPress={handleRestore}
          style={[styles.primaryButton, restoring && styles.disabledButton]}
          disabled={restoring}>
          {restoring ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{t.restore}</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.settingsSectionBackup}</Text>
        <Text style={styles.sectionBody}>{t.settingsBackupDesc}</Text>
        <Pressable onPress={() => router.push('/backup')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{t.settingsBackupOpen}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
    backgroundColor: '#f6f6f6',
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
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  backText: {
    fontSize: 20,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  sectionBody: {
    fontSize: 13,
    color: '#666',
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
    color: '#222',
  },
  chevron: {
    fontSize: 12,
    color: '#666',
  },
  optionList: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionRowActive: {
    backgroundColor: '#f5f5f5',
  },
  optionText: {
    fontSize: 13,
    color: '#333',
  },
  optionTextActive: {
    fontWeight: '600',
    color: '#111',
  },
  optionCheck: {
    fontSize: 12,
    color: '#111',
  },
  primaryButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#111',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
