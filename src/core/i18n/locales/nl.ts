import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'Instellingen',          // 設定
  theme: 'Thema',                    // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Aankopen herstellen',    // 購入の復元
  purchaseSuccess: 'Pro-abonnement is nu actief.', // 購入成功
  purchaseFailed: 'Aankoop mislukt. Probeer het later opnieuw.', // 購入失敗
  restoreSuccess: 'Aankoopgeschiedenis hersteld.', // 復元成功 (長い単語ですがここは大丈夫)
  restoreNotFound: 'Geen aankopen gevonden om te herstellen.', // 復元データなし
  restoreFailed: 'Herstellen van aankopen mislukt.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'Bekijk Pro-plan',        // Proプランを見る
  cancel: 'Annuleren',               // キャンセル
  paywallPlanLifetimeTitle: 'Levenslang',
  paywallLifetimeDesc: 'Eenmalig betalen, voor altijd gebruiken.',
  paywallCtaLifetime: 'Levenslange toegang kopen',
  paywallOneTimeBadge: 'Eenmalig',
  paywallLifetimeFinePrint: 'Eenmalige aankoop. Geen automatische verlenging.',
  lifetimeSubWarningTitle: 'Actief abonnement gevonden',
  lifetimeSubWarningBody: 'Je hebt een actief abonnement. De aankoop van levenslange toegang annuleert dit niet automatisch. Annuleer je abonnement na de aankoop om dubbele kosten te voorkomen.',
  manageSubscription: 'Abonnement beheren',
  continueAnyway: 'Toch doorgaan',
  paywallOrDivider: 'of',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'Verander het uiterlijk van de app.',
  themeDarkLabel: 'Donker',          // Dark
  themeLightLabel: 'Licht',           // Light
  themeSystemLabel: 'Systeem',

  // --- Habit Management (習慣管理) ---
  save: 'Opslaan',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: 'Gegevens laden mislukt.',
  errorSaveFailed: 'Opslaan mislukt.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'Taal wijzigen',
  currentLanguage: 'Huidige',
  languageNameEn: 'Engels',
  languageNameJa: 'Japans',
  languageNameFr: 'Frans',
  languageNameEs: 'Spaans',
  languageNameDe: 'Duits',
  languageNameIt: 'Italiaans',
  languageNamePt: 'Portugees',
  languageNameRu: 'Russisch',
  languageNameZhHans: 'Chinees (简体)',
  languageNameZhHant: 'Chinees (繁體)',
  languageNameKo: 'Koreaans',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesisch',
  languageNameTh: 'Thais',
  languageNameVi: 'Vietnamees',
  languageNameTr: 'Turks',
  languageNameNl: 'Nederlands',
  languageNamePl: 'Pools',
  languageNameSv: 'Zweeds',

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
  pdfPhotoWarningTitle: 'Te veel foto\'s',
  pdfPhotoWarningBody: '{count}+ foto\'s kunnen lang duren om een PDF te maken. Doorgaan?',
  pdfPhotoWarningContinue: 'Doorgaan',
  pdfPhotoWarningCancel: 'Terug',
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
  settingsSectionGeneral: 'Algemeen',
  settingsSectionPrivacy: 'Privacy',
  settingsSectionPurchases: 'Aankopen',
  settingsSectionBackup: 'Back-up',
  settingsBackupDesc: 'Exporteer of importeer een back-up ZIP (manifest.json + photos/).',
  settingsBackupOpen: 'Back-up openen',
  tagsLabel: 'Tags',
  addTagAction: 'Toevoegen',
  tagsEmpty: 'Nog geen tags.',
  photoDeletedNotice: 'Foto verwijderd.',
  undoAction: 'Ongedaan maken',
  a11yGoBack: 'Terug',
  a11yReorderPhoto: 'Foto herordenen',
};

export default dict;
