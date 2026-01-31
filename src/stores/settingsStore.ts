import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsState = {
  includeLocation: boolean;
  setIncludeLocation: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      includeLocation: true,
      setIncludeLocation: (value) => set({ includeLocation: value }),
    }),
    {
      name: 'repolog-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
