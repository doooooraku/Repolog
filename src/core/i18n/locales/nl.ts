import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: 'DAGEN OP RIJ',        // 英語: DAYS STREAK (連続日数)
  yourChain: 'JOUW KETEN',           // 英語: YOUR CHAIN
  allDoneDays: 'DAGEN VOLTOOID',     // 英語: ALL DONE DAYS (全て完了した日)

  // --- Settings (General) (設定：一般) ---
  settings: 'Instellingen',          // 設定
  hapticOff: 'Trillen uit',          // 振動オフ
  language: 'Taal',                  // 言語
  sound: 'Geluid',                   // 音
  haptics: 'Trillen',                // 振動 (Haptics - 一般的にTrillen)
  theme: 'Thema',                    // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Aankopen herstellen',    // 購入の復元
  purchaseSuccess: 'Pro-abonnement is nu actief.', // 購入成功
  purchaseFailed: 'Aankoop mislukt. Probeer het later opnieuw.', // 購入失敗
  restoreSuccess: 'Aankoopgeschiedenis hersteld.', // 復元成功 (長い単語ですがここは大丈夫)
  restoreNotFound: 'Geen aankopen gevonden om te herstellen.', // 復元データなし
  restoreFailed: 'Herstellen van aankopen mislukt.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'App-versie',             // アプリバージョン
  tapSound: 'Tikgeluid',             // タップ音
  click: 'Klik',                     // クリック
  pop: 'Pop',                        // ポップ
  soundSwitchLabel: 'Geluidseffecten', // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: 'Ontgrendel je keten.',  // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: 'Ga verder dan 3 gewoonten en maak je stippen onstuitbaar.',
  proPlanFreeTitle: 'Gratis',        // 無料
  proPlanMonthlyTitle: 'Maandelijks', // 月額
  proPlanYearlyTitle: 'Jaarlijks',   // 年額
  proPlanYearlyBadge: 'Beste keus',  // 英語: Best value (一番お得/ベストチョイス)
  proBadgeShort: 'PRO',
  priceFree: '€0 / voor altijd',     // ずっと0ユーロ (または $0)
  proOnlyTitle: 'Pro-functie',       // Pro機能
  proOnlyTheme: 'Upgrade naar Pro om dit thema te gebruiken.',
  openPro: 'Bekijk Pro-plan',        // Proプランを見る
  cancel: 'Annuleren',               // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'Elektrische stroom-animatie', // 電気の流れのアニメーション
  flowEffectHelp:
    'Laat een neonstroom over je ketenlijn lopen. Zet uit als je een rustiger beeld wilt.',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: 'Weergaveperiode',
  heatmapRangeHelp: 'Kies hoeveel dagen van je keten op de heatmap van het startscherm worden getoond.',
  heatmapRange7: '1 week',
  heatmapRange30: '1 maand',
  heatmapRange60: '2 maanden',
  heatmapRange90: '3 maanden',
  heatmapRange180: '6 maanden',
  heatmapRange365: '1 jaar',
  heatmapSummaryPrefix: 'Afgelopen ', // 「Afgelopen (過去〜/終わった〜)」
  heatmapSummarySuffix: ' dagen',     // 「dagen (〜日間)」
  heatmapAgoSuffix: ' dagen geleden', // 「〜日前」
  heatmapToday: 'Vandaag',

  // --- Themes (テーマ) ---
  themeDesc: 'Verander het uiterlijk van de app.',
  themeDarkLabel: 'Donker',          // Dark
  themeNeonPinkLabel: 'Neon Pink',
  themeCyberBlueLabel: 'Cyber Blue',
  freeThemeNote: 'Gratis: alleen Donker / Pro ontgrendelt Neon Pink & Cyber Blue',
  proThemeNote: 'Pro-thema\'s komen binnenkort.',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: 'Nieuwe gewoonte',
  editHabitTitle: 'Gewoonte bewerken',
  habitNameLabel: 'Naam',
  habitNamePlaceholder: 'bijv. Water drinken, Lezen',
  habitIconLabel: 'Icoon',
  deleteHabit: 'Verwijder deze gewoonte',
  deleteConfirmationTitle: 'Verwijderen?',
  deleteConfirmationMessage: 'Dit kan niet ongedaan worden gemaakt. Alle geschiedenis gaat verloren.',
  save: 'Opslaan',
  create: 'Aanmaken',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: 'Basis',
  iconCatHealth: 'Gezondheid',
  iconCatLearning: 'Leren',

  iconLabelStreak: 'Reeks',          // Streak (連続)
  iconLabelTask: 'Taak',             // Task
  iconLabelShine: 'Glans',           // Shine
  iconLabelClean: 'Schoonmaken',     // Clean
  iconLabelLaundry: 'De was',        // Laundry
  iconLabelWater: 'Water',           // Water
  iconLabelWalk: 'Wandelen',         // Walk
  iconLabelSleep: 'Slapen',          // Sleep
  iconLabelWorkout: 'Training',      // Workout
  iconLabelBarbell: 'Halter',        // Barbell
  iconLabelRead: 'Lezen',            // Read
  iconLabelArt: 'Kunst',             // Art
  iconLabelMedia: 'Media',           // Media
  iconLabelStudy: 'Studie',          // Study
  iconLabelLanguage: 'Taal',         // Language

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' gewoonteknop', // アクセシビリティ用
  errorLoadFailed: 'Gegevens laden mislukt.',
  errorTitleRequired: 'Naam is verplicht.',
  errorTitleTooLong: 'Naam mag maximaal 20 tekens bevatten.',
  errorSaveFailed: 'Opslaan mislukt.',
  errorDeleteFailed: 'Verwijderen mislukt.',
  errorToggleFailed: 'Updaten mislukt.',
  habitLimitTitle: 'Limiet gratis plan',
  habitLimitBody: 'In het gratis plan kun je maximaal 3 gewoonten aanmaken.',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'Haptische feedback (trillen)',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: 'Herinnering',
  reminderToggleLabel: 'Gebruik herinnering',
  reminderTimeLabel: 'Tijdstip melding',
  reminderNotificationBody: 'Het is tijd om aan je keten te bouwen!', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: '7 dagen op rij!',
  streak7Message: 'Je hebt je keten een hele week volgehouden. Goed bezig!',
  ok: 'Geweldig',

  // --- Language labels (言語名) ---
  languageChange: 'Taal wijzigen',
  currentLanguage: 'Huidige',
  languageNameEn: 'Engels',
  languageNameJa: 'Japans',
  languageNameFr: 'Frans',
  languageNameEs: 'Spaans',
  languageNameDe: 'Duits',
  languageNameIt: 'Italiaans',
  languageNamePt: 'Portugees',
  languageNameRu: 'Russisch',
  languageNameZhHans: 'Chinees (简体)',
  languageNameZhHant: 'Chinees (繁體)',
  languageNameKo: 'Koreaans',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesisch',
  languageNameTh: 'Thais',
  languageNameVi: 'Vietnamees',
  languageNameTr: 'Turks',
  languageNameNl: 'Nederlands',
  languageNamePl: 'Pools',
  languageNameSv: 'Zweeds',

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
  tutorialNext: 'Volgende',
  tutorialWelcome: 'Welkom bij Repolog',
  tutorialDesc1: 'Verbind je dagelijkse gewoonten en bouw je eigen keten.',
  tutorialDesc2: 'Breek de keten niet om de gewoonte vast te houden.',
  tutorialStart: 'Starten',
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
  pdfPhotoWarningTitle: 'Te veel foto\'s',
  pdfPhotoWarningBody: '{count}+ foto\'s kunnen lang duren om een PDF te maken. Doorgaan?',
  pdfPhotoWarningContinue: 'Doorgaan',
  pdfPhotoWarningCancel: 'Terug',
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
  settingsSectionGeneral: 'Algemeen',
  settingsSectionPrivacy: 'Privacy',
  settingsSectionPurchases: 'Aankopen',
  settingsSectionBackup: 'Back-up',
  settingsBackupDesc: 'Exporteer of importeer een back-up ZIP (manifest.json + photos/).',
  settingsBackupOpen: 'Back-up openen',
  tagsLabel: 'Tags',
  addTagAction: 'Toevoegen',
  tagsEmpty: 'Nog geen tags.',
  photoDeletedNotice: 'Foto verwijderd.',
  undoAction: 'Ongedaan maken',
};

export default dict;
