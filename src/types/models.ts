export type WeatherType = 'none' | 'sunny' | 'cloudy' | 'rainy' | 'snowy';
export type AddressSource = 'auto' | 'manual' | 'none';

export type Report = {
  id: string;
  createdAt: string;
  updatedAt: string;
  reportName: string | null;
  weather: WeatherType;
  locationEnabledAtCreation: boolean;
  lat: number | null;
  lng: number | null;
  latLngCapturedAt: string | null;
  address: string | null;
  addressSource: AddressSource | null;
  addressLocale: string | null;
  comment: string;
  tags: string[];
  pinned: boolean;
};

export type NewReportInput = {
  reportName?: string | null;
  weather?: WeatherType;
  locationEnabledAtCreation?: boolean;
  lat?: number | null;
  lng?: number | null;
  latLngCapturedAt?: string | null;
  address?: string | null;
  addressSource?: AddressSource | null;
  addressLocale?: string | null;
  comment?: string;
  tags?: string[];
  pinned?: boolean;
};

export type UpdateReportInput = {
  id: string;
  reportName?: string | null;
  weather?: WeatherType;
  locationEnabledAtCreation?: boolean;
  lat?: number | null;
  lng?: number | null;
  latLngCapturedAt?: string | null;
  address?: string | null;
  addressSource?: AddressSource | null;
  addressLocale?: string | null;
  comment?: string;
  tags?: string[];
  pinned?: boolean;
  updatedAt?: string;
};

export type Photo = {
  id: string;
  reportId: string;
  localUri: string;
  width: number | null;
  height: number | null;
  createdAt: string;
  orderIndex: number;
};

export type NewPhotoInput = {
  reportId: string;
  localUri: string;
  width?: number | null;
  height?: number | null;
  createdAt?: string;
  orderIndex: number;
};

export type UpdatePhotoInput = {
  id: string;
  localUri?: string;
  width?: number | null;
  height?: number | null;
  orderIndex?: number;
};

export type ProState = {
  isPro: boolean;
  anonUserId: string | null;
  lastCheckAt: string;
};
