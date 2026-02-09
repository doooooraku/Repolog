import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { AdBanner } from '@/components/ad-banner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from '@/src/core/i18n/i18n';
import { deleteReport, searchReportsWithFilters, updateReport } from '@/src/db/reportRepository';
import {
  countPhotosByReportIds,
  deletePhotosByReport,
  getFirstPhotosByReportIds,
} from '@/src/db/photoRepository';
import { buildTimelineSections } from '@/src/features/reports/reportListUtils';
import { normalizeTags, splitTagInput } from '@/src/features/reports/reportUtils';
import { removeReportPhotos } from '@/src/services/photoService';
import { useProStore } from '@/src/stores/proStore';
import type { Report } from '@/src/types/models';

type ReportMeta = {
  firstPhotoUri?: string;
  photoCount?: number;
};

const sanitizeTestIdToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isPro = useProStore((s) => s.isPro);
  const proInitialized = useProStore((s) => s.initialized);
  const initPro = useProStore((s) => s.init);
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterTagInput, setFilterTagInput] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [meta, setMeta] = useState<Record<string, ReportMeta>>({});
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchReportsWithFilters({
        query,
        fromDate,
        toDate,
        tags: filterTags,
        pinnedOnly,
      });
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
    } catch {
      setReports([]);
      setMeta({});
      Alert.alert(t.errorLoadFailed);
    } finally {
      setLoading(false);
    }
  }, [query, fromDate, toDate, filterTags, pinnedOnly, t.errorLoadFailed]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  useEffect(() => {
    void initPro();
  }, [initPro]);

  const sections = useMemo(
    () => buildTimelineSections(reports, '', t.homePinnedSection),
    [reports, t.homePinnedSection],
  );

  const hasActiveFilters =
    fromDate.trim().length > 0 ||
    toDate.trim().length > 0 ||
    pinnedOnly ||
    filterTags.length > 0;

  const handleAddFilterTags = useCallback(() => {
    const next = normalizeTags([...filterTags, ...splitTagInput(filterTagInput)]);
    if (next.length === filterTags.length) {
      setFilterTagInput('');
      return;
    }
    setFilterTags(next);
    setFilterTagInput('');
  }, [filterTagInput, filterTags]);

  const handleRemoveFilterTag = useCallback((tag: string) => {
    const target = tag.trim().toLowerCase();
    setFilterTags((current) => current.filter((item) => item.trim().toLowerCase() !== target));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFromDate('');
    setToDate('');
    setPinnedOnly(false);
    setFilterTags([]);
    setFilterTagInput('');
  }, []);

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

  const renderItem = ({ item, index }: { item: Report; index: number }) => {
    const summary = meta[item.id] ?? {};
    return (
      <Pressable
        testID={`e2e_home_report_card_${index}`}
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
              {/* Keep count explicit for E2E assertions. */}
              {summary.photoCount ?? 0} {t.reportPhotosLabel}
            </Text>
            <Text testID={`e2e_home_report_${index}_photo_count_${summary.photoCount ?? 0}`} />
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
    <View style={styles.container} testID="e2e_home_screen">
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t.homeTitle}</Text>
        <Pressable
          testID="e2e_open_settings"
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
      <View style={styles.filterPanel}>
        <Text style={styles.filterTitle}>{t.homeFiltersTitle}</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterColumn}>
            <Text style={styles.filterLabel}>{t.homeFilterFromLabel}</Text>
            <TextInput
              testID="e2e_home_filter_from"
              value={fromDate}
              onChangeText={setFromDate}
              placeholder={t.homeFilterDatePlaceholder}
              style={styles.filterInput}
            />
          </View>
          <View style={styles.filterColumn}>
            <Text style={styles.filterLabel}>{t.homeFilterToLabel}</Text>
            <TextInput
              testID="e2e_home_filter_to"
              value={toDate}
              onChangeText={setToDate}
              placeholder={t.homeFilterDatePlaceholder}
              style={styles.filterInput}
            />
          </View>
        </View>
        <View style={styles.filterTagInputRow}>
          <TextInput
            testID="e2e_home_filter_tags_input"
            value={filterTagInput}
            onChangeText={setFilterTagInput}
            onSubmitEditing={handleAddFilterTags}
            placeholder={t.homeFilterTagPlaceholder}
            style={[styles.filterInput, styles.filterTagInput]}
            returnKeyType="done"
          />
          <Pressable
            testID="e2e_home_filter_tags_add"
            onPress={handleAddFilterTags}
            style={styles.filterTagAddButton}>
            <Text style={styles.filterTagAddText}>{t.addTagAction}</Text>
          </Pressable>
        </View>
        {filterTags.length > 0 && (
          <View style={styles.filterTagsWrap}>
            {filterTags.map((tag) => (
              <Pressable
                key={tag}
                testID={`e2e_home_filter_tag_${sanitizeTestIdToken(tag)}`}
                onPress={() => handleRemoveFilterTag(tag)}
                style={styles.filterTagChip}>
                <Text style={styles.filterTagChipText}>{tag}</Text>
                <Text style={styles.filterTagChipRemove}>×</Text>
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.filterSwitchRow}>
          <Text style={styles.filterLabel}>{t.homeFilterPinnedOnlyLabel}</Text>
          <Switch testID="e2e_home_filter_pinned_only" value={pinnedOnly} onValueChange={setPinnedOnly} />
        </View>
        {hasActiveFilters && (
          <Pressable
            testID="e2e_home_filter_reset"
            onPress={handleResetFilters}
            style={styles.filterResetButton}>
            <Text style={styles.filterResetText}>{t.homeFilterResetAction}</Text>
          </Pressable>
        )}
      </View>
      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t.homeEmptyTitle}</Text>
          <Text style={styles.emptyBody}>{t.homeEmptyBody}</Text>
          <Pressable
            testID="e2e_home_create_report"
            style={styles.newButton}
            onPress={() => router.push('/reports/new')}>
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
  filterPanel: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterColumn: {
    flex: 1,
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    color: '#4b5563',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#f9fafb',
    color: '#111',
  },
  filterTagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTagInput: {
    flex: 1,
  },
  filterTagAddButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  filterTagAddText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  filterTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
  },
  filterTagChipText: {
    fontSize: 12,
    color: '#111827',
  },
  filterTagChipRemove: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  filterSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filterResetButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterResetText: {
    fontSize: 12,
    color: '#374151',
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
