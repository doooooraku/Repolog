// Core Types for Repolog

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'none';

export interface Location {
  lat: number;
  lng: number;
  address?: string; // 住所（例：東京都渋谷区渋谷1丁目）
  addressFetchedAt?: Date; // 住所取得日時（キャッシュ管理用）
}

export interface Photo {
  id: string;
  uri: string; // base64 or blob URL
  order: number;
  capturedAt: Date;
}

export interface Report {
  id: string;
  siteName: string;
  createdAt: Date;
  location?: Location;
  weather: WeatherType;
  comment: string;
  photos: Photo[];
  isPinned: boolean;
  pdfGenerated: boolean;
}

export type PlanType = 'free' | 'pro';

export interface UserSettings {
  language: string;
  includeLocation: boolean;
  plan: PlanType;
}

export type LayoutType = 'standard' | 'large';

export const MAX_COMMENT_LENGTH = 4000;
export const FREE_MAX_PHOTOS_PER_REPORT = 10;
export const FREE_MAX_PDF_EXPORTS = 5;
export const PHOTO_WARNING_THRESHOLD = 50;
