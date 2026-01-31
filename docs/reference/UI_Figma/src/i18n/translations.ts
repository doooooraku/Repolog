// 19 Language Translations for Repolog
// Languages: en, ja, fr, es, de, it, pt, ru, zhHans, zhHant, ko, th, id, vi, hi, tr, nl, pl, sv

export type LanguageCode = 'en' | 'ja' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ru' | 
  'zhHans' | 'zhHant' | 'ko' | 'th' | 'id' | 'vi' | 'hi' | 'tr' | 'nl' | 'pl' | 'sv';

export interface Translations {
  appName: string;
  
  // Home Screen
  home: string;
  allReports: string;
  pinned: string;
  thisWeek: string;
  search: string;
  newReport: string;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
  
  // Report Editor
  reportEditor: string;
  siteName: string;
  siteNamePlaceholder: string;
  createdAt: string;
  location: string;
  weather: string;
  comment: string;
  commentPlaceholder: string;
  charactersRemaining: string;
  maxLengthReached: string;
  photos: string;
  takePhoto: string;
  addFromAlbum: string;
  reorderPhotos: string;
  
  // Weather
  sunny: string;
  cloudy: string;
  rainy: string;
  snowy: string;
  noWeather: string;
  
  // Days of the week
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  
  // PDF
  pdf: string;
  pdfPreview: string;
  generatePDF: string;
  exportPDF: string;
  layoutStandard: string;
  layoutLarge: string;
  reportTitle: string;
  site: string;
  photoCount: string;
  pageCount: string;
  photoLabel: string;
  
  // Settings
  settings: string;
  general: string;
  language: string;
  includeLocationInPDF: string;
  plan: string;
  currentPlan: string;
  upgradeToPro: string;
  restorePurchases: string;
  backup: string;
  exportBackup: string;
  importBackup: string;
  about: string;
  privacyPolicy: string;
  termsOfService: string;
  
  // Plan / Pricing
  free: string;
  pro: string;
  freePlan: string;
  proPlan: string;
  monthly: string;
  yearly: string;
  lifetime: string;
  
  // Modals
  proOnlyFeature: string;
  proOnlyLayoutMessage: string;
  useStandardLayout: string;
  upgradeNow: string;
  tooManyPhotosTitle: string;
  tooManyPhotosMessage: string;
  continueAnyway: string;
  goBack: string;
  
  // Actions
  save: string;
  cancel: string;
  delete: string;
  duplicate: string;
  edit: string;
  done: string;
  undo: string;
  confirm: string;
  pin: string;
  unpin: string;
  
  // Common
  pages: string;
  page: string;
  loading: string;
  error: string;
  success: string;
  watermark: string;
  
  // Location (NEW)
  getLocation: string;
  refreshAddress: string;
  locationObtained: string;
  locationDenied: string;
  locationUnavailable: string;
  locationTimeout: string;
  locationError: string;
  addressUpdated: string;
  addressUpdateFailed: string;
  addressNotAvailable: string;
  obtaining: string;
  generatingPDF: string;
  httpsRequired: string;
  geolocationNotSupported: string;
}

const en: Translations = {
  appName: 'Repolog',
  
  home: 'Home',
  allReports: 'All Reports',
  pinned: 'Pinned',
  thisWeek: 'This Week',
  search: 'Search',
  newReport: 'New Report',
  emptyStateTitle: 'No reports yet',
  emptyStateSubtitle: 'Tap + to create your first report',
  
  reportEditor: 'Report Editor',
  siteName: 'Report Name',
  siteNamePlaceholder: 'Enter report name',
  createdAt: 'Created at',
  location: 'Location',
  weather: 'Weather',
  comment: 'Comment',
  commentPlaceholder: 'Enter work details, observations, notes...',
  charactersRemaining: 'characters remaining',
  maxLengthReached: 'Maximum length reached',
  photos: 'Photos',
  takePhoto: 'Take Photo',
  addFromAlbum: 'Add from Album',
  reorderPhotos: 'Reorder Photos',
  
  sunny: 'Sunny',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
  snowy: 'Snowy',
  noWeather: 'No weather',
  
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  
  pdf: 'PDF',
  pdfPreview: 'PDF Preview',
  generatePDF: 'Generate PDF',
  exportPDF: 'Export PDF',
  layoutStandard: 'Standard (2 photos/page)',
  layoutLarge: 'Large (1 photo/page)',
  reportTitle: 'Repolog Report',
  site: 'Report',
  photoCount: 'photos',
  pageCount: 'pages',
  photoLabel: 'Photo',
  
  settings: 'Settings',
  general: 'General',
  language: 'Language',
  includeLocationInPDF: 'Use Location',
  plan: 'Plan',
  currentPlan: 'Current Plan',
  upgradeToPro: 'Upgrade to Pro',
  restorePurchases: 'Restore Purchases',
  backup: 'Backup',
  exportBackup: 'Export Backup',
  importBackup: 'Import Backup',
  about: 'About',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
  
  free: 'Free',
  pro: 'Pro',
  freePlan: 'Free Plan',
  proPlan: 'Pro Plan',
  monthly: 'Monthly',
  yearly: 'Yearly',
  lifetime: 'Lifetime',
  
  proOnlyFeature: 'This layout is Pro only',
  proOnlyLayoutMessage: 'You can export with Standard layout for free',
  useStandardLayout: 'Use Standard Layout',
  upgradeNow: 'Upgrade to Pro',
  tooManyPhotosTitle: 'Many photos',
  tooManyPhotosMessage: 'You have over 50 photos. PDF generation may take several minutes. Continue?',
  continueAnyway: 'Continue',
  goBack: 'Go Back',
  
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  duplicate: 'Duplicate',
  edit: 'Edit',
  done: 'Done',
  undo: 'Undo',
  confirm: 'Confirm',
  pin: 'Pin',
  unpin: 'Unpin',
  
  pages: 'pages',
  page: 'Page',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  watermark: 'Created by Repolog',
  
  // Location
  getLocation: 'Get Location',
  refreshAddress: 'Refresh Address',
  locationObtained: 'Location obtained',
  locationDenied: 'Location access denied',
  locationUnavailable: 'Location unavailable',
  locationTimeout: 'Location request timed out',
  locationError: 'Failed to get location',
  addressUpdated: 'Address updated',
  addressUpdateFailed: 'Failed to update address',
  addressNotAvailable: 'Address not available',
  obtaining: 'Obtaining...',
  generatingPDF: 'Generating PDF...',
  httpsRequired: 'HTTPS connection required for location access',
  geolocationNotSupported: 'Geolocation is not supported by this browser',
};

const ja: Translations = {
  appName: 'Repolog',
  
  home: 'ホーム',
  allReports: 'すべて',
  pinned: 'ピン留め',
  thisWeek: '今週',
  search: '検索',
  newReport: '新規レポート',
  emptyStateTitle: 'レポートがありません',
  emptyStateSubtitle: '＋ボタンで最初のレポートを作成',
  
  reportEditor: 'レポート編集',
  siteName: 'レポート名',
  siteNamePlaceholder: 'レポート名を入力',
  createdAt: '作成日時',
  location: '位置情報',
  weather: '天気',
  comment: 'コメント',
  commentPlaceholder: '作業内容、異常、注意点を入力...',
  charactersRemaining: '文字残り',
  maxLengthReached: '上限に達しました',
  photos: '枚',
  takePhoto: '撮影',
  addFromAlbum: 'アルバムから追加',
  reorderPhotos: '並び替え',
  
  sunny: '晴れ',
  cloudy: '曇り',
  rainy: '雨',
  snowy: '雪',
  noWeather: '天気なし',
  
  sunday: '日曜日',
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  
  pdf: 'PDF',
  pdfPreview: 'PDFプレビュー',
  generatePDF: 'PDF生成',
  exportPDF: 'PDF出力',
  layoutStandard: '標準（2枚/ページ）',
  layoutLarge: '大きく（1枚/ページ）',
  reportTitle: 'Repolog レポート',
  site: 'レポート',
  photoCount: '枚',
  pageCount: 'ページ',
  photoLabel: '写真',
  
  settings: '設定',
  general: '一般',
  language: '言語',
  includeLocationInPDF: '位置情報を使用',
  plan: 'プラン',
  currentPlan: '現在のプラン',
  upgradeToPro: 'Proにアップグレード',
  restorePurchases: '購入を復元',
  backup: 'バックアップ',
  exportBackup: 'エクスポート',
  importBackup: 'インポート',
  about: 'その他',
  privacyPolicy: 'プライバシーポリシー',
  termsOfService: '利用規約',
  
  free: '無料',
  pro: 'Pro',
  freePlan: '無料プラン',
  proPlan: 'Proプラン',
  monthly: '月額',
  yearly: '年額',
  lifetime: '買い切り',
  
  proOnlyFeature: 'このレイアウトはPro限定です',
  proOnlyLayoutMessage: '標準レイアウトなら無料で出力できます',
  useStandardLayout: '標準で出力する',
  upgradeNow: 'Proにアップグレード',
  tooManyPhotosTitle: '写真枚数が多いです',
  tooManyPhotosMessage: '50枚を超えています。PDF作成に数分かかる場合があります。続けますか？',
  continueAnyway: '作成する',
  goBack: '戻る',
  
  save: '保存',
  cancel: 'キャンセル',
  delete: '削除',
  duplicate: '複製',
  edit: '編集',
  done: '完了',
  undo: '元に戻す',
  confirm: '確認',
  pin: 'ピン留め',
  unpin: 'ピン留め解除',
  
  pages: 'ページ',
  page: 'ページ',
  loading: '読み込み中...',
  error: 'エラー',
  success: '成功',
  watermark: 'Created by Repolog',
  
  // Location
  getLocation: '位置情報を取得',
  refreshAddress: '住所を再取得',
  locationObtained: '位置情報を取得しました',
  locationDenied: '位置情報の取得が拒否されました',
  locationUnavailable: '位置情報が利用できません',
  locationTimeout: '位置情報の取得がタイムアウトしました',
  locationError: '位置情報の取得に失敗しました',
  addressUpdated: '住所を更新しました',
  addressUpdateFailed: '住所の更新に失敗しました',
  addressNotAvailable: '住所を取得できませんでした',
  obtaining: '取得中...',
  generatingPDF: 'PDF生成中...',
  httpsRequired: '位置情報取得にはHTTPS接続が必要です',
  geolocationNotSupported: 'このブラウザは位置情報取得に対応していません',
};

