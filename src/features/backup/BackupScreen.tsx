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

import { useTranslation } from '@/src/core/i18n/i18n';
import { BackupError, exportBackup, importBackup } from '@/src/features/backup/backupService';

export default function BackupScreen() {
  const router = useRouter();
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t.backupTitle}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.backupExportTitle}</Text>
        <Text style={styles.sectionBody}>{t.backupExportDesc}</Text>
        <Pressable
          onPress={handleExport}
          style={[styles.primaryButton, exporting && styles.disabledButton]}
          disabled={exporting || importing}>
          {exporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{t.backupExportAction}</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.backupImportTitle}</Text>
        <Text style={styles.sectionBody}>{t.backupImportDesc}</Text>
        <Pressable
          onPress={handleImport}
          style={[styles.secondaryButton, importing && styles.disabledButton]}
          disabled={exporting || importing}>
          {importing ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.secondaryButtonText}>{t.backupImportAction}</Text>
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
