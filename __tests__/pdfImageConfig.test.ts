import { PDF_IMAGE_CONFIGS } from '@/src/features/pdf/pdfTemplate';

describe('PDF image config', () => {
  test('standard layout uses 1200px max edge', () => {
    expect(PDF_IMAGE_CONFIGS.standard.maxEdge).toBe(1200);
    expect(PDF_IMAGE_CONFIGS.standard.quality).toBe(0.80);
  });

  test('large layout uses 1600px max edge', () => {
    expect(PDF_IMAGE_CONFIGS.large.maxEdge).toBe(1600);
    expect(PDF_IMAGE_CONFIGS.large.quality).toBe(0.80);
  });

  test('standard is smaller than large', () => {
    expect(PDF_IMAGE_CONFIGS.standard.maxEdge).toBeLessThan(
      PDF_IMAGE_CONFIGS.large.maxEdge,
    );
  });

  describe('DPI validation (A4)', () => {
    // A4: 210mm width, page padding 12mm each side → photo width = 186mm
    const A4_PHOTO_WIDTH_INCH = (210 - 24) / 25.4; // 7.32 inches

    test('standard layout achieves >= 150 DPI on A4', () => {
      const dpi = PDF_IMAGE_CONFIGS.standard.maxEdge / A4_PHOTO_WIDTH_INCH;
      expect(dpi).toBeGreaterThanOrEqual(150);
    });

    test('large layout achieves >= 150 DPI on A4', () => {
      const dpi = PDF_IMAGE_CONFIGS.large.maxEdge / A4_PHOTO_WIDTH_INCH;
      expect(dpi).toBeGreaterThanOrEqual(150);
    });
  });
});
