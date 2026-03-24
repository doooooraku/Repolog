import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';
import 'react-native-reanimated';

import tamaguiConfig from '@/tamagui.config';
import { useAppTheme } from '@/hooks/useAppTheme';
import { proService } from '@/src/services/proService';
import { useProStore } from '@/src/stores/proStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { colorScheme, isDark } = useAppTheme();

  useEffect(() => {
    const remove = proService.addCustomerInfoListener((state) => {
      useProStore.setState({ state, isPro: state.isPro, initialized: true });
    });
    return () => { remove?.(); };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme}>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="reports/new" options={{ headerShown: false }} />
            <Stack.Screen name="reports/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="reports/[id]/pdf" options={{ headerShown: false }} />
            <Stack.Screen name="pro" options={{ headerShown: false }} />
            <Stack.Screen name="backup" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </ThemeProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
