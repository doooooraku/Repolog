import {
  ALL_PDF_FONT_KEYS,
  containsUnsupportedScripts,
  detectPdfScriptSubset,
  selectPdfFontKeys,
} from '@/src/features/pdf/pdfFontSelection';

describe('pdfFontSelection', () => {
  test('uses all fonts when experiment is disabled', () => {
    const result = selectPdfFontKeys({
      text: 'Bridge inspection report',
      localeHint: 'en',
      subsetExperimentEnabled: false,
    });

    expect(result.strategy).toBe('all_fonts');
    expect(result.reason).toBe('experiment_disabled');
    expect(result.selectedFontKeys).toEqual([...ALL_PDF_FONT_KEYS]);
  });

  test('uses latin-only subset for plain latin text when experiment is enabled', () => {
    const result = selectPdfFontKeys({
      text: 'Bridge inspection report',
      localeHint: 'en',
      subsetExperimentEnabled: true,
    });

    expect(result.strategy).toBe('script_subset');
    expect(result.reason).toBe('script_subset');
    expect(result.selectedFontKeys).toEqual(['latin']);
  });

  test('selects JP font for Japanese text with ja locale hint', () => {
    const subset = detectPdfScriptSubset('点検レポート', 'ja');
    expect(subset).toEqual(['latin', 'jp']);
  });

  test('selects broad CJK fallback when locale hint is not CJK-specific', () => {
    const subset = detectPdfScriptSubset('点検レポート', 'en');
    expect(subset).toEqual(['latin', 'jp', 'sc', 'tc']);
  });

  test('falls back to all fonts when unsupported script is included', () => {
    const result = selectPdfFontKeys({
      text: 'مرحبا world',
      localeHint: 'en',
      subsetExperimentEnabled: true,
    });

    expect(result.strategy).toBe('all_fonts');
    expect(result.reason).toBe('unsupported_script_fallback');
    expect(result.selectedFontKeys).toEqual([...ALL_PDF_FONT_KEYS]);
  });

  test('treats emoji as unsupported and forces all-font fallback', () => {
    expect(containsUnsupportedScripts('✅')).toBe(true);
  });
});
