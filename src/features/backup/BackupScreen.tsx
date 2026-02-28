import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslation } from '@/src/core/i18n/i18n';
import { BackupError, exportBackup, importBackup } from '@/src/features/backup/backupService';

export default function BackupScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    if (exporting || importing) return;
    setExporting(true);
    try {
      await exportBackup();
      Alert.alert(t.backupExportSuccess);
    } catch (error) {
      if (error instanceof BackupError && error.code === 'unsupported') {
        Alert.alert(t.backupUnsupportedTitle, t.backupUnsupportedBody);
      } else if (error instanceof BackupError && error.code === 'share') {
        Alert.alert(t.backupShareUnavailableTitle, t.backupShareUnavailableBody);
      } else {
        Alert.alert(t.backupExportFailed);
      }
    } finally {
      setExporting(false);
    }
  };

  const executeImport = async () => {
    setImporting(true);
    try {
      const result = await importBackup();
      if (!result) return;
      Alert.alert(
        t.backupImportSuccess,
        t.backupImportSuccessDetail
          .replace('{reports}', String(result.reports))
          .replace('{photos}', String(result.photos)),
      );
    } catch (error) {
      if (error instanceof BackupError && error.code === 'schema') {
        Alert.alert(t.backupSchemaMismatchTitle, t.backupSchemaMismatchBody);
      } else if (error instanceof BackupError && error.code === 'invalid') {
        Alert.alert(t.backupInvalidTitle, t.backupInvalidBody);
      } else if (error instanceof BackupError && error.code === 'unsupported') {
        Alert.alert(t.backupUnsupportedTitle, t.backupUnsupportedBody);
      } else {
        Alert.alert(t.backupImportFailed);
      }
    } finally {
      setImporting(false);
    }
  };

  const handleImport = () => {
    if (exporting || importing) return;
    Alert.alert(t.backupImportWarningTitle, t.backupImportWarningBody, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.backupImportAction,
        onPress: () => {
          void executeImport();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.screenBgAlt }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }]}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t.backupTitle}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.backupExportTitle}</Text>
        <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t.backupExportDesc}</Text>
        <Pressable
          onPress={handleExport}
          style={[styles.primaryButton, { backgroundColor: colors.primaryBg }, exporting && styles.disabledButton]}
          disabled={exporting || importing}>
          {exporting ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{t.backupExportAction}</Text>
          )}
        </Pressable>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.backupImportTitle}</Text>
        <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t.backupImportDesc}</Text>
        <Pressable
          onPress={handleImport}
          style={[styles.secondaryButton, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }, importing && styles.disabledButton]}
          disabled={exporting || importing}>
          {importing ? (
            <ActivityIndicator />
          ) : (
            <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>{t.backupImportAction}</Text>
          )}
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
