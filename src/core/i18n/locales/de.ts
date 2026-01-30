import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面のヘッダー) ---
  daysStreak: 'TAGE IN FOLGE',       // 英語: DAYS STREAK
  yourChain: 'DEINE KETTE',          // 英語: YOUR CHAIN
  allDoneDays: 'TAGE KOMPLETT',      // 英語: ALL DONE DAYS (「完了した日」を短く表現)

  // --- Settings (General) (設定：一般) ---
  settings: 'Einstellungen',         // 設定
  hapticOff: 'Vibration aus',        // 振動オフ
  language: 'Sprache',               // 言語
  sound: 'Ton',                      // 音
  haptics: 'Haptik',                 // 触覚フィードバック
  theme: 'Design',                   // テーマ（ドイツ語ではDesignもよく使われます）

  // --- Purchase / Restore (課金・復元) ---
  restore: 'Käufe wiederherstellen', // 購入の復元
  purchaseSuccess: 'Pro-Plan ist jetzt aktiv.', // 購入成功
  purchaseFailed: 'Kauf fehlgeschlagen. Bitte später erneut versuchen.', // 購入失敗
  restoreSuccess: 'Kaufhistorie wiederhergestellt.', // 復元成功
  restoreNotFound: 'Keine Käufe zum Wiederherstellen gefunden.', // 復元データなし
  restoreFailed: 'Wiederherstellung fehlgeschlagen.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'App-Version',            // アプリバージョン
  tapSound: 'Tipp-Sound',            // タップ音
  click: 'Klick',                    // カチッ
  pop: 'Pop',                        // ポップ
  soundSwitchLabel: 'Soundeffekte',  // 効果音

  // --- Pro Screen (Paywall) (課金画面) ---
  proTitle: 'Entfessle deine Kette.', // 英語: Unlock your chain. (直訳より「解き放つ」感じ)
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: 'Mehr als 3 Gewohnheiten: Mach deine Punkte unaufhaltsam.',
  proPlanFreeTitle: 'Gratis',        // 無料
  proPlanMonthlyTitle: 'Monatlich',  // 月額
  proPlanYearlyTitle: 'Jährlich',    // 年額
  proPlanYearlyBadge: 'Beste Wahl',  // 英語: Best value (ベストな選択)
  proBadgeShort: 'PRO',
  priceFree: '0 € / für immer',      // ずっと0円
  proOnlyTitle: 'Pro-Funktion',      // Pro限定機能
  proOnlyTheme: 'Wechsle zu Pro, um dieses Design zu nutzen.',
  openPro: 'Pro-Plan ansehen',       // Proプランを見る
  cancel: 'Abbrechen',               // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'Elektrische Fluss-Animation',
  flowEffectHelp:
    'Lass einen Neon-Strom entlang deiner Kette fließen. Schalte es aus, wenn du es ruhiger magst.',

  // --- Heatmap Range (Settings) (ヒートマップの表示期間) ---
  heatmapRangeTitle: 'Anzeigezeitraum der Kette',
  heatmapRangeHelp: 'Wähle, wie viele Tage deiner Kette auf der Startseite angezeigt werden.',
  heatmapRange7: '1 Woche',
  heatmapRange30: '1 Monat',
  heatmapRange60: '2 Monate',
  heatmapRange90: '3 Monate',
  heatmapRange180: '6 Monate',
  heatmapRange365: '1 Jahr',
  heatmapSummaryPrefix: 'Letzte ',
  heatmapSummarySuffix: ' Tage',
  heatmapAgoSuffix: ' Tage her',
  heatmapToday: 'Heute',             // 今日

  // --- Themes (テーマ) ---
  themeDesc: 'Ändere das Erscheinungsbild der App.',
  themeDarkLabel: 'Dunkel',          // Dark
  themeNeonPinkLabel: 'Neon Pink',
  themeCyberBlueLabel: 'Cyber Blau',
  freeThemeNote: 'Gratis: Nur Dunkel / Pro schaltet Neon Pink & Cyber Blau frei',
  proThemeNote: 'Pro-Designs sind bald verfügbar.',

  // --- Habit Management (習慣の管理) ---
  newHabitTitle: 'Neue Gewohnheit',
  editHabitTitle: 'Gewohnheit bearbeiten',
  habitNameLabel: 'Name',
  habitNamePlaceholder: 'z. B. Buch lesen, Wasser trinken',
  habitIconLabel: 'Icon',
  deleteHabit: 'Diese Gewohnheit löschen',
  deleteConfirmationTitle: 'Gewohnheit löschen?',
  deleteConfirmationMessage: 'Diese Aktion kann nicht rückgängig gemacht werden. Der gesamte Verlauf geht verloren.',
  save: 'Speichern',
  create: 'Erstellen',

  // --- Icon Categories & Labels (アイコンのカテゴリとラベル) ---
  iconCatBasic: 'Basis',
  iconCatHealth: 'Gesundheit',
  iconCatLearning: 'Lernen',         // 英語: Learning

  iconLabelStreak: 'Serie',          // Streak (連続)
  iconLabelTask: 'Aufgabe',          // Task
  iconLabelShine: 'Glanz',           // Shine
  iconLabelClean: 'Putzen',          // Clean
  iconLabelLaundry: 'Wäsche',        // Laundry
  iconLabelWater: 'Wasser',          // Water
  iconLabelWalk: 'Gehen',            // Walk
  iconLabelSleep: 'Schlaf',          // Sleep
  iconLabelWorkout: 'Training',      // Workout
  iconLabelBarbell: 'Hantel',        // Barbell
  iconLabelRead: 'Lesen',            // Read
  iconLabelArt: 'Kunst',             // Art
  iconLabelMedia: 'Medien',          // Media
  iconLabelStudy: 'Lernen',          // Study
  iconLabelLanguage: 'Sprache',      // Language

  // --- Misc / Errors (その他・エラー) ---
  habitButtonSuffix: ' Gewohnheits-Button', // アクセシビリティ用
  errorLoadFailed: 'Daten konnten nicht geladen werden.',
  errorTitleRequired: 'Titel ist erforderlich.',
  errorTitleTooLong: 'Der Titel darf maximal 20 Zeichen lang sein.',
  errorSaveFailed: 'Speichern fehlgeschlagen.',
  errorDeleteFailed: 'Löschen fehlgeschlagen.',
  errorToggleFailed: 'Update fehlgeschlagen.',
  habitLimitTitle: 'Limit des kostenlosen Plans',
  habitLimitBody: 'Im kostenlosen Plan kannst du bis zu 3 Gewohnheiten erstellen.',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'Haptisches Feedback (Vibration)',

  // --- Reminder (リマインダー・通知) ---
  reminderSectionTitle: 'Erinnerung',
  reminderToggleLabel: 'Erinnerung nutzen',
  reminderTimeLabel: 'Benachrichtigungszeit',
  reminderNotificationBody: 'Es ist Zeit, deine Kette zu bauen!',

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: '7-Tage-Serie!',
  streak7Message: 'Du hast deine Kette eine ganze Woche gehalten. Super Arbeit!',
  ok: 'Spitze',

  // --- Language labels (言語名) ---
  languageChange: 'Sprache ändern',
  currentLanguage: 'Aktuell',
  languageNameEn: 'Englisch',
  languageNameJa: 'Japanisch',
  languageNameFr: 'Französisch',
  languageNameEs: 'Spanisch',
  languageNameDe: 'Deutsch',
  languageNameIt: 'Italienisch',
  languageNamePt: 'Portugiesisch',
  languageNameRu: 'Russisch',
  languageNameZhHans: 'Chinesisch (简体)',
  languageNameZhHant: 'Chinesisch (繁體)',
  languageNameKo: 'Koreanisch',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesisch',
  languageNameTh: 'Thailändisch',
  languageNameVi: 'Vietnamesisch',
  languageNameTr: 'Türkisch',
  languageNameNl: 'Niederländisch',
  languageNameSv: 'Schwedisch',

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
  tutorialNext: 'Weiter',
  tutorialWelcome: 'Willkommen bei Repolog',
  tutorialDesc1: 'Verbinde deine täglichen Gewohnheiten und baue deine eigene Kette.',
  tutorialDesc2: 'Unterbrich die Kette nicht, damit die Gewohnheit bleibt.',
  tutorialStart: 'Loslegen',
};

export default dict;