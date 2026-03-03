import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'सेटिंग्स',              // 設定 (Settings)
  theme: 'थीम',                      // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'खरीद बहाल करें',         // 購入の復元 (Restore purchases)
  purchaseSuccess: 'Pro प्लान अब सक्रिय है।', // 購入成功
  purchaseFailed: 'खरीदारी विफल रही। कृपया बाद में पुनः प्रयास करें।', // 購入失敗
  restoreSuccess: 'खरीद इतिहास बहाल कर दिया गया।', // 復元成功
  restoreNotFound: 'बहाल करने के लिए कोई खरीदारी नहीं मिली।', // 復元データなし
  restoreFailed: 'खरीद बहाल करने में विफल।', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'Pro प्लान देखें',        // Proプランを見る
  cancel: 'रद्द करें',               // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'ऐप का स्वरूप बदलें।',
  themeDarkLabel: 'डार्क',             // Dark
  themeLightLabel: 'लाइट',             // Light
  themeSystemLabel: 'सिस्टम',

  // --- Habit Management (習慣管理) ---
  save: 'सेव करें',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: 'डेटा लोड करने में विफल।',
  errorSaveFailed: 'सेव करने में विफल।',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'भाषा बदलें',
  currentLanguage: 'वर्तमान',
  languageNameEn: 'अंग्रेजी',
  languageNameJa: 'जापानी',
  languageNameFr: 'फ्रेंच',
  languageNameEs: 'स्पेनिश',
  languageNameDe: 'जर्मन',
  languageNameIt: 'इतालवी',
  languageNamePt: 'पुर्तगाली',
  languageNameRu: 'रूसी',
  languageNameZhHans: 'चीनी (简体)',
  languageNameZhHant: 'चीनी (繁體)',
  languageNameKo: 'कोरियाई',
  languageNameHi: 'हिन्दी',
  languageNameId: 'इंडोनेशियाई',
  languageNameTh: 'थाई',
  languageNameVi: 'वियतनामी',
  languageNameTr: 'तुर्की',
  languageNameNl: 'डच',
  languageNamePl: 'पोलिश',
  languageNameSv: 'स्वीडिश',

  // --- Tutorial (チュートリアル) ---
  reportEditorTitle: 'Report Editor',
  reportNameLabel: 'Report name',
  reportNamePlaceholder: 'Enter report name...',
  createdAtLabel: 'Created at',
  weatherLabel: 'Weather',
  weatherSunny: 'Sunny',
  weatherCloudy: 'Cloudy',
  weatherRainy: 'Rainy',
  weatherSnowy: 'Snowy',
  weatherNone: 'No weather',
  commentLabel: 'Comment',
  commentPlaceholder: 'Enter comment...',
  commentRemainingLabel: 'Remaining',
  includeLocationLabel: 'Include location',
  includeLocationHelp: 'Adds location and address to this report.',
  locationLabel: 'Location',
  locationFetch: 'Get location',
  locationRefresh: 'Refresh location',
  locationClear: 'Clear location',
  locationUnavailable: 'Location unavailable',
  locationPermissionDenied: 'Location permission denied',
  locationError: 'Failed to get location',
  addressPlaceholder: 'Enter address...',
  obtaining: 'Obtaining...',
  photosLabel: 'Photos',
  addFromCamera: 'Camera',
  addFromLibrary: 'Library',
  photoLimitHint: 'Free plan allows up to {max} photos per report.',
  photoLimitTitle: 'Photo limit reached',
  photoLimitBody: 'Free plan allows up to {max} photos per report.',
  photoPermissionDenied: 'Photo permission denied',
  photoAddFailed: 'Failed to add photo',
  photoEmpty: 'No photos yet.',
  homeSearchPlaceholder: 'Search reports...',
  homePinnedSection: 'Pinned',
  homeEmptyTitle: 'No reports yet',
  homeEmptyBody: 'Create your first report.',
  homeCreateReport: 'Create report',
  deleteConfirmTitle: 'Delete report?',
  deleteConfirmBody: 'This action cannot be undone.',
  deleteAction: 'Delete',
  cancelAction: 'Cancel',
  reportUnnamed: 'Untitled report',
  pdfPreviewTitle: 'PDF Preview',
  pdfLayoutStandard: 'Standard',
  pdfLayoutLarge: 'Large',
  pdfPaperA4: 'A4',
  pdfPaperLetter: 'Letter',
  pdfExport: 'Export PDF',
  pdfGenerating: 'Generating PDF...',
  pdfLargeProTitle: 'Pro only layout',
  pdfLargeProBody: 'Large layout is Pro only. Use Standard instead?',
  pdfLargeUseStandard: 'Use Standard',
  pdfLargeUpgrade: 'Upgrade',
  pdfExportLimitTitle: 'Monthly limit reached',
  pdfExportLimitBody: 'Free plan allows 5 exports per month.',
  pdfExportFailed: 'Failed to export PDF.',
  pdfPhotoWarningTitle: 'फ़ोटो बहुत ज़्यादा हैं',
  pdfPhotoWarningBody: '{count}+ फ़ोटो होने पर PDF बनाने में समय लग सकता है। जारी रखें?',
  pdfPhotoWarningContinue: 'जारी रखें',
  pdfPhotoWarningCancel: 'वापस जाएँ',
  pdfCreatedAt: 'Created at',
  pdfReportName: 'Report name',
  pdfAddress: 'Address',
  pdfLocation: 'Location',
  pdfWeather: 'Weather',
  pdfPhotoCount: 'Photo count',
  pdfPageCount: 'Page count',
  pdfPhotos: 'Photos',
  pdfPages: 'Pages',
  pdfComment: 'Comment',
  settingsSectionGeneral: 'सामान्य',
  settingsSectionPrivacy: 'गोपनीयता',
  settingsSectionPurchases: 'खरीदारी',
  settingsSectionBackup: 'बैकअप',
  settingsBackupDesc: 'बैकअप ZIP फ़ाइल (manifest.json + photos/) निर्यात या आयात करें।',
  settingsBackupOpen: 'बैकअप खोलें',
  tagsLabel: 'टैग',
  addTagAction: 'जोड़ें',
  tagsEmpty: 'अभी कोई टैग नहीं।',
  photoDeletedNotice: 'फ़ोटो हटाई गई।',
  undoAction: 'पूर्ववत करें',
  a11yGoBack: 'वापस जाएँ',
};

export default dict;
