import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: '設定',                  // 設定 (Settings)
  theme: '主題',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: '恢復購買',               // 購入の復元
  purchaseSuccess: 'Pro 方案已啟用。', // 購入成功
  purchaseFailed: '購買失敗，請稍後再試。', // 購入失敗
  restoreSuccess: '購買紀錄已恢復。', // 復元成功
  restoreNotFound: '找不到可恢復的購買紀錄。', // 復元データなし
  restoreFailed: '恢復購買失敗。',   // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: '查看 Pro 方案',          // Proプランを見る
  cancel: '取消',                    // キャンセル
  paywallPlanLifetimeTitle: '永久版',
  paywallLifetimeDesc: '一次付費，永久使用。',
  paywallCtaLifetime: '取得永久版',
  paywallOneTimeBadge: '一次性',
  paywallLifetimeFinePrint: '一次性購買，無自動續費。',
  lifetimeSubWarningTitle: '偵測到有效訂閱',
  lifetimeSubWarningBody: '您有一個有效的訂閱。購買永久版不會自動取消訂閱。請在購買後取消訂閱，以避免重複扣款。',
  manageSubscription: '管理訂閱',
  continueAnyway: '繼續購買',
  paywallOrDivider: '或',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: '更改應用程式的外觀。',
  themeDarkLabel: '深色',            // Dark
  themeLightLabel: '淺色',            // Light
  themeSystemLabel: '跟隨系統',

  // --- Habit Management (習慣管理) ---
  save: '儲存',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: '資料載入失敗。',
  errorSaveFailed: '儲存失敗。',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: '更改語言',
  currentLanguage: '目前語言',
  languageNameEn: '英語',
  languageNameJa: '日語',
  languageNameFr: '法語',
  languageNameEs: '西班牙語',
  languageNameDe: '德語',
  languageNameIt: '義大利語',
  languageNamePt: '葡萄牙語',
  languageNameRu: '俄語',
  languageNameZhHans: '簡體中文',
  languageNameZhHant: '繁體中文',
  languageNameKo: '韓語',
  languageNameHi: '印地語',
  languageNameId: '印尼語',
  languageNameTh: '泰語',
  languageNameVi: '越南語',
  languageNameTr: '土耳其語',
  languageNameNl: '荷蘭語',
  languageNamePl: '波蘭語',
  languageNameSv: '瑞典語',

  // --- Tutorial (チュートリアル) ---
  reportEditorTitle: 'Report Editor',
  reportNameLabel: 'Report name',
  reportNamePlaceholder: 'Enter report name...',
  authorNameLabel: '作者',
  authorNamePlaceholder: '輸入作者姓名...',
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
  pdfPhotoWarningTitle: '照片過多',
  pdfPhotoWarningBody: '超過 {count} 張照片，產生 PDF 可能需要較長時間。要繼續嗎？',
  pdfPhotoWarningContinue: '繼續',
  pdfPhotoWarningCancel: '返回',
  pdfCreatedAt: 'Created at',
  pdfReportName: 'Report name',
  pdfAuthor: '作者',
  pdfAddress: 'Address',
  pdfLocation: 'Location',
  pdfWeather: 'Weather',
  pdfPhotoCount: 'Photo count',
  pdfPageCount: 'Page count',
  pdfPhotos: 'Photos',
  pdfPages: 'Pages',
  pdfComment: 'Comment',
  settingsSectionGeneral: '一般',
  settingsSectionPrivacy: '隱私',
  settingsSectionPurchases: '購買',
  settingsSectionBackup: '備份',
  settingsBackupDesc: '匯出或匯入備份ZIP檔案（manifest.json + photos/）。',
  settingsBackupOpen: '開啟備份',
  tagsLabel: '標籤',
  addTagAction: '新增',
  tagsEmpty: '尚無標籤。',
  photoDeletedNotice: '照片已刪除。',
  undoAction: '復原',
  a11yGoBack: '返回',
  a11yReorderPhoto: '重新排列照片',
};

export default dict;
