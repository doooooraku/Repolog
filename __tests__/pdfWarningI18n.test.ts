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

describe('pdf warning i18n', () => {
  test('all 19 languages define warning strings with {count} placeholder', () => {
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

    Object.entries(locales).forEach(([code, locale]) => {
      const merged = { ...baseEn, ...locale };
      expect(merged.pdfPhotoWarningTitle.trim().length).toBeGreaterThan(0);
      expect(merged.pdfPhotoWarningBody).toContain('{count}');
      expect(merged.pdfPhotoWarningContinue.trim().length).toBeGreaterThan(0);
      expect(merged.pdfPhotoWarningCancel.trim().length).toBeGreaterThan(0);

      if (code !== 'en') {
        expect(merged.pdfPhotoWarningTitle).not.toBe(baseEn.pdfPhotoWarningTitle);
        expect(merged.pdfPhotoWarningBody).not.toBe(baseEn.pdfPhotoWarningBody);
      }
    });
  });
});
