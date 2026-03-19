import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'Inställningar',         // 設定
  theme: 'Tema',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Återställ köp',          // 購入の復元
  purchaseSuccess: 'Pro-planen är nu aktiv.', // 購入成功
  purchaseFailed: 'Köpet misslyckades. Försök igen senare.', // 購入失敗
  restoreSuccess: 'Köphistorik återställd.', // 復元成功
  restoreNotFound: 'Inga köp hittades att återställa.', // 復元データなし
  restoreFailed: 'Misslyckades med att återställa köp.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'Se Pro-planen',          // Proプランを見る
  cancel: 'Avbryt',                  // キャンセル
  paywallPlanLifetimeTitle: 'Livstid',
  paywallLifetimeDesc: 'Betala en gång, använd för alltid.',
  paywallCtaLifetime: 'Få livstidsåtkomst',
  paywallOneTimeBadge: 'Engångs',
  paywallLifetimeFinePrint: 'Engångsköp. Ingen automatisk förnyelse.',
  paywallOrDivider: 'eller',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'Ändra appens utseende.',
  themeDarkLabel: 'Mörk',            // Dark
  themeLightLabel: 'Ljus',            // Light
  themeSystemLabel: 'System',

  // --- Habit Management (習慣管理) ---
  save: 'Spara',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: 'Kunde inte ladda data.',
  errorSaveFailed: 'Kunde inte spara.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'Byt språk',
  currentLanguage: 'Nuvarande',
  languageNameEn: 'Engelska',
  languageNameJa: 'Japanska',
  languageNameFr: 'Franska',
  languageNameEs: 'Spanska',
  languageNameDe: 'Tyska',
  languageNameIt: 'Italienska',
  languageNamePt: 'Portugisiska',
  languageNameRu: 'Ryska',
  languageNameZhHans: 'Kinesiska (简体)',
  languageNameZhHant: 'Kinesiska (繁體)',
  languageNameKo: 'Koreanska',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesiska',
  languageNameTh: 'Thailändska',
  languageNameVi: 'Vietnamesiska',
  languageNameTr: 'Turkiska',
  languageNameNl: 'Holländska',
  languageNamePl: 'Polska',
  languageNameSv: 'Svenska',

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
  pdfPhotoWarningTitle: 'För många bilder',
  pdfPhotoWarningBody: '{count}+ bilder kan ta lång tid att skapa PDF. Fortsätta?',
  pdfPhotoWarningContinue: 'Fortsätt',
  pdfPhotoWarningCancel: 'Tillbaka',
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
  settingsSectionGeneral: 'Allmänt',
  settingsSectionPrivacy: 'Integritet',
  settingsSectionPurchases: 'Köp',
  settingsSectionBackup: 'Säkerhetskopiering',
  settingsBackupDesc: 'Exportera eller importera en säkerhetskopia (manifest.json + photos/).',
  settingsBackupOpen: 'Öppna säkerhetskopia',
  tagsLabel: 'Taggar',
  addTagAction: 'Lägg till',
  tagsEmpty: 'Inga taggar ännu.',
  photoDeletedNotice: 'Foto borttaget.',
  undoAction: 'Ångra',
  a11yGoBack: 'Gå tillbaka',
  a11yReorderPhoto: 'Ändra ordning på foto',
};

export default dict;
