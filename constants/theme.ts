import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Backgrounds
    screenBg: '#f9fafb',
    screenBgAlt: '#f6f6f6',
    surfaceBg: '#ffffff',
    surfaceBgAlt: '#fafafa',
    surfaceHighlight: '#f3f3f5',

    // Text
    textPrimary: '#0a0a0a',
    textHeading: '#101828',
    textSecondary: '#4a5565',
    textMuted: '#6a7282',
    textPlaceholder: '#717182',
    textOnPrimary: '#ffffff',

    // Borders
    borderDefault: 'rgba(0, 0, 0, 0.1)',
    borderLight: '#eeeeee',
    borderMedium: '#dddddd',

    // Primary actions
    primaryBg: '#030213',
    primaryText: '#ffffff',

    // Misc
    imagePlaceholder: '#d4d4d8',
    photoCardBg: '#e5e7eb',

    // Tags
    tagChipBg: '#f3f4f6',
    tagChipBorder: '#d1d5db',
    tagChipText: '#111827',
    tagChipRemove: '#374151',

    // Undo banner
    undoBannerBg: '#eff6ff',
    undoBannerBorder: '#dbeafe',
    undoBannerText: '#1e3a8a',
    undoActionText: '#1d4ed8',

    // Pro badge
    activeBadgeBg: '#e7f6ea',
    activeBadgeBorder: '#b9e4c5',
    activeBadgeText: '#1f7a3e',

    // Paywall plan highlight
    planHighlightBg: '#fff7e0',
    planHighlightBorder: '#ffb800',
    badgeText: '#4b2d00',

    // PDF tab
    tabActive: '#111111',
  },
  dark: {
    // Backgrounds
    screenBg: '#111214',
    screenBgAlt: '#111214',
    surfaceBg: '#1c1d20',
    surfaceBgAlt: '#1c1d20',
    surfaceHighlight: '#27282c',

    // Text
    textPrimary: '#ecedee',
    textHeading: '#ecedee',
    textSecondary: '#9ba1a6',
    textMuted: '#6d7278',
    textPlaceholder: '#6d7278',
    textOnPrimary: '#ffffff',

    // Borders
    borderDefault: 'rgba(255, 255, 255, 0.1)',
    borderLight: '#2a2b2f',
    borderMedium: '#333537',

    // Primary actions
    primaryBg: '#ecedee',
    primaryText: '#111214',

    // Misc
    imagePlaceholder: '#27282c',
    photoCardBg: '#27282c',

    // Tags
    tagChipBg: '#27282c',
    tagChipBorder: '#3f4146',
    tagChipText: '#d1d5db',
    tagChipRemove: '#9ba1a6',

    // Undo banner
    undoBannerBg: '#1a2744',
    undoBannerBorder: '#1e3a5c',
    undoBannerText: '#93bbfb',
    undoActionText: '#60a5fa',

    // Pro badge
    activeBadgeBg: '#162e1c',
    activeBadgeBorder: '#2a5c37',
    activeBadgeText: '#6ee7a0',

    // Paywall plan highlight
    planHighlightBg: '#2a2210',
    planHighlightBorder: '#ffb800',
    badgeText: '#4b2d00',

    // PDF tab
    tabActive: '#ecedee',
  },
};

export type AppColors = typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
