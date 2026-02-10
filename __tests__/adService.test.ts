import {
  buildAdsConsentInfoOptions,
  parseConsentDebugGeography,
  parseConsentTestDeviceIdentifiers,
  showAdPrivacyOptionsForm,
} from '@/src/services/adService';
import {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
} from 'react-native-google-mobile-ads';

jest.mock('react-native-google-mobile-ads', () => {
  const mobileAds = jest.fn(() => ({
    initialize: jest.fn(),
  }));

  return {
    __esModule: true,
    default: mobileAds,
    AdsConsent: {
      gatherConsent: jest.fn(async () => ({
        canRequestAds: true,
        privacyOptionsRequirementStatus: 'NOT_REQUIRED',
      })),
      getConsentInfo: jest.fn(async () => ({
        canRequestAds: true,
        privacyOptionsRequirementStatus: 'NOT_REQUIRED',
      })),
      showPrivacyOptionsForm: jest.fn(async () => ({})),
    },
    AdsConsentDebugGeography: {
      DISABLED: 0,
      EEA: 1,
      NOT_EEA: 2,
      REGULATED_US_STATE: 3,
      OTHER: 4,
    },
    AdsConsentPrivacyOptionsRequirementStatus: {
      UNKNOWN: 'UNKNOWN',
      REQUIRED: 'REQUIRED',
      NOT_REQUIRED: 'NOT_REQUIRED',
    },
    TestIds: {
      ADAPTIVE_BANNER: 'test-banner',
    },
  };
});

describe('adService consent helpers', () => {
  test('parses debug geography names from env-style strings', () => {
    const eea = parseConsentDebugGeography('EEA');
    const regulatedUs = parseConsentDebugGeography('regulated-us-state');
    const other = parseConsentDebugGeography('OTHER');

    expect(eea).toBeDefined();
    expect(regulatedUs).toBeDefined();
    expect(other).toBeDefined();
    expect(parseConsentDebugGeography('eea')).toBe(eea);
    expect(parseConsentDebugGeography('REGULATED_US_STATE')).toBe(regulatedUs);
  });

  test('returns undefined for unsupported debug geography values', () => {
    expect(parseConsentDebugGeography('unknown')).toBeUndefined();
    expect(parseConsentDebugGeography('')).toBeUndefined();
    expect(parseConsentDebugGeography(undefined)).toBeUndefined();
  });

  test('parses comma-separated test device ids and removes duplicates', () => {
    expect(parseConsentTestDeviceIdentifiers(' abc , def,abc ,, ghi ')).toEqual([
      'abc',
      'def',
      'ghi',
    ]);
    expect(parseConsentTestDeviceIdentifiers('')).toBeUndefined();
  });

  test('builds consent options only when values are valid', () => {
    const eea = parseConsentDebugGeography('EEA');
    expect(eea).toBeDefined();

    expect(
      buildAdsConsentInfoOptions({
        ADMOB_CONSENT_DEBUG_GEOGRAPHY: 'EEA',
        ADMOB_CONSENT_TEST_DEVICE_IDS: 'abc,def',
      }),
    ).toEqual({
      debugGeography: eea,
      testDeviceIdentifiers: ['abc', 'def'],
    });

    expect(
      buildAdsConsentInfoOptions({
        ADMOB_CONSENT_DEBUG_GEOGRAPHY: 'INVALID',
        ADMOB_CONSENT_TEST_DEVICE_IDS: '',
      }),
    ).toEqual({});
  });
});

describe('adService privacy options', () => {
  const mockedAdsConsent = AdsConsent as unknown as {
    getConsentInfo: jest.Mock;
    showPrivacyOptionsForm: jest.Mock;
  };

  beforeEach(() => {
    mockedAdsConsent.getConsentInfo.mockReset();
    mockedAdsConsent.showPrivacyOptionsForm.mockReset();
  });

  test('returns false when privacy options are not required', async () => {
    mockedAdsConsent.getConsentInfo.mockResolvedValue({
      canRequestAds: true,
      privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.NOT_REQUIRED,
    });

    await expect(showAdPrivacyOptionsForm()).resolves.toBe(false);
    expect(mockedAdsConsent.showPrivacyOptionsForm).not.toHaveBeenCalled();
  });

  test('shows privacy options form when requirement is REQUIRED', async () => {
    mockedAdsConsent.getConsentInfo.mockResolvedValue({
      canRequestAds: true,
      privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    });
    mockedAdsConsent.showPrivacyOptionsForm.mockResolvedValue({});

    await expect(showAdPrivacyOptionsForm()).resolves.toBe(true);
    expect(mockedAdsConsent.showPrivacyOptionsForm).toHaveBeenCalledTimes(1);
  });
});
