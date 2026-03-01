import { useMemo } from 'react';
import { Colors, type AppColors } from '@/constants/theme';
import { useSettingsStore } from '@/src/stores/settingsStore';

type AppTheme = {
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  colors: AppColors;
};

export function useAppTheme(): AppTheme {
  const themeMode = useSettingsStore((s) => s.themeMode);
  return useMemo(
    () => ({
      colorScheme: themeMode,
      isDark: themeMode === 'dark',
      colors: Colors[themeMode],
    }),
    [themeMode],
  );
}
