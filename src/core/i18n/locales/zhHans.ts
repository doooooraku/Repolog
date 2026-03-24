import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: '设置',                  // 設定
  theme: '主题',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: '恢复购买',               // 購入の復元
  purchaseSuccess: 'Pro 方案已激活。', // 購入成功
  purchaseFailed: '购买失败，请稍后重试。', // 購入失敗
  purchasePending: '您的付款正在处理中。付款确认后 Pro 功能将自动激活。',
  restoreSuccess: '购买记录已恢复。', // 復元成功
  restoreNotFound: '未找到可恢复的购买记录。', // 復元データなし
  restoreFailed: '恢复购买失败。',   // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: '查看 Pro 方案',          // Proプランを見る
  cancel: '取消',                    // キャンセル
  paywallPlanLifetimeTitle: '永久版',
  paywallLifetimeDesc: '一次付费，永久使用。',
  paywallCtaLifetime: '获取永久版',
  paywallOneTimeBadge: '一次性',
  paywallLifetimeFinePrint: '一次性购买，无自动续费。',
  lifetimeSubWarningTitle: '检测到有效订阅',
  lifetimeSubWarningBody: '您有一个有效的订阅。购买永久版不会自动取消订阅。请在购买后取消订阅，以避免重复扣费。',
  manageSubscription: '管理订阅',
  continueAnyway: '继续购买',
  paywallOrDivider: '或',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: '更改应用程序的外观。',
  themeDarkLabel: '深色',            // Dark
  themeLightLabel: '浅色',            // Light
  themeSystemLabel: '跟随系统',

  // --- Habit Management (習慣管理) ---
  save: '保存',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: '数据加载失败。',
  errorSaveFailed: '保存失败。',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: '更改语言',
  currentLanguage: '当前语言',
  languageNameEn: '英语',
  languageNameJa: '日语',
  languageNameFr: '法语',
  languageNameEs: '西班牙语',
  languageNameDe: '德语',
  languageNameIt: '意大利语',
  languageNamePt: '葡萄牙语',
  languageNameRu: '俄语',
  languageNameZhHans: '简体中文',
  languageNameZhHant: '繁體中文',
  languageNameKo: '韩语',
  languageNameHi: '印地语',
  languageNameId: '印尼语',
  languageNameTh: '泰语',
  languageNameVi: '越南语',
  languageNameTr: '土耳其语',
  languageNameNl: '荷兰语',
  languageNamePl: '波兰语',
  languageNameSv: '瑞典语',

  // --- Tutorial (チュートリアル) ---
  reportEditorTitle: 'Report Editor',
  reportNameLabel: 'Report name',
  reportNamePlaceholder: 'Enter report name...',
  authorNameLabel: '作者',
  authorNamePlaceholder: '输入作者姓名...',
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
  pdfPhotoWarningTitle: '照片过多',
  pdfPhotoWarningBody: '超过 {count} 张照片，生成 PDF 可能需要较长时间。继续吗？',
  pdfPhotoWarningContinue: '继续',
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
  settingsSectionGeneral: '通用',
  settingsSectionPrivacy: '隐私',
  settingsSectionPurchases: '购买',
  settingsSectionBackup: '备份',
  settingsBackupDesc: '导出或导入备份ZIP文件（manifest.json + photos/）。',
  settingsBackupOpen: '打开备份',
  tagsLabel: '标签',
  addTagAction: '添加',
  tagsEmpty: '暂无标签。',
  photoDeletedNotice: '照片已删除。',
  undoAction: '撤销',
  a11yGoBack: '返回',
  a11yReorderPhoto: '重新排列照片',
};

export default dict;
