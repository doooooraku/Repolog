import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

type SettingsState = {
  includeLocation: boolean;
  setIncludeLocation: (value: boolean) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      includeLocation: true,
      setIncludeLocation: (value) => set({ includeLocation: value }),
      themeMode: 'light',
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'repolog-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
