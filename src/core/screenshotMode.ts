import Constants from 'expo-constants';

const expoConfig = Constants.expoConfig ?? Constants.manifest;
const extra = (expoConfig as any)?.extra ?? {};
const flag = extra?.SCREENSHOT_MODE;

/**
 * When true, hides ads and other distracting UI elements
 * so that clean screenshots can be captured for store listings.
 *
 * Activate by setting `SCREENSHOT_MODE=1` in `.env` before building.
 */
export const SCREENSHOT_MODE =
  flag === true || flag === 'true' || flag === '1' || flag === 1;
