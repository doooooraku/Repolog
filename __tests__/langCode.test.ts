import { normalizeLangCode } from '@/src/core/i18n/langCode';

describe('normalizeLangCode', () => {
  test('keeps BCP47 Chinese codes as-is', () => {
    expect(normalizeLangCode('zh-Hans')).toBe('zh-Hans');
    expect(normalizeLangCode('zh-Hant')).toBe('zh-Hant');
  });

  test('migrates legacy Chinese codes to BCP47', () => {
    expect(normalizeLangCode('zhHans')).toBe('zh-Hans');
    expect(normalizeLangCode('zhHant')).toBe('zh-Hant');
  });

  test('detects Chinese script by language tag', () => {
    expect(normalizeLangCode('zh', 'zh-Hant-TW')).toBe('zh-Hant');
    expect(normalizeLangCode('zh', 'zh-Hans-CN')).toBe('zh-Hans');
  });

  test('falls back to English for unsupported codes', () => {
    expect(normalizeLangCode('xx')).toBe('en');
  });
});
