import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'Configurações',
  theme: 'Tema',

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Restaurar Compras',
  purchaseSuccess: 'O plano Pro está ativo agora.',
  purchaseFailed: 'Falha na compra. Tente novamente mais tarde.',
  restoreSuccess: 'Histórico de compras restaurado.',
  restoreNotFound: 'Nenhuma compra encontrada para restaurar.',
  restoreFailed: 'Falha ao restaurar compras.',

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'Ver Plano Pro',
  cancel: 'Cancelar',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'Mude a aparência do aplicativo.',
  themeDarkLabel: 'Escuro',
  themeLightLabel: 'Claro',
  themeSystemLabel: 'Sistema',

  // --- Habit Management (習慣管理) ---
  save: 'Salvar',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: 'Falha ao carregar dados.',
  errorSaveFailed: 'Falha ao salvar.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'Mudar idioma',
  currentLanguage: 'Atual',
  languageNameEn: 'Inglês',
  languageNameJa: 'Japonês',
  languageNameFr: 'Francês',
  languageNameEs: 'Espanhol',
  languageNameDe: 'Alemão',
  languageNameIt: 'Italiano',
  languageNamePt: 'Português',
  languageNameRu: 'Russo',
  languageNameZhHans: 'Chinês (简体)',
  languageNameZhHant: 'Chinês (繁體)',
  languageNameKo: 'Coreano',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonésio',
  languageNameTh: 'Tailandês',
  languageNameVi: 'Vietnamita',
  languageNameTr: 'Turco',
  languageNameNl: 'Holandês',
  languageNamePl: 'Polonês',
  languageNameSv: 'Sueco',

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
  pdfPhotoWarningTitle: 'Fotos demais',
  pdfPhotoWarningBody: '{count}+ fotos podem levar mais tempo para gerar o PDF. Continuar?',
  pdfPhotoWarningContinue: 'Continuar',
  pdfPhotoWarningCancel: 'Voltar',
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
  settingsSectionGeneral: 'Geral',
  settingsSectionPrivacy: 'Privacidade',
  settingsSectionPurchases: 'Compras',
  settingsSectionBackup: 'Backup',
  settingsBackupDesc: 'Exportar ou importar um ZIP de backup (manifest.json + photos/).',
  settingsBackupOpen: 'Abrir backup',
  tagsLabel: 'Tags',
  addTagAction: 'Adicionar',
  tagsEmpty: 'Nenhuma tag ainda.',
  photoDeletedNotice: 'Foto removida.',
  undoAction: 'Desfazer',
  a11yGoBack: 'Voltar',
};

export default dict;
