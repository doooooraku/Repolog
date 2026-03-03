import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'Pengaturan',            // 設定
  theme: 'Tema',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Pulihkan Pembelian',     // 購入の復元
  purchaseSuccess: 'Paket Pro kini aktif.', // 購入成功
  purchaseFailed: 'Pembelian gagal. Silakan coba lagi nanti.', // 購入失敗
  restoreSuccess: 'Riwayat pembelian dipulihkan.', // 復元成功
  restoreNotFound: 'Tidak ada pembelian untuk dipulihkan.', // 復元データなし
  restoreFailed: 'Gagal memulihkan pembelian.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'Lihat Paket Pro',        // Proプランを見る
  cancel: 'Batal',                   // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'Ubah tampilan aplikasi.',
  themeDarkLabel: 'Gelap',           // Dark
  themeLightLabel: 'Terang',          // Light
  themeSystemLabel: 'Sistem',

  // --- Habit Management (習慣管理) ---
  save: 'Simpan',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: 'Gagal memuat data.',
  errorSaveFailed: 'Gagal menyimpan.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'Ganti Bahasa',
  currentLanguage: 'Saat ini',
  languageNameEn: 'Inggris',
  languageNameJa: 'Jepang',
  languageNameFr: 'Prancis',
  languageNameEs: 'Spanyol',
  languageNameDe: 'Jerman',
  languageNameIt: 'Italia',
  languageNamePt: 'Portugis',
  languageNameRu: 'Rusia',
  languageNameZhHans: 'Mandarin (简体)',
  languageNameZhHant: 'Mandarin (繁體)',
  languageNameKo: 'Korea',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesia',
  languageNameTh: 'Thailand',
  languageNameVi: 'Vietnam',
  languageNameTr: 'Turki',
  languageNameNl: 'Belanda',
  languageNamePl: 'Polandia',
  languageNameSv: 'Swedia',

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
  pdfPhotoWarningTitle: 'Foto terlalu banyak',
  pdfPhotoWarningBody: '{count}+ foto mungkin membutuhkan waktu lama untuk membuat PDF. Lanjutkan?',
  pdfPhotoWarningContinue: 'Lanjutkan',
  pdfPhotoWarningCancel: 'Kembali',
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
  settingsSectionGeneral: 'Umum',
  settingsSectionPrivacy: 'Privasi',
  settingsSectionPurchases: 'Pembelian',
  settingsSectionBackup: 'Cadangan',
  settingsBackupDesc: 'Ekspor atau impor file ZIP cadangan (manifest.json + photos/).',
  settingsBackupOpen: 'Buka cadangan',
  tagsLabel: 'Tag',
  addTagAction: 'Tambah',
  tagsEmpty: 'Belum ada tag.',
  photoDeletedNotice: 'Foto dihapus.',
  undoAction: 'Urungkan',
  a11yGoBack: 'Kembali',
};

export default dict;
