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
});
