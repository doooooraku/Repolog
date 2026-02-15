import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';

import type { AddressSource, Photo, Report, WeatherType } from '@/src/types/models';
import { useTranslation } from '@/src/core/i18n/i18n';
import {
  createReport,
  getLatestReportName,
  getReportById,
  updateReport,
} from '@/src/db/reportRepository';
import {
  clampComment,
  normalizeTags,
  remainingCommentChars,
  splitTagInput,
} from '@/src/features/reports/reportUtils';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { getCurrentLocationWithAddress } from '@/src/services/locationService';
import { createPhoto, listPhotosByReport, updatePhotoOrderByIds } from '@/src/db/photoRepository';
import {
  addPhotosFromCamera,
  addPhotosFromLibrary,
  consumePendingPhotoSelection,
  removePhotoFromReport,
} from '@/src/services/photoService';
import { resolvePhotoAddLimit, MAX_FREE_PHOTOS_PER_REPORT } from '@/src/features/photos/photoUtils';
import { useProStore } from '@/src/stores/proStore';
import {
  normalizePhotoOrder,
  removePhotoAndNormalize,
  restorePhotoAtIndexAndNormalize,
} from '@/src/features/reports/photoOrderUtils';

type LocationState = {
  lat: number | null;
  lng: number | null;
  latLngCapturedAt: string | null;
  address: string | null;
  addressSource: AddressSource | null;
  addressLocale: string | null;
};

const emptyLocation: LocationState = {
  lat: null,
  lng: null,
  latLngCapturedAt: null,
  address: null,
  addressSource: null,
  addressLocale: null,
};

type WeatherOption = { type: WeatherType; emoji: string };

const weatherOptions: WeatherOption[] = [
  { type: 'sunny', emoji: '☀️' },
  { type: 'cloudy', emoji: '☁️' },
  { type: 'rainy', emoji: '🌧️' },
  { type: 'snowy', emoji: '❄️' },
  { type: 'none', emoji: '—' },
];

const E2E_SEED_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAPEA8PEA8PDw8PDw8PDw8PDw8PFREWFhURFRUYHSggGBolGxUVITEhJSorLi4uFx8zODMtNygtLisBCgoKDg0OFRAQFS0dHR0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIABQAFAMBIgACEQEDEQH/xAAaAAEAAgMBAAAAAAAAAAAAAAAABQYDBEcB/8QAJxAAAQMDAgQHAAAAAAAAAAAAAQIDEQQABSEGEjFBURMiMmFxkqH/xAAXAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAHREAAgMBAQEAAAAAAAAAAAAAAAECEQMhEjFBcf/aAAwDAQACEQMRAD8An2dbfW6WJ6PSp2w4VNrSRJfT2c5iQfWAZxV+6wWJ7LFR6jSxF7VlC4xQ62J1z7fI4xS0Qx3EJ6u6+6fB2cQfSE4qz9SZ0w6k0G5WnkhqfWGrvC4m2JJmKzFKBv6qCQ2f/Z';
const PHOTO_DELETE_UNDO_MS = 4000;

const sanitizeTestIdToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const extractPhotoMarker = (uri: string) => {
  const fileName = uri.split('/').pop() ?? 'photo';
  return sanitizeTestIdToken(fileName);
};

type ReportEditorScreenProps = {
  reportId?: string | null;
};

type PendingPhotoDeletion = {
  reportId: string;
  photo: Photo;
  previous: Photo[];
  next: Photo[];
  removedIndex: number;
};

