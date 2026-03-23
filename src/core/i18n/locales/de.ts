import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面のヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'Einstellungen',         // 設定
  theme: 'Design',                   // テーマ（ドイツ語ではDesignもよく使われます）

  // --- Purchase / Restore (課金・復元) ---
  restore: 'Käufe wiederherstellen', // 購入の復元
  purchaseSuccess: 'Pro-Plan ist jetzt aktiv.', // 購入成功
  purchaseFailed: 'Kauf fehlgeschlagen. Bitte später erneut versuchen.', // 購入失敗
  restoreSuccess: 'Kaufhistorie wiederhergestellt.', // 復元成功
  restoreNotFound: 'Keine Käufe zum Wiederherstellen gefunden.', // 復元データなし
  restoreFailed: 'Wiederherstellung fehlgeschlagen.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (課金画面) ---
  openPro: 'Pro-Plan ansehen',       // Proプランを見る
  cancel: 'Abbrechen',               // キャンセル
  paywallPlanLifetimeTitle: 'Einmalkauf',
  paywallLifetimeDesc: 'Einmal zahlen, für immer nutzen.',
  paywallCtaLifetime: 'Lebenslangen Zugang erhalten',
  paywallOneTimeBadge: 'Einmalig',
  paywallLifetimeFinePrint: 'Einmaliger Kauf. Kein Abo, keine automatische Verlängerung.',
  lifetimeSubWarningTitle: 'Aktives Abo gefunden',
  lifetimeSubWarningBody: 'Du hast ein aktives Abo. Der Kauf des Lebenslang-Zugangs kündigt es nicht automatisch. Bitte kündige dein Abo nach dem Kauf, um Doppelbelastungen zu vermeiden.',
  manageSubscription: 'Abo verwalten',
  continueAnyway: 'Trotzdem fortfahren',
  paywallOrDivider: 'oder',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップの表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'Ändere das Erscheinungsbild der App.',
  themeDarkLabel: 'Dunkel',          // Dark
  themeLightLabel: 'Hell',            // Light
  themeSystemLabel: 'System',

  // --- Habit Management (習慣の管理) ---
  save: 'Speichern',

  // --- Icon Categories & Labels (アイコンのカテゴリとラベル) ---

  // --- Misc / Errors (その他・エラー) ---
  errorLoadFailed: 'Daten konnten nicht geladen werden.',
  errorSaveFailed: 'Speichern fehlgeschlagen.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー・通知) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'Sprache ändern',
  currentLanguage: 'Aktuell',
  languageNameEn: 'Englisch',
  languageNameJa: 'Japanisch',
  languageNameFr: 'Französisch',
  languageNameEs: 'Spanisch',
  languageNameDe: 'Deutsch',
  languageNameIt: 'Italienisch',
  languageNamePt: 'Portugiesisch',
  languageNameRu: 'Russisch',
  languageNameZhHans: 'Chinesisch (简体)',
  languageNameZhHant: 'Chinesisch (繁體)',
  languageNameKo: 'Koreanisch',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesisch',
  languageNameTh: 'Thailändisch',
  languageNameVi: 'Vietnamesisch',
  languageNameTr: 'Türkisch',
  languageNameNl: 'Niederländisch',
  languageNamePl: 'Polnisch',
  languageNameSv: 'Schwedisch',

  // --- Tutorial (チュートリアル) ---
  reportEditorTitle: 'Report Editor',
  reportNameLabel: 'Report name',
  reportNamePlaceholder: 'Enter report name...',
  authorNameLabel: 'Autor',
  authorNamePlaceholder: 'Autorname eingeben...',
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
  pdfPhotoWarningTitle: 'Zu viele Fotos',
  pdfPhotoWarningBody: '{count}+ Fotos können länger dauern. Fortfahren?',
  pdfPhotoWarningContinue: 'Fortfahren',
  pdfPhotoWarningCancel: 'Zurück',
  pdfCreatedAt: 'Created at',
  pdfReportName: 'Report name',
  pdfAuthor: 'Autor',
  pdfAddress: 'Address',
  pdfLocation: 'Location',
  pdfWeather: 'Weather',
  pdfPhotoCount: 'Photo count',
  pdfPageCount: 'Page count',
  pdfPhotos: 'Photos',
  pdfPages: 'Pages',
  pdfComment: 'Comment',
  settingsSectionGeneral: 'Allgemein',
  settingsSectionPrivacy: 'Datenschutz',
  settingsSectionPurchases: 'Käufe',
  settingsSectionBackup: 'Sicherung',
  settingsBackupDesc: 'Exportiere oder importiere ein Backup-ZIP (manifest.json + photos/).',
  settingsBackupOpen: 'Sicherung öffnen',
  tagsLabel: 'Tags',
  addTagAction: 'Hinzufügen',
  tagsEmpty: 'Noch keine Tags.',
  photoDeletedNotice: 'Foto entfernt.',
  undoAction: 'Rückgängig',
  a11yGoBack: 'Zurück',
  a11yReorderPhoto: 'Foto neu anordnen',
};

export default dict;
