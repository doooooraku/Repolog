import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { getBannerUnitId, initializeAds } from '@/src/services/adService';

export function AdBanner() {
  const isWeb = Platform.OS === 'web';
  const unitId = getBannerUnitId();

  useEffect(() => {
    if (isWeb) return;
    void initializeAds();
  }, [isWeb]);

  if (isWeb || !unitId) return null;

  return (
    <View style={styles.container}>
      <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
