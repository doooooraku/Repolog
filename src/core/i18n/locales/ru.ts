import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム / ヘッダー) ---
  daysStreak: 'СЕРИЯ ДНЕЙ',
  yourChain: 'ТВОЯ ЦЕПОЧКА',
  allDoneDays: 'ВСЕ ВЫПОЛНЕНО', // 直訳より「全て完了」のニュアンス

  // --- Settings (General) (設定：一般) ---
  settings: 'Настройки',
  hapticOff: 'Вибрация выкл.',
  language: 'Язык',
  sound: 'Звук',
  haptics: 'Вибрация',
  theme: 'Тема',

  // --- Purchase / Restore (購入 / 復元) ---
  restore: 'Восстановить покупки',
  purchaseSuccess: 'Pro план активирован.',
  purchaseFailed: 'Ошибка покупки. Попробуйте позже.',
  restoreSuccess: 'История покупок восстановлена.',
  restoreNotFound: 'Покупки для восстановления не найдены.',
  restoreFailed: 'Не удалось восстановить покупки.',

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: 'Версия',
  tapSound: 'Звук нажатия',
  click: 'Клик',
  pop: 'Поп',
  soundSwitchLabel: 'Звуковые эффекты',

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: 'Разблокируй цепь.',
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: 'Больше 3 привычек и неудержимые точки.',
  proPlanFreeTitle: 'Бесплатно',
  proPlanMonthlyTitle: 'Месяц',
  proPlanYearlyTitle: 'Год',
  proPlanYearlyBadge: 'Выгодно', // 「Best value」の自然な意訳
  proBadgeShort: 'PRO',
  priceFree: '0 ₽ / навсегда', // 通貨記号は適宜ですが、一般的に₽または$
  proOnlyTitle: 'Pro функция',
  proOnlyTheme: 'Перейди на Pro для этой темы.',
  openPro: 'Смотреть Pro',
  cancel: 'Отмена',

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: 'Эффект электротока',
  flowEffectHelp:
    'Пусти неоновый ток по своей цепочке. Выключи, если хочешь спокойствия.',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: 'Период отображения',
  heatmapRangeHelp: 'Сколько дней цепочки показывать на главном экране.',
  heatmapRange7: '1 неделя',
  heatmapRange30: '1 месяц',
  heatmapRange60: '2 месяца',
  heatmapRange90: '3 месяца',
  heatmapRange180: '6 месяцев',
  heatmapRange365: '1 год',
  heatmapSummaryPrefix: 'За ',
  heatmapSummarySuffix: ' дн.', // "days" の短縮形（文法回避のため）
  heatmapAgoSuffix: ' дн. назад',
  heatmapToday: 'Сегодня',

  // --- Themes (テーマ) ---
  themeDesc: 'Измени внешний вид приложения.',
  themeDarkLabel: 'Темная',
  themeNeonPinkLabel: 'Неон Розовый',
  themeCyberBlueLabel: 'Кибер Синий',
  freeThemeNote: 'Free: Темная / Pro: Неон и Кибер',
  proThemeNote: 'Pro темы скоро появятся.',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: 'Новая привычка',
  editHabitTitle: 'Редактировать',
  habitNameLabel: 'Название',
  habitNamePlaceholder: 'Напр.: Читать книгу, Пить воду',
  habitIconLabel: 'Иконка',
  deleteHabit: 'Удалить привычку',
  deleteConfirmationTitle: 'Удалить?',
  deleteConfirmationMessage: 'Это действие нельзя отменить. История будет потеряна.',
  save: 'Сохранить',
  create: 'Создать',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: 'Базовые',
  iconCatHealth: 'Здоровье',
  iconCatLearning: 'Обучение',

  iconLabelStreak: 'Серия',
  iconLabelTask: 'Задача',
  iconLabelShine: 'Сияние',
  iconLabelClean: 'Уборка',
  iconLabelLaundry: 'Стирка',
  iconLabelWater: 'Вода',
  iconLabelWalk: 'Прогулка',
  iconLabelSleep: 'Сон',
  iconLabelWorkout: 'Тренировка',
  iconLabelBarbell: 'Штанга',
  iconLabelRead: 'Чтение',
  iconLabelArt: 'Искусство',
  iconLabelMedia: 'Медиа',
  iconLabelStudy: 'Учеба',
  iconLabelLanguage: 'Язык',

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' кнопка привычки',
  errorLoadFailed: 'Ошибка загрузки данных.',
  errorTitleRequired: 'Название обязательно.',
  errorTitleTooLong: 'Название не более 20 символов.',
  errorSaveFailed: 'Ошибка сохранения.',
  errorDeleteFailed: 'Ошибка удаления.',
  errorToggleFailed: 'Ошибка обновления.',
  habitLimitTitle: 'Лимит бесплатного плана',
  habitLimitBody: 'В бесплатном плане можно создать до 3 привычек.',

  // --- Settings description (設定の説明) ---
  hapticsDescription: 'Тактильный отклик (вибрация)',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: 'Напоминание',
  reminderToggleLabel: 'Включить напоминание',
  reminderTimeLabel: 'Время уведомления',
  reminderNotificationBody: 'Пора строить свою цепочку!',

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: 'Серия 7 дней!',
  streak7Message: 'Ты держишь цепочку целую неделю. Отличная работа!',
  ok: 'Круто',

  // --- Language labels (言語名) ---
  languageChange: 'Сменить язык',
  currentLanguage: 'Текущий',
  languageNameEn: 'Английский',
  languageNameJa: 'Японский',
  languageNameFr: 'Французский',
  languageNameEs: 'Испанский',
  languageNameDe: 'Немецкий',
  languageNameIt: 'Итальянский',
  languageNamePt: 'Португальский',
  languageNameRu: 'Русский',
  languageNameZhHans: 'Китайский (简体)',
  languageNameZhHant: 'Китайский (繁體)',
  languageNameKo: 'Корейский',
  languageNameHi: 'Хинди',
  languageNameId: 'Индонезийский',
  languageNameTh: 'Тайский',
  languageNameVi: 'Вьетнамский',
  languageNameTr: 'Турецкий',
  languageNameNl: 'Нидерландский',
  languageNameSv: 'Шведский',

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
  tutorialNext: 'Далее',
  tutorialWelcome: 'Добро пожаловать в Repolog',
  tutorialDesc1: 'Соединяй ежедневные привычки и строй свою цепочку.',
  tutorialDesc2: 'Не прерывай цепочку, чтобы привычка закрепилась.',
  tutorialStart: 'Начать',
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