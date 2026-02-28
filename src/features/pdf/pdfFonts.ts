import Constants from 'expo-constants';
import { Asset } from 'expo-asset';

import { selectPdfFontKeys } from './pdfFontSelection';

const EXPERIMENT_FLAG_KEY = 'PDF_FONT_SUBSET_EXPERIMENT';

const fontAssets = [
  {
    key: 'latin',
    family: 'Noto Sans',
    source: require('@/assets/fonts/NotoSans-Variable.ttf'),
  },
  {
    key: 'jp',
    family: 'Noto Sans JP',
    source: require('@/assets/fonts/NotoSansJP-Variable.ttf'),
  },
  {
    key: 'sc',
    family: 'Noto Sans SC',
    source: require('@/assets/fonts/NotoSansSC-Variable.ttf'),
  },
  {
    key: 'tc',
    family: 'Noto Sans TC',
    source: require('@/assets/fonts/NotoSansTC-Variable.ttf'),
  },
  {
    key: 'kr',
    family: 'Noto Sans KR',
    source: require('@/assets/fonts/NotoSansKR-Variable.ttf'),
  },
  {
    key: 'thai',
    family: 'Noto Sans Thai',
    source: require('@/assets/fonts/NotoSansThai-Variable.ttf'),
  },
  {
    key: 'devanagari',
    family: 'Noto Sans Devanagari',
    source: require('@/assets/fonts/NotoSansDevanagari-Variable.ttf'),
  },
] as const;

type FontAsset = (typeof fontAssets)[number];
type FontAssetKey = FontAsset['key'];

const fontUriCache = new Map<FontAsset['source'], string>();

/**
 * Return a file:// URI pointing to the font on disk.
 *
 * Previous implementation read the whole font file into memory, base64-encoded
 * it, and embedded it as a data-URI in the HTML string.  For CJK variable
 * fonts this produced 10-17 MB of base64 **per font**, pushing the WebView
 * renderer past Android's 256 MB heap limit (OOM).
 *
 * The new approach references the font directly via its local file path.
 * Android's WebView can resolve `file://` URIs, so the font is loaded from
 * disk on demand instead of being buffered in the JS heap.  This eliminates
 * the ~15 MB base64 overhead for a typical Japanese-locale PDF.
 */
async function loadFontFileUri(source: FontAsset['source']) {
  const cached = fontUriCache.get(source);
  if (cached) return cached;

  const asset = Asset.fromModule(source);
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  const fileUri = asset.localUri ?? asset.uri;
  fontUriCache.set(source, fileUri);
  return fileUri;
}

function toBooleanFlag(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true';
}

function isSubsetExperimentEnabled() {
  const expoConfig = Constants.expoConfig ?? Constants.manifest;
  const extra = (expoConfig as { extra?: Record<string, unknown> } | null)?.extra ?? {};
  return toBooleanFlag(extra?.[EXPERIMENT_FLAG_KEY]);
}

type BuildPdfFontCssOptions = {
  textForSubset?: string;
  localeHint?: string;
};

export async function buildPdfFontCss(options: BuildPdfFontCssOptions = {}) {
  const selection = selectPdfFontKeys({
    text: options.textForSubset ?? '',
    localeHint: options.localeHint,
    subsetExperimentEnabled: isSubsetExperimentEnabled(),
  });

  const selectedKeys = new Set<FontAssetKey>(selection.selectedFontKeys);
  const selectedFonts = fontAssets.filter((font) => selectedKeys.has(font.key));
  const rules = await Promise.all(
    selectedFonts.map(async (font) => {
      const uri = await loadFontFileUri(font.source);
      return `@font-face {\n  font-family: '${font.family}';\n  src: url('${uri}') format('truetype');\n  font-weight: 100 900;\n  font-style: normal;\n}`;
    }),
  );

  return rules.join('\n');
}

export const pdfFontStack = [
  '"Noto Sans"',
  '"Noto Sans JP"',
  '"Noto Sans SC"',
  '"Noto Sans TC"',
  '"Noto Sans KR"',
  '"Noto Sans Thai"',
  '"Noto Sans Devanagari"',
  'system-ui',
  '-apple-system',
  'Segoe UI',
  'Arial',
  'sans-serif',
].join(', ');
