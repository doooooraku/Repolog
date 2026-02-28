import { useEffect, useMemo, useState } from 'react';
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
import { proService, type PlanType, type PriceDetails } from '@/src/services/proService';
import { useProStore } from '@/src/stores/proStore';

const DEFAULT_BADGE = '#ffb800';

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

  const yearlyPerMonth = priceDetails?.yearly?.pricePerMonthString ?? null;
  const monthlyAvailable = Boolean(priceDetails?.monthly?.priceString);
  const yearlyAvailable = Boolean(priceDetails?.yearly?.priceString);

  const handlePurchase = async (plan: PlanType) => {
    if (isPro) return;
    setAction(plan);
    try {
      await purchasePro(plan);
      Alert.alert(t.purchaseSuccess);
      router.back();
    } catch {
      Alert.alert(t.purchaseFailed);
    } finally {
      setAction(null);
    }
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

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.screenBgAlt }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { borderColor: colors.borderMedium, backgroundColor: colors.surfaceBg }]}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t.paywallHeaderTitle}</Text>
      </View>

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

      <View style={[styles.section, { backgroundColor: colors.surfaceBg, borderColor: colors.borderLight }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.paywallPlansTitle}</Text>
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

        <View style={[styles.planCard, styles.planHighlight, { borderColor: colors.planHighlightBorder, backgroundColor: colors.planHighlightBg }]}>
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
          <Text style={[styles.planSub, { color: colors.textMuted }]}>{t.paywallYearlySavings}</Text>
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
      </View>

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

      <Pressable onPress={() => router.back()} style={[styles.stayFreeButton, { backgroundColor: colors.surfaceBg, borderColor: colors.borderMedium }]}>
        <Text style={[styles.stayFreeText, { color: colors.textSecondary }]}>{t.paywallCtaStayFree}</Text>
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
  planCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  planHighlight: {},
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
});
