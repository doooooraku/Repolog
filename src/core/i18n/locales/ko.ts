import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---

  // --- Settings (General) (設定：一般) ---
  settings: '설정',                  // 設定
  theme: '테마',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: '구매 복원',              // 購入履歴の復元
  purchaseSuccess: 'Pro 플랜이 활성화되었습니다.', // 購入成功
  purchaseFailed: '결제에 실패했습니다. 나중에 다시 시도해 주세요.', // 購入失敗
  restoreSuccess: '구매 기록이 복원되었습니다.', // 復元成功
  restoreNotFound: '복원할 구매 기록이 없습니다.', // 復元データなし
  restoreFailed: '구매 복원에 실패했습니다.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  openPro: 'Pro 플랜 보기',          // Proプランを見る
  cancel: '취소',                    // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---

  // --- Themes (テーマ) ---
  themeDesc: '앱의 분위기를 바꿔보세요.',
  themeDarkLabel: '다크',            // Dark
  themeLightLabel: '라이트',          // Light
  themeSystemLabel: '시스템',

  // --- Habit Management (習慣管理) ---
  save: '저장',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---

  // --- Misc / Errors (その他 / エラー) ---
  errorLoadFailed: '데이터를 불러오지 못했습니다.',
  errorSaveFailed: '저장에 실패했습니다.',

  // --- Settings description (設定の説明) ---

  // --- Reminder (リマインダー) ---

  // --- Review (7-day streak) (レビュー依頼) ---

  // --- Language labels (言語名) ---
  languageChange: '언어 변경',
  currentLanguage: '현재 언어',
  languageNameEn: '영어',
  languageNameJa: '일본어',
  languageNameFr: '프랑스어',
  languageNameEs: '스페인어',
  languageNameDe: '독일어',
  languageNameIt: '이탈리아어',
  languageNamePt: '포르투갈어',
  languageNameRu: '러시아어',
  languageNameZhHans: '중국어 (简体)',
  languageNameZhHant: '중국어 (繁體)',
  languageNameKo: '한국어',
  languageNameHi: '힌디어',
  languageNameId: '인도네시아어',
  languageNameTh: '태국어',
  languageNameVi: '베트남어',
  languageNameTr: '튀르키예어',
  languageNameNl: '네덜란드어',
  languageNamePl: '폴란드어',
  languageNameSv: '스웨덴어',

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
  pdfPhotoWarningTitle: '사진이 너무 많습니다',
  pdfPhotoWarningBody: '{count}장 이상이면 PDF 생성에 시간이 걸릴 수 있습니다. 계속할까요?',
  pdfPhotoWarningContinue: '계속',
  pdfPhotoWarningCancel: '뒤로',
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
  settingsSectionGeneral: '일반',
  settingsSectionPrivacy: '개인정보',
  settingsSectionPurchases: '구매',
  settingsSectionBackup: '백업',
  settingsBackupDesc: '백업 ZIP 파일(manifest.json + photos/)을 내보내거나 가져옵니다.',
  settingsBackupOpen: '백업 열기',
  tagsLabel: '태그',
  addTagAction: '추가',
  tagsEmpty: '태그가 없습니다.',
  photoDeletedNotice: '사진이 삭제되었습니다.',
  undoAction: '실행 취소',
  a11yGoBack: '뒤로 가기',
};

export default dict;
