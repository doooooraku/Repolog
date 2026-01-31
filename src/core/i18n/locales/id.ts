import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: 'HARI BERUNTUN',       // 英語: DAYS STREAK (連続日数)
  yourChain: 'RANTAI KAMU',          // 英語: YOUR CHAIN (あなたのチェーン)
  allDoneDays: 'HARI TUNTAS',        // 英語: ALL DONE DAYS (全て完了した日)

  // --- Settings (General) (設定：一般) ---
  settings: 'Pengaturan',            // 設定
  hapticOff: 'Getaran mati',         // 振動オフ
  language: 'Bahasa',                // 言語
  sound: 'Suara',                    // 音
  haptics: 'Getaran',                // 振動 (Haptics)
  theme: 'Tema',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Pulihkan Pembelian',     // 購入の復元
  purchaseSuccess: 'Paket Pro kini aktif.', // 購入成功
  purchaseFailed: 'Pembelian gagal. Silakan coba lagi nanti.', // 購入失敗
  restoreSuccess: 'Riwayat pembelian dipulihkan.', // 復元成功
  restoreNotFound: 'Tidak ada pembelian untuk dipulihkan.', // 復元データなし
  restoreFailed: 'Gagal memulihkan pembelian.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'Versi Aplikasi',         // アプリバージョン
  tapSound: 'Suara Tap',             // タップ音
  click: 'Klik',                     // クリック
  pop: 'Pop',                        // ポップ
  soundSwitchLabel: 'Efek Suara',    // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: 'Buka rantaimu.',        // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: 'Lebih dari 3 kebiasaan dan buat titik-titikmu tak terhentikan.',
  proPlanFreeTitle: 'Gratis',        // 無料
  proPlanMonthlyTitle: 'Bulanan',    // 月額
  proPlanYearlyTitle: 'Tahunan',     // 年額
  proPlanYearlyBadge: 'Paling Hemat', // 英語: Best value (一番お得/節約できる)
  proBadgeShort: 'PRO',
  priceFree: 'Rp0 / selamanya',      // ずっと0ルピア (または $0)
  proOnlyTitle: 'Fitur Pro',         // Pro機能
  proOnlyTheme: 'Upgrade ke Pro untuk menggunakan tema ini.',
  openPro: 'Lihat Paket Pro',        // Proプランを見る
  cancel: 'Batal',                   // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'Animasi Aliran Listrik', // 電気の流れのアニメーション
  flowEffectHelp:
    'Biarkan aliran neon mengalir di sepanjang rantaimu. Matikan jika ingin tampilan yang lebih tenang.',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: 'Rentang Tampilan',
  heatmapRangeHelp: 'Pilih berapa hari rantai yang akan ditampilkan di peta panas beranda.',
  heatmapRange7: '1 minggu',
  heatmapRange30: '1 bulan',
  heatmapRange60: '2 bulan',
  heatmapRange90: '3 bulan',
  heatmapRange180: '6 bulan',
  heatmapRange365: '1 tahun',
  heatmapSummaryPrefix: '',          // 空文字 (数字の後ろに言葉が来るため)
  heatmapSummarySuffix: ' hari terakhir', // 「〜 hari terakhir (過去〜日間)」
  heatmapAgoSuffix: ' hari lalu',    // 「〜日前」
  heatmapToday: 'Hari ini',

  // --- Themes (テーマ) ---
  themeDesc: 'Ubah tampilan aplikasi.',
  themeDarkLabel: 'Gelap',           // Dark
  themeNeonPinkLabel: 'Neon Pink',
  themeCyberBlueLabel: 'Cyber Blue',
  freeThemeNote: 'Gratis: Hanya Gelap / Pro membuka Neon Pink & Cyber Blue',
  proThemeNote: 'Tema Pro akan terbuka setelah berlangganan.',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: 'Kebiasaan Baru',
  editHabitTitle: 'Edit Kebiasaan',
  habitNameLabel: 'Nama',
  habitNamePlaceholder: 'Cth: Minum air, Baca buku',
  habitIconLabel: 'Ikon',
  deleteHabit: 'Hapus kebiasaan ini',
  deleteConfirmationTitle: 'Hapus?',
  deleteConfirmationMessage: 'Tindakan ini tidak bisa dibatalkan. Semua riwayat akan hilang.',
  save: 'Simpan',
  create: 'Buat',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: 'Dasar',
  iconCatHealth: 'Kesehatan',
  iconCatLearning: 'Belajar',

  iconLabelStreak: 'Runtun',         // Streak
  iconLabelTask: 'Tugas',            // Task
  iconLabelShine: 'Kilau',           // Shine
  iconLabelClean: 'Bersih',          // Clean
  iconLabelLaundry: 'Cucian',        // Laundry
  iconLabelWater: 'Air',             // Water
  iconLabelWalk: 'Jalan',            // Walk
  iconLabelSleep: 'Tidur',           // Sleep
  iconLabelWorkout: 'Olahraga',      // Workout
  iconLabelBarbell: 'Barbel',        // Barbell
  iconLabelRead: 'Baca',             // Read
  iconLabelArt: 'Seni',              // Art
  iconLabelMedia: 'Media',           // Media
  iconLabelStudy: 'Belajar',         // Study
  iconLabelLanguage: 'Bahasa',       // Language

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' tombol kebiasaan', // アクセシビリティ用
  errorLoadFailed: 'Gagal memuat data.',
  errorTitleRequired: 'Nama wajib diisi.',
  errorTitleTooLong: 'Nama maksimal 20 karakter.',
  errorSaveFailed: 'Gagal menyimpan.',
  errorDeleteFailed: 'Gagal menghapus.',
  errorToggleFailed: 'Gagal memperbarui.',
  habitLimitTitle: 'Batas Paket Gratis',
  habitLimitBody: 'Di paket gratis, kamu hanya bisa membuat hingga 3 kebiasaan.',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'Umpan balik getaran',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: 'Pengingat',
  reminderToggleLabel: 'Gunakan pengingat',
  reminderTimeLabel: 'Waktu notifikasi',
  reminderNotificationBody: 'Waktunya membangun rantaimu!', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: '7 hari beruntun!',
  streak7Message: 'Kamu telah menjaga rantaimu selama seminggu penuh. Kerja bagus!',
  ok: 'Mantap',

  // --- Language labels (言語名) ---
  languageChange: 'Ganti Bahasa',
  currentLanguage: 'Saat ini',
  languageNameEn: 'Inggris',
  languageNameJa: 'Jepang',
  languageNameFr: 'Prancis',
  languageNameEs: 'Spanyol',
  languageNameDe: 'Jerman',
  languageNameIt: 'Italia',
  languageNamePt: 'Portugis',
  languageNameRu: 'Rusia',
  languageNameZhHans: 'Mandarin (简体)',
  languageNameZhHant: 'Mandarin (繁體)',
  languageNameKo: 'Korea',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesia',
  languageNameTh: 'Thailand',
  languageNameVi: 'Vietnam',
  languageNameTr: 'Turki',
  languageNameNl: 'Belanda',
  languageNameSv: 'Swedia',

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
  tutorialNext: 'Lanjut',
  tutorialWelcome: 'Selamat datang di Repolog',
  tutorialDesc1: 'Hubungkan kebiasaan harianmu dan bangun rantaimu sendiri.',
  tutorialDesc2: 'Jangan putus rantainya agar kebiasaanmu tetap terjaga.',
  tutorialStart: 'Mulai',
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