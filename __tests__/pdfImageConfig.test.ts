import { PDF_IMAGE_CONFIGS } from '@/src/features/pdf/pdfTemplate';

describe('PDF image config', () => {
  test('standard layout uses 800px max edge', () => {
    expect(PDF_IMAGE_CONFIGS.standard.maxEdge).toBe(800);
    expect(PDF_IMAGE_CONFIGS.standard.quality).toBe(0.65);
  });

  test('large layout uses 1000px max edge', () => {
    expect(PDF_IMAGE_CONFIGS.large.maxEdge).toBe(1000);
    expect(PDF_IMAGE_CONFIGS.large.quality).toBe(0.7);
  });

  test('standard is smaller than large', () => {
    expect(PDF_IMAGE_CONFIGS.standard.maxEdge).toBeLessThan(
      PDF_IMAGE_CONFIGS.large.maxEdge,
    );
  });
});
