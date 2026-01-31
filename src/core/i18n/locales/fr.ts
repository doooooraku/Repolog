import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header ---
  daysStreak: 'JOURS DE SUITE',
  yourChain: 'TA CHAÎNE',
  allDoneDays: 'JOURS TERMINÉS',

  // --- Settings (General) ---
  settings: 'Paramètres',
  hapticOff: 'Vibrations désactivées',
  language: 'Langue',
  sound: 'Son',
  haptics: 'Vibrations',
  theme: 'Thème',

  // --- Purchase / Restore ---
  restore: 'Restaurer les achats',
  purchaseSuccess: 'Le plan Pro est maintenant actif.',
  purchaseFailed: 'L’achat a échoué. Veuillez réessayer plus tard.',
  restoreSuccess: 'Historique d’achat restauré.',
  restoreNotFound: 'Aucun achat trouvé à restaurer.',
  restoreFailed: 'Échec de la restauration des achats.',

  // --- Settings (Sound & Info) ---
  version: 'Version de l’app',
  tapSound: 'Son du tap',
  click: 'Clic',
  pop: 'Pop',
  
  // --- Paywall / Pro Screen ---
  proSubtitle: 'Dépasse 3 habitudes et rends tes points inarrêtables.',
  proPlanFreeTitle: 'Gratuit',
  proPlanMonthlyTitle: 'Mensuel',
  proPlanYearlyTitle: 'Annuel',
  proPlanYearlyBadge: 'Meilleure offre',
  proBadgeShort: 'PRO',
  priceFree: '0 € / pour toujours',
  
  flowEffectTitle: 'Animation de flux électrique',
  flowEffectHelp:
    'Laisse un flux néon parcourir ta chaîne. Désactive-le si tu préfères un rendu plus calme.',

  // --- Heatmap Range (Settings) ---
  heatmapRangeTitle: 'Plage d’affichage de la chaîne',
  heatmapRangeHelp: 'Choisis le nombre de jours de ta chaîne à afficher sur la carte thermique.',
  heatmapRange7: '1 semaine',
  heatmapRange30: '1 mois',
  heatmapRange60: '2 mois',
  heatmapRange180: '6 mois',
  heatmapRange365: '1 an',
  heatmapSummaryPrefix: 'Les derniers ',
  heatmapSummarySuffix: ' jours',
  heatmapAgoSuffix: ' jours plus tôt',
  heatmapToday: 'Aujourd’hui',

  proMonthlyTagline: 'Commence petit, annule à tout moment.',
  proYearlyTagline: 'Pour les bâtisseurs de chaîne sérieux.',
  proYearlySavingShort: 'Économise environ 37 % (soit 8 mois gratuits).',

  proCompareTitle: 'Ce que tu obtiens avec Pro',
  proCompareSubtitle: 'Tu peux rester en Gratuit. Pro supprime juste les limites.',
  proCompareHeaderFeature: 'Fonctionnalité',
  proCompareHeaderFree: 'Gratuit',
  proCompareHeaderPro: 'Pro',
  proFeatureHabits: 'Habitudes suivies',
  proFeatureHabitsFree: 'Jusqu’à 3 habitudes',
  proFeatureHabitsPro: 'Habitudes illimitées',
  proFeatureThemesFree: '1 thème (Sombre)',
  proFeatureThemesPro: 'Tous les thèmes débloqués',
  proFeatureAdsFree: '',
  proFeatureAdsPro: '',

  proOnlyTitle: 'Fonctionnalité Pro',
  proOnlyTheme: 'Ce thème est disponible avec Pro.',
  proCtaYearly: 'Prendre Pro Annuel',
  proCtaMonthly: 'Prendre Pro Mensuel',
  proCtaStayFree: 'Continuer en Gratuit',
  proFinePrint:
    'L’abonnement se renouvelle automatiquement. Tu peux annuler à tout moment dans les paramètres de ton compte.',

  paywallMonthlyLabel: 'Forfait mensuel',
  paywallYearlyLabel: 'Forfait annuel',
  paywallBestValueBadge: 'Meilleure valeur',
  paywallYearlySub: 'Facturé une fois par an. Annule quand tu veux.',
  paywallMonthlySub: 'Facturé chaque mois. Annule quand tu veux.',
  comingSoonTitle: 'Bientôt disponible',

  // --- Themes ---
  themeDarkLabel: 'Sombre',
  themeNeonPinkLabel: 'Néon Rose',
  themeCyberBlueLabel: 'Cyber Bleu',
  themeDesc: 'Choisis ton ambiance. (Les thèmes Pro arriveront plus tard.)',
  restoreSoon: 'La restauration des achats sera ajoutée dans une future mise à jour.',
  freeThemeNote: 'Gratuit : Sombre uniquement / Pro débloque Néon Rose et Cyber Bleu',
  proThemeNote: 'Les thèmes Pro se débloquent après l’implémentation du paywall.',
  restoreDesc: 'Restaurer les achats effectués sur ce compte.',
  licenses: 'Licences Open Source (plus tard)',
  openPro: 'Ouvrir Repolog Pro',
  heroPaywall: 'Passe au monde néon',
  
  onboardingTitle: 'Bienvenue sur Repolog',
  onboardingBody: 'Un tap, une vibration forte. Construisons la chaîne d’aujourd’hui.',
  onboardingPunch: 'C’est Repolog.',
  start: 'Commencer',

  // --- Tutorial / Onboarding flow ---
  tutorialWelcomeBody:
    'Bienvenue !\nRepolog te permet de construire ta chaîne d’habitudes.\nCommence par créer ta première habitude avec le bouton +.',
  tutorialPressFabBody: 'Appuie sur le bouton + en bas à droite pour créer ta première habitude.',
  tutorialPressHabitBody: 'Maintenant, appuie sur l’habitude que tu viens de créer.\nAppuyer marque la journée comme "faite".',
  tutorialExplainChainBody:
    'En appuyant, ta SÉRIE DE JOURS augmente et aujourd’hui s’allume sur TA CHAÎNE.\nContinue pour étendre ta chaîne.',
  tutorialEditIconBody: 'D’abord, choisis une icône qui correspond à ton habitude.',
  tutorialEditNameBody: 'Ensuite, entre un nom pour ton habitude.\nPar exemple : "Boire de l’eau", "Lire un livre".',
  tutorialEditSubmitBody: 'Tu es prêt !\nAppuie sur le bouton créer ci-dessous pour ajouter cette habitude à ton écran d’accueil.',
  tutorialNext: 'Suivant',
  tutorialStart: 'Démarrer',
  tutorialGotIt: 'Compris',

  // --- Home ---
  homeLoading: 'Chargement...',
  homeAddHabitLabel: 'Ajouter une habitude',

  // --- Edit ---
  editNewHabit: 'Nouvelle habitude',
  editHabitTitle: 'Modifier l’habitude',
  editCategoryLabel: 'Catégorie',
  editNameLabel: 'Nom (max 20 caractères)',
  editNamePlaceholder: 'Nomme ton habitude...',
  editSaveChanges: 'Enregistrer',
  editCreateHabit: 'Créer l’habitude',
  editDeleteHabit: 'Supprimer l’habitude',
  deleteConfirmBody: 'Es-tu sûr ? Cette action est irréversible.',
  cancel: 'Annuler',
  delete: 'Supprimer',

  // --- Icon Categories & Labels ---
  iconCatBasic: 'Basique',
  iconCatHealth: 'Santé',
  iconCatLearning: 'Apprentissage & Travail',

  iconLabelStreak: 'Série',
  iconLabelTask: 'Tâche',
  iconLabelShine: 'Briller',
  iconLabelClean: 'Nettoyer',
  iconLabelLaundry: 'Lessive',
  iconLabelWater: 'Eau',
  iconLabelWalk: 'Marche',
  iconLabelSleep: 'Sommeil',
  iconLabelWorkout: 'Entraînement',
  iconLabelBarbell: 'Haltère',
  iconLabelRead: 'Lire',
  iconLabelArt: 'Art',
  iconLabelMedia: 'Média',
  iconLabelStudy: 'Études',
  iconLabelLanguage: 'Langue',

  // --- Pro ---
  proTitle: 'Débloque ta chaîne.',
  proHeaderTitle: 'Repolog Pro',
  proFeatureUnlimited: 'Habitudes illimitées',
  proFeatureThemes: 'Tous les thèmes débloqués (Néon Rose / Cyber Bleu)',
  proFeatureAds: '',

  // --- Accessibility ---
  habitButtonSuffix: ' bouton d’habitude',

  // --- Misc / Errors ---
  errorLoadFailed: 'Échec du chargement des données',
  errorTitleRequired: 'Le titre est requis.',
  errorTitleTooLong: 'Le titre doit faire 20 caractères ou moins.',
  errorSaveFailed: 'Échec de l’enregistrement.',
  errorDeleteFailed: 'Échec de la suppression.',
  errorToggleFailed: 'Échec de la mise à jour.',
  habitLimitTitle: 'Limite du plan gratuit',
  habitLimitBody: 'Sur le plan gratuit, tu peux créer jusqu’à 3 habitudes.',

  // --- Settings description ---
  hapticsDescription: 'Retour haptique',

  // --- Reminder ---
  reminderSectionTitle: 'Notification de rappel',
  reminderToggleLabel: 'Utiliser le rappel',
  reminderTimeLabel: 'Heure de notification',
  reminderNotificationBody: 'Il est temps de construire ta chaîne.',

  // --- Review (7-day streak) ---
  streak7Title: 'Série de 7 jours !',
  streak7Message: 'Tu as gardé ta chaîne pendant une semaine entière. Bravo !',
  ok: 'OK',

  // --- Language labels ---
  languageChange: 'Changer de langue',
  currentLanguage: 'Actuel',
  languageNameEn: 'Anglais',
  languageNameJa: 'Japonais',
  languageNameFr: 'Français',
  languageNameEs: 'Espagnol',
  languageNameDe: 'Allemand',
  languageNameIt: 'Italien',
  languageNamePt: 'Portugais',
  languageNameRu: 'Russe',
  languageNameZhHans: 'Chinois (简体)',
  languageNameZhHant: 'Chinois (繁體)',
  languageNameKo: 'Coréen',
  languageNameHi: 'Hindi',
  languageNameId: 'Indonésien',
  languageNameTh: 'Thaï',
  languageNameVi: 'Vietnamien',
  languageNameTr: 'Turc',
  languageNameNl: 'Néerlandais',
  languageNameSv: 'Suédois',

  // --- Sound labels ---
  soundSwitchLabel: 'Activer le son',
  tapSoundLabel: 'Style de son au toucher',
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
};

export default dict;
