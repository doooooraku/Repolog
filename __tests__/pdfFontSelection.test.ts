import {
  ALL_PDF_FONT_KEYS,
  containsUnsupportedScripts,
  detectPdfScriptSubset,
  selectPdfFontKeys,
} from '@/src/features/pdf/pdfFontSelection';

describe('pdfFontSelection', () => {
  describe('selectPdfFontKeys (language-based)', () => {
    test('selects latin + jp for Japanese language', () => {
      const result = selectPdfFontKeys({ lang: 'ja' });
      expect(result.strategy).toBe('lang_based');
      expect(result.reason).toBe('lang_match');
      expect(result.selectedFontKeys).toEqual(['latin', 'jp']);
    });

    test('selects latin only for English language', () => {
      const result = selectPdfFontKeys({ lang: 'en' });
      expect(result.selectedFontKeys).toEqual(['latin']);
    });

    test('selects latin + kr for Korean language', () => {
      const result = selectPdfFontKeys({ lang: 'ko' });
      expect(result.selectedFontKeys).toEqual(['latin', 'kr']);
    });

    test('selects latin + sc for Simplified Chinese', () => {
      const result = selectPdfFontKeys({ lang: 'zh-Hans' });
      expect(result.selectedFontKeys).toEqual(['latin', 'sc']);
    });

    test('selects latin + tc for Traditional Chinese', () => {
      const result = selectPdfFontKeys({ lang: 'zh-Hant' });
      expect(result.selectedFontKeys).toEqual(['latin', 'tc']);
    });

    test('selects latin + devanagari for Hindi', () => {
      const result = selectPdfFontKeys({ lang: 'hi' });
      expect(result.selectedFontKeys).toEqual(['latin', 'devanagari']);
    });

    test('selects latin + thai for Thai', () => {
      const result = selectPdfFontKeys({ lang: 'th' });
      expect(result.selectedFontKeys).toEqual(['latin', 'thai']);
    });

    test('selects latin only for Latin-script languages', () => {
      for (const lang of ['fr', 'es', 'de', 'it', 'pt', 'ru', 'id', 'vi', 'tr', 'nl', 'pl', 'sv']) {
        const result = selectPdfFontKeys({ lang });
        expect(result.selectedFontKeys).toEqual(['latin']);
      }
    });

    test('falls back to latin for unknown language', () => {
      const result = selectPdfFontKeys({ lang: 'xx' });
      expect(result.selectedFontKeys).toEqual(['latin']);
    });
  });

  describe('content-based supplement', () => {
    test('adds kr font when Korean text found in ja-mode report', () => {
      const result = selectPdfFontKeys({ lang: 'ja', text: '点検レポート 서울' });
      expect(result.strategy).toBe('lang_plus_content');
      expect(result.reason).toBe('additional_scripts_found');
      expect(result.selectedFontKeys).toContain('jp');
      expect(result.selectedFontKeys).toContain('kr');
    });

    test('does not add extra fonts when text matches language', () => {
      const result = selectPdfFontKeys({ lang: 'ja', text: '点検レポート' });
      expect(result.strategy).toBe('lang_based');
      expect(result.selectedFontKeys).toEqual(['latin', 'jp']);
    });

    test('falls back to all fonts when unsupported script in text', () => {
      const result = selectPdfFontKeys({ lang: 'ja', text: 'مرحبا world' });
      expect(result.strategy).toBe('all_fonts');
      expect(result.reason).toBe('unsupported_script_fallback');
      expect(result.selectedFontKeys).toEqual([...ALL_PDF_FONT_KEYS]);
    });
  });

  describe('detectPdfScriptSubset', () => {
    test('detects Japanese text with ja locale', () => {
      expect(detectPdfScriptSubset('点検レポート', 'ja')).toEqual(['latin', 'jp']);
    });

    test('uses broad CJK fallback without CJK locale', () => {
      expect(detectPdfScriptSubset('点検レポート', 'en')).toEqual(['latin', 'jp', 'sc', 'tc']);
    });
  });

  describe('containsUnsupportedScripts', () => {
    test('returns true for Arabic', () => {
      expect(containsUnsupportedScripts('مرحبا')).toBe(true);
    });

    test('returns true for emoji', () => {
      expect(containsUnsupportedScripts('✅')).toBe(true);
    });

    test('returns false for Latin text', () => {
      expect(containsUnsupportedScripts('Hello')).toBe(false);
    });

    test('returns false for Japanese text', () => {
      expect(containsUnsupportedScripts('こんにちは')).toBe(false);
    });
  });
});
