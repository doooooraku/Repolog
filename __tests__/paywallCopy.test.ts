import baseEn from '@/src/core/i18n/locales/en';
import de from '@/src/core/i18n/locales/de';
import es from '@/src/core/i18n/locales/es';
import fr from '@/src/core/i18n/locales/fr';
import hi from '@/src/core/i18n/locales/hi';
import id from '@/src/core/i18n/locales/id';
import it from '@/src/core/i18n/locales/it';
import ja from '@/src/core/i18n/locales/ja';
import ko from '@/src/core/i18n/locales/ko';
import nl from '@/src/core/i18n/locales/nl';
import pl from '@/src/core/i18n/locales/pl';
import pt from '@/src/core/i18n/locales/pt';
import ru from '@/src/core/i18n/locales/ru';
import sv from '@/src/core/i18n/locales/sv';
import th from '@/src/core/i18n/locales/th';
import tr from '@/src/core/i18n/locales/tr';
import vi from '@/src/core/i18n/locales/vi';
import zhHans from '@/src/core/i18n/locales/zhHans';
import zhHant from '@/src/core/i18n/locales/zhHant';

const paywallKeys = [
  'paywallHeaderTitle',
  'paywallHeroSubtitle',
  'paywallPlansTitle',
  'paywallPlanMonthlyTitle',
  'paywallPlanYearlyTitle',
  'paywallBestValueBadge',
  'paywallBadgeShort',
  'paywallPricePerMonthLabel',
  'paywallYearlySavings',
  'paywallCtaYearly',
  'paywallCtaMonthly',
  'paywallCtaStayFree',
  'paywallFinePrint',
  'paywallRestoreTitle',
  'paywallRestoreDesc',
] as const;

describe('paywall copy', () => {
  test('en/ja paywall subtitle reflects Repolog value (photo + PDF)', () => {
    expect(baseEn.paywallHeroSubtitle).toMatch(/photo/i);
    expect(baseEn.paywallHeroSubtitle).toMatch(/pdf/i);
    expect(baseEn.paywallHeroSubtitle).not.toMatch(/habit|chain|dot/i);

    expect(ja.paywallHeroSubtitle).toContain('写真');
    expect(ja.paywallHeroSubtitle).toContain('PDF');
    expect(ja.paywallHeroSubtitle).not.toMatch(/習慣|チェーン|ドット/);
  });

  test('all 19 languages resolve paywall keys (fallback allowed)', () => {
    const locales = {
      en: baseEn,
      ja,
      fr,
      es,
      de,
      it,
      pt,
      ru,
      'zh-Hans': zhHans,
      'zh-Hant': zhHant,
      ko,
      th,
      id,
      vi,
      hi,
      tr,
      nl,
      pl,
      sv,
    } as const;

    Object.values(locales).forEach((locale) => {
      const merged = { ...baseEn, ...locale };
      paywallKeys.forEach((key) => {
        expect(typeof merged[key]).toBe('string');
        expect(merged[key].trim().length).toBeGreaterThan(0);
      });
    });
  });
});
