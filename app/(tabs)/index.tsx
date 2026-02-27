import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  EllipsisVertical,
  Plus,
  Search,
  Settings,
  Sun,
} from '@tamagui/lucide-icons';
import type { IconProps } from '@tamagui/helpers-icon';

import { AdBanner } from '@/components/ad-banner';
import { useTranslation } from '@/src/core/i18n/i18n';
import { deleteReport, searchReportsWithFilters, updateReport } from '@/src/db/reportRepository';
import {
  countPhotosByReportIds,
  deletePhotosByReport,
  getFirstPhotosByReportIds,
} from '@/src/db/photoRepository';
import { removeReportPhotos } from '@/src/services/photoService';
import { useProStore } from '@/src/stores/proStore';
import type { Report } from '@/src/types/models';

type ReportMeta = {
  firstPhotoUri?: string;
  photoCount?: number;
};

type HomeFilter = 'all' | 'pinned' | 'week';

const TOUCH_HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 } as const;
const ICON_STROKE_WIDTH = 1.9;

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOffsetFromMonday = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - dayOffsetFromMonday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return {
    fromDate: formatLocalDate(weekStart),
    toDate: formatLocalDate(weekEnd),
  };
};

const weatherIconMap: Record<Report['weather'], ComponentType<IconProps>> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  none: Sun,
};

