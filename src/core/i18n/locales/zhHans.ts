import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: '连续天数',            // 英語: DAYS STREAK (連続記録)
  yourChain: '你的链条',             // 英語: YOUR CHAIN (あなたのチェーン)
  allDoneDays: '完美达成',           // 英語: ALL DONE DAYS (全て完了した日 -> 意訳して「完美達成」)

  // --- Settings (General) (設定：一般) ---
  settings: '设置',                  // 設定
  hapticOff: '振动已关',             // 振動オフ
  language: '语言',                  // 言語
  sound: '音效',                     // 音 (Sound)
  haptics: '振动反馈',               // 振動 (Haptics)
  theme: '主题',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: '恢复购买',               // 購入の復元
  purchaseSuccess: 'Pro 方案已激活。', // 購入成功
  purchaseFailed: '购买失败，请稍后重试。', // 購入失敗
  restoreSuccess: '购买记录已恢复。', // 復元成功
  restoreNotFound: '未找到可恢复的购买记录。', // 復元データなし
  restoreFailed: '恢复购买失败。',   // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'App 版本',               // アプリバージョン
  tapSound: '点击音效',              // タップ音
  click: '点击音',                   // クリック
  pop: '气泡音',                     // ポップ
  soundSwitchLabel: '声音效果',      // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: '解锁你的链条。',        // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: '突破 3 个习惯的限制，让你的圆点势不可挡。',
  proPlanFreeTitle: '免费版',        // 無料
  proPlanMonthlyTitle: '按月订阅',   // 月額
  proPlanYearlyTitle: '按年订阅',    // 年額
  proPlanYearlyBadge: '超值推荐',    // 英語: Best value (一番お得/超値推薦)
  proBadgeShort: 'PRO',
  priceFree: '¥0 / 永久',            // ずっと0円
  proOnlyTitle: 'Pro 功能',          // Pro機能
  proOnlyTheme: '升级到 Pro 即可使用此主题。',
  openPro: '查看 Pro 方案',          // Proプランを見る
  cancel: '取消',                    // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: '电流动画效果',   // 電気の流れのアニメーション
  flowEffectHelp:
    '让霓虹电流沿着你的链条流动。如果你喜欢安静的界面，可以关闭它。',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: '链条显示范围',
  heatmapRangeHelp: '选择在主屏幕热力图上显示多少天的链条记录。',
  heatmapRange7: '1 周',
  heatmapRange30: '1 个月',
  heatmapRange60: '2 个月',
  heatmapRange90: '3 个月',
  heatmapRange180: '6 个月',
  heatmapRange365: '1 年',
  heatmapSummaryPrefix: '最近 ',     // 「最近〜」
  heatmapSummarySuffix: ' 天',       // 「〜天」
  heatmapAgoSuffix: ' 天前',         // 「〜天前」
  heatmapToday: '今天',

  // --- Themes (テーマ) ---
  themeDesc: '更改应用程序的外观。',
  themeDarkLabel: '深色',            // Dark
  themeLightLabel: '浅色',            // Light
  themeNeonPinkLabel: '霓虹粉',      // Neon Pink
  themeCyberBlueLabel: '赛博蓝',     // Cyber Blue
  freeThemeNote: '免费：仅限深色 / Pro 解锁霓虹粉和赛博蓝',
  proThemeNote: 'Pro 主题将在购买后解锁。',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: '新建习惯',
  editHabitTitle: '编辑习惯',
  habitNameLabel: '名称',
  habitNamePlaceholder: '例如：喝水、读书',
  habitIconLabel: '图标',
  deleteHabit: '删除此习惯',
  deleteConfirmationTitle: '确认删除？',
  deleteConfirmationMessage: '此操作无法撤销。所有打卡记录都将丢失。',
  save: '保存',
  create: '创建',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: '基础',
  iconCatHealth: '健康',
  iconCatLearning: '学习',

  iconLabelStreak: '连胜',           // Streak
  iconLabelTask: '任务',             // Task
  iconLabelShine: '闪耀',            // Shine
  iconLabelClean: '清洁',            // Clean
  iconLabelLaundry: '洗衣',          // Laundry
  iconLabelWater: '喝水',            // Water
  iconLabelWalk: '步行',             // Walk
  iconLabelSleep: '睡眠',            // Sleep
  iconLabelWorkout: '健身',          // Workout
  iconLabelBarbell: '举重',          // Barbell
  iconLabelRead: '阅读',             // Read
  iconLabelArt: '艺术',              // Art
  iconLabelMedia: '媒体',            // Media
  iconLabelStudy: '学习',            // Study
  iconLabelLanguage: '语言',         // Language

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' 习惯按钮',    // アクセシビリティ用
  errorLoadFailed: '数据加载失败。',
  errorTitleRequired: '名称是必填项。',
  errorTitleTooLong: '名称最多 20 个字符。',
  errorSaveFailed: '保存失败。',
  errorDeleteFailed: '删除失败。',
  errorToggleFailed: '更新失败。',
  habitLimitTitle: '免费版限制',
  habitLimitBody: '免费版最多只能创建 3 个习惯。',

  // --- Settings description (設定の説明) ---
  hapticsDescription: '触感反馈 (振动)',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: '提醒',
  reminderToggleLabel: '使用提醒',
  reminderTimeLabel: '通知时间',
  reminderNotificationBody: '是时候连接你的链条了！', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: '连续打卡 7 天！',
  streak7Message: '你已经保持链条整整一周了。干得漂亮！',
  ok: '太棒了',

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
  tutorialWelcome: '欢迎使用 Repolog',
  tutorialDesc1: '连接你的日常习惯，构建属于你的链条。',
  tutorialDesc2: '不要让链条断裂，让习惯坚持下去。',
  tutorialStart: '开始',
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
  pdfPhotoWarningTitle: '照片过多',
  pdfPhotoWarningBody: '超过 {count} 张照片，生成 PDF 可能需要较长时间。继续吗？',
  pdfPhotoWarningContinue: '继续',
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
