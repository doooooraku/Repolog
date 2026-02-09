import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: 'GÜN SERİSİ',         // 英語: DAYS STREAK (連続日数)
  yourChain: 'ZİNCİRİN',             // 英語: YOUR CHAIN (あなたのチェーン)
  allDoneDays: 'TAMAMLANAN GÜNLER',  // 英語: ALL DONE DAYS (全て完了した日)

  // --- Settings (General) (設定：一般) ---
  settings: 'Ayarlar',               // 設定
  hapticOff: 'Titreşim kapalı',      // 振動オフ
  language: 'Dil',                   // 言語
  sound: 'Ses',                      // 音
  haptics: 'Titreşim',               // 振動 (Haptics)
  theme: 'Tema',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Satın Alımları Yükle',   // 購入の復元 (少し短縮してボタンに収める)
  purchaseSuccess: 'Pro plan artık aktif.', // 購入成功
  purchaseFailed: 'Satın alma başarısız. Lütfen sonra tekrar dene.', // 購入失敗
  restoreSuccess: 'Satın alma geçmişi yüklendi.', // 復元成功
  restoreNotFound: 'Geri yüklenecek satın alma bulunamadı.', // 復元データなし
  restoreFailed: 'Satın alımlar yüklenemedi.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'Uygulama Sürümü',        // アプリバージョン
  tapSound: 'Dokunma sesi',          // タップ音
  click: 'Tık',                      // クリック
  pop: 'Pop',                        // ポップ
  soundSwitchLabel: 'Ses Efektleri', // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: 'Zincirinin kilidini aç.', // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: '3 alışkanlığın ötesine geç ve noktalarını durdurulamaz yap.',
  proPlanFreeTitle: 'Ücretsiz',      // 無料
  proPlanMonthlyTitle: 'Aylık',      // 月額
  proPlanYearlyTitle: 'Yıllık',      // 年額
  proPlanYearlyBadge: 'En Avantajlı', // 英語: Best value (一番お得)
  proBadgeShort: 'PRO',
  priceFree: '₺0 / sonsuza kadar',   // ずっと0リラ (または $0)
  proOnlyTitle: 'Pro Özellik',       // Pro機能
  proOnlyTheme: 'Bu temayı kullanmak için Pro\'ya geç.',
  openPro: 'Pro Planı Gör',          // Proプランを見る
  cancel: 'İptal',                   // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'Elektrik Akışı Animasyonu', // 電気の流れのアニメーション
  flowEffectHelp:
    'Zincir hattın boyunca neon bir akışın gezinmesine izin ver. Daha sakin bir görünüm istersen kapat.',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: 'Görüntüleme Aralığı',
  heatmapRangeHelp: 'Ana ekrandaki ısı haritasında zincirinin kaç gününün gösterileceğini seç.',
  heatmapRange7: '1 hafta',
  heatmapRange30: '1 ay',
  heatmapRange60: '2 ay',
  heatmapRange90: '3 ay',
  heatmapRange180: '6 ay',
  heatmapRange365: '1 yıl',
  heatmapSummaryPrefix: 'Son ',      // 「Son (最後の/過去の)」
  heatmapSummarySuffix: ' gün',      // 「gün (日)」
  heatmapAgoSuffix: ' gün önce',     // 「gün önce (日前)」
  heatmapToday: 'Bugün',

  // --- Themes (テーマ) ---
  themeDesc: 'Uygulama görünümünü değiştir.',
  themeDarkLabel: 'Koyu',            // Dark
  themeNeonPinkLabel: 'Neon Pembe',
  themeCyberBlueLabel: 'Siber Mavi',
  freeThemeNote: 'Ücretsiz: Sadece Koyu / Pro: Neon Pembe ve Siber Mavi\'yi açar',
  proThemeNote: 'Pro temalar yakında gelecek.',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: 'Yeni Alışkanlık',
  editHabitTitle: 'Alışkanlığı Düzenle',
  habitNameLabel: 'İsim',
  habitNamePlaceholder: 'ör: Su iç, Kitap oku',
  habitIconLabel: 'Simge',
  deleteHabit: 'Bu alışkanlığı sil',
  deleteConfirmationTitle: 'Silinsin mi?',
  deleteConfirmationMessage: 'Bu işlem geri alınamaz. Tüm geçmiş kaybolacak.',
  save: 'Kaydet',
  create: 'Oluştur',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: 'Temel',
  iconCatHealth: 'Sağlık',
  iconCatLearning: 'Öğrenme',

  iconLabelStreak: 'Seri',           // Streak
  iconLabelTask: 'Görev',            // Task
  iconLabelShine: 'Parıltı',         // Shine
  iconLabelClean: 'Temizlik',        // Clean
  iconLabelLaundry: 'Çamaşır',       // Laundry
  iconLabelWater: 'Su',              // Water
  iconLabelWalk: 'Yürüyüş',          // Walk
  iconLabelSleep: 'Uyku',            // Sleep
  iconLabelWorkout: 'Antrenman',     // Workout
  iconLabelBarbell: 'Halter',        // Barbell
  iconLabelRead: 'Okuma',            // Read
  iconLabelArt: 'Sanat',             // Art
  iconLabelMedia: 'Medya',           // Media
  iconLabelStudy: 'Ders',            // Study
  iconLabelLanguage: 'Dil',          // Language

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' alışkanlık düğmesi', // アクセシビリティ用
  errorLoadFailed: 'Veri yüklenemedi.',
  errorTitleRequired: 'İsim gerekli.',
  errorTitleTooLong: 'İsim 20 karakterden kısa olmalı.',
  errorSaveFailed: 'Kaydedilemedi.',
  errorDeleteFailed: 'Silinemedi.',
  errorToggleFailed: 'Güncellenemedi.',
  habitLimitTitle: 'Ücretsiz plan limiti',
  habitLimitBody: 'Ücretsiz planda en fazla 3 alışkanlık oluşturabilirsin.',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'Dokunsal geri bildirim (titreşim)',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: 'Hatırlatıcı',
  reminderToggleLabel: 'Hatırlatıcı kullan',
  reminderTimeLabel: 'Bildirim zamanı',
  reminderNotificationBody: 'Zincirini kurma zamanı!', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: '7 günlük seri!',
  streak7Message: 'Zincirini tam bir hafta korudun. Harika iş!',
  ok: 'Süper',

  // --- Language labels (言語名) ---
  languageChange: 'Dili değiştir',
  currentLanguage: 'Mevcut',
  languageNameEn: 'İngilizce',
  languageNameJa: 'Japonca',
  languageNameFr: 'Fransızca',
  languageNameEs: 'İspanyolca',
  languageNameDe: 'Almanca',
  languageNameIt: 'İtalyanca',
  languageNamePt: 'Portekizce',
  languageNameRu: 'Rusça',
  languageNameZhHans: 'Çince (简体)',
  languageNameZhHant: 'Çince (繁體)',
  languageNameKo: 'Korece',
  languageNameHi: 'Hintçe',
  languageNameId: 'Endonezce',
  languageNameTh: 'Tayca',
  languageNameVi: 'Vietnamca',
  languageNameTr: 'Türkçe',
  languageNameNl: 'Felemenkçe',
  languageNameSv: 'İsveççe',

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
  tutorialNext: 'İleri',
  tutorialWelcome: 'Repolog\'e Hoş Geldin',
  tutorialDesc1: 'Günlük alışkanlıklarını birleştir ve kendi zincirini kur.',
  tutorialDesc2: 'Alışkanlığın kalıcı olması için zinciri kırma.',
  tutorialStart: 'Başla',
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
  pdfPhotoWarningTitle: 'Çok fazla fotoğraf',
  pdfPhotoWarningBody: '{count}+ fotoğraf PDF oluşturmayı uzun sürebilir. Devam edilsin mi?',
  pdfPhotoWarningContinue: 'Devam et',
  pdfPhotoWarningCancel: 'Geri dön',
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