// Simplified versions for other languages (complete translations would be added)
const fr: Translations = { ...en, appName: 'Repolog', sunny: 'Ensoleillé', cloudy: 'Nuageux', rainy: 'Pluvieux', snowy: 'Neigeux', maxLengthReached: 'Longueur maximale atteinte', pin: 'Épingler', unpin: 'Désépingler', includeLocationInPDF: 'Utiliser la localisation', sunday: 'Dimanche', monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi' };
const es: Translations = { ...en, appName: 'Repolog', sunny: 'Soleado', cloudy: 'Nublado', rainy: 'Lluvioso', snowy: 'Nevado', maxLengthReached: 'Longitud máxima alcanzada', pin: 'Fijar', unpin: 'Desfijar', includeLocationInPDF: 'Usar ubicación', sunday: 'Domingo', monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado' };
const de: Translations = { ...en, appName: 'Repolog', sunny: 'Sonnig', cloudy: 'Bewölkt', rainy: 'Regnerisch', snowy: 'Schneebedeckt', pin: 'Anheften', unpin: 'Loslösen', includeLocationInPDF: 'Standort verwenden', sunday: 'Sonntag', monday: 'Montag', tuesday: 'Dienstag', wednesday: 'Mittwoch', thursday: 'Donnerstag', friday: 'Freitag', saturday: 'Samstag' };
const it: Translations = { ...en, appName: 'Repolog', sunny: 'Soleggiato', cloudy: 'Nuvoloso', rainy: 'Piovoso', snowy: 'Nevoso', pin: 'Fissa', unpin: 'Rimuovi', includeLocationInPDF: 'Usa posizione', sunday: 'Domenica', monday: 'Lunedì', tuesday: 'Martedì', wednesday: 'Mercoledì', thursday: 'Giovedì', friday: 'Venerdì', saturday: 'Sabato' };
const pt: Translations = { ...en, appName: 'Repolog', sunny: 'Ensolarado', cloudy: 'Nublado', rainy: 'Chuvoso', snowy: 'Nevado', pin: 'Fixar', unpin: 'Desafixar', includeLocationInPDF: 'Usar localização', sunday: 'Domingo', monday: 'Segunda-feira', tuesday: 'Terça-feira', wednesday: 'Quarta-feira', thursday: 'Quinta-feira', friday: 'Sexta-feira', saturday: 'Sábado' };
const ru: Translations = { ...en, appName: 'Repolog', sunny: 'Солнечно', cloudy: 'Облачно', rainy: 'Дождливо', snowy: 'Снежно', pin: 'Закрепить', unpin: 'Открепить', includeLocationInPDF: 'Использовать местоположение', sunday: 'Воскресенье', monday: 'Понедельник', tuesday: 'Вторник', wednesday: 'Среда', thursday: 'Четверг', friday: 'Пятница', saturday: 'Суббота' };
const zhHans: Translations = { ...en, appName: 'Repolog', sunny: '晴天', cloudy: '多云', rainy: '雨天', snowy: '雪天', pin: '置顶', unpin: '取消置顶', includeLocationInPDF: '使用位置', sunday: '星期日', monday: '星期一', tuesday: '星期二', wednesday: '星期三', thursday: '星期四', friday: '星期五', saturday: '星期六' };
const zhHant: Translations = { ...en, appName: 'Repolog', sunny: '晴天', cloudy: '多雲', rainy: '雨天', snowy: '雪天', pin: '置頂', unpin: '取消置頂', includeLocationInPDF: '使用位置', sunday: '星期日', monday: '星期一', tuesday: '星期二', wednesday: '星期三', thursday: '星期四', friday: '星期五', saturday: '星期六' };
const ko: Translations = { ...en, appName: 'Repolog', sunny: '맑음', cloudy: '흐림', rainy: '비', snowy: '눈', pin: '고정', unpin: '고정 해제', includeLocationInPDF: '위치 사용', sunday: '일요일', monday: '월요일', tuesday: '화요일', wednesday: '수요일', thursday: '목요일', friday: '금요일', saturday: '토요일' };
const th: Translations = { ...en, appName: 'Repolog', sunny: 'แดดจัด', cloudy: 'มีเมฆ', rainy: 'ฝนตก', snowy: 'หิมะตก', pin: 'ปักหมุด', unpin: 'ยกเลิกปักหมุด', includeLocationInPDF: 'ใช้ตำแหน่ง', sunday: 'วันอาทิตย์', monday: 'วันจันทร์', tuesday: 'วันอังคาร', wednesday: 'วันพุธ', thursday: 'วันพฤหัสบดี', friday: 'วันศุกร์', saturday: 'วันเสาร์' };
const id: Translations = { ...en, appName: 'Repolog', sunny: 'Cerah', cloudy: 'Berawan', rainy: 'Hujan', snowy: 'Bersalju', pin: 'Sematkan', unpin: 'Lepas Sematan', includeLocationInPDF: 'Gunakan Lokasi', sunday: 'Minggu', monday: 'Senin', tuesday: 'Selasa', wednesday: 'Rabu', thursday: 'Kamis', friday: 'Jumat', saturday: 'Sabtu' };
const vi: Translations = { ...en, appName: 'Repolog', sunny: 'Nắng', cloudy: 'Nhiều mây', rainy: 'Mưa', snowy: 'Tuyết', pin: 'Ghim', unpin: 'Bỏ ghim', includeLocationInPDF: 'Sử dụng vị trí', sunday: 'Chủ nhật', monday: 'Thứ hai', tuesday: 'Thứ ba', wednesday: 'Thứ tư', thursday: 'Thứ năm', friday: 'Thứ sáu', saturday: 'Thứ bảy' };
const hi: Translations = { ...en, appName: 'Repolog', sunny: 'धूप', cloudy: 'बादल', rainy: 'बारिश', snowy: 'बर्फ़', pin: 'पिन करें', unpin: 'अनपिन करें', includeLocationInPDF: 'स्थान का उपयोग करें', sunday: 'रविवार', monday: 'सोमवार', tuesday: 'मंगलवार', wednesday: 'बुधवार', thursday: 'गुरुवार', friday: 'शुक्रवार', saturday: 'शनिवार' };
const tr: Translations = { ...en, appName: 'Repolog', sunny: 'Güneşli', cloudy: 'Bulutlu', rainy: 'Yağmurlu', snowy: 'Karlı', pin: 'Sabitle', unpin: 'Sabitlemeyi Kaldır', includeLocationInPDF: 'Konumu Kullan', sunday: 'Pazar', monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba', thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi' };
const nl: Translations = { ...en, appName: 'Repolog' };
const pl: Translations = { ...en, appName: 'Repolog', sunny: 'Słonecznie', cloudy: 'Pochmurnie', rainy: 'Deszczowo', snowy: 'Śnieżnie', pin: 'Przypnij', unpin: 'Odepnij', includeLocationInPDF: 'Użyj lokalizacji', sunday: 'Niedziela', monday: 'Poniedziałek', tuesday: 'Wtorek', wednesday: 'Środa', thursday: 'Czwartek', friday: 'Piątek', saturday: 'Sobota' };
const sv: Translations = { ...en, appName: 'Repolog', sunny: 'Soligt', cloudy: 'Molnigt', rainy: 'Regnigt', snowy: 'Snöigt', pin: 'Fäst', unpin: 'Ta bort fästning', includeLocationInPDF: 'Använd plats', sunday: 'Söndag', monday: 'Måndag', tuesday: 'Tisdag', wednesday: 'Onsdag', thursday: 'Torsdag', friday: 'Fredag', saturday: 'Lördag' };

export const translations: Record<LanguageCode, Translations> = {
  en, ja, fr, es, de, it, pt, ru, zhHans, zhHant, ko, th, id, vi, hi, tr, nl, pl, sv
};

export const getTranslations = (lang: LanguageCode): Translations => {
  return translations[lang] || translations.en;
};
