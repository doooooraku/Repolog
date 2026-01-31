import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: 'วันต่อเนื่อง',        // 英語: DAYS STREAK (連続日数)
  yourChain: 'เชนของคุณ',            // 英語: YOUR CHAIN (あなたのチェーン)
  allDoneDays: 'วันที่ทำครบ',        // 英語: ALL DONE DAYS (全て完了した日)

  // --- Settings (General) (設定：一般) ---
  settings: 'การตั้งค่า',            // 設定
  hapticOff: 'ปิดการสั่น',           // 振動オフ
  language: 'ภาษา',                  // 言語
  sound: 'เสียง',                    // 音
  haptics: 'การสั่น',                // 振動 (Haptics)
  theme: 'ธีม',                      // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'กู้คืนการซื้อ',          // 購入の復元
  purchaseSuccess: 'แพ็กเกจ Pro ใช้งานได้แล้ว', // 購入成功
  purchaseFailed: 'การสั่งซื้อล้มเหลว โปรดลองใหม่ภายหลัง', // 購入失敗
  restoreSuccess: 'กู้คืนประวัติการซื้อแล้ว', // 復元成功
  restoreNotFound: 'ไม่พบประวัติการซื้อ',    // 復元データなし
  restoreFailed: 'กู้คืนการซื้อไม่สำเร็จ',   // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'เวอร์ชันแอป',            // アプリバージョン
  tapSound: 'เสียงกด',               // タップ音
  click: 'คลิก',                     // クリック
  pop: 'ป๊อป',                       // ポップ
  soundSwitchLabel: 'เอฟเฟกต์เสียง', // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: 'ปลดล็อกเชนของคุณ',      // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: 'ก้าวข้ามขีดจำกัด 3 นิสัย และทำให้จุดของคุณไม่หยุดนิ่ง',
  proPlanFreeTitle: 'ฟรี',           // 無料
  proPlanMonthlyTitle: 'รายเดือน',   // 月額
  proPlanYearlyTitle: 'รายปี',       // 年額
  proPlanYearlyBadge: 'คุ้มที่สุด',  // 英語: Best value (一番お得/価値がある)
  proBadgeShort: 'PRO',
  priceFree: '฿0 / ตลอดไป',          // ずっと0バーツ (または $0)
  proOnlyTitle: 'ฟีเจอร์ Pro',       // Pro機能
  proOnlyTheme: 'อัปเกรดเป็น Pro เพื่อใช้ธีมนี้',
  openPro: 'ดูแพ็กเกจ Pro',          // Proプランを見る
  cancel: 'ยกเลิก',                  // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'แอนิเมชันกระแสไฟ', // 電気の流れのアニメーション
  flowEffectHelp:
    'ให้แสงนีออนไหลผ่านเส้นเชนของคุณ ปิดได้หากต้องการหน้าจอที่นิ่งสงบ',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: 'ระยะเวลาแสดงผล',
  heatmapRangeHelp: 'เลือกจำนวนวันที่ต้องการแสดงเชนบนหน้าโฮม',
  heatmapRange7: '1 สัปดาห์',
  heatmapRange30: '1 เดือน',
  heatmapRange60: '2 เดือน',
  heatmapRange90: '3 เดือน',
  heatmapRange180: '6 เดือน',
  heatmapRange365: '1 ปี',
  heatmapSummaryPrefix: 'ย้อนหลัง ', // 「過去〜」
  heatmapSummarySuffix: ' วัน',      // 「〜日」
  heatmapAgoSuffix: ' วันที่แล้ว',   // 「〜日前」
  heatmapToday: 'วันนี้',

  // --- Themes (テーマ) ---
  themeDesc: 'เปลี่ยนหน้าตาของแอป',
  themeDarkLabel: 'มืด',             // Dark
  themeNeonPinkLabel: 'นีออนชมพู',
  themeCyberBlueLabel: 'ไซเบอร์บลู',
  freeThemeNote: 'ฟรี: ใช้ได้เฉพาะธีมมืด / Pro: ปลดล็อกนีออนชมพูและไซเบอร์บลู',
  proThemeNote: 'ธีม Pro จะใช้ได้หลังจากสมัครสมาชิก',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: 'นิสัยใหม่',
  editHabitTitle: 'แก้ไขนิสัย',
  habitNameLabel: 'ชื่อ',
  habitNamePlaceholder: 'เช่น ดื่มน้ำ, อ่านหนังสือ',
  habitIconLabel: 'ไอคอน',
  deleteHabit: 'ลบนิสัยนี้',
  deleteConfirmationTitle: 'ยืนยันการลบ?',
  deleteConfirmationMessage: 'การกระทำนี้ไม่สามารถย้อนกลับได้ ประวัติทั้งหมดจะหายไป',
  save: 'บันทึก',
  create: 'สร้าง',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: 'พื้นฐาน',
  iconCatHealth: 'สุขภาพ',
  iconCatLearning: 'การเรียนรู้',

  iconLabelStreak: 'ต่อเนื่อง',      // Streak
  iconLabelTask: 'งาน',              // Task
  iconLabelShine: 'สดใส',            // Shine
  iconLabelClean: 'ทำความสะอาด',     // Clean
  iconLabelLaundry: 'ซักผ้า',        // Laundry
  iconLabelWater: 'ดื่มน้ำ',         // Water
  iconLabelWalk: 'เดิน',             // Walk
  iconLabelSleep: 'นอนหลับ',         // Sleep
  iconLabelWorkout: 'ออกกำลังกาย',   // Workout
  iconLabelBarbell: 'ยกน้ำหนัก',     // Barbell
  iconLabelRead: 'อ่าน',             // Read
  iconLabelArt: 'ศิลปะ',             // Art
  iconLabelMedia: 'สื่อ',            // Media
  iconLabelStudy: 'เรียน',           // Study
  iconLabelLanguage: 'ภาษา',         // Language

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' ปุ่มนิสัย',   // アクセシビリティ用
  errorLoadFailed: 'โหลดข้อมูลล้มเหลว',
  errorTitleRequired: 'กรุณาระบุชื่อ',
  errorTitleTooLong: 'ชื่อต้องไม่เกิน 20 ตัวอักษร',
  errorSaveFailed: 'บันทึกไม่สำเร็จ',
  errorDeleteFailed: 'ลบไม่สำเร็จ',
  errorToggleFailed: 'อัปเดตไม่สำเร็จ',
  habitLimitTitle: 'ขีดจำกัดแพ็กเกจฟรี',
  habitLimitBody: 'แพ็กเกจฟรีสร้างได้สูงสุด 3 นิสัย',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'ระบบสั่นตอบสนอง (Haptic)',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: 'แจ้งเตือน',
  reminderToggleLabel: 'เปิดใช้แจ้งเตือน',
  reminderTimeLabel: 'เวลาแจ้งเตือน',
  reminderNotificationBody: 'ได้เวลาสร้างเชนของคุณแล้ว!', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: 'ต่อเนื่อง 7 วัน!',
  streak7Message: 'คุณรักษาเชนได้ครบหนึ่งสัปดาห์แล้ว สุดยอดมาก!',
  ok: 'ยอดเยี่ยม',

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
  languageNameSv: 'สวีเดน',

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
  tutorialNext: 'ถัดไป',
  tutorialWelcome: 'ยินดีต้อนรับสู่ Repolog',
  tutorialDesc1: 'เชื่อมต่อนิสัยประจำวันและสร้างเชนของคุณเอง',
  tutorialDesc2: 'อย่าให้เชนขาด เพื่อให้นิสัยคงอยู่ตลอดไป',
  tutorialStart: 'เริ่มต้น',
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