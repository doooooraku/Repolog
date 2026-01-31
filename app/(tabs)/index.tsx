import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { AdBanner } from '@/components/ad-banner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from '@/src/core/i18n/i18n';
import { deleteReport, listReports, searchReports, updateReport } from '@/src/db/reportRepository';
import {
  countPhotosByReportIds,
  deletePhotosByReport,
  getFirstPhotosByReportIds,
} from '@/src/db/photoRepository';
import { buildTimelineSections } from '@/src/features/reports/reportListUtils';
import { removeReportPhotos } from '@/src/services/photoService';
import { useProStore } from '@/src/stores/proStore';
import type { Report } from '@/src/types/models';

type ReportMeta = {
  firstPhotoUri?: string;
  photoCount?: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isPro = useProStore((s) => s.isPro);
  const proInitialized = useProStore((s) => s.initialized);
  const initPro = useProStore((s) => s.init);
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [meta, setMeta] = useState<Record<string, ReportMeta>>({});
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const data = query.trim() ? await searchReports(query) : await listReports();
    setReports(data);
    const ids = data.map((report) => report.id);
    const firstPhotos = await getFirstPhotosByReportIds(ids);
    const counts = await countPhotosByReportIds(ids);
    const nextMeta: Record<string, ReportMeta> = {};
    ids.forEach((id) => {
      nextMeta[id] = {
        firstPhotoUri: firstPhotos[id]?.localUri,
        photoCount: counts[id] ?? 0,
      };
    });
    setMeta(nextMeta);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  useEffect(() => {
    void initPro();
  }, [initPro]);

  const sections = useMemo(
    () => buildTimelineSections(reports, query, t.homePinnedSection),
    [reports, query, t.homePinnedSection],
  );

  const handleTogglePin = async (report: Report) => {
    await updateReport({ id: report.id, pinned: !report.pinned });
    await loadReports();
  };

  const handleDelete = async (report: Report) => {
    Alert.alert(t.deleteConfirmTitle, t.deleteConfirmBody, [
      { text: t.cancelAction, style: 'cancel' },
      {
        text: t.deleteAction,
        style: 'destructive',
        onPress: async () => {
          await removeReportPhotos(report.id);
          await deletePhotosByReport(report.id);
          await deleteReport(report.id);
          await loadReports();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Report }) => {
    const summary = meta[item.id] ?? {};
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/reports/${item.id}`)}>
        {summary.firstPhotoUri ? (
          <Image source={{ uri: summary.firstPhotoUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.reportName ?? t.reportUnnamed}
            </Text>
            <Pressable onPress={() => handleTogglePin(item)}>
              <Text style={styles.pinText}>{item.pinned ? '★' : '☆'}</Text>
            </Pressable>
          </View>
          <Text style={styles.cardSub}>{item.createdAt.replace('T', ' ').slice(0, 16)}</Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardMeta}>
              {summary.photoCount ?? 0} {t.reportPhotosLabel}
            </Text>
            <Pressable onPress={() => handleDelete(item)}>
              <Text style={styles.deleteText}>{t.deleteAction}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t.homeTitle}</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          style={styles.iconButton}>
          <IconSymbol name="gearshape.fill" size={20} color="#111" />
        </Pressable>
      </View>
      <TextInput
        placeholder={t.homeSearchPlaceholder}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t.homeEmptyTitle}</Text>
          <Text style={styles.emptyBody}>{t.homeEmptyBody}</Text>
          <Pressable style={styles.newButton} onPress={() => router.push('/reports/new')}>
            <Text style={styles.newButtonText}>{t.homeCreateReport}</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}
      {proInitialized && !isPro && <AdBanner />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f6f6',
  },
  list: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  search: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  thumbPlaceholder: {
    backgroundColor: '#e9e9e9',
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    flex: 1,
  },
  cardSub: {
    fontSize: 12,
    color: '#777',
  },
  cardMeta: {
    fontSize: 12,
    color: '#666',
  },
  pinText: {
    fontSize: 18,
    color: '#f59e0b',
  },
  deleteText: {
    fontSize: 12,
    color: '#ef4444',
  },
  empty: {
    marginTop: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  emptyBody: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  newButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111',
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