const weatherIconOpacityMap: Record<Report['weather'], number> = {
  sunny: 1,
  cloudy: 1,
  rainy: 1,
  snowy: 1,
  none: 0.45,
};

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isPro = useProStore((s) => s.isPro);
  const proInitialized = useProStore((s) => s.initialized);
  const initPro = useProStore((s) => s.init);

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<HomeFilter>('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [meta, setMeta] = useState<Record<string, ReportMeta>>({});
  const [loading, setLoading] = useState(true);

  const weekRange = useMemo(() => getCurrentWeekRange(), []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchReportsWithFilters({
        query,
        fromDate: activeFilter === 'week' ? weekRange.fromDate : '',
        toDate: activeFilter === 'week' ? weekRange.toDate : '',
        tags: [],
        pinnedOnly: activeFilter === 'pinned',
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
  }, [activeFilter, query, t.errorLoadFailed, weekRange.fromDate, weekRange.toDate]);

  useFocusEffect(
    useCallback(() => {
      void loadReports();
    }, [loadReports]),
  );

  useEffect(() => {
    void initPro();
  }, [initPro]);

  const handleTogglePin = useCallback(
    async (report: Report) => {
      try {
        await updateReport({ id: report.id, pinned: !report.pinned });
        await loadReports();
      } catch {
        Alert.alert(t.errorSaveFailed);
      }
    },
    [loadReports, t.errorSaveFailed],
  );

  const handleDelete = useCallback(
    async (report: Report) => {
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
    },
    [loadReports, t.cancelAction, t.deleteAction, t.deleteConfirmBody, t.deleteConfirmTitle],
  );

  const handleOpenCardMenu = useCallback(
    (report: Report) => {
      Alert.alert(report.reportName ?? t.reportUnnamed, undefined, [
        {
          text: t.homePinnedSection,
          onPress: () => {
            void handleTogglePin(report);
          },
        },
        {
          text: t.deleteAction,
          style: 'destructive',
          onPress: () => {
            void handleDelete(report);
          },
        },
        { text: t.cancelAction, style: 'cancel' },
      ]);
    },
    [handleDelete, handleTogglePin, t.cancelAction, t.deleteAction, t.homePinnedSection, t.reportUnnamed],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Report; index: number }) => {
      const summary = meta[item.id] ?? {};
      const WeatherIcon = weatherIconMap[item.weather];
      const commentText = item.comment?.trim().length ? item.comment.trim() : '-';
      const photoCount = summary.photoCount ?? 0;

      return (
        <Pressable
          testID={`e2e_home_report_card_${index}`}
          style={styles.card}
          onPress={() => router.push(`/reports/${item.id}`)}>
          {summary.firstPhotoUri ? (
            <Image source={{ uri: summary.firstPhotoUri }} style={styles.cardImage} contentFit="cover" />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
          )}

          <View style={styles.photoCountBadge}>
            <Text style={styles.photoCountBadgeText}>{photoCount}</Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.reportName ?? t.reportUnnamed}
              </Text>
              <Pressable
                onPress={() => handleOpenCardMenu(item)}
                hitSlop={TOUCH_HIT_SLOP}
                style={styles.cardMenuButton}>
                <EllipsisVertical size={16} color="#0a0a0a" strokeWidth={ICON_STROKE_WIDTH} />
              </Pressable>
            </View>

            <View style={styles.cardDateRow}>
              <Text style={styles.cardDate}>{item.createdAt.replace('T', ' ').slice(0, 16)}</Text>
              <WeatherIcon
                testID={`e2e_home_report_${index}_weather_${item.weather}`}
                size={16}
                color="#6a7282"
                strokeWidth={ICON_STROKE_WIDTH}
                opacity={weatherIconOpacityMap[item.weather]}
              />
            </View>

            <Text style={styles.cardComment} numberOfLines={1}>
              {commentText}
            </Text>

            <Text testID={`e2e_home_report_${index}_photo_count_${photoCount}`} style={styles.hiddenText}>
              {photoCount}
            </Text>
          </View>
        </Pressable>
      );
    },
    [handleOpenCardMenu, meta, router, t.reportUnnamed],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.root} testID="e2e_home_screen">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Repolog</Text>
          <Pressable
            testID="e2e_open_settings"
            onPress={() => router.push('/settings')}
            hitSlop={TOUCH_HIT_SLOP}
            style={styles.headerIconButton}>
            <Settings size={16} color="#0a0a0a" strokeWidth={ICON_STROKE_WIDTH} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Search size={16} color="#717182" strokeWidth={ICON_STROKE_WIDTH} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t.homeSearchPlaceholder}
              placeholderTextColor="#717182"
              style={styles.searchInput}
            />
          </View>
        </View>

        <View style={styles.filterRow}>
          <Pressable
            testID="e2e_home_filter_all"
            onPress={() => setActiveFilter('all')}
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
              {t.homeFilterAll}
            </Text>
          </Pressable>
          <Pressable
            testID="e2e_home_filter_pinned"
            onPress={() => setActiveFilter('pinned')}
            style={[styles.filterChip, activeFilter === 'pinned' && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, activeFilter === 'pinned' && styles.filterChipTextActive]}>
              {t.homeFilterPinned}
            </Text>
          </Pressable>
          <Pressable
            testID="e2e_home_filter_week"
            onPress={() => setActiveFilter('week')}
            style={[styles.filterChip, activeFilter === 'week' && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, activeFilter === 'week' && styles.filterChipTextActive]}>
              {t.homeFilterThisWeek}
            </Text>
          </Pressable>
        </View>

        <View style={styles.listWrap}>
          {reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{t.homeEmptyTitle}</Text>
              <Text style={styles.emptyBody}>{t.homeEmptyBody}</Text>
              <Pressable testID="e2e_home_create_report" style={styles.emptyButton} onPress={() => router.push('/reports/new')}>
                <Text style={styles.emptyButtonText}>{t.homeCreateReport}</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {proInitialized && !isPro && (
            <View style={styles.adBannerWrap}>
              <AdBanner />
            </View>
          )}
        </View>

        <Pressable
          testID="e2e_home_create_report_fab"
          onPress={() => router.push('/reports/new')}
          hitSlop={TOUCH_HIT_SLOP}
          style={styles.fabButton}>
          <Plus size={16} color="#ffffff" strokeWidth={ICON_STROKE_WIDTH} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  root: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    height: 61,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    height: 61,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchInputWrap: {
    minHeight: 36,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 8,
    backgroundColor: '#f3f3f5',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 36,
    fontSize: 16,
    color: '#0a0a0a',
    paddingVertical: 8,
  },
  filterRow: {
    height: 57,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    height: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  filterChipActive: {
    borderColor: '#030213',
    backgroundColor: '#030213',
  },
  filterChipText: {
    fontSize: 14,
    color: '#0a0a0a',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listWrap: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 32,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 258,
    backgroundColor: '#d4d4d8',
  },
  cardImagePlaceholder: {
    backgroundColor: '#d4d4d8',
  },
  photoCountBadge: {
    position: 'absolute',
    right: 12,
    top: 206,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCountBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    color: '#101828',
  },
  cardMenuButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardDate: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6a7282',
  },
  cardComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4a5565',
  },
  hiddenText: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  adBannerWrap: {
    marginTop: 8,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a0a',
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    color: '#6a7282',
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 4,
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030213',
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  fabButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#030213',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