export default function ReportEditorScreen({ reportId }: ReportEditorScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const includeLocation = useSettingsStore((s) => s.includeLocation);

  const [loading, setLoading] = useState<boolean>(Boolean(reportId));
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const isPro = useProStore((s) => s.isPro);
  const initPro = useProStore((s) => s.init);

  const [reportName, setReportName] = useState('');
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [weather, setWeather] = useState<WeatherType>('none');
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [locationState, setLocationState] = useState<LocationState>(emptyLocation);
  const [locationLoading, setLocationLoading] = useState(false);
  const [undoVisible, setUndoVisible] = useState(false);

  const autoLocationRequested = useRef(false);
  const reportNameSeeded = useRef(false);
  const pendingDeletionRef = useRef<PendingPhotoDeletion | null>(null);
  const pendingDeletionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadReport = async () => {
      if (!reportId) {
        setLoading(false);
        return;
      }
      try {
        const existing = await getReportById(reportId);
        if (!mounted) return;
        if (!existing) {
          Alert.alert(t.errorLoadFailed);
          setLoading(false);
          return;
        }
        setReport(existing);
        setReportName(existing.reportName ?? '');
        setComment(existing.comment ?? '');
        setTags(existing.tags ?? []);
        setWeather(existing.weather);
        setCreatedAt(existing.createdAt);
        setLocationState({
          lat: existing.lat,
          lng: existing.lng,
          latLngCapturedAt: existing.latLngCapturedAt,
          address: existing.address,
          addressSource: existing.addressSource,
          addressLocale: existing.addressLocale,
        });
        const photoList = await listPhotosByReport(existing.id);
        if (mounted) setPhotos(photoList);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadReport();
    return () => {
      mounted = false;
    };
  }, [reportId, t.errorLoadFailed]);

  useEffect(() => {
    void initPro();
  }, [initPro]);

  useEffect(() => {
    if (reportId || loading || report || reportNameSeeded.current) return;
    reportNameSeeded.current = true;
    let mounted = true;
    const seedReportName = async () => {
      const latestReportName = await getLatestReportName();
      if (!mounted || !latestReportName) return;
      setReportName((current) => (current.trim().length > 0 ? current : latestReportName));
    };
    void seedReportName();
    return () => {
      mounted = false;
    };
  }, [loading, report, reportId]);

  const handleFetchLocation = useCallback(async () => {
    if (!includeLocation || locationLoading) return;
    setLocationLoading(true);
    const result = await getCurrentLocationWithAddress();
    setLocationLoading(false);
    if (!result.ok) {
      if (result.reason === 'permission') {
        Alert.alert(t.locationPermissionDenied);
        return;
      }
      if (result.reason === 'unavailable') {
        Alert.alert(t.locationUnavailable);
        return;
      }
      Alert.alert(t.locationError);
      return;
    }
    setLocationState({
      lat: result.data.lat,
      lng: result.data.lng,
      latLngCapturedAt: result.data.latLngCapturedAt,
      address: result.data.address,
      addressSource: result.data.address ? 'auto' : null,
      addressLocale: result.data.addressLocale,
    });
  }, [
    includeLocation,
    locationLoading,
    t.locationPermissionDenied,
    t.locationUnavailable,
    t.locationError,
  ]);

  useEffect(() => {
    if (!includeLocation) {
      setLocationState(emptyLocation);
      return;
    }
    if (reportId) return;
    if (autoLocationRequested.current) return;
    autoLocationRequested.current = true;
    void handleFetchLocation();
  }, [includeLocation, reportId, handleFetchLocation]);

  const handleClearLocation = () => {
    setLocationState(emptyLocation);
  };

  const handleAddressChange = (value: string) => {
    setLocationState((prev) => ({
      ...prev,
      address: value.length > 0 ? value : null,
      addressSource: value.length > 0 ? 'manual' : prev.addressSource,
    }));
  };

  const handleAddTags = useCallback(() => {
    const next = normalizeTags([...tags, ...splitTagInput(tagInput)]);
    if (next.length === tags.length) {
      setTagInput('');
      return;
    }
    setTags(next);
    setTagInput('');
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    const target = tag.trim().toLowerCase();
    setTags((current) => current.filter((item) => item.trim().toLowerCase() !== target));
  }, []);

  const weatherLabelMap = useMemo(
    () => ({
      sunny: t.weatherSunny,
      cloudy: t.weatherCloudy,
      rainy: t.weatherRainy,
      snowy: t.weatherSnowy,
      none: t.weatherNone,
    }),
    [t],
  );

  const buildPayload = useCallback(() => {
    const nextTags = normalizeTags([...tags, ...splitTagInput(tagInput)]);
    return {
      reportName: reportName.trim() || null,
      comment,
      tags: nextTags,
      weather,
      locationEnabledAtCreation: report?.locationEnabledAtCreation ?? includeLocation,
      lat: includeLocation ? locationState.lat : null,
      lng: includeLocation ? locationState.lng : null,
      latLngCapturedAt: includeLocation ? locationState.latLngCapturedAt : null,
      address: includeLocation ? locationState.address : null,
      addressSource: includeLocation ? locationState.addressSource : null,
      addressLocale: includeLocation ? locationState.addressLocale : null,
    };
  }, [report, reportName, comment, tags, tagInput, weather, includeLocation, locationState]);

  const ensureReport = useCallback(async () => {
    if (report) return report;
    const created = await createReport(buildPayload());
    setReport(created);
    setCreatedAt(created.createdAt);
    return created;
  }, [report, buildPayload]);

  const refreshPhotos = useCallback(async (reportIdValue: string) => {
    const list = await listPhotosByReport(reportIdValue);
    setPhotos(list);
  }, []);

  const handleSeedPhotosForE2E = useCallback(async () => {
    try {
      const current = await ensureReport();
      const existing = await listPhotosByReport(current.id);
      if (existing.length >= 3) {
        setPhotos(existing);
        return;
      }

      const baseRoot = FileSystem.Paths?.cache?.uri ?? FileSystem.Paths?.document?.uri;
      if (!baseRoot) {
        throw new Error('FileSystem path unavailable for E2E seed photos.');
      }
      const baseDir = `${baseRoot}repolog/e2e/${current.id}/`;
      await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });

      const seedCount = 3;
      for (let i = 1; i <= seedCount; i += 1) {
        const seedUri = `${baseDir}seed-${i}.jpg`;
        const info = await FileSystem.getInfoAsync(seedUri);
        if (!info.exists) {
          await FileSystem.writeAsStringAsync(seedUri, E2E_SEED_JPEG_BASE64, {
            encoding: 'base64',
          });
        }
      }

      const refreshed = await listPhotosByReport(current.id);
      let order = refreshed.length;
      for (let i = refreshed.length + 1; i <= seedCount; i += 1) {
        const seedUri = `${baseDir}seed-${i}.jpg`;
        await createPhoto({
          reportId: current.id,
          localUri: seedUri,
          width: 1,
          height: 1,
          orderIndex: order,
        });
        order += 1;
      }

      await refreshPhotos(current.id);
    } catch {
      Alert.alert(t.photoAddFailed);
    }
  }, [ensureReport, refreshPhotos, t.photoAddFailed]);

  const clearPendingDeletionTimer = useCallback(() => {
    if (pendingDeletionTimerRef.current) {
      clearTimeout(pendingDeletionTimerRef.current);
      pendingDeletionTimerRef.current = null;
    }
  }, []);

  const finalizePendingDeletion = useCallback(
    async (options: { showAlert?: boolean; updateUi?: boolean } = {}) => {
      const pending = pendingDeletionRef.current;
      if (!pending) return true;

      const showAlert = options.showAlert ?? true;
      const updateUi = options.updateUi ?? true;

      clearPendingDeletionTimer();
      pendingDeletionRef.current = null;
      if (updateUi) {
        setUndoVisible(false);
      }

      try {
        await removePhotoFromReport(pending.reportId, pending.photo);
        await updatePhotoOrderByIds(
          pending.reportId,
          pending.next.map((item) => item.id),
        );
        return true;
      } catch {
        if (updateUi) {
          setPhotos(pending.previous);
          setUndoVisible(false);
        }
        try {
          await refreshPhotos(pending.reportId);
        } catch {
          // Keep local fallback state when refresh also fails.
        }
        if (showAlert) {
          Alert.alert(t.photoDeleteFailed);
        }
        return false;
      }
    },
    [clearPendingDeletionTimer, refreshPhotos, t.photoDeleteFailed],
  );

  const handleUndoDeletePhoto = useCallback(() => {
    const pending = pendingDeletionRef.current;
    if (!pending) return;

    clearPendingDeletionTimer();
    pendingDeletionRef.current = null;
    setPhotos(
      restorePhotoAtIndexAndNormalize(
        pending.next,
        { ...pending.photo, orderIndex: pending.removedIndex },
        pending.removedIndex,
      ),
    );
    setUndoVisible(false);
  }, [clearPendingDeletionTimer]);

  useEffect(
    () => () => {
      void finalizePendingDeletion({ showAlert: false, updateUi: false });
    },
    [finalizePendingDeletion],
  );

  const showPhotoLimitAlert = useCallback(() => {
    Alert.alert(
      t.photoLimitTitle,
      t.photoLimitBody.replace('{max}', String(MAX_FREE_PHOTOS_PER_REPORT)),
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.openPro, onPress: () => router.push('/pro') },
      ],
    );
  }, [router, t]);

  useEffect(() => {
    if (!reportId) return;
    let mounted = true;

    const recoverPendingPhotoSelection = async () => {
      try {
        const result = await consumePendingPhotoSelection(reportId, isPro);
        if (!mounted || !result) return;
        if (result.reason === 'permission') {
          Alert.alert(t.photoPermissionDenied);
          return;
        }
        if (result.reason === 'error' && result.photos.length === 0) {
          Alert.alert(t.photoAddFailed);
          return;
        }
        if (result.blocked && !isPro) {
          showPhotoLimitAlert();
        }
        if (result.photos.length > 0) {
          await refreshPhotos(reportId);
        }
      } catch {
        if (mounted) {
          Alert.alert(t.photoAddFailed);
        }
      }
    };

    void recoverPendingPhotoSelection();

    return () => {
      mounted = false;
    };
  }, [
    reportId,
    isPro,
    refreshPhotos,
    showPhotoLimitAlert,
    t.photoAddFailed,
    t.photoPermissionDenied,
  ]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const finalized = await finalizePendingDeletion();
      if (!finalized) {
        setSaving(false);
        return;
      }
      const payload = buildPayload();
      if (reportId) {
        await updateReport({ id: reportId, ...payload });
      } else {
        const created = await createReport(payload);
        setReport(created);
        setCreatedAt(created.createdAt);
      }
      Alert.alert(t.save);
    } catch {
      Alert.alert(t.errorSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPdf = async () => {
    const finalized = await finalizePendingDeletion();
    if (!finalized) return;
    const current = await ensureReport();
    router.push(`/reports/${current.id}/pdf`);
  };

  const handleBack = useCallback(() => {
    void (async () => {
      const finalized = await finalizePendingDeletion();
      if (!finalized) return;
      router.back();
    })();
  }, [finalizePendingDeletion, router]);

  const handleAddPhotos = useCallback(
    async (source: 'camera' | 'library') => {
      try {
        const finalized = await finalizePendingDeletion();
        if (!finalized) return;
        const current = await ensureReport();
        const existingCount = photos.length;
        const limitStatus = resolvePhotoAddLimit(isPro, existingCount, 1);
        if (limitStatus.blocked && !isPro && limitStatus.allowedCount === 0) {
          showPhotoLimitAlert();
          return;
        }

        const result =
          source === 'camera'
            ? await addPhotosFromCamera(current.id, isPro)
            : await addPhotosFromLibrary(current.id, isPro);

        if (result.reason === 'permission') {
          Alert.alert(t.photoPermissionDenied);
          return;
        }
        if (result.canceled) return;
        if (result.reason === 'error' && result.photos.length === 0) {
          Alert.alert(t.photoAddFailed);
          return;
        }
        if (result.blocked && !isPro) {
          showPhotoLimitAlert();
        }
        if (result.photos.length > 0) {
          await refreshPhotos(current.id);
        }
      } catch {
        Alert.alert(t.photoAddFailed);
      }
    },
    [ensureReport, finalizePendingDeletion, photos.length, isPro, refreshPhotos, showPhotoLimitAlert, t],
  );

  const handlePhotoReorder = useCallback(
    async (reordered: Photo[]) => {
      const finalized = await finalizePendingDeletion();
      if (!finalized) return;
      const current = await ensureReport();
      const previous = photos;
      const normalized = normalizePhotoOrder(reordered);
      setPhotos(normalized);
      try {
        await updatePhotoOrderByIds(
          current.id,
          normalized.map((photo) => photo.id),
        );
      } catch {
        setPhotos(previous);
        try {
          await refreshPhotos(current.id);
        } catch {
          // Keep local fallback state when refresh also fails.
        }
        Alert.alert(t.photoReorderFailed);
      }
    },
    [ensureReport, finalizePendingDeletion, photos, refreshPhotos, t.photoReorderFailed],
  );

  const handleDeletePhoto = useCallback(
    async (photo: Photo) => {
      try {
        const finalized = await finalizePendingDeletion();
        if (!finalized) return;

        const current = await ensureReport();
        const previous = photos;
        const removedIndex = previous.findIndex((item) => item.id === photo.id);
        if (removedIndex < 0) return;

        const next = removePhotoAndNormalize(previous, photo.id);
        if (next.length === previous.length) return;

        setPhotos(next);
        pendingDeletionRef.current = {
          reportId: current.id,
          photo: { ...photo, orderIndex: removedIndex },
          previous,
          next,
          removedIndex,
        };
        setUndoVisible(true);
        clearPendingDeletionTimer();
        pendingDeletionTimerRef.current = setTimeout(() => {
          void finalizePendingDeletion();
        }, PHOTO_DELETE_UNDO_MS);
      } catch {
        Alert.alert(t.photoDeleteFailed);
      }
    },
    [clearPendingDeletionTimer, ensureReport, finalizePendingDeletion, photos, t.photoDeleteFailed],
  );

  const confirmDeletePhoto = useCallback(
    (photo: Photo) => {
      Alert.alert(
        t.photoDeleteConfirmTitle,
        t.photoDeleteConfirmBody,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.deleteAction,
            style: 'destructive',
            onPress: () => {
              void handleDeletePhoto(photo);
            },
          },
        ],
      );
    },
    [
      handleDeletePhoto,
      t.photoDeleteConfirmBody,
      t.photoDeleteConfirmTitle,
      t.cancel,
      t.deleteAction,
    ],
  );

  const renderPhotoItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<Photo>) => {
      const index = getIndex() ?? item.orderIndex;
      const marker = extractPhotoMarker(item.localUri);
      return (
        <Pressable
          testID={`e2e_photo_slot_${index}_${marker}`}
          onLongPress={drag}
          delayLongPress={160}
          style={[styles.photoCard, isActive && styles.photoCardActive]}>
          <Image source={{ uri: item.localUri }} style={styles.photoThumb} />
          <Text style={styles.photoIndexLabel}>{index + 1}</Text>
          <Pressable
            testID={`e2e_photo_delete_${index}`}
            onPress={() => confirmDeletePhoto(item)}
            hitSlop={8}
            style={styles.photoDeleteButton}>
            <Text style={styles.photoDeleteButtonText}>×</Text>
          </Pressable>
          {__DEV__ && (
            <Pressable
              testID={`e2e_photo_delete_now_${index}`}
              onPress={() => {
                void handleDeletePhoto(item);
              }}
              style={styles.photoDeleteNowButton}>
              <Text style={styles.photoDeleteNowText}>-</Text>
            </Pressable>
          )}
        </Pressable>
      );
    },
    [confirmDeletePhoto, handleDeletePhoto],
  );

  const remaining = remainingCommentChars(comment);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      testID="e2e_report_editor_screen">
      <View style={styles.headerRow}>
        <Pressable testID="e2e_report_back" onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t.reportEditorTitle}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.reportNameLabel}</Text>
        <TextInput
          style={styles.input}
          value={reportName}
          onChangeText={setReportName}
          placeholder={t.reportNamePlaceholder}
        />

        <View style={styles.rowBetween}>
          <Text style={styles.label}>{t.createdAtLabel}</Text>
          <Text style={styles.value}>{createdAt.replace('T', ' ').slice(0, 16)}</Text>
        </View>

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>{t.weatherLabel}</Text>
        <View style={styles.weatherRow}>
          {weatherOptions.map((option) => (
            <Pressable
              key={option.type}
              onPress={() => setWeather(option.type)}
              style={[
                styles.weatherChip,
                weather === option.type && styles.weatherChipActive,
              ]}>
              <Text style={styles.weatherEmoji}>{option.emoji}</Text>
              <Text style={styles.weatherText}>{weatherLabelMap[option.type]}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>{t.tagsLabel}</Text>
        <View style={styles.tagInputRow}>
          <TextInput
            testID="e2e_report_tags_input"
            style={[styles.input, styles.tagInput]}
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={handleAddTags}
            placeholder={t.tagInputPlaceholder}
            returnKeyType="done"
          />
          <Pressable testID="e2e_report_tags_add" onPress={handleAddTags} style={styles.tagAddButton}>
            <Text style={styles.tagAddButtonText}>{t.addTagAction}</Text>
          </Pressable>
        </View>
        {tags.length === 0 ? (
          <Text style={styles.subtle}>{t.tagsEmpty}</Text>
        ) : (
          <View style={styles.tagsWrap}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                testID={`e2e_report_tag_chip_${sanitizeTestIdToken(tag)}`}
                onPress={() => handleRemoveTag(tag)}
                style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
                <Text style={styles.tagChipRemove}>×</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.locationLabel}</Text>
        {includeLocation ? (
          <View style={styles.locationBlock}>
            <View style={styles.rowBetween}>
              <View style={styles.column}>
                <Text style={styles.subtle}>{t.includeLocationHelp}</Text>
              </View>
              <Pressable
                onPress={handleFetchLocation}
                style={styles.locationButton}
                disabled={locationLoading}>
                <Text style={styles.locationButtonText}>
                  {locationLoading ? t.obtaining : t.locationFetch}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.value}>
              {locationState.lat != null && locationState.lng != null
                ? `${locationState.lat}, ${locationState.lng}`
                : '-'}
            </Text>

            <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
              {t.addressLabel}
            </Text>
            <TextInput
              style={styles.input}
              value={locationState.address ?? ''}
              onChangeText={handleAddressChange}
              placeholder={t.addressPlaceholder}
            />

            <View style={styles.rowBetween}>
              <Pressable
                onPress={handleFetchLocation}
                style={[styles.secondaryButton, locationLoading && styles.disabledButton]}
                disabled={locationLoading}>
                <Text style={styles.secondaryButtonText}>{t.locationRefresh}</Text>
              </Pressable>
              <Pressable onPress={handleClearLocation} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>{t.locationClear}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={styles.subtle}>{t.locationDisabledHint}</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>{t.photosLabel}</Text>
          <Text testID={`e2e_photo_count_${photos.length}`} style={styles.subtle}>
            {photos.length}
          </Text>
        </View>
        {!isPro && (
          <Text style={styles.subtle}>
            {t.photoLimitHint.replace('{max}', String(MAX_FREE_PHOTOS_PER_REPORT))}
          </Text>
        )}
        <View style={styles.rowBetween}>
          <Pressable
            testID="e2e_add_photo_camera"
            onPress={() => handleAddPhotos('camera')}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{t.addFromCamera}</Text>
          </Pressable>
          <Pressable
            testID="e2e_add_photo_library"
            onPress={() => handleAddPhotos('library')}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{t.addFromLibrary}</Text>
          </Pressable>
        </View>
        {__DEV__ && (
          <Pressable
            testID="e2e_seed_photos"
            onPress={() => {
              void handleSeedPhotosForE2E();
            }}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Seed photos (E2E)</Text>
          </Pressable>
        )}
        {photos.length > 0 && <Text style={styles.subtle}>{t.photoReorderHint}</Text>}
        {photos.length === 0 ? (
          <Text style={styles.subtle}>{t.photoEmpty}</Text>
        ) : (
          <DraggableFlatList
            horizontal
            data={photos}
            keyExtractor={(item) => item.id}
            renderItem={renderPhotoItem}
            activationDistance={12}
            onDragEnd={({ data }) => {
              void handlePhotoReorder(data);
            }}
            containerStyle={styles.photoStrip}
            contentContainerStyle={styles.photoListContent}
            showsHorizontalScrollIndicator={false}
          />
        )}
        {undoVisible && (
          <View style={styles.undoBanner} testID="e2e_photo_delete_undo_bar">
            <Text style={styles.undoBannerText}>{t.photoDeletedNotice}</Text>
            <Pressable testID="e2e_photo_delete_undo" onPress={handleUndoDeletePhoto}>
              <Text style={styles.undoActionText}>{t.undoAction}</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>{t.commentLabel}</Text>
          <Text style={styles.subtle}>
            {t.commentRemainingLabel}: {remaining}
          </Text>
        </View>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={comment}
          onChangeText={(value) => setComment(clampComment(value))}
          placeholder={t.commentPlaceholder}
          multiline
          textAlignVertical="top"
        />
      </View>

      <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>{t.save}</Text>
        )}
      </Pressable>
      <Pressable onPress={handlePreviewPdf} style={styles.secondaryAction}>
        <Text style={styles.secondaryActionText}>{t.pdfPreviewTitle}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  sectionTitleSpacing: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  value: {
    fontSize: 13,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  textarea: {
    minHeight: 120,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  tagAddButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagAddButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagChipText: {
    fontSize: 12,
    color: '#111827',
  },
  tagChipRemove: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 4,
  },
  subtle: {
    fontSize: 12,
    color: '#666',
  },
  weatherRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weatherChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherChipActive: {
    borderColor: '#111',
    backgroundColor: '#f0f0f0',
  },
  weatherEmoji: {
    fontSize: 14,
  },
  weatherText: {
    fontSize: 12,
    color: '#333',
  },
  locationBlock: {
    gap: 10,
  },
  locationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  locationButtonText: {
    fontSize: 12,
    color: '#222',
  },
  secondaryButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 12,
    color: '#333',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButton: {
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryAction: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#fff',
    fontWeight: '600',
  },
  photoStrip: {
    marginTop: 8,
  },
  photoListContent: {
    paddingRight: 8,
  },
  undoBanner: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  undoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#1e3a8a',
  },
  undoActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  photoCard: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  photoCardActive: {
    opacity: 0.85,
  },
  photoThumb: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  photoDeleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDeleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  photoDeleteNowButton: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDeleteNowText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  photoIndexLabel: {
    position: 'absolute',
    left: 6,
    bottom: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
});
