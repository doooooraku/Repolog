jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    getOfferings: jest.fn(),
    getCustomerInfo: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  LOG_LEVEL: { DEBUG: 'DEBUG' },
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import { _toProState, _findPackage, _derivePlanType } from '@/src/services/proService';
import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

/* ---------- toProState ---------- */

function fakeCustomerInfo(overrides: Partial<CustomerInfo> = {}): CustomerInfo {
  return {
    entitlements: { all: {}, active: {}, verification: 'NOT_REQUESTED' as any },
    activeSubscriptions: [],
    allPurchasedProductIdentifiers: [],
    latestExpirationDate: null,
    firstSeen: '2024-01-01T00:00:00Z',
    originalAppUserId: 'anon-123',
    requestDate: '2024-01-01T00:00:00Z',
    allExpirationDates: {},
    allPurchaseDates: {},
    originalApplicationVersion: null,
    originalPurchaseDate: null,
    managementURL: null,
    nonSubscriptionTransactions: [],
    ...overrides,
  } as unknown as CustomerInfo;
}

describe('toProState', () => {
  test('returns isPro=true when Pro_Plan entitlement is active', () => {
    const info = fakeCustomerInfo({
      entitlements: {
        all: {},
        active: { Pro_Plan: {} as any },
        verification: 'NOT_REQUESTED' as any,
      },
    });
    const state = _toProState(info);
    expect(state.isPro).toBe(true);
    expect(state.anonUserId).toBe('anon-123');
    expect(state.lastCheckAt).toBeDefined();
  });

  test('returns isPro=false when no active entitlements', () => {
    const info = fakeCustomerInfo();
    const state = _toProState(info);
    expect(state.isPro).toBe(false);
    expect(state.planType).toBeNull();
    expect(state.expirationDate).toBeNull();
    expect(state.managementURL).toBeNull();
  });

  test('returns isPro=false when different entitlement is active', () => {
    const info = fakeCustomerInfo({
      entitlements: {
        all: {},
        active: { Other_Plan: {} as any },
        verification: 'NOT_REQUESTED' as any,
      },
    });
    const state = _toProState(info);
    expect(state.isPro).toBe(false);
  });

  test('extracts planType=lifetime when expirationDate is null', () => {
    const info = fakeCustomerInfo({
      entitlements: {
        all: {},
        active: {
          Pro_Plan: {
            productIdentifier: 'repolog_pro_lifetime',
            expirationDate: null,
          } as any,
        },
        verification: 'NOT_REQUESTED' as any,
      },
      managementURL: 'https://play.google.com/store/account/subscriptions',
    });
    const state = _toProState(info);
    expect(state.isPro).toBe(true);
    expect(state.planType).toBe('lifetime');
    expect(state.expirationDate).toBeNull();
    expect(state.managementURL).toBe('https://play.google.com/store/account/subscriptions');
  });

  test('extracts planType=yearly with expirationDate', () => {
    const info = fakeCustomerInfo({
      entitlements: {
        all: {},
        active: {
          Pro_Plan: {
            productIdentifier: 'repolog_pro_yearly',
            expirationDate: '2027-03-28T00:00:00Z',
          } as any,
        },
        verification: 'NOT_REQUESTED' as any,
      },
      managementURL: 'https://apps.apple.com/account/subscriptions',
    });
    const state = _toProState(info);
    expect(state.isPro).toBe(true);
    expect(state.planType).toBe('yearly');
    expect(state.expirationDate).toBe('2027-03-28T00:00:00Z');
    expect(state.managementURL).toBe('https://apps.apple.com/account/subscriptions');
  });

  test('extracts planType=monthly with expirationDate', () => {
    const info = fakeCustomerInfo({
      entitlements: {
        all: {},
        active: {
          Pro_Plan: {
            productIdentifier: 'repolog_pro_monthly',
            expirationDate: '2026-04-28T00:00:00Z',
          } as any,
        },
        verification: 'NOT_REQUESTED' as any,
      },
    });
    const state = _toProState(info);
    expect(state.planType).toBe('monthly');
    expect(state.expirationDate).toBe('2026-04-28T00:00:00Z');
  });
});

/* ---------- derivePlanType ---------- */

describe('derivePlanType', () => {
  test('returns lifetime when no expiration', () => {
    expect(_derivePlanType('repolog_pro_lifetime', false)).toBe('lifetime');
  });

  test('returns lifetime for product ID containing "lifetime"', () => {
    expect(_derivePlanType('repolog_pro_lifetime', true)).toBe('lifetime');
  });

  test('returns yearly for product ID containing "annual"', () => {
    expect(_derivePlanType('repolog_pro_annual', true)).toBe('yearly');
  });

  test('returns yearly for product ID containing "yearly"', () => {
    expect(_derivePlanType('repolog_pro_yearly', true)).toBe('yearly');
  });

  test('returns monthly for product ID containing "monthly"', () => {
    expect(_derivePlanType('repolog_pro_monthly', true)).toBe('monthly');
  });

  test('returns null for undefined product ID', () => {
    expect(_derivePlanType(undefined, true)).toBeNull();
  });

  test('returns null for unrecognized product ID', () => {
    expect(_derivePlanType('unknown_product', true)).toBeNull();
  });
});

/* ---------- findPackage ---------- */

function fakeOffering(overrides: Partial<PurchasesOffering> = {}): PurchasesOffering {
  return {
    identifier: 'default',
    serverDescription: 'Default offering',
    availablePackages: [],
    metadata: {},
    monthly: { identifier: '$rc_monthly' } as PurchasesPackage,
    annual: { identifier: '$rc_annual' } as PurchasesPackage,
    lifetime: { identifier: '$rc_lifetime' } as PurchasesPackage,
    ...overrides,
  } as unknown as PurchasesOffering;
}

describe('findPackage', () => {
  test('returns monthly package for monthly plan', () => {
    const offering = fakeOffering();
    const pkg = _findPackage(offering, 'monthly');
    expect(pkg?.identifier).toBe('$rc_monthly');
  });

  test('returns annual package for yearly plan', () => {
    const offering = fakeOffering();
    const pkg = _findPackage(offering, 'yearly');
    expect(pkg?.identifier).toBe('$rc_annual');
  });

  test('returns lifetime package for lifetime plan', () => {
    const offering = fakeOffering();
    const pkg = _findPackage(offering, 'lifetime');
    expect(pkg?.identifier).toBe('$rc_lifetime');
  });

  test('returns null when offering is null', () => {
    const pkg = _findPackage(null, 'monthly');
    expect(pkg).toBeNull();
  });

  test('returns null when package is missing from offering', () => {
    const offering = fakeOffering({ monthly: null as any });
    const pkg = _findPackage(offering, 'monthly');
    expect(pkg).toBeNull();
  });
});
