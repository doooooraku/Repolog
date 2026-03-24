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

import { _toProState, _findPackage } from '@/src/services/proService';
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
