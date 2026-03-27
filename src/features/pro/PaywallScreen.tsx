import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Purchases from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from '@tamagui/lucide-icons';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslation } from '@/src/core/i18n/i18n';
import { proService, type PlanType, type PriceDetails } from '@/src/services/proService';
import { getLegalLinks, openExternalLink } from '@/src/services/legalService';
import { useProStore } from '@/src/stores/proStore';

const DEFAULT_BADGE = '#ffb800';
const TOUCH_HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 } as const;
const ICON_STROKE_WIDTH = 1.85;

export default function PaywallScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const isPro = useProStore((s) => s.isPro);
  const initPro = useProStore((s) => s.init);
  const refreshPro = useProStore((s) => s.refresh);
  const purchasePro = useProStore((s) => s.purchase);
  const restorePro = useProStore((s) => s.restore);

  const [priceDetails, setPriceDetails] = useState<PriceDetails | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [action, setAction] = useState<PlanType | 'restore' | null>(null);

  useEffect(() => {
    void initPro();
    refreshPro().catch(() => null);
  }, [initPro, refreshPro]);

  useEffect(() => {
    let mounted = true;
    setLoadingPrices(true);
    proService
      .getPriceDetails()
      .then((details) => {
        if (mounted) setPriceDetails(details);
      })
      .catch(() => {
        if (mounted) setPriceDetails(null);
      })
      .finally(() => {
        if (mounted) setLoadingPrices(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const monthlyPriceLabel = useMemo(() => {
    if (loadingPrices) return t.priceLoading;
    return priceDetails?.monthly?.priceString ?? t.priceUnavailable;
  }, [loadingPrices, priceDetails?.monthly?.priceString, t.priceLoading, t.priceUnavailable]);

  const yearlyPriceLabel = useMemo(() => {
    if (loadingPrices) return t.priceLoading;
    return priceDetails?.yearly?.priceString ?? t.priceUnavailable;
  }, [loadingPrices, priceDetails?.yearly?.priceString, t.priceLoading, t.priceUnavailable]);

  const lifetimePriceLabel = useMemo(() => {
    if (loadingPrices) return t.priceLoading;
    return priceDetails?.lifetime?.priceString ?? t.priceUnavailable;
  }, [loadingPrices, priceDetails?.lifetime?.priceString, t.priceLoading, t.priceUnavailable]);
  const lifetimeAvailable = Boolean(priceDetails?.lifetime?.priceString);

  const yearlyPerMonth = priceDetails?.yearly?.pricePerMonthString ?? null;
  const monthlyAvailable = Boolean(priceDetails?.monthly?.priceString);
  const yearlyAvailable = Boolean(priceDetails?.yearly?.priceString);

  const handlePurchase = async (plan: PlanType) => {
    if (isPro) return;

    // Warn if user has active subscription and is buying lifetime
    if (plan === 'lifetime') {
      try {
        const info = await Purchases.getCustomerInfo();
        if (info.activeSubscriptions.length > 0) {
          const proceed = await new Promise<boolean>((resolve) => {
            Alert.alert(
              t.lifetimeSubWarningTitle,
              t.lifetimeSubWarningBody,
              [
                { text: t.cancel, style: 'cancel', onPress: () => resolve(false) },
                {
                  text: t.manageSubscription,
                  onPress: () => {
                    void Linking.openURL('https://play.google.com/store/account/subscriptions');
                    resolve(false);
                  },
                },
                { text: t.continueAnyway, onPress: () => resolve(true) },
              ],
              { cancelable: false },
            );
          });
          if (!proceed) return;
        }
      } catch {
        // If check fails, proceed with purchase
      }
    }

    setAction(plan);
    try {
      await purchasePro(plan);
      Alert.alert(t.purchaseSuccess);
      router.back();
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'userCancelled' in e && (e as { userCancelled: boolean }).userCancelled) {
        return;
      }
      if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'PAYMENT_PENDING_ERROR') {
        Alert.alert(t.purchasePending);
        return;
      }
      Alert.alert(t.purchaseFailed);
    } finally {
      setAction(null);
    }
  };

  const openPrivacyPolicy = () => {
    const { privacyUrl } = getLegalLinks();
    void openExternalLink(privacyUrl);
  };

  const openTerms = () => {
    const { termsUrl } = getLegalLinks();
    void openExternalLink(termsUrl);
  };

  const handleRestore = async () => {
    setAction('restore');
    try {
      const result = await restorePro();
      Alert.alert(result.hasActive ? t.restoreSuccess : t.restoreNotFound);
      if (result.hasActive) router.back();
    } catch {
      Alert.alert(t.restoreFailed);
    } finally {
      setAction(null);
    }
  };

  const featureRows = [
    { label: t.paywallFeaturePhotos, free: t.paywallFeaturePhotosFree, pro: t.paywallFeaturePhotosPro },
    { label: t.paywallFeaturePdf, free: t.paywallFeaturePdfFree, pro: t.paywallFeaturePdfPro },
    { label: t.paywallFeatureLayout, free: t.paywallFeatureLayoutFree, pro: t.paywallFeatureLayoutPro },
    { label: t.paywallFeatureWatermark, free: t.paywallFeatureWatermarkFree, pro: t.paywallFeatureWatermarkPro },
    { label: t.paywallFeatureAds, free: t.paywallFeatureAdsFree, pro: t.paywallFeatureAdsPro },
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.screenBgAlt }]}>
      {/* --- Unified header (matches ReportEditor / PdfPreview) --- */}
      <View style={[styles.header, { borderBottomColor: colors.borderDefault, backgroundColor: colors.surfaceBg }]}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityLabel={t.a11yGoBack}
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={TOUCH_HIT_SLOP}>
            <ArrowLeft size={18} color={colors.textPrimary} strokeWidth={ICON_STROKE_WIDTH} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {t.paywallHeaderTitle}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* --- Hero --- */}
        <View style={[styles.hero, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{t.paywallHeaderTitle}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>{t.paywallHeroSubtitle}</Text>
          {isPro && (
            <View style={[styles.activeBadge, { backgroundColor: colors.activeBadgeBg, borderColor: colors.activeBadgeBorder }]}>
              <Text style={[styles.activeBadgeText, { color: colors.activeBadgeText }]}>{t.paywallBadgeShort}</Text>
              <Text style={[styles.activeBadgeSub, { color: colors.activeBadgeText }]}>{t.purchaseSuccess}</Text>
            </View>
          )}
        </View>

        {/* --- Free vs Pro comparison table --- */}
        <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.paywallPlansTitle}</Text>
          <View style={styles.compareTable}>
            {/* Table header */}
            <View style={[styles.compareRow, styles.compareHeaderRow]}>
              <View style={styles.compareLabel} />
              <Text style={[styles.compareColHeader, { color: colors.textMuted }]}>{t.paywallFreeLabel}</Text>
              <Text style={[styles.compareColHeader, styles.compareColHeaderPro, { color: colors.textPrimary }]}>{t.paywallProLabel}</Text>
            </View>
            {/* Feature rows */}
            {featureRows.map((row, i) => (
              <View
                key={row.label}
                style={[
                  styles.compareRow,
                  i < featureRows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
                ]}>
                <Text style={[styles.compareLabel, { color: colors.textPrimary }]} numberOfLines={2}>{row.label}</Text>
                <Text style={[styles.compareValue, { color: colors.textMuted }]} numberOfLines={2}>{row.free}</Text>
                <View style={styles.compareProCell}>
                  <Text style={[styles.compareCheckmark, { color: colors.activeBadgeText }]}>{'✓ '}</Text>
                  <Text style={[styles.compareValuePro, { color: colors.textPrimary }]} numberOfLines={2}>{row.pro}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* --- Monthly plan --- */}
        <View style={[styles.planCard, { borderColor: colors.borderLight, backgroundColor: colors.surfaceBgAlt }]}>
          <View style={styles.planRow}>
            <Text style={[styles.planTitle, { color: colors.textPrimary }]}>{t.paywallPlanMonthlyTitle}</Text>
            <Text style={[styles.planPrice, { color: colors.textPrimary }]}>{monthlyPriceLabel}</Text>
          </View>
          <Pressable
            onPress={() => handlePurchase('monthly')}
            style={[
              styles.ctaButton,
              { backgroundColor: colors.primaryBg },
              (!monthlyAvailable || isPro) && styles.disabledButton,
            ]}
            disabled={!monthlyAvailable || isPro || action !== null}>
            {action === 'monthly' ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.ctaText, { color: colors.primaryText }]}>{t.paywallCtaMonthly}</Text>
            )}
          </Pressable>
        </View>

        {/* --- Yearly plan (highlighted) --- */}
        <View style={[styles.planCard, { borderColor: colors.planHighlightBorder, backgroundColor: colors.planHighlightBg }]}>
          <View style={styles.planRow}>
            <Text style={[styles.planTitle, { color: colors.textPrimary }]}>{t.paywallPlanYearlyTitle}</Text>
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: colors.badgeText }]}>{t.paywallBestValueBadge}</Text>
            </View>
          </View>
          <Text style={[styles.planPrice, { color: colors.textPrimary }]}>{yearlyPriceLabel}</Text>
          {yearlyPerMonth && (
            <Text style={[styles.planSub, { color: colors.textMuted }]}>{`${t.paywallPricePerMonthLabel}: ${yearlyPerMonth}`}</Text>
          )}
          <Text style={[styles.planSub, { color: colors.textPrimary, fontWeight: '600' }]}>{t.paywallYearlySavings}</Text>
          <Pressable
            onPress={() => handlePurchase('yearly')}
            style={[
              styles.ctaButton,
              { backgroundColor: colors.primaryBg },
              (!yearlyAvailable || isPro) && styles.disabledButton,
            ]}
            disabled={!yearlyAvailable || isPro || action !== null}>
            {action === 'yearly' ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.ctaText, { color: colors.primaryText }]}>{t.paywallCtaYearly}</Text>
            )}
          </Pressable>
        </View>

        {/* --- or divider --- */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted }]}>{t.paywallOrDivider}</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
        </View>

        {/* --- Lifetime plan --- */}
        <View style={[styles.planCard, { borderColor: colors.borderLight, backgroundColor: colors.surfaceBgAlt }]}>
          <View style={styles.planRow}>
            <Text style={[styles.planTitle, { color: colors.textPrimary }]}>{t.paywallPlanLifetimeTitle}</Text>
            <View style={[styles.badge, { backgroundColor: colors.textMuted }]}>
              <Text style={[styles.badgeText, { color: colors.surfaceBg }]}>{t.paywallOneTimeBadge}</Text>
            </View>
          </View>
          <Text style={[styles.planPrice, { color: colors.textPrimary }]}>{lifetimePriceLabel}</Text>
          <Text style={[styles.planSub, { color: colors.textMuted }]}>{t.paywallLifetimeDesc}</Text>
          <Pressable
            onPress={() => handlePurchase('lifetime')}
            style={[
              styles.ctaButton,
              { backgroundColor: colors.primaryBg },
              (!lifetimeAvailable || isPro) && styles.disabledButton,
            ]}
            disabled={!lifetimeAvailable || isPro || action !== null}>
            {action === 'lifetime' ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.ctaText, { color: colors.primaryText }]}>{t.paywallCtaLifetime}</Text>
            )}
          </Pressable>
        </View>
        <Text style={[styles.finePrint, { color: colors.textMuted }]}>{t.paywallLifetimeFinePrint}</Text>

        {/* --- Restore --- */}
        <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.paywallRestoreTitle}</Text>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>{t.paywallRestoreDesc}</Text>
          <Pressable
            onPress={handleRestore}
            style={[styles.secondaryButton, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }, action === 'restore' && styles.disabledButton]}
            disabled={action !== null}>
            {action === 'restore' ? (
              <ActivityIndicator />
            ) : (
              <Text style={[styles.secondaryText, { color: colors.textPrimary }]}>{t.restore}</Text>
            )}
          </Pressable>
        </View>

        <Text style={[styles.finePrint, { color: colors.textMuted }]}>{t.paywallFinePrint}</Text>

        <View style={styles.legalRow}>
          <Pressable onPress={() => openPrivacyPolicy()}>
            <Text style={[styles.legalLink, { color: colors.primaryBg }]}>{t.legalPrivacyPolicyLabel}</Text>
          </Pressable>
          <Text style={[styles.legalSeparator, { color: colors.textMuted }]}>{'|'}</Text>
          <Pressable onPress={() => openTerms()}>
            <Text style={[styles.legalLink, { color: colors.primaryBg }]}>{t.legalTermsOfUseLabel}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.back()} style={[styles.stayFreeButton, { backgroundColor: colors.surfaceBg, borderColor: colors.borderMedium }]}>
          <Text style={[styles.stayFreeText, { color: colors.textSecondary }]}>{t.paywallCtaStayFree}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  hero: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  activeBadge: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeBadgeSub: {
    fontSize: 12,
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
  sectionSub: {
    fontSize: 12,
  },
  /* --- Comparison table --- */
  compareTable: {
    gap: 0,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  compareHeaderRow: {
    paddingBottom: 6,
  },
  compareLabel: {
    flex: 2,
    fontSize: 13,
  },
  compareColHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  compareColHeaderPro: {
    fontWeight: '700',
  },
  compareValue: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  compareProCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareCheckmark: {
    fontSize: 13,
    fontWeight: '700',
  },
  compareValuePro: {
    fontSize: 12,
    fontWeight: '600',
  },
  /* --- Plan cards --- */
  planCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  planSub: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: DEFAULT_BADGE,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ctaButton: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryText: {
    fontWeight: '600',
  },
  finePrint: {
    fontSize: 11,
    lineHeight: 16,
  },
  stayFreeButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  stayFreeText: {
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    fontWeight: '500',
  },
  legalSeparator: {
    fontSize: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
