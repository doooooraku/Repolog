import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面のヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'Impostazioni',          // 設定
  theme: 'Tema',                     // テーマ

  // --- Purchase / Restore (課金・復元) ---
  restore: 'Ripristina acquisti',    // 購入の復元
  purchaseSuccess: 'Il piano Pro è attivo.', // 購入成功
  purchaseFailed: 'Acquisto fallito. Riprova più tardi.', // 購入失敗
  restoreSuccess: 'Cronologia acquisti ripristinata.', // 復元成功
  restoreNotFound: 'Nessun acquisto trovato da ripristinare.', // 復元データなし
  restoreFailed: 'Impossibile ripristinare gli acquisti.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (課金画面) ---
  openPro: 'Vedi piano Pro',         // Proプランを見る
  cancel: 'Annulla',                 // キャンセル
  paywallPlanLifetimeTitle: 'A vita',
  paywallLifetimeDesc: 'Paga una volta, usa per sempre.',
  paywallCtaLifetime: 'Ottieni l\'accesso a vita',
  paywallOneTimeBadge: 'Una tantum',
  paywallLifetimeFinePrint: 'Acquisto una tantum. Nessun rinnovo automatico.',
  paywallOrDivider: 'o',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップの表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'Cambia l’aspetto dell’applicazione.',
  themeDarkLabel: 'Scuro',           // Dark
  themeLightLabel: 'Chiaro',          // Light
  themeSystemLabel: 'Sistema',

  // --- Habit Management (習慣の管理) ---
  save: 'Salva',

  // --- Icon Categories & Labels (アイコンのカテゴリとラベル) ---

  // --- Misc / Errors (その他・エラー) ---
  errorLoadFailed: 'Caricamento dati fallito.',
  errorSaveFailed: 'Salvataggio fallito.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー・通知) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'Cambia lingua',
  currentLanguage: 'Attuale',
  languageNameEn: 'Inglese',
  languageNameJa: 'Giapponese',
  languageNameFr: 'Francese',
  languageNameEs: 'Spagnolo',
  languageNameDe: 'Tedesco',
  languageNameIt: 'Italiano',
  languageNamePt: 'Portoghese',
  languageNameRu: 'Russo',
  languageNameZhHans: 'Cinese (简体)',
  languageNameZhHant: 'Cinese (繁體)',
  languageNameKo: 'Coreano',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesiano',
  languageNameTh: 'Tailandese',
  languageNameVi: 'Vietnamita',
  languageNameTr: 'Turco',
  languageNameNl: 'Olandese',
  languageNamePl: 'Polacco',
  languageNameSv: 'Svedese',

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
  pdfPhotoWarningTitle: 'Troppe foto',
  pdfPhotoWarningBody: '{count}+ foto potrebbero richiedere tempo. Continuare?',
  pdfPhotoWarningContinue: 'Continua',
  pdfPhotoWarningCancel: 'Indietro',
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
  settingsSectionGeneral: 'Generale',
  settingsSectionPrivacy: 'Privacy',
  settingsSectionPurchases: 'Acquisti',
  settingsSectionBackup: 'Backup',
  settingsBackupDesc: 'Esporta o importa un file ZIP di backup (manifest.json + photos/).',
  settingsBackupOpen: 'Apri backup',
  tagsLabel: 'Tag',
  addTagAction: 'Aggiungi',
  tagsEmpty: 'Nessun tag.',
  photoDeletedNotice: 'Foto rimossa.',
  undoAction: 'Annulla',
  a11yGoBack: 'Indietro',
  a11yReorderPhoto: 'Riordina foto',
};

export default dict;
