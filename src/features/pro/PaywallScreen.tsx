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

import { useTranslation } from '@/src/core/i18n/i18n';
import { proService, type PlanType, type PriceDetails } from '@/src/services/proService';
import { useProStore } from '@/src/stores/proStore';

const DEFAULT_BADGE = '#ffb800';

export default function PaywallScreen() {
  const router = useRouter();
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t.proHeaderTitle}</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t.proHeaderTitle}</Text>
        <Text style={styles.heroSubtitle}>{t.proCompareSubtitle}</Text>
        {isPro && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>{t.proBadgeShort}</Text>
            <Text style={styles.activeBadgeSub}>{t.purchaseSuccess}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.proCompareTitle}</Text>
        <View style={styles.planCard}>
          <View style={styles.planRow}>
            <Text style={styles.planTitle}>{t.proPlanMonthlyTitle}</Text>
            <Text style={styles.planPrice}>{monthlyPriceLabel}</Text>
          </View>
          <Pressable
            onPress={() => handlePurchase('monthly')}
            style={[
              styles.ctaButton,
              (!monthlyAvailable || isPro) && styles.disabledButton,
            ]}
            disabled={!monthlyAvailable || isPro || action !== null}>
            {action === 'monthly' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>{t.proCtaMonthly}</Text>
            )}
          </Pressable>
        </View>

        <View style={[styles.planCard, styles.planHighlight]}>
          <View style={styles.planRow}>
            <Text style={styles.planTitle}>{t.proPlanYearlyTitle}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.proPlanYearlyBadge}</Text>
            </View>
          </View>
          <Text style={styles.planPrice}>{yearlyPriceLabel}</Text>
          {yearlyPerMonth && (
            <Text style={styles.planSub}>{`${t.subscriptionDetailsPerMonthLabel}: ${yearlyPerMonth}`}</Text>
          )}
          <Text style={styles.planSub}>{t.proYearlySavingShort}</Text>
          <Pressable
            onPress={() => handlePurchase('yearly')}
            style={[
              styles.ctaButton,
              (!yearlyAvailable || isPro) && styles.disabledButton,
            ]}
            disabled={!yearlyAvailable || isPro || action !== null}>
            {action === 'yearly' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>{t.proCtaYearly}</Text>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.restore}</Text>
        <Text style={styles.sectionSub}>{t.restoreDesc}</Text>
        <Pressable
          onPress={handleRestore}
          style={[styles.secondaryButton, action === 'restore' && styles.disabledButton]}
          disabled={action !== null}>
          {action === 'restore' ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.secondaryText}>{t.restore}</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.finePrint}>{t.proFinePrint}</Text>

      <Pressable onPress={() => router.back()} style={styles.stayFreeButton}>
        <Text style={styles.stayFreeText}>{t.proCtaStayFree}</Text>
      </Pressable>
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
  hero: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    gap: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  activeBadge: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#e7f6ea',
    borderWidth: 1,
    borderColor: '#b9e4c5',
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f7a3e',
  },
  activeBadgeSub: {
    fontSize: 12,
    color: '#1f7a3e',
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
  sectionSub: {
    fontSize: 12,
    color: '#666',
  },
  planCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    gap: 8,
  },
  planHighlight: {
    borderColor: DEFAULT_BADGE,
    backgroundColor: '#fff7e0',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  planSub: {
    fontSize: 12,
    color: '#666',
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
    color: '#4b2d00',
  },
  ctaButton: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryText: {
    color: '#111',
    fontWeight: '600',
  },
  finePrint: {
    fontSize: 11,
    color: '#777',
    lineHeight: 16,
  },
  stayFreeButton: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  stayFreeText: {
    fontWeight: '600',
    color: '#333',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
