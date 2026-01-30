import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesOffering,
  type PurchasesStoreProduct,
} from 'react-native-purchases';

import type { ProState } from '@/src/types/models';
import { IAP_DEBUG } from '@/src/core/debug';

export type PlanType = 'monthly' | 'yearly';
export type PriceDetail = {
  title: string;
  priceString: string;
  price: number;
  currencyCode: string;
  pricePerMonth: number | null;
  pricePerMonthString: string | null;
  subscriptionPeriod: string | null;
};
export type PriceDetails = {
  monthly?: PriceDetail;
  yearly?: PriceDetail;
};

const PRO_STATE_KEY = 'dotchain_pro_state_v1';
const ENTITLEMENT_ID = 'Pro_Plan';
let configured = false;

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

function getExtraValue(key: string) {
  const expoConfig = Constants.expoConfig ?? Constants.manifest;
  const extra = (expoConfig as any)?.extra ?? {};
  return extra?.[key];
}

function getApiKey(): string | null {
  if (Platform.OS === 'ios') {
    return getExtraValue('REVENUECAT_IOS_API_KEY') ?? null;
  }
  if (Platform.OS === 'android') {
    return getExtraValue('REVENUECAT_ANDROID_API_KEY') ?? null;
  }
  return null;
}

async function saveState(state: ProState) {
  await SecureStore.setItemAsync(PRO_STATE_KEY, JSON.stringify(state));
}

function toProState(info: CustomerInfo): ProState {
  const isPro = Boolean(info.entitlements.active[ENTITLEMENT_ID]);
  return {
    isPro,
    anonUserId: info.originalAppUserId ?? null,
    lastCheckAt: new Date().toISOString(),
  };
}

async function ensureConfigured() {
  if (!isNative) return;
  if (configured) return;

  const apiKey = getApiKey();
  if (IAP_DEBUG) {
    console.log('[RC] platform=', Platform.OS, 'apiKey exists=', Boolean(apiKey), 'len=', apiKey?.length ?? 0);
  }
  if (!apiKey) {
    throw new Error('RevenueCat API key is missing.');
  }

  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  await Purchases.configure({ apiKey });
  if (IAP_DEBUG) {
    console.log('[RC] configured');
  }
  configured = true;
}

async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  await ensureConfigured();
  if (!isNative) return null;
  const offerings = await Purchases.getOfferings();
  if (IAP_DEBUG) {
    const currentId = offerings.current?.identifier ?? 'null';
    const packages = offerings.current?.availablePackages?.map((p) => ({
      id: p.identifier,
      type: p.packageType,
      productId: p.product.identifier,
    }));
    console.log('[RC] offerings.current=', currentId);
    console.log('[RC] availablePackages=', packages ?? []);
  }
  return offerings.current ?? null;
}

function findPackage(offering: PurchasesOffering | null, plan: PlanType): PurchasesPackage | null {
  if (!offering) return null;
  return plan === 'monthly' ? offering.monthly : offering.annual;
}

function toPriceDetail(product?: PurchasesStoreProduct | null): PriceDetail | null {
  if (!product) return null;
  return {
    title: product.title,
    priceString: product.priceString,
    price: product.price,
    currencyCode: product.currencyCode,
    pricePerMonth: product.pricePerMonth ?? null,
    pricePerMonthString: product.pricePerMonthString ?? null,
    subscriptionPeriod: product.subscriptionPeriod ?? null,
  };
}

async function getPriceDetails(): Promise<PriceDetails | null> {
  const offering = await getCurrentOffering();
  if (!offering) return null;
  return {
    monthly: toPriceDetail(offering.monthly?.product ?? null) ?? undefined,
    yearly: toPriceDetail(offering.annual?.product ?? null) ?? undefined,
  };
}

async function getPriceStrings(): Promise<{ monthly?: string; yearly?: string } | null> {
  const details = await getPriceDetails();
  if (!details) return null;
  return {
    monthly: details.monthly?.priceString,
    yearly: details.yearly?.priceString,
  };
}

export const proService = {
  async getPriceDetails() {
    return getPriceDetails();
  },
  async getPriceStrings() {
    return getPriceStrings();
  },
  async loadLocalState(): Promise<ProState | null> {
    try {
      const raw = await SecureStore.getItemAsync(PRO_STATE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ProState;
    } catch {
      return null;
    }
  },

  async refreshCustomerInfo(): Promise<ProState | null> {
    if (!isNative) return null;
    await ensureConfigured();
    const info = await Purchases.getCustomerInfo();
    const state = toProState(info);
    await saveState(state);
    return state;
  },

  async purchase(plan: PlanType): Promise<ProState> {
    await ensureConfigured();
    const offering = await getCurrentOffering();
    const pkg = findPackage(offering, plan);
    if (!pkg) {
      const currentId = offering?.identifier ?? 'null';
      throw new Error(
        IAP_DEBUG ? `Package not found. plan=${plan} current=${currentId}` : 'Package not found.',
      );
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const state = toProState(customerInfo);
    await saveState(state);
    return state;
  },

  async restore(): Promise<{ state: ProState; hasActive: boolean }> {
    await ensureConfigured();
    const customerInfo = await Purchases.restorePurchases();
    const state = toProState(customerInfo);
    await saveState(state);
    return { state, hasActive: state.isPro };
  },
};
