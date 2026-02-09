import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: 'DAGAR I RAD',         // 英語: DAYS STREAK (直訳：一列に並んだ日々＝連続記録)
  yourChain: 'DIN KEDJA',            // 英語: YOUR CHAIN
  allDoneDays: 'HELDAGAR',           // 英語: ALL DONE DAYS (「完全に完了した日」を短く表現)

  // --- Settings (General) (設定：一般) ---
  settings: 'Inställningar',         // 設定
  hapticOff: 'Vibration av',         // 振動オフ
  language: 'Språk',                 // 言語
  sound: 'Ljud',                     // 音
  haptics: 'Haptik',                 // 振動 (Haptics)
  theme: 'Tema',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Återställ köp',          // 購入の復元
  purchaseSuccess: 'Pro-planen är nu aktiv.', // 購入成功
  purchaseFailed: 'Köpet misslyckades. Försök igen senare.', // 購入失敗
  restoreSuccess: 'Köphistorik återställd.', // 復元成功
  restoreNotFound: 'Inga köp hittades att återställa.', // 復元データなし
  restoreFailed: 'Misslyckades med att återställa köp.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'App-version',            // アプリバージョン
  tapSound: 'Tryckljud',             // タップ音
  click: 'Klick',                    // クリック
  pop: 'Pop',                        // ポップ
  soundSwitchLabel: 'Ljudeffekter',  // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: 'Lås upp din kedja.',    // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: 'Gå bortom 3 vanor och gör dina prickar ostoppbara.',
  proPlanFreeTitle: 'Gratis',        // 無料
  proPlanMonthlyTitle: 'Månadsvis',  // 月額
  proPlanYearlyTitle: 'Årsvis',      // 年額
  proPlanYearlyBadge: 'Bästa värde', // 英語: Best value (一番お得)
  proBadgeShort: 'PRO',
  priceFree: '0 kr / för alltid',    // ずっと0クローナ (または $0)
  proOnlyTitle: 'Pro-funktion',      // Pro機能
  proOnlyTheme: 'Uppgradera till Pro för att använda detta tema.',
  openPro: 'Se Pro-planen',          // Proプランを見る
  cancel: 'Avbryt',                  // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'Elektrisk flödesanimation', // 電気の流れのアニメーション
  flowEffectHelp:
    'Låt ett neonflöde strömma längs din kedja. Stäng av om du föredrar en lugnare vy.',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: 'Visningsperiod',
  heatmapRangeHelp: 'Välj hur många dagar av din kedja som ska visas på hemskärmen.',
  heatmapRange7: '1 vecka',
  heatmapRange30: '1 månad',
  heatmapRange60: '2 månader',
  heatmapRange90: '3 månader',
  heatmapRange180: '6 månader',
  heatmapRange365: '1 år',
  heatmapSummaryPrefix: 'Senaste ',  // 「Senaste (最新の/過去の)」
  heatmapSummarySuffix: ' dagarna',  // 「dagarna (その日々)」
  heatmapAgoSuffix: ' dagar sedan',  // 「〜日前」
  heatmapToday: 'Idag',

  // --- Themes (テーマ) ---
  themeDesc: 'Ändra appens utseende.',
  themeDarkLabel: 'Mörk',            // Dark
  themeNeonPinkLabel: 'Neonrosa',
  themeCyberBlueLabel: 'Cyberblå',
  freeThemeNote: 'Gratis: Endast Mörk / Pro låser upp Neonrosa och Cyberblå',
  proThemeNote: 'Pro-teman blir tillgängliga efter köp.',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: 'Ny vana',
  editHabitTitle: 'Redigera vana',
  habitNameLabel: 'Namn',
  habitNamePlaceholder: 't.ex. Dricka vatten, Läsa bok',
  habitIconLabel: 'Ikon',
  deleteHabit: 'Ta bort denna vana',
  deleteConfirmationTitle: 'Ta bort?',
  deleteConfirmationMessage: 'Detta går inte att ångra. All historik försvinner.',
  save: 'Spara',
  create: 'Skapa',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: 'Grundläggande',
  iconCatHealth: 'Hälsa',
  iconCatLearning: 'Lärande',

  iconLabelStreak: 'Svit',           // Streak (連続記録)
  iconLabelTask: 'Uppgift',          // Task
  iconLabelShine: 'Glans',           // Shine
  iconLabelClean: 'Städa',           // Clean
  iconLabelLaundry: 'Tvätt',         // Laundry
  iconLabelWater: 'Vatten',          // Water
  iconLabelWalk: 'Promenad',         // Walk
  iconLabelSleep: 'Sömn',            // Sleep
  iconLabelWorkout: 'Träning',       // Workout
  iconLabelBarbell: 'Skivstång',     // Barbell
  iconLabelRead: 'Läsa',             // Read
  iconLabelArt: 'Konst',             // Art
  iconLabelMedia: 'Media',           // Media
  iconLabelStudy: 'Studera',         // Study
  iconLabelLanguage: 'Språk',        // Language

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' vaneknapp',   // アクセシビリティ用
  errorLoadFailed: 'Kunde inte ladda data.',
  errorTitleRequired: 'Namn krävs.',
  errorTitleTooLong: 'Namnet får vara max 20 tecken.',
  errorSaveFailed: 'Kunde inte spara.',
  errorDeleteFailed: 'Kunde inte ta bort.',
  errorToggleFailed: 'Kunde inte uppdatera.',
  habitLimitTitle: 'Gräns för gratisplan',
  habitLimitBody: 'På gratisplanen kan du skapa upp till 3 vanor.',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'Haptisk feedback (vibration)',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: 'Påminnelse',
  reminderToggleLabel: 'Använd påminnelse',
  reminderTimeLabel: 'Tid för notis',
  reminderNotificationBody: 'Det är dags att bygga din kedja!', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: '7 dagars svit!',
  streak7Message: 'Du har hållit din kedja i en hel vecka. Bra jobbat!',
  ok: 'Grymt',

  // --- Language labels (言語名) ---
  languageChange: 'Byt språk',
  currentLanguage: 'Nuvarande',
  languageNameEn: 'Engelska',
  languageNameJa: 'Japanska',
  languageNameFr: 'Franska',
  languageNameEs: 'Spanska',
  languageNameDe: 'Tyska',
  languageNameIt: 'Italienska',
  languageNamePt: 'Portugisiska',
  languageNameRu: 'Ryska',
  languageNameZhHans: 'Kinesiska (简体)',
  languageNameZhHant: 'Kinesiska (繁體)',
  languageNameKo: 'Koreanska',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesiska',
  languageNameTh: 'Thailändska',
  languageNameVi: 'Vietnamesiska',
  languageNameTr: 'Turkiska',
  languageNameNl: 'Holländska',
  languageNameSv: 'Svenska',

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
  tutorialNext: 'Nästa',
  tutorialWelcome: 'Välkommen till Repolog',
  tutorialDesc1: 'Koppla ihop dina dagliga vanor och bygg din egen kedja.',
  tutorialDesc2: 'Bryt inte kedjan för att få vanan att fastna.',
  tutorialStart: 'Börja',
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
  pdfPhotoWarningTitle: 'För många bilder',
  pdfPhotoWarningBody: '{count}+ bilder kan ta lång tid att skapa PDF. Fortsätta?',
  pdfPhotoWarningContinue: 'Fortsätt',
  pdfPhotoWarningCancel: 'Tillbaka',
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
