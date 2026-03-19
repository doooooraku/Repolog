import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'Cài đặt',               // 設定
  theme: 'Giao diện',                // テーマ (Chủ đềとも言うがGiao diệnはUI全体を指す)

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Khôi phục mua hàng',     // 購入の復元
  purchaseSuccess: 'Gói Pro đã được kích hoạt.', // 購入成功
  purchaseFailed: 'Giao dịch thất bại. Vui lòng thử lại sau.', // 購入失敗
  restoreSuccess: 'Đã khôi phục lịch sử mua hàng.', // 復元成功
  restoreNotFound: 'Không tìm thấy đơn hàng để khôi phục.', // 復元データなし
  restoreFailed: 'Khôi phục thất bại.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'Xem gói Pro',            // Proプランを見る
  cancel: 'Hủy',                     // キャンセル
  paywallPlanLifetimeTitle: 'Trọn đời',
  paywallLifetimeDesc: 'Thanh toán một lần, dùng mãi mãi.',
  paywallCtaLifetime: 'Mua quyền trọn đời',
  paywallOneTimeBadge: 'Một lần',
  paywallLifetimeFinePrint: 'Mua một lần. Không tự động gia hạn.',
  lifetimeSubWarningTitle: 'Phát hiện gói đăng ký đang hoạt động',
  lifetimeSubWarningBody: 'Bạn có gói đăng ký đang hoạt động. Việc mua quyền trọn đời sẽ không tự động hủy gói đăng ký. Vui lòng hủy gói đăng ký sau khi mua để tránh bị tính phí hai lần.',
  manageSubscription: 'Quản lý đăng ký',
  continueAnyway: 'Tiếp tục',
  paywallOrDivider: 'hoặc',

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'Thay đổi giao diện ứng dụng.',
  themeDarkLabel: 'Tối',             // Dark
  themeLightLabel: 'Sáng',            // Light
  themeSystemLabel: 'Hệ thống',

  // --- Habit Management (習慣管理) ---
  save: 'Lưu',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: 'Tải dữ liệu thất bại.',
  errorSaveFailed: 'Lưu thất bại.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'Đổi ngôn ngữ',
  currentLanguage: 'Hiện tại',
  languageNameEn: 'Tiếng Anh',
  languageNameJa: 'Tiếng Nhật',
  languageNameFr: 'Tiếng Pháp',
  languageNameEs: 'Tiếng Tây Ban Nha',
  languageNameDe: 'Tiếng Đức',
  languageNameIt: 'Tiếng Ý',
  languageNamePt: 'Tiếng Bồ Đào Nha',
  languageNameRu: 'Tiếng Nga',
  languageNameZhHans: 'Tiếng Trung (简体)',
  languageNameZhHant: 'Tiếng Trung (繁體)',
  languageNameKo: 'Tiếng Hàn',
  languageNameHi: 'Tiếng Hindi',
  languageNameId: 'Tiếng Indo',
  languageNameTh: 'Tiếng Thái',
  languageNameVi: 'Tiếng Việt',
  languageNameTr: 'Tiếng Thổ Nhĩ Kỳ',
  languageNameNl: 'Tiếng Hà Lan',
  languageNamePl: 'Tiếng Ba Lan',
  languageNameSv: 'Tiếng Thụy Điển',

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
  pdfPhotoWarningTitle: 'Quá nhiều ảnh',
  pdfPhotoWarningBody: '{count}+ ảnh có thể mất nhiều thời gian để tạo PDF. Tiếp tục?',
  pdfPhotoWarningContinue: 'Tiếp tục',
  pdfPhotoWarningCancel: 'Quay lại',
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
  settingsSectionGeneral: 'Chung',
  settingsSectionPrivacy: 'Quyền riêng tư',
  settingsSectionPurchases: 'Mua hàng',
  settingsSectionBackup: 'Sao lưu',
  settingsBackupDesc: 'Xuất hoặc nhập tệp ZIP sao lưu (manifest.json + photos/).',
  settingsBackupOpen: 'Mở sao lưu',
  tagsLabel: 'Thẻ',
  addTagAction: 'Thêm',
  tagsEmpty: 'Chưa có thẻ nào.',
  photoDeletedNotice: 'Đã xóa ảnh.',
  undoAction: 'Hoàn tác',
  a11yGoBack: 'Quay lại',
  a11yReorderPhoto: 'Sắp xếp lại ảnh',
};

export default dict;
