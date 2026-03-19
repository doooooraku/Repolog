import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'Ayarlar',               // 設定
  theme: 'Tema',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Satın Alımları Yükle',   // 購入の復元 (少し短縮してボタンに収める)
  purchaseSuccess: 'Pro plan artık aktif.', // 購入成功
  purchaseFailed: 'Satın alma başarısız. Lütfen sonra tekrar dene.', // 購入失敗
  restoreSuccess: 'Satın alma geçmişi yüklendi.', // 復元成功
  restoreNotFound: 'Geri yüklenecek satın alma bulunamadı.', // 復元データなし
  restoreFailed: 'Satın alımlar yüklenemedi.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'Pro Planı Gör',          // Proプランを見る
  cancel: 'İptal',                   // キャンセル
  paywallPlanLifetimeTitle: 'Ömür Boyu',
  paywallLifetimeDesc: 'Bir kez öde, sonsuza dek kullan.',
  paywallCtaLifetime: 'Ömür Boyu Erişim Al',
  paywallOneTimeBadge: 'Tek seferlik',
  paywallLifetimeFinePrint: 'Tek seferlik satın alma. Otomatik yenileme yok.',
  lifetimeSubWarningTitle: 'Aktif abonelik bulundu',
  lifetimeSubWarningBody: 'Aktif bir aboneliğiniz var. Ömür boyu erişim satın almak aboneliğinizi otomatik olarak iptal etmez. Çifte ücretlendirmeden kaçınmak için satın alma sonrası aboneliğinizi iptal edin.',
  manageSubscription: 'Aboneliği yönet',
  continueAnyway: 'Devam et',
  paywallOrDivider: 'veya',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'Uygulama görünümünü değiştir.',
  themeDarkLabel: 'Koyu',            // Dark
  themeLightLabel: 'Açık',            // Light
  themeSystemLabel: 'Sistem',

  // --- Habit Management (習慣管理) ---
  save: 'Kaydet',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: 'Veri yüklenemedi.',
  errorSaveFailed: 'Kaydedilemedi.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'Dili değiştir',
  currentLanguage: 'Mevcut',
  languageNameEn: 'İngilizce',
  languageNameJa: 'Japonca',
  languageNameFr: 'Fransızca',
  languageNameEs: 'İspanyolca',
  languageNameDe: 'Almanca',
  languageNameIt: 'İtalyanca',
  languageNamePt: 'Portekizce',
  languageNameRu: 'Rusça',
  languageNameZhHans: 'Çince (简体)',
  languageNameZhHant: 'Çince (繁體)',
  languageNameKo: 'Korece',
  languageNameHi: 'Hintçe',
  languageNameId: 'Endonezce',
  languageNameTh: 'Tayca',
  languageNameVi: 'Vietnamca',
  languageNameTr: 'Türkçe',
  languageNameNl: 'Felemenkçe',
  languageNamePl: 'Lehçe',
  languageNameSv: 'İsveççe',

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
  pdfPhotoWarningTitle: 'Çok fazla fotoğraf',
  pdfPhotoWarningBody: '{count}+ fotoğraf PDF oluşturmayı uzun sürebilir. Devam edilsin mi?',
  pdfPhotoWarningContinue: 'Devam et',
  pdfPhotoWarningCancel: 'Geri dön',
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
  settingsSectionGeneral: 'Genel',
  settingsSectionPrivacy: 'Gizlilik',
  settingsSectionPurchases: 'Satın Almalar',
  settingsSectionBackup: 'Yedekleme',
  settingsBackupDesc: 'Yedek ZIP dosyasını (manifest.json + photos/) dışa veya içe aktarın.',
  settingsBackupOpen: 'Yedeği aç',
  tagsLabel: 'Etiketler',
  addTagAction: 'Ekle',
  tagsEmpty: 'Henüz etiket yok.',
  photoDeletedNotice: 'Fotoğraf kaldırıldı.',
  undoAction: 'Geri al',
  a11yGoBack: 'Geri dön',
  a11yReorderPhoto: 'Fotoğrafı yeniden sırala',
};

export default dict;
