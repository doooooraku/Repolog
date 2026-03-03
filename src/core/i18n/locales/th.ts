import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: 'การตั้งค่า',            // 設定
  theme: 'ธีม',                      // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'กู้คืนการซื้อ',          // 購入の復元
  purchaseSuccess: 'แพ็กเกจ Pro ใช้งานได้แล้ว', // 購入成功
  purchaseFailed: 'การสั่งซื้อล้มเหลว โปรดลองใหม่ภายหลัง', // 購入失敗
  restoreSuccess: 'กู้คืนประวัติการซื้อแล้ว', // 復元成功
  restoreNotFound: 'ไม่พบประวัติการซื้อ',    // 復元データなし
  restoreFailed: 'กู้คืนการซื้อไม่สำเร็จ',   // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'ดูแพ็กเกจ Pro',          // Proプランを見る
  cancel: 'ยกเลิก',                  // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: 'เปลี่ยนหน้าตาของแอป',
  themeDarkLabel: 'มืด',             // Dark
  themeLightLabel: 'สว่าง',           // Light
  themeSystemLabel: 'ระบบ',

  // --- Habit Management (習慣管理) ---
  save: 'บันทึก',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: 'โหลดข้อมูลล้มเหลว',
  errorSaveFailed: 'บันทึกไม่สำเร็จ',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: 'เปลี่ยนภาษา',
  currentLanguage: 'ปัจจุบัน',
  languageNameEn: 'อังกฤษ',
  languageNameJa: 'ญี่ปุ่น',
  languageNameFr: 'ฝรั่งเศส',
  languageNameEs: 'สเปน',
  languageNameDe: 'เยอรมัน',
  languageNameIt: 'อิตาลี',
  languageNamePt: 'โปรตุเกส',
  languageNameRu: 'รัสเซีย',
  languageNameZhHans: 'จีน (简体)',
  languageNameZhHant: 'จีน (繁體)',
  languageNameKo: 'เกาหลี',
  languageNameHi: 'ฮินดี',
  languageNameId: 'อินโดนีเซีย',
  languageNameTh: 'ไทย',
  languageNameVi: 'เวียดนาม',
  languageNameTr: 'ตุรกี',
  languageNameNl: 'ดัตช์',
  languageNamePl: 'โปแลนด์',
  languageNameSv: 'สวีเดน',

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
  pdfPhotoWarningTitle: 'รูปภาพมากเกินไป',
  pdfPhotoWarningBody: 'มีรูปมากกว่า {count} รูป การสร้าง PDF อาจใช้เวลานาน ดำเนินการต่อหรือไม่?',
  pdfPhotoWarningContinue: 'ดำเนินการต่อ',
  pdfPhotoWarningCancel: 'กลับ',
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
  settingsSectionGeneral: 'ทั่วไป',
  settingsSectionPrivacy: 'ความเป็นส่วนตัว',
  settingsSectionPurchases: 'การซื้อ',
  settingsSectionBackup: 'สำรองข้อมูล',
  settingsBackupDesc: 'ส่งออกหรือนำเข้าไฟล์ ZIP สำรอง (manifest.json + photos/)',
  settingsBackupOpen: 'เปิดการสำรองข้อมูล',
  tagsLabel: 'แท็ก',
  addTagAction: 'เพิ่ม',
  tagsEmpty: 'ยังไม่มีแท็ก',
  photoDeletedNotice: 'ลบรูปภาพแล้ว',
  undoAction: 'เลิกทำ',
  a11yGoBack: 'ย้อนกลับ',
  a11yReorderPhoto: 'จัดลำดับรูปภาพใหม่',
};

export default dict;
