import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'Настройки',
  theme: 'Тема',

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Восстановить покупки',
  purchaseSuccess: 'Pro план активирован.',
  purchaseFailed: 'Ошибка покупки. Попробуйте позже.',
  restoreSuccess: 'История покупок восстановлена.',
  restoreNotFound: 'Покупки для восстановления не найдены.',
  restoreFailed: 'Не удалось восстановить покупки.',

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'Смотреть Pro',
  cancel: 'Отмена',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'Измени внешний вид приложения.',
  themeDarkLabel: 'Темная',
  themeLightLabel: 'Светлая',
  themeSystemLabel: 'Системная',

  // --- Habit Management (習慣管理) ---
  save: 'Сохранить',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: 'Ошибка загрузки данных.',
  errorSaveFailed: 'Ошибка сохранения.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'Сменить язык',
  currentLanguage: 'Текущий',
  languageNameEn: 'Английский',
  languageNameJa: 'Японский',
  languageNameFr: 'Французский',
  languageNameEs: 'Испанский',
  languageNameDe: 'Немецкий',
  languageNameIt: 'Итальянский',
  languageNamePt: 'Португальский',
  languageNameRu: 'Русский',
  languageNameZhHans: 'Китайский (简体)',
  languageNameZhHant: 'Китайский (繁體)',
  languageNameKo: 'Корейский',
  languageNameHi: 'Хинди',
  languageNameId: 'Индонезийский',
  languageNameTh: 'Тайский',
  languageNameVi: 'Вьетнамский',
  languageNameTr: 'Турецкий',
  languageNameNl: 'Нидерландский',
  languageNamePl: 'Польский',
  languageNameSv: 'Шведский',

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
  pdfPhotoWarningTitle: 'Слишком много фото',
  pdfPhotoWarningBody: '{count}+ фото: создание PDF может занять время. Продолжить?',
  pdfPhotoWarningContinue: 'Продолжить',
  pdfPhotoWarningCancel: 'Назад',
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
  settingsSectionGeneral: 'Общие',
  settingsSectionPrivacy: 'Конфиденциальность',
  settingsSectionPurchases: 'Покупки',
  settingsSectionBackup: 'Резервная копия',
  settingsBackupDesc: 'Экспорт или импорт ZIP-архива (manifest.json + photos/).',
  settingsBackupOpen: 'Открыть резервную копию',
  tagsLabel: 'Теги',
  addTagAction: 'Добавить',
  tagsEmpty: 'Тегов пока нет.',
  photoDeletedNotice: 'Фото удалено.',
  undoAction: 'Отменить',
  a11yGoBack: 'Назад',
};

export default dict;
