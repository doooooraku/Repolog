import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面のヘッダー) ---
  daysStreak: 'GIORNI DI FILA',      // 英語: DAYS STREAK (連続日数)
  yourChain: 'LA TUA CATENA',        // 英語: YOUR CHAIN
  allDoneDays: 'GIORNI COMPLETATI',  // 英語: ALL DONE DAYS (全て完了した日)

  // --- Settings (General) (設定：一般) ---
  settings: 'Impostazioni',          // 設定
  hapticOff: 'Vibrazione disattivata', // 振動オフ
  language: 'Lingua',                // 言語
  sound: 'Suoni',                    // 音
  haptics: 'Vibrazione',             // 英語: Haptics (わかりやすく「振動」と翻訳)
  theme: 'Tema',                     // テーマ

  // --- Purchase / Restore (課金・復元) ---
  restore: 'Ripristina acquisti',    // 購入の復元
  purchaseSuccess: 'Il piano Pro è attivo.', // 購入成功
  purchaseFailed: 'Acquisto fallito. Riprova più tardi.', // 購入失敗
  restoreSuccess: 'Cronologia acquisti ripristinata.', // 復元成功
  restoreNotFound: 'Nessun acquisto trovato da ripristinare.', // 復元データなし
  restoreFailed: 'Impossibile ripristinare gli acquisti.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'Versione App',           // アプリバージョン
  tapSound: 'Suono al tocco',        // タップ音
  click: 'Click',                    // クリック
  pop: 'Pop',                        // ポップ
  soundSwitchLabel: 'Effetti sonori', // 効果音

  // --- Pro Screen (Paywall) (課金画面) ---
  proTitle: 'Sblocca la tua catena.', // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: 'Crea abitudini illimitate e rendi i tuoi punti inarrestabili.',
  proPlanFreeTitle: 'Gratis',
  proPlanMonthlyTitle: 'Mensile',
  proPlanYearlyTitle: 'Annuale',
  proPlanYearlyBadge: 'Migliore offerta', // 英語: Best value (一番お得)
  proBadgeShort: 'PRO',
  priceFree: '0 € / per sempre',     // ずっと0円
  proOnlyTitle: 'Funzione Pro',      // Pro機能
  proOnlyTheme: 'Passa a Pro per usare questo tema.',
  openPro: 'Vedi piano Pro',         // Proプランを見る
  cancel: 'Annulla',                 // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'Animazione flusso elettrico',
  flowEffectHelp:
    'Fai scorrere un flusso al neon lungo la tua catena. Disattivalo se preferisci un aspetto più calmo.',

  // --- Heatmap Range (Settings) (ヒートマップの表示期間) ---
  heatmapRangeTitle: 'Intervallo visualizzazione',
  heatmapRangeHelp: 'Scegli quanti giorni della tua catena mostrare nella mappa di calore.',
  heatmapRange7: '1 settimana',
  heatmapRange30: '1 mese',
  heatmapRange60: '2 mesi',
  heatmapRange90: '3 mesi',
  heatmapRange180: '6 mesi',
  heatmapRange365: '1 anno',
  heatmapSummaryPrefix: 'Ultimi ',
  heatmapSummarySuffix: ' giorni',
  heatmapAgoSuffix: ' giorni fa',
  heatmapToday: 'Oggi',              // 今日

  // --- Themes (テーマ) ---
  themeDesc: 'Cambia l’aspetto dell’applicazione.',
  themeDarkLabel: 'Scuro',           // Dark
  themeNeonPinkLabel: 'Neon Rosa',
  themeCyberBlueLabel: 'Cyber Blu',
  freeThemeNote: 'Gratis: Solo Scuro / Pro sblocca Neon Rosa e Cyber Blu',
  proThemeNote: 'I temi Pro saranno disponibili presto.',

  // --- Habit Management (習慣の管理) ---
  newHabitTitle: 'Nuova abitudine',
  editHabitTitle: 'Modifica abitudine',
  habitNameLabel: 'Nome',
  habitNamePlaceholder: 'es. Leggere un libro, Bere acqua',
  habitIconLabel: 'Icona',
  deleteHabit: 'Elimina questa abitudine',
  deleteConfirmationTitle: 'Eliminare?',
  deleteConfirmationMessage: 'Questa azione non può essere annullata. Tutta la cronologia andrà persa.',
  save: 'Salva',
  create: 'Crea',

  // --- Icon Categories & Labels (アイコンのカテゴリとラベル) ---
  iconCatBasic: 'Base',
  iconCatHealth: 'Salute',
  iconCatLearning: 'Apprendimento',  // 学び

  iconLabelStreak: 'Serie',          // Streak
  iconLabelTask: 'Task',
  iconLabelShine: 'Scintilla',       // Shine
  iconLabelClean: 'Pulizia',         // Clean
  iconLabelLaundry: 'Bucato',        // Laundry
  iconLabelWater: 'Acqua',           // Water
  iconLabelWalk: 'Passeggiata',      // Walk
  iconLabelSleep: 'Sonno',           // Sleep
  iconLabelWorkout: 'Allenamento',   // Workout
  iconLabelBarbell: 'Pesi',          // Barbell
  iconLabelRead: 'Lettura',          // Read
  iconLabelArt: 'Arte',              // Art
  iconLabelMedia: 'Media',           // Media
  iconLabelStudy: 'Studio',          // Study
  iconLabelLanguage: 'Lingua',       // Language

  // --- Misc / Errors (その他・エラー) ---
  habitButtonSuffix: ' pulsante abitudine',
  errorLoadFailed: 'Caricamento dati fallito.',
  errorTitleRequired: 'Il titolo è obbligatorio.',
  errorTitleTooLong: 'Il titolo deve avere 20 caratteri o meno.',
  errorSaveFailed: 'Salvataggio fallito.',
  errorDeleteFailed: 'Eliminazione fallita.',
  errorToggleFailed: 'Aggiornamento fallito.',
  habitLimitTitle: 'Limite piano gratuito',
  habitLimitBody: 'Col piano gratuito puoi creare fino a 3 abitudini.',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'Feedback tattile (vibrazione)',

  // --- Reminder (リマインダー・通知) ---
  reminderSectionTitle: 'Promemoria',
  reminderToggleLabel: 'Usa promemoria',
  reminderTimeLabel: 'Orario notifica',
  reminderNotificationBody: 'È ora di costruire la tua catena!', // チェーンを作る時間だよ！

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: 'Serie di 7 giorni!',
  streak7Message: 'Hai mantenuto la catena per una settimana intera. Ottimo lavoro!',
  ok: 'Fantastico',

  // --- Language labels (言語名) ---
  languageChange: 'Cambia lingua',
  currentLanguage: 'Attuale',
  languageNameEn: 'Inglese',
  languageNameJa: 'Giapponese',
  languageNameFr: 'Francese',
  languageNameEs: 'Spagnolo',
  languageNameDe: 'Tedesco',
  languageNameIt: 'Italiano',
  languageNamePt: 'Portoghese',
  languageNameRu: 'Russo',
  languageNameZhHans: 'Cinese (简体)',
  languageNameZhHant: 'Cinese (繁體)',
  languageNameKo: 'Coreano',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesiano',
  languageNameTh: 'Tailandese',
  languageNameVi: 'Vietnamita',
  languageNameTr: 'Turco',
  languageNameNl: 'Olandese',
  languageNameSv: 'Svedese',

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
  tutorialNext: 'Avanti',
  tutorialWelcome: 'Benvenuto in Repolog',
  tutorialDesc1: 'Collega le tue abitudini quotidiane e costruisci la tua catena.',
  tutorialDesc2: 'Non spezzare la catena per far durare l’abitudine.',
  tutorialStart: 'Inizia',
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
  pdfPhotoWarningTitle: 'Too many photos',
  pdfPhotoWarningBody: '{count}+ photos may take a long time. Continue?',
  pdfPhotoWarningContinue: 'Continue',
  pdfPhotoWarningCancel: 'Cancel',
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