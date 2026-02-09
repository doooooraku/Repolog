import { getLegalLinks } from '@/src/services/legalService';

describe('legalService', () => {
  test('returns default links when extras are missing', () => {
    const links = getLegalLinks({});
    expect(links.privacyUrl).toBe('https://doooooraku.github.io/Repolog/privacy/');
    expect(links.termsUrl).toBe('https://doooooraku.github.io/Repolog/terms/');
  });

  test('uses configured links when valid', () => {
    const links = getLegalLinks({
      LEGAL_PRIVACY_URL: 'https://example.com/privacy',
      LEGAL_TERMS_URL: 'https://example.com/terms',
    });
    expect(links.privacyUrl).toBe('https://example.com/privacy');
    expect(links.termsUrl).toBe('https://example.com/terms');
  });

  test('falls back when configured links are invalid', () => {
    const links = getLegalLinks({
      LEGAL_PRIVACY_URL: 'javascript:alert(1)',
      LEGAL_TERMS_URL: '',
    });
    expect(links.privacyUrl).toBe('https://doooooraku.github.io/Repolog/privacy/');
    expect(links.termsUrl).toBe('https://doooooraku.github.io/Repolog/terms/');
  });
});
