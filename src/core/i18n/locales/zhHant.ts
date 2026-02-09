import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: '連續天數',            // 英語: DAYS STREAK
  yourChain: '你的鎖鏈',             // 英語: YOUR CHAIN
  allDoneDays: '完美達成',           // 英語: ALL DONE DAYS (「全て完了」をポジティブに「完美達成」と表現)

  // --- Settings (General) (設定：一般) ---
  settings: '設定',                  // 設定 (Settings)
  hapticOff: '震動已關閉',           // 振動オフ
  language: '語言',                  // 言語
  sound: '音效',                     // 音 (Sound)
  haptics: '觸覺回饋',               // 振動 (Haptics - 一般的に「觸覺回饋」)
  theme: '主題',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: '恢復購買',               // 購入の復元
  purchaseSuccess: 'Pro 方案已啟用。', // 購入成功
  purchaseFailed: '購買失敗，請稍後再試。', // 購入失敗
  restoreSuccess: '購買紀錄已恢復。', // 復元成功
  restoreNotFound: '找不到可恢復的購買紀錄。', // 復元データなし
  restoreFailed: '恢復購買失敗。',   // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: '應用程式版本',           // アプリバージョン
  tapSound: '點擊音效',              // タップ音
  click: '點擊音',                   // クリック
  pop: '氣泡音',                     // ポップ
  soundSwitchLabel: '聲音效果',      // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: '解鎖你的鎖鏈。',        // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: '突破 3 個習慣的限制，讓你的點點勢不可擋。',
  proPlanFreeTitle: '免費版',        // 無料
  proPlanMonthlyTitle: '月度訂閱',   // 月額
  proPlanYearlyTitle: '年度訂閱',    // 年額
  proPlanYearlyBadge: '超值推薦',    // 英語: Best value (一番お得)
  proBadgeShort: 'PRO',
  priceFree: '$0 / 永久',            // ずっと0円
  proOnlyTitle: 'Pro 功能',          // Pro機能
  proOnlyTheme: '升級至 Pro 即可使用此主題。',
  openPro: '查看 Pro 方案',          // Proプランを見る
  cancel: '取消',                    // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: '電流動畫效果',   // 電気の流れのアニメーション
  flowEffectHelp:
    '讓霓虹電流沿著你的鎖鏈流動。如果你喜歡安靜的介面，可以關閉它。',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: '鎖鏈顯示範圍',
  heatmapRangeHelp: '選擇在主畫面的熱力圖上顯示多少天的鎖鏈紀錄。',
  heatmapRange7: '1 週',
  heatmapRange30: '1 個月',
  heatmapRange60: '2 個月',
  heatmapRange90: '3 個月',
  heatmapRange180: '6 個月',
  heatmapRange365: '1 年',
  heatmapSummaryPrefix: '最近 ',     // 「最近〜」
  heatmapSummarySuffix: ' 天',       // 「〜天」
  heatmapAgoSuffix: ' 天前',         // 「〜天前」
  heatmapToday: '今天',

  // --- Themes (テーマ) ---
  themeDesc: '更改應用程式的外觀。',
  themeDarkLabel: '深色',            // Dark
  themeNeonPinkLabel: '霓虹粉',      // Neon Pink
  themeCyberBlueLabel: '賽博藍',     // Cyber Blue
  freeThemeNote: '免費：僅限深色 / Pro 解鎖霓虹粉和賽博藍',
  proThemeNote: 'Pro 主題將在購買後解鎖。',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: '新增習慣',
  editHabitTitle: '編輯習慣',
  habitNameLabel: '名稱',
  habitNamePlaceholder: '例如：喝水、閱讀',
  habitIconLabel: '圖示',
  deleteHabit: '刪除此習慣',
  deleteConfirmationTitle: '確認刪除？',
  deleteConfirmationMessage: '此動作無法復原。所有的打卡紀錄都將遺失。',
  save: '儲存',
  create: '建立',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: '基礎',
  iconCatHealth: '健康',
  iconCatLearning: '學習',

  iconLabelStreak: '連勝',           // Streak
  iconLabelTask: '任務',             // Task
  iconLabelShine: '閃耀',            // Shine
  iconLabelClean: '清潔',            // Clean
  iconLabelLaundry: '洗衣',          // Laundry
  iconLabelWater: '喝水',            // Water
  iconLabelWalk: '步行',             // Walk
  iconLabelSleep: '睡眠',            // Sleep
  iconLabelWorkout: '健身',          // Workout
  iconLabelBarbell: '舉重',          // Barbell
  iconLabelRead: '閱讀',             // Read
  iconLabelArt: '藝術',              // Art
  iconLabelMedia: '媒體',            // Media
  iconLabelStudy: '學習',            // Study
  iconLabelLanguage: '語言',         // Language

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' 習慣按鈕',    // アクセシビリティ用
  errorLoadFailed: '資料載入失敗。',
  errorTitleRequired: '必須輸入名稱。',
  errorTitleTooLong: '名稱最多 20 個字元。',
  errorSaveFailed: '儲存失敗。',
  errorDeleteFailed: '刪除失敗。',
  errorToggleFailed: '更新失敗。',
  habitLimitTitle: '免費版限制',
  habitLimitBody: '免費版最多只能建立 3 個習慣。',

  // --- Settings description (設定の説明) ---
  hapticsDescription: '觸覺回饋 (震動)',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: '提醒',
  reminderToggleLabel: '使用提醒',
  reminderTimeLabel: '通知時間',
  reminderNotificationBody: '是時候連結你的鎖鏈了！', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: '連續打卡 7 天！',
  streak7Message: '你已經保持鎖鏈整整一週了。做得好！',
  ok: '太棒了',

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
  languageNameSv: '瑞典語',

  // --- Tutorial (チュートリアル) ---
  tutorialWelcomeBody:
    'Welcome!\nRepolog helps you build a chain of habits.\nTap the + button at the bottom right to create your first habit.',
  tutorialPressFabBody:
    'Tap the + button at the bottom right to create your first habit.',
  tutorialPressHabitBody:
    'Now tap the habit you just created.\nA tap marks today as done.',
  tutorialExplainChainBody:
    'That tap increased your DAYS STREAK and lit up YOUR CHAIN.\nKeep going each day to grow your chain.',
  tutorialEditIconBody: 'First, choose an icon that matches your habit.',
  tutorialEditNameBody:
    'Next, enter a habit name.\nFor example: Drink water or Read a book.',
  tutorialEditSubmitBody:
    'All set!\nTap Create below to add it to your Home screen.',
  tutorialGotIt: 'Got it',
  tutorialNext: '下一步',
  tutorialWelcome: '歡迎使用 Repolog',
  tutorialDesc1: '連結你的日常習慣，建立屬於你的鎖鏈。',
  tutorialDesc2: '不要讓鎖鏈斷裂，讓習慣堅持下去。',
  tutorialStart: '開始',
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
  locationObtained: 'Location obtained',
  locationUnavailable: 'Location unavailable',
  locationPermissionDenied: 'Location permission denied',
  locationError: 'Failed to get location',
  addressLabel: 'Address',
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
  homeTitle: 'Home',
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
  reportPhotosLabel: 'photos',
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
  pdfExportSuccess: 'PDF exported successfully.',
  pdfExportFailed: 'Failed to export PDF.',
  pdfPhotoWarningTitle: '照片過多',
  pdfPhotoWarningBody: '超過 {count} 張照片，產生 PDF 可能需要較長時間。要繼續嗎？',
  pdfPhotoWarningContinue: '繼續',
  pdfPhotoWarningCancel: '返回',
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
};

export default dict;
