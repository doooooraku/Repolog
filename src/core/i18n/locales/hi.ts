import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: 'लगातार दिन',          // 英語: DAYS STREAK (連続日数)
  yourChain: 'आपकी चेन',             // 英語: YOUR CHAIN (あなたのチェーン)
  allDoneDays: 'पूरे किए गए दिन',    // 英語: ALL DONE DAYS (全て完了した日)

  // --- Settings (General) (設定：一般) ---
  settings: 'सेटिंग्स',              // 設定 (Settings)
  hapticOff: 'वाइब्रेशन बंद',        // 振動オフ
  language: 'भाषा',                  // 言語
  sound: 'साउंड',                    // 音 (Sound)
  haptics: 'हैप्टिक्स',              // 振動 (Haptics)
  theme: 'थीम',                      // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'खरीद बहाल करें',         // 購入の復元 (Restore purchases)
  purchaseSuccess: 'Pro प्लान अब सक्रिय है।', // 購入成功
  purchaseFailed: 'खरीदारी विफल रही। कृपया बाद में पुनः प्रयास करें।', // 購入失敗
  restoreSuccess: 'खरीद इतिहास बहाल कर दिया गया।', // 復元成功
  restoreNotFound: 'बहाल करने के लिए कोई खरीदारी नहीं मिली।', // 復元データなし
  restoreFailed: 'खरीद बहाल करने में विफल।', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'ऐप वर्ज़न',              // アプリバージョン
  tapSound: 'टैप साउंड',             // タップ音
  click: 'क्लिक',                    // クリック
  pop: 'पॉप',                        // ポップ
  soundSwitchLabel: 'साउंड इफेक्ट्स', // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: 'अपनी चेन को अनलॉक करें।', // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: '3 आदतों से आगे बढ़ें और अपने डॉट्स को रोकना मुश्किल बनाएं।',
  proPlanFreeTitle: 'फ्री',          // 無料
  proPlanMonthlyTitle: 'मासिक',      // 月額
  proPlanYearlyTitle: 'वार्षिक',     // 年額
  proPlanYearlyBadge: 'सबसे किफायती', // 英語: Best value (最も価値がある/お得)
  proBadgeShort: 'PRO',
  priceFree: '₹0 / हमेशा के लिए',    // ずっと0ルピー (または $0)
  proOnlyTitle: 'Pro फीचर',          // Pro機能
  proOnlyTheme: 'इस थीम का उपयोग करने के लिए Pro में अपग्रेड करें।',
  openPro: 'Pro प्लान देखें',        // Proプランを見る
  cancel: 'रद्द करें',               // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'इलेक्ट्रिक फ्लो ऐनिमेशन', // 電気の流れのアニメーション
  flowEffectHelp:
    'अपनी चेन लाइन पर एक नियन प्रवाह चलने दें। यदि आप शांत लुक चाहते हैं तो इसे बंद कर दें।',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: 'चेन दिखाने की अवधि',
  heatmapRangeHelp: 'चुनें कि होम स्क्रीन हीटमैप पर आपकी चेन के कितने दिन दिखाई दें।',
  heatmapRange7: '1 सप्ताह',
  heatmapRange30: '1 महीना',
  heatmapRange60: '2 महीने',
  heatmapRange90: '3 महीने',
  heatmapRange180: '6 महीने',
  heatmapRange365: '1 साल',
  heatmapSummaryPrefix: 'पिछले ',      // 「過去〜」
  heatmapSummarySuffix: ' दिन',        // 「〜日」
  heatmapAgoSuffix: ' दिन पहले',       // 「〜日前」
  heatmapToday: 'आज',

  // --- Themes (テーマ) ---
  themeDesc: 'ऐप का स्वरूप बदलें।',
  themeDarkLabel: 'डार्क',             // Dark
  themeNeonPinkLabel: 'नियन पिंक',
  themeCyberBlueLabel: 'साइबर ब्लू',
  freeThemeNote: 'फ्री: केवल डार्क / Pro में नियन पिंक और साइबर ब्लू अनलॉक होते हैं',
  proThemeNote: 'Pro थीम सदस्यता के बाद उपलब्ध होंगे।',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: 'नई आदत',
  editHabitTitle: 'आदत बदलें',
  habitNameLabel: 'नाम',
  habitNamePlaceholder: 'जैसे: पानी पीना, किताब पढ़ना',
  habitIconLabel: 'आइकन',
  deleteHabit: 'यह आदत हटाएं',
  deleteConfirmationTitle: 'हटाएं?',
  deleteConfirmationMessage: 'इसे पूर्ववत नहीं किया जा सकता। सारा इतिहास मिट जाएगा।',
  save: 'सेव करें',
  create: 'बनाएं',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: 'बेसिक',
  iconCatHealth: 'सेहत',
  iconCatLearning: 'सीखना',

  iconLabelStreak: 'लगातार',         // Streak
  iconLabelTask: 'कार्य',            // Task
  iconLabelShine: 'चमक',             // Shine
  iconLabelClean: 'सफाई',            // Clean
  iconLabelLaundry: 'धुलाई',         // Laundry
  iconLabelWater: 'पानी',            // Water
  iconLabelWalk: 'चलना',             // Walk
  iconLabelSleep: 'नींद',            // Sleep
  iconLabelWorkout: 'कसरत',          // Workout
  iconLabelBarbell: 'डंबल',          // Barbell
  iconLabelRead: 'पढ़ना',            // Read
  iconLabelArt: 'कला',               // Art
  iconLabelMedia: 'मीडिया',          // Media
  iconLabelStudy: 'पढ़ाई',           // Study
  iconLabelLanguage: 'भाषा',         // Language

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' आदत बटन',     // アクセシビリティ用
  errorLoadFailed: 'डेटा लोड करने में विफल।',
  errorTitleRequired: 'नाम आवश्यक है।',
  errorTitleTooLong: 'नाम 20 अक्षरों या उससे कम का होना चाहिए।',
  errorSaveFailed: 'सेव करने में विफल।',
  errorDeleteFailed: 'हटाने में विफल।',
  errorToggleFailed: 'अपडेट करने में विफल।',
  habitLimitTitle: 'फ्री प्लान की सीमा',
  habitLimitBody: 'फ्री प्लान में आप 3 आदतें तक बना सकते हैं।',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'हैप्टिक फीडबैक (कंपन)',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: 'रिमाइंडर',
  reminderToggleLabel: 'रिमाइंडर का उपयोग करें',
  reminderTimeLabel: 'नोटिफिकेशन का समय',
  reminderNotificationBody: 'यह आपकी चेन बनाने का समय है!', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: '7 दिन लगातार!',
  streak7Message: 'आपने पूरे एक सप्ताह अपनी चेन बनाए रखी। बहुत बढ़िया!',
  ok: 'शानदार',

  // --- Language labels (言語名) ---
  languageChange: 'भाषा बदलें',
  currentLanguage: 'वर्तमान',
  languageNameEn: 'अंग्रेजी',
  languageNameJa: 'जापानी',
  languageNameFr: 'फ्रेंच',
  languageNameEs: 'स्पेनिश',
  languageNameDe: 'जर्मन',
  languageNameIt: 'इतालवी',
  languageNamePt: 'पुर्तगाली',
  languageNameRu: 'रूसी',
  languageNameZhHans: 'चीनी (简体)',
  languageNameZhHant: 'चीनी (繁體)',
  languageNameKo: 'कोरियाई',
  languageNameHi: 'हिन्दी',
  languageNameId: 'इंडोनेशियाई',
  languageNameTh: 'थाई',
  languageNameVi: 'वियतनामी',
  languageNameTr: 'तुर्की',
  languageNameNl: 'डच',
  languageNameSv: 'स्वीडिश',

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
  tutorialNext: 'आगे',
  tutorialWelcome: 'Repolog में आपका स्वागत है',
  tutorialDesc1: 'अपनी दैनिक आदतों को जोड़ें और अपनी खुद की चेन बनाएं।',
  tutorialDesc2: 'आदत बनाए रखने के लिए चेन को टूटने न दें।',
  tutorialStart: 'शुरू करें',
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
};

export default dict;