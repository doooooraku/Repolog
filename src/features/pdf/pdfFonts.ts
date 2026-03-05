import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

import { selectPdfFontKeys } from './pdfFontSelection';
import type { PdfFontKey } from './pdfFontSelection';

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

const fontCache = new Map<FontAsset['source'], string>();

async function loadFontDataUri(source: FontAsset['source']) {
  const cached = fontCache.get(source);
  if (cached) return cached;

  const asset = Asset.fromModule(source);
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  const uri = asset.localUri ?? asset.uri;
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });
  const dataUri = `data:font/ttf;base64,${base64}`;
  fontCache.set(source, dataUri);
  return dataUri;
}

export function clearFontCache() {
  fontCache.clear();
}

type BuildPdfFontCssOptions = {
  lang: string;
  textForSubset?: string;
};

export async function buildPdfFontCss(options: BuildPdfFontCssOptions) {
  const selection = selectPdfFontKeys({
    lang: options.lang,
    text: options.textForSubset,
  });

  const selectedKeys = new Set<PdfFontKey>(selection.selectedFontKeys);
  const selectedFonts = fontAssets.filter((font) => selectedKeys.has(font.key));
  const rules = await Promise.all(
    selectedFonts.map(async (font) => {
      const dataUri = await loadFontDataUri(font.source);
      return `@font-face {\n  font-family: '${font.family}';\n  src: url('${dataUri}') format('truetype');\n  font-weight: 100 900;\n  font-style: normal;\n}`;
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
