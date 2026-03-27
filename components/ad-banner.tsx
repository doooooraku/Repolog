import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { getBannerUnitId, initializeAds } from '@/src/services/adService';

export function AdBanner() {
  const isWeb = Platform.OS === 'web';
  const unitId = getBannerUnitId();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isWeb) return;
    let mounted = true;
    void initializeAds()
      .then((canRenderAds) => {
        if (!mounted) return;
        setReady(canRenderAds);
      })
      .catch(() => {
        if (!mounted) return;
        setReady(false);
      });

    return () => {
      mounted = false;
    };
  }, [isWeb]);

  const handleAdFailedToLoad = useCallback((error: Error) => {
    if (__DEV__) {
      console.warn(`[AdBanner] failed to load: ${error.message}`);
    }
  }, []);

  if (isWeb || !unitId || !ready) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
        maxHeight={90}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
