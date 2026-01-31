import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const fontAssets = [
  {
    family: 'Noto Sans',
    source: require('@/assets/fonts/NotoSans-Variable.ttf'),
  },
  {
    family: 'Noto Sans JP',
    source: require('@/assets/fonts/NotoSansJP-Variable.ttf'),
  },
  {
    family: 'Noto Sans SC',
    source: require('@/assets/fonts/NotoSansSC-Variable.ttf'),
  },
  {
    family: 'Noto Sans TC',
    source: require('@/assets/fonts/NotoSansTC-Variable.ttf'),
  },
  {
    family: 'Noto Sans KR',
    source: require('@/assets/fonts/NotoSansKR-Variable.ttf'),
  },
  {
    family: 'Noto Sans Thai',
    source: require('@/assets/fonts/NotoSansThai-Variable.ttf'),
  },
  {
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

export async function buildPdfFontCss() {
  const rules = await Promise.all(
    fontAssets.map(async (font) => {
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
