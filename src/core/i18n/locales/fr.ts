import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header ---

  // --- Settings (General) ---
  settings: 'Paramètres',
  theme: 'Thème',

  // --- Purchase / Restore ---
  restore: 'Restaurer les achats',
  purchaseSuccess: 'Le plan Pro est maintenant actif.',
  purchaseFailed: 'L’achat a échoué. Veuillez réessayer plus tard.',
  restoreSuccess: 'Historique d’achat restauré.',
  restoreNotFound: 'Aucun achat trouvé à restaurer.',
  restoreFailed: 'Échec de la restauration des achats.',

  // --- Settings (Sound & Info) ---
  
  // --- Paywall / Pro Screen ---
  

  // --- Heatmap Range (Settings) ---

  proFeatureAdsFree: '',
  proFeatureAdsPro: '',

  paywallMonthlyLabel: 'Forfait mensuel',
  paywallYearlyLabel: 'Forfait annuel',
  paywallBestValueBadge: 'Meilleure valeur',
  paywallYearlySub: 'Facturé une fois par an. Annule quand tu veux.',
  paywallMonthlySub: 'Facturé chaque mois. Annule quand tu veux.',
  comingSoonTitle: 'Bientôt disponible',

  // --- Themes ---
  themeDarkLabel: 'Sombre',
  themeLightLabel: 'Clair',
  themeSystemLabel: 'Système',
  themeDesc: 'Choisis ton ambiance. (Les thèmes Pro arriveront plus tard.)',
  restoreSoon: 'La restauration des achats sera ajoutée dans une future mise à jour.',
  restoreDesc: 'Restaurer les achats effectués sur ce compte.',
  licenses: 'Licences Open Source (plus tard)',
  openPro: 'Ouvrir Repolog Pro',
  heroPaywall: 'Passe au monde néon',
  
  onboardingTitle: 'Bienvenue sur Repolog',
  onboardingBody: 'Un tap, une vibration forte. Construisons la chaîne d’aujourd’hui.',
  onboardingPunch: 'C’est Repolog.',
  start: 'Commencer',

  // --- Tutorial / Onboarding flow ---

  // --- Home ---

  // --- Edit ---
  deleteConfirmBody: 'Es-tu sûr ? Cette action est irréversible.',
  cancel: 'Annuler',

  // --- Icon Categories & Labels ---

  // --- Pro ---
  proFeatureAds: '',

  // --- Accessibility ---

  // --- Misc / Errors ---
  errorLoadFailed: 'Échec du chargement des données',
  errorSaveFailed: 'Échec de l’enregistrement.',

  // --- Settings description ---

  // --- Reminder ---

  // --- Review (7-day streak) ---

  // --- Language labels ---
  languageChange: 'Changer de langue',
  currentLanguage: 'Actuel',
  languageNameEn: 'Anglais',
  languageNameJa: 'Japonais',
  languageNameFr: 'Français',
  languageNameEs: 'Espagnol',
  languageNameDe: 'Allemand',
  languageNameIt: 'Italien',
  languageNamePt: 'Portugais',
  languageNameRu: 'Russe',
  languageNameZhHans: 'Chinois (简体)',
  languageNameZhHant: 'Chinois (繁體)',
  languageNameKo: 'Coréen',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonésien',
  languageNameTh: 'Thaï',
  languageNameVi: 'Vietnamien',
  languageNameTr: 'Turc',
  languageNameNl: 'Néerlandais',
  languageNamePl: 'Polonais',
  languageNameSv: 'Suédois',

  // --- Sound labels ---
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
  pdfPhotoWarningTitle: 'Trop de photos',
  pdfPhotoWarningBody: '{count}+ photos peuvent prendre du temps. Continuer ?',
  pdfPhotoWarningContinue: 'Continuer',
  pdfPhotoWarningCancel: 'Retour',
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
  settingsSectionGeneral: 'Général',
  settingsSectionPrivacy: 'Confidentialité',
  settingsSectionPurchases: 'Achats',
  settingsSectionBackup: 'Sauvegarde',
  settingsBackupDesc: 'Exportez ou importez un ZIP de sauvegarde (manifest.json + photos/).',
  settingsBackupOpen: 'Ouvrir la sauvegarde',
  save: 'Enregistrer',
  tagsLabel: 'Tags',
  addTagAction: 'Ajouter',
  tagsEmpty: 'Aucun tag pour le moment.',
  photoDeletedNotice: 'Photo supprimée.',
  undoAction: 'Annuler',
  a11yGoBack: 'Retour',
};

export default dict;
