import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header ---
  daysStreak: 'DÍAS SEGUIDOS',
  yourChain: 'TU CADENA',
  allDoneDays: 'DÍAS COMPLETOS',

  // --- Settings (General) ---
  settings: 'Ajustes',
  hapticOff: 'Vibración desactivada',
  language: 'Idioma',
  sound: 'Sonido',
  haptics: 'Respuesta háptica',
  theme: 'Tema',

  // --- Purchase / Restore ---
  restore: 'Restaurar compras',
  purchaseSuccess: 'El plan Pro está activo.',
  purchaseFailed: 'Error en la compra. Inténtalo más tarde.',
  restoreSuccess: 'Historial de compras restaurado.',
  restoreNotFound: 'No se encontraron compras para restaurar.',
  restoreFailed: 'Error al restaurar las compras.',

  // --- Settings (Sound & Info) ---
  version: 'Versión de la app',
  tapSound: 'Sonido al tocar',
  click: 'Clic',
  pop: 'Pop',
  soundSwitchLabel: 'Efectos de sonido',

  // --- Pro Screen (Paywall) ---
  proTitle: 'Desbloquea tu cadena.',
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: 'Crea hábitos ilimitados y haz que tus puntos sean imparables.',
  proPlanFreeTitle: 'Gratis',
  proPlanMonthlyTitle: 'Mensual',
  proPlanYearlyTitle: 'Anual',
  proPlanYearlyBadge: 'Mejor opción',
  proBadgeShort: 'PRO',
  priceFree: '0 € / para siempre',
  proOnlyTitle: 'Función Pro',
  proOnlyTheme: 'Pásate a Pro para usar este tema.',
  openPro: 'Ver plan Pro',
  cancel: 'Cancelar',

  // --- Settings (Appearance) ---
  flowEffectTitle: 'Animación de flujo eléctrico',
  flowEffectHelp:
    'Haz que un flujo de neón recorra la línea de tu cadena. Apágalo si prefieres una vista más tranquila.',

  // --- Heatmap Range (Settings) ---
  heatmapRangeTitle: 'Periodo de visualización',
  heatmapRangeHelp: 'Elige cuántos días de tu cadena mostrar en el mapa de calor.',
  heatmapRange7: '1 semana',
  heatmapRange30: '1 mes',
  heatmapRange60: '2 meses',
  heatmapRange90: '3 meses',
  heatmapRange180: '6 meses',
  heatmapRange365: '1 año',
  heatmapSummaryPrefix: 'Últimos ',
  heatmapSummarySuffix: ' días',
  heatmapAgoSuffix: ' días atrás',
  heatmapToday: 'Hoy',

  // --- Themes ---
  themeDesc: 'Cambia la apariencia de la aplicación.',
  themeDarkLabel: 'Oscuro',
  themeNeonPinkLabel: 'Neón Rosa',
  themeCyberBlueLabel: 'Ciber Azul',
  freeThemeNote: 'Gratis: Solo Oscuro / Pro desbloquea Neón Rosa y Ciber Azul',
  proThemeNote: 'Los temas Pro estarán disponibles pronto.',

  // --- Habit Management ---
  newHabitTitle: 'Nuevo hábito',
  editHabitTitle: 'Editar hábito',
  habitNameLabel: 'Nombre',
  habitNamePlaceholder: 'ej: Leer un libro, Beber agua',
  habitIconLabel: 'Icono',
  deleteHabit: 'Eliminar este hábito',
  deleteConfirmationTitle: '¿Eliminar?',
  deleteConfirmationMessage: 'Esta acción no se puede deshacer. Se perderá todo el historial.',
  save: 'Guardar',
  create: 'Crear',

  // --- Icon Categories & Labels ---
  iconCatBasic: 'Básico',
  iconCatHealth: 'Salud',
  iconCatLearning: 'Aprendizaje',

  iconLabelStreak: 'Racha',
  iconLabelTask: 'Tarea',
  iconLabelShine: 'Brillo',
  iconLabelClean: 'Limpieza',
  iconLabelLaundry: 'Colada',
  iconLabelWater: 'Agua',
  iconLabelWalk: 'Paseo',
  iconLabelSleep: 'Sueño',
  iconLabelWorkout: 'Entreno',
  iconLabelBarbell: 'Pesas',
  iconLabelRead: 'Lectura',
  iconLabelArt: 'Arte',
  iconLabelMedia: 'Medios',
  iconLabelStudy: 'Estudio',
  iconLabelLanguage: 'Idiomas',

  // --- Misc / Errors ---
  habitButtonSuffix: ' botón de hábito',
  errorLoadFailed: 'Error al cargar los datos.',
  errorTitleRequired: 'El título es obligatorio.',
  errorTitleTooLong: 'El título debe tener 20 caracteres o menos.',
  errorSaveFailed: 'Error al guardar.',
  errorDeleteFailed: 'Error al eliminar.',
  errorToggleFailed: 'Error al actualizar.',
  habitLimitTitle: 'Límite del plan gratuito',
  habitLimitBody: 'En el plan gratuito puedes crear hasta 3 hábitos.',

  // --- Settings description ---
  hapticsDescription: 'Respuesta háptica (vibración)',

  // --- Reminder ---
  reminderSectionTitle: 'Recordatorios',
  reminderToggleLabel: 'Usar recordatorio',
  reminderTimeLabel: 'Hora de notificación',
  reminderNotificationBody: '¡Es hora de construir tu cadena!',

  // --- Review (7-day streak) ---
  streak7Title: '¡Racha de 7 días!',
  streak7Message: 'Has mantenido tu cadena una semana completa. ¡Buen trabajo!',
  ok: 'Genial',

  // --- Language labels ---
  languageChange: 'Cambiar idioma',
  currentLanguage: 'Actual',
  languageNameEn: 'Inglés',
  languageNameJa: 'Japonés',
  languageNameFr: 'Francés',
  languageNameEs: 'Español',
  languageNameDe: 'Alemán',
  languageNameIt: 'Italiano',
  languageNamePt: 'Portugués',
  languageNameRu: 'Ruso',
  languageNameZhHans: 'Chino (简体)',
  languageNameZhHant: 'Chino (繁體)',
  languageNameKo: 'Coreano',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonesio',
  languageNameTh: 'Tailandés',
  languageNameVi: 'Vietnamita',
  languageNameTr: 'Turco',
  languageNameNl: 'Holandés',
  languageNameSv: 'Sueco',

  // --- Tutorial ---
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
  tutorialNext: 'Siguiente',
  tutorialWelcome: 'Bienvenido a Repolog',
  tutorialDesc1: 'Conecta tus hábitos diarios y construye tu propia cadena.',
  tutorialDesc2: 'No rompas la cadena para que el hábito perdure.',
  tutorialStart: '¡Empezar!',
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
};

export default dict;