/**
 * Expo config plugin: set android:largeHeap="true" on the <application> tag.
 *
 * PDF generation via expo-print WebView needs ~95 MB contiguous allocation.
 * Without largeHeap the default 256 MB limit causes OOM; with it the limit
 * rises to 512 MB, providing comfortable headroom.
 */
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withLargeHeap(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (app) {
      app.$['android:largeHeap'] = 'true';
    }
    return cfg;
  });
};
