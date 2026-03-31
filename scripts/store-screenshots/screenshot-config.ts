/**
 * App-specific configuration for store screenshot generation.
 *
 * This file is the SINGLE SOURCE OF TRUTH for all app-specific values.
 * The generation scripts (generate.ts, lib/*.ts) are fully generic —
 * only this file needs to change when adapting for a different app.
 *
 * Workflow:
 *   1. Update this config for your app
 *   2. Claude Code generates marketing-text.ts based on this config (Phase 0)
 *   3. Capture raw screenshots with Maestro (Phase 1)
 *   4. Run `pnpm store-screenshots` to composite final images (Phase 2)
 */

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface ScreenDef {
  /** Screenshot filename without extension (e.g. '01_home') */
  id: string;
  /** Key in MarketingText interface (e.g. 'screen1') */
  key: string;
  /** Human-readable screen name */
  name: string;
  /** What this screen shows (used by Claude Code to understand the screenshot) */
  description: string;
  /** What marketing message to convey (used by Claude Code to write copy) */
  marketingFocus: string;
}

export interface ScreenshotConfig {
  app: {
    name: string;
    packageId: string;
    description: string;
  };
  persona: {
    /** Who is the target user? */
    target: string;
    /** In what context do they use the app? */
    context: string;
    /** What tone should the marketing text use? */
    tone: string;
    /** What to avoid in the text */
    avoid: string;
  };
  screens: ScreenDef[];
  textGuidelines: {
    /** Approximate max character count per line */
    maxChars: { cjk: number; latin: number };
    /** How to approach multi-language text */
    style: string;
    /** Core requirement for the text */
    requirement: string;
    /** ASO (App Store Optimization) note */
    asoNote: string;
  };
  /** BCP-47 locale codes to generate */
  locales: string[];
  /** Locale code -> raw screenshot directory name mapping */
  localeDirMap: Record<string, string>;
  capture: {
    /** Pixels to crop from top of raw screenshot (Android status bar) */
    cropTop: number;
    /** Pixels to crop from bottom of raw screenshot (Android gesture bar) */
    cropBottom: number;
    /** Device used for capture (for documentation) */
    deviceNote: string;
  };
}

// ---------------------------------------------------------------------------
// Repolog configuration
// ---------------------------------------------------------------------------

export const screenshotConfig: ScreenshotConfig = {
  app: {
    name: 'Repolog',
    packageId: 'com.dooooraku.repolog',
    description:
      '建設現場の施工記録・レポート作成アプリ。写真撮影、天気・位置情報の自動取得、PDF出力に対応。',
  },

  persona: {
    target: '現場作業者・現場監督',
    context: '建設現場で毎日使う、写真撮影とレポート作成のツール',
    tone: '実務的、簡潔、現場で日常的に使う言葉',
    avoid: '技術用語の多用、マーケティング的な誇張表現',
  },

  screens: [
    {
      id: '01_home',
      key: 'screen1',
      name: 'Home',
      description: 'レポート一覧画面。写真付きカードでレポートが並ぶ。',
      marketingFocus: '記録が1箇所にまとまる便利さ',
    },
    {
      id: '02_editor_top',
      key: 'screen2',
      name: 'Editor（上部）',
      description:
        'レポート編集画面の上部。基本情報、天気、位置情報の入力フォーム。',
      marketingFocus: '入力の手軽さ、天気・位置の自動補完',
    },
    {
      id: '03_editor_bottom',
      key: 'screen3',
      name: 'Editor（下部）',
      description:
        'レポート編集画面の下部。コメント入力と写真セクション。',
      marketingFocus: '写真とメモを一緒に記録できる',
    },
    {
      id: '04_pdf_preview',
      key: 'screen4',
      name: 'PDFプレビュー',
      description: 'PDF出力のプレビュー画面。レポートの表紙が表示される。',
      marketingFocus: 'ワンタップで提出用PDFを生成できる',
    },
  ],

  textGuidelines: {
    maxChars: { cjk: 18, latin: 45 },
    style:
      '各言語で独自に作成する（日本語からの翻訳ではない）。その国のネイティブスピーカーが自然に使う言葉で書く。',
    requirement:
      '各テキストは対応するスクリーンショットの内容と1:1で対応するキャッチコピー。1〜2行。',
    asoNote:
      '各言語の検索キーワード（建設、現場、レポート等に相当する語）を自然に含める。',
  },

  locales: [
    'en', 'ja', 'fr', 'es', 'de', 'it', 'pt', 'ru',
    'zh-Hans', 'zh-Hant', 'ko', 'hi', 'id', 'th', 'vi', 'tr', 'nl', 'pl', 'sv',
  ],

  localeDirMap: {
    en: 'en_English',
    ja: 'ja_日本語',
    fr: 'fr_Français',
    es: 'es_Español',
    de: 'de_Deutsch',
    it: 'it_Italiano',
    pt: 'pt_Português',
    ru: 'ru_Русский',
    'zh-Hans': 'zh-Hans_简体中文',
    'zh-Hant': 'zh-Hant_繁體中文',
    ko: 'ko_한국어',
    hi: 'hi_हिन्दी',
    id: 'id_Indonesia',
    th: 'th_ไทย',
    vi: 'vi_Tiếng-Việt',
    tr: 'tr_Türkçe',
    nl: 'nl_Nederlands',
    pl: 'pl_Polski',
    sv: 'sv_Svenska',
  },

  capture: {
    cropTop: 56,
    cropBottom: 32,
    deviceNote: 'Pixel 8a (Maestro output: 720×1520)',
  },
};
