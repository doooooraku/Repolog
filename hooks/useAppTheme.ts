import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, type AppColors } from '@/constants/theme';
import { useSettingsStore } from '@/src/stores/settingsStore';

type AppTheme = {
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  colors: AppColors;
};

export function useAppTheme(): AppTheme {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const osScheme = useColorScheme();

  const resolved = themeMode === 'system' ? (osScheme ?? 'light') : themeMode;

  return useMemo(
    () => ({
      colorScheme: resolved,
      isDark: resolved === 'dark',
      colors: Colors[resolved],
    }),
    [resolved],
  );
}
