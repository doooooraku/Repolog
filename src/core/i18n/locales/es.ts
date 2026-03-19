import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header ---

  // --- Settings (General) ---
  settings: 'Ajustes',
  theme: 'Tema',

  // --- Purchase / Restore ---
  restore: 'Restaurar compras',
  purchaseSuccess: 'El plan Pro está activo.',
  purchaseFailed: 'Error en la compra. Inténtalo más tarde.',
  restoreSuccess: 'Historial de compras restaurado.',
  restoreNotFound: 'No se encontraron compras para restaurar.',
  restoreFailed: 'Error al restaurar las compras.',

  // --- Settings (Sound & Info) ---

  // --- Pro Screen (Paywall) ---
  openPro: 'Ver plan Pro',
  cancel: 'Cancelar',
  paywallPlanLifetimeTitle: 'De por vida',
  paywallLifetimeDesc: 'Paga una vez, usa para siempre.',
  paywallCtaLifetime: 'Obtener acceso de por vida',
  paywallOneTimeBadge: 'Único',
  paywallLifetimeFinePrint: 'Compra única. Sin renovación automática.',
  lifetimeSubWarningTitle: 'Suscripción activa encontrada',
  lifetimeSubWarningBody: 'Tienes una suscripción activa. La compra de acceso de por vida no la cancelará automáticamente. Cancela tu suscripción después de la compra para evitar cargos dobles.',
  manageSubscription: 'Gestionar suscripción',
  continueAnyway: 'Continuar',
  paywallOrDivider: 'o',

  // --- Settings (Appearance) ---

  // --- Heatmap Range (Settings) ---

  // --- Themes ---
  themeDesc: 'Cambia la apariencia de la aplicación.',
  themeDarkLabel: 'Oscuro',
  themeLightLabel: 'Claro',
  themeSystemLabel: 'Sistema',

  // --- Habit Management ---
  save: 'Guardar',

  // --- Icon Categories & Labels ---

  // --- Misc / Errors ---
  errorLoadFailed: 'Error al cargar los datos.',
  errorSaveFailed: 'Error al guardar.',

  // --- Settings description ---

  // --- Reminder ---

  // --- Review (7-day streak) ---

  // --- Language labels ---
  languageChange: 'Cambiar idioma',
  currentLanguage: 'Actual',
  languageNameEn: 'Inglés',
  languageNameJa: 'Japonés',
  languageNameFr: 'Francés',
  languageNameEs: 'Español',
  languageNameDe: 'Alemán',
  languageNameIt: 'Italiano',
  languageNamePt: 'Portugués',
  languageNameRu: 'Ruso',
  languageNameZhHans: 'Chino (简体)',
  languageNameZhHant: 'Chino (繁體)',
  languageNameKo: 'Coreano',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesio',
  languageNameTh: 'Tailandés',
  languageNameVi: 'Vietnamita',
  languageNameTr: 'Turco',
  languageNameNl: 'Holandés',
  languageNamePl: 'Polaco',
  languageNameSv: 'Sueco',

  // --- Tutorial ---
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
  pdfPhotoWarningTitle: 'Demasiadas fotos',
  pdfPhotoWarningBody: '{count}+ fotos pueden tardar bastante. ¿Continuar?',
  pdfPhotoWarningContinue: 'Continuar',
  pdfPhotoWarningCancel: 'Volver',
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
  settingsSectionGeneral: 'General',
  settingsSectionPrivacy: 'Privacidad',
  settingsSectionPurchases: 'Compras',
  settingsSectionBackup: 'Respaldo',
  settingsBackupDesc: 'Exporta o importa un ZIP de respaldo (manifest.json + photos/).',
  settingsBackupOpen: 'Abrir respaldo',
  tagsLabel: 'Etiquetas',
  addTagAction: 'Añadir',
  tagsEmpty: 'No hay etiquetas aún.',
  photoDeletedNotice: 'Foto eliminada.',
  undoAction: 'Deshacer',
  a11yGoBack: 'Volver',
  a11yReorderPhoto: 'Reordenar foto',
};

export default dict;
