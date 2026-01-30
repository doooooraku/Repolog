import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: 'CHUỖI NGÀY',          // 英語: DAYS STREAK (連続日数 - 短くインパクトのある表現)
  yourChain: 'CHUỖI CỦA BẠN',        // 英語: YOUR CHAIN
  allDoneDays: 'NGÀY HOÀN TẤT',      // 英語: ALL DONE DAYS (全て完了した日)

  // --- Settings (General) (設定：一般) ---
  settings: 'Cài đặt',               // 設定
  hapticOff: 'Tắt rung',             // 振動オフ
  language: 'Ngôn ngữ',              // 言語
  sound: 'Âm thanh',                 // 音
  haptics: 'Rung',                   // 振動 (Haptics - 一般的に「Rung」)
  theme: 'Giao diện',                // テーマ (Chủ đềとも言うがGiao diệnはUI全体を指す)

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Khôi phục mua hàng',     // 購入の復元
  purchaseSuccess: 'Gói Pro đã được kích hoạt.', // 購入成功
  purchaseFailed: 'Giao dịch thất bại. Vui lòng thử lại sau.', // 購入失敗
  restoreSuccess: 'Đã khôi phục lịch sử mua hàng.', // 復元成功
  restoreNotFound: 'Không tìm thấy đơn hàng để khôi phục.', // 復元データなし
  restoreFailed: 'Khôi phục thất bại.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'Phiên bản ứng dụng',     // アプリバージョン
  tapSound: 'Âm thanh chạm',         // タップ音
  click: 'Click',                    // クリック (英語のままで通じやすい)
  pop: 'Pop',                        // ポップ
  soundSwitchLabel: 'Hiệu ứng âm thanh', // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: 'Mở khóa chuỗi của bạn.', // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: 'Vượt qua giới hạn 3 thói quen và khiến các điểm của bạn không thể dừng lại.',
  proPlanFreeTitle: 'Miễn phí',      // 無料
  proPlanMonthlyTitle: 'Hàng tháng', // 月額
  proPlanYearlyTitle: 'Hàng năm',    // 年額
  proPlanYearlyBadge: 'Tốt nhất',    // 英語: Best value (一番お得/ベスト)
  proBadgeShort: 'PRO',
  priceFree: '0đ / vĩnh viễn',       // ずっと0ドン (または $0)
  proOnlyTitle: 'Tính năng Pro',     // Pro機能
  proOnlyTheme: 'Nâng cấp lên Pro để dùng giao diện này.',
  openPro: 'Xem gói Pro',            // Proプランを見る
  cancel: 'Hủy',                     // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'Hiệu ứng dòng điện', // 電気の流れのアニメーション
  flowEffectHelp:
    'Cho dòng điện neon chạy dọc chuỗi của bạn. Tắt đi nếu bạn muốn giao diện tĩnh lặng hơn.',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: 'Khoảng thời gian hiển thị',
  heatmapRangeHelp: 'Chọn số ngày của chuỗi sẽ hiển thị trên bản đồ nhiệt ở màn hình chính.',
  heatmapRange7: '1 tuần',
  heatmapRange30: '1 tháng',
  heatmapRange60: '2 tháng',
  heatmapRange90: '3 tháng',
  heatmapRange180: '6 tháng',
  heatmapRange365: '1 năm',
  heatmapSummaryPrefix: '',          // 空文字 (ベトナム語は数字の後ろに言葉が来る)
  heatmapSummarySuffix: ' ngày qua', // 「〜 ngày qua (過去〜日間)」
  heatmapAgoSuffix: ' ngày trước',   // 「〜日前」
  heatmapToday: 'Hôm nay',

  // --- Themes (テーマ) ---
  themeDesc: 'Thay đổi giao diện ứng dụng.',
  themeDarkLabel: 'Tối',             // Dark
  themeNeonPinkLabel: 'Neon Hồng',
  themeCyberBlueLabel: 'Cyber Xanh',
  freeThemeNote: 'Miễn phí: Chỉ Giao diện Tối / Pro mở khóa Neon Hồng & Cyber Xanh',
  proThemeNote: 'Giao diện Pro sẽ mở sau khi đăng ký.',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: 'Thói quen mới',
  editHabitTitle: 'Sửa thói quen',
  habitNameLabel: 'Tên',
  habitNamePlaceholder: 'VD: Uống nước, Đọc sách',
  habitIconLabel: 'Biểu tượng',
  deleteHabit: 'Xóa thói quen này',
  deleteConfirmationTitle: 'Xóa thói quen?',
  deleteConfirmationMessage: 'Hành động này không thể hoàn tác. Mọi lịch sử sẽ bị mất.',
  save: 'Lưu',
  create: 'Tạo',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: 'Cơ bản',
  iconCatHealth: 'Sức khỏe',
  iconCatLearning: 'Học tập',

  iconLabelStreak: 'Chuỗi',          // Streak
  iconLabelTask: 'Tác vụ',           // Task
  iconLabelShine: 'Tỏa sáng',        // Shine
  iconLabelClean: 'Dọn dẹp',         // Clean
  iconLabelLaundry: 'Giặt ủi',       // Laundry
  iconLabelWater: 'Nước',            // Water
  iconLabelWalk: 'Đi bộ',            // Walk
  iconLabelSleep: 'Giấc ngủ',        // Sleep
  iconLabelWorkout: 'Tập luyện',     // Workout
  iconLabelBarbell: 'Tạ',            // Barbell
  iconLabelRead: 'Đọc',              // Read
  iconLabelArt: 'Nghệ thuật',        // Art
  iconLabelMedia: 'Giải trí',        // Media
  iconLabelStudy: 'Học',             // Study
  iconLabelLanguage: 'Ngôn ngữ',     // Language

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' nút thói quen', // アクセシビリティ用
  errorLoadFailed: 'Tải dữ liệu thất bại.',
  errorTitleRequired: 'Vui lòng nhập tên.',
  errorTitleTooLong: 'Tên không được quá 20 ký tự.',
  errorSaveFailed: 'Lưu thất bại.',
  errorDeleteFailed: 'Xóa thất bại.',
  errorToggleFailed: 'Cập nhật thất bại.',
  habitLimitTitle: 'Giới hạn gói miễn phí',
  habitLimitBody: 'Ở gói miễn phí, bạn chỉ có thể tạo tối đa 3 thói quen.',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'Phản hồi rung',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: 'Nhắc nhở',
  reminderToggleLabel: 'Bật nhắc nhở',
  reminderTimeLabel: 'Thời gian thông báo',
  reminderNotificationBody: 'Đã đến lúc nối dài chuỗi của bạn!', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: 'Chuỗi 7 ngày!',
  streak7Message: 'Bạn đã giữ chuỗi liên tục trong một tuần. Làm tốt lắm!',
  ok: 'Tuyệt vời',

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
  languageNameSv: 'Tiếng Thụy Điển',

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
  tutorialNext: 'Tiếp theo',
  tutorialWelcome: 'Chào mừng đến với Repolog',
  tutorialDesc1: 'Kết nối các thói quen hàng ngày và xây dựng chuỗi của riêng bạn.',
  tutorialDesc2: 'Đừng để đứt chuỗi để duy trì thói quen.',
  tutorialStart: 'Bắt đầu',
};

export default dict;