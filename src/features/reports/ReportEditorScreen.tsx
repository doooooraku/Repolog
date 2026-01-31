import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import type { AddressSource, Photo, Report, WeatherType } from '@/src/types/models';
import { useTranslation } from '@/src/core/i18n/i18n';
import { createReport, getReportById, updateReport } from '@/src/db/reportRepository';
import { clampComment, remainingCommentChars } from '@/src/features/reports/reportUtils';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { getCurrentLocationWithAddress } from '@/src/services/locationService';
import { listPhotosByReport } from '@/src/db/photoRepository';
import { addPhotosFromCamera, addPhotosFromLibrary } from '@/src/services/photoService';
import { resolvePhotoAddLimit, MAX_FREE_PHOTOS_PER_REPORT } from '@/src/features/photos/photoUtils';
import { proService } from '@/src/services/proService';

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

type ReportEditorScreenProps = {
  reportId?: string | null;
};

export default function ReportEditorScreen({ reportId }: ReportEditorScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const includeLocation = useSettingsStore((s) => s.includeLocation);
  const setIncludeLocation = useSettingsStore((s) => s.setIncludeLocation);

  const [loading, setLoading] = useState<boolean>(Boolean(reportId));
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isPro, setIsPro] = useState(false);

  const [reportName, setReportName] = useState('');
  const [comment, setComment] = useState('');
  const [weather, setWeather] = useState<WeatherType>('none');
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [locationState, setLocationState] = useState<LocationState>(emptyLocation);
  const [locationLoading, setLocationLoading] = useState(false);

  const autoLocationRequested = useRef(false);

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
    let mounted = true;
    proService
      .loadLocalState()
      .then((state) => {
        if (!mounted) return;
        setIsPro(Boolean(state?.isPro));
      })
      .catch(() => {
        if (mounted) setIsPro(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

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

  const buildPayload = useCallback(() => ({
    reportName: reportName.trim() || null,
    comment,
    weather,
    locationEnabledAtCreation: report?.locationEnabledAtCreation ?? includeLocation,
    lat: includeLocation ? locationState.lat : null,
    lng: includeLocation ? locationState.lng : null,
    latLngCapturedAt: includeLocation ? locationState.latLngCapturedAt : null,
    address: includeLocation ? locationState.address : null,
    addressSource: includeLocation ? locationState.addressSource : null,
    addressLocale: includeLocation ? locationState.addressLocale : null,
  }), [report, reportName, comment, weather, includeLocation, locationState]);

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

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
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
    const current = await ensureReport();
    router.push(`/reports/${current.id}/pdf`);
  };

  const handleAddPhotos = useCallback(
    async (source: 'camera' | 'library') => {
      try {
        const current = await ensureReport();
        const existingCount = photos.length;
        const limitStatus = resolvePhotoAddLimit(isPro, existingCount, 1);
        if (limitStatus.blocked && !isPro && limitStatus.allowedCount === 0) {
          Alert.alert(
            t.photoLimitTitle,
            t.photoLimitBody.replace('{max}', String(MAX_FREE_PHOTOS_PER_REPORT)),
          );
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
        if (result.blocked && !isPro) {
          Alert.alert(
            t.photoLimitTitle,
            t.photoLimitBody.replace('{max}', String(MAX_FREE_PHOTOS_PER_REPORT)),
          );
        }
        await refreshPhotos(current.id);
      } catch {
        Alert.alert(t.photoAddFailed);
      }
    },
    [ensureReport, photos.length, isPro, refreshPhotos, t],
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
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
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t.includeLocationLabel}</Text>
            <Text style={styles.subtle}>{t.includeLocationHelp}</Text>
          </View>
          <Switch
            value={includeLocation}
            onValueChange={(value) => setIncludeLocation(value)}
          />
        </View>

        {includeLocation && (
          <View style={styles.locationBlock}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>{t.locationLabel}</Text>
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
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>{t.photosLabel}</Text>
          <Text style={styles.subtle}>{photos.length}</Text>
        </View>
        {!isPro && (
          <Text style={styles.subtle}>
            {t.photoLimitHint.replace('{max}', String(MAX_FREE_PHOTOS_PER_REPORT))}
          </Text>
        )}
        <View style={styles.rowBetween}>
          <Pressable onPress={() => handleAddPhotos('camera')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{t.addFromCamera}</Text>
          </Pressable>
          <Pressable onPress={() => handleAddPhotos('library')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{t.addFromLibrary}</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
          {photos.slice(0, 6).map((photo) => (
            <Image key={photo.id} source={{ uri: photo.localUri }} style={styles.photoThumb} />
          ))}
          {photos.length === 0 && <Text style={styles.subtle}>{t.photoEmpty}</Text>}
        </ScrollView>
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
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 1,
    borderColor: '#111',
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#111',
    fontWeight: '600',
  },
  photoStrip: {
    marginTop: 8,
  },
  photoThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#eee',
  },
});
