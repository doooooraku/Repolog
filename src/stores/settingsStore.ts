import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

type SettingsState = {
  includeLocation: boolean;
  setIncludeLocation: (value: boolean) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  authorName: string;
  setAuthorName: (name: string) => void;
  reviewPromptShownFreeAt: string | null;
  setReviewPromptShownFreeAt: (iso: string) => void;
  reviewPromptShownProAt: string | null;
  setReviewPromptShownProAt: (iso: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      includeLocation: true,
      setIncludeLocation: (value) => set({ includeLocation: value }),
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
      authorName: '',
      setAuthorName: (name) => set({ authorName: name }),
      reviewPromptShownFreeAt: null,
      setReviewPromptShownFreeAt: (iso) => set({ reviewPromptShownFreeAt: iso }),
      reviewPromptShownProAt: null,
      setReviewPromptShownProAt: (iso) => set({ reviewPromptShownProAt: iso }),
    }),
    {
      name: 'repolog-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
