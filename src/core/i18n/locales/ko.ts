import baseEn from './en';

const dict = {
  ...baseEn,
  // --- Home / Header (ホーム画面 / ヘッダー) ---
  daysStreak: '연속 일수',           // 英語: DAYS STREAK
  yourChain: '나의 체인',            // 英語: YOUR CHAIN
  allDoneDays: '완료한 날',          // 英語: ALL DONE DAYS (短く「完了日」のニュアンス)

  // --- Settings (General) (設定：一般) ---
  settings: '설정',                  // 設定
  hapticOff: '진동 끄기',            // 振動オフ
  language: '언어',                  // 言語
  sound: '사운드',                   // 音（サウンド）
  haptics: '진동',                   // 振動（わかりやすく「振動」を採用）
  theme: '테마',                     // テーマ

  // --- Purchase / Restore (購入 / 復元) ---
  restore: '구매 복원',              // 購入履歴の復元
  purchaseSuccess: 'Pro 플랜이 활성화되었습니다.', // 購入成功
  purchaseFailed: '결제에 실패했습니다. 나중에 다시 시도해 주세요.', // 購入失敗
  restoreSuccess: '구매 기록이 복원되었습니다.', // 復元成功
  restoreNotFound: '복원할 구매 기록이 없습니다.', // 復元データなし
  restoreFailed: '구매 복원에 실패했습니다.', // 復元失敗

  // --- Settings (Sound & Info) (設定：音と情報) ---
  version: '앱 버전',                // アプリバージョン
  tapSound: '탭 사운드',             // タップ音
  click: '클릭',                     // クリック
  pop: '팝',                         // ポップ
  soundSwitchLabel: '사운드 효과',   // 効果音

  // --- Pro Screen (Paywall) (Pro画面 / 課金) ---
  proTitle: '체인을 잠금 해제하세요.', // 英語: Unlock your chain.
  proHeaderTitle: 'Repolog Pro',
  proSubtitle: '3개의 습관을 넘어, 멈추지 않는 점을 만드세요.',
  proPlanFreeTitle: '무료',          // 無料
  proPlanMonthlyTitle: '월간',       // 月額
  proPlanYearlyTitle: '연간',        // 年額
  proPlanYearlyBadge: '최고의 선택', // 英語: Best value (直訳より「ベストチョイス」)
  proBadgeShort: 'PRO',
  priceFree: '₩0 / 평생',            // ずっと0ウォン
  proOnlyTitle: 'Pro 기능',          // Pro機能
  proOnlyTheme: '이 테마는 Pro에서 사용할 수 있습니다.',
  openPro: 'Pro 플랜 보기',          // Proプランを見る
  cancel: '취소',                    // キャンセル

  // --- Settings (Appearance) (設定：見た目) ---
  flowEffectTitle: '전류 애니메이션', // 直訳より「電気の流れ」のイメージ
  flowEffectHelp:
    '체인 라인을 따라 네온 전류가 흐릅니다. 차분한 화면을 원하면 끄셔도 좋습니다.',

  // --- Heatmap Range (Settings) (ヒートマップ表示期間) ---
  heatmapRangeTitle: '표시 기간',
  heatmapRangeHelp: '홈 화면의 히트맵에 체인을 며칠 동안 표시할지 선택하세요.',
  heatmapRange7: '1주',
  heatmapRange30: '1개월',
  heatmapRange60: '2개월',
  heatmapRange90: '3개월',
  heatmapRange180: '6개월',
  heatmapRange365: '1년',
  heatmapSummaryPrefix: '최근 ',     // 「最近」
  heatmapSummarySuffix: '일',        // 「日」
  heatmapAgoSuffix: '일 전',         // 「日前」
  heatmapToday: '오늘',

  // --- Themes (テーマ) ---
  themeDesc: '앱의 분위기를 바꿔보세요.',
  themeDarkLabel: '다크',            // Dark
  themeNeonPinkLabel: '네온 핑크',
  themeCyberBlueLabel: '사이버 블루',
  freeThemeNote: '무료: 다크만 사용 가능 / Pro: 네온 핑크, 사이버 블루 잠금 해제',
  proThemeNote: 'Pro 테마는 곧 출시됩니다.',

  // --- Habit Management (習慣管理) ---
  newHabitTitle: '새로운 습관',
  editHabitTitle: '습관 수정',
  habitNameLabel: '이름',
  habitNamePlaceholder: '예: 물 마시기, 책 읽기',
  habitIconLabel: '아이콘',
  deleteHabit: '이 습관 삭제',
  deleteConfirmationTitle: '삭제하시겠습니까?',
  deleteConfirmationMessage: '이 작업은 되돌릴 수 없습니다. 모든 기록이 사라집니다.',
  save: '저장',
  create: '만들기',

  // --- Icon Categories & Labels (アイコンカテゴリとラベル) ---
  iconCatBasic: '기본',
  iconCatHealth: '건강',
  iconCatLearning: '학습',

  iconLabelStreak: '연속',
  iconLabelTask: '할 일',
  iconLabelShine: '반짝임',
  iconLabelClean: '청소',
  iconLabelLaundry: '세탁',
  iconLabelWater: '물',
  iconLabelWalk: '걷기',
  iconLabelSleep: '수면',
  iconLabelWorkout: '운동',
  iconLabelBarbell: '바벨',
  iconLabelRead: '독서',
  iconLabelArt: '예술',
  iconLabelMedia: '미디어',
  iconLabelStudy: '공부',
  iconLabelLanguage: '언어',

  // --- Misc / Errors (その他 / エラー) ---
  habitButtonSuffix: ' 습관 버튼',   // アクセシビリティ用
  errorLoadFailed: '데이터를 불러오지 못했습니다.',
  errorTitleRequired: '이름을 입력해야 합니다.',
  errorTitleTooLong: '이름은 20자 이내여야 합니다.',
  errorSaveFailed: '저장에 실패했습니다.',
  errorDeleteFailed: '삭제에 실패했습니다.',
  errorToggleFailed: '업데이트에 실패했습니다.',
  habitLimitTitle: '무료 플랜 제한',
  habitLimitBody: '무료 플랜에서는 최대 3개의 습관만 만들 수 있습니다.',

  // --- Settings description (設定の説明) ---
  hapticsDescription: '햅틱 피드백 (진동)',

  // --- Reminder (リマインダー) ---
  reminderSectionTitle: '리마인더',
  reminderToggleLabel: '리마인더 사용',
  reminderTimeLabel: '알림 시간',
  reminderNotificationBody: '체인을 연결할 시간입니다!', // 「チェーンを作る時間！」

  // --- Review (7-day streak) (レビュー依頼) ---
  streak7Title: '7일 연속 달성!',
  streak7Message: '일주일 동안 체인을 끊지 않았군요. 정말 대단해요!',
  ok: '최고예요',

  // --- Language labels (言語名) ---
  languageChange: '언어 변경',
  currentLanguage: '현재 언어',
  languageNameEn: '영어',
  languageNameJa: '일본어',
  languageNameFr: '프랑스어',
  languageNameEs: '스페인어',
  languageNameDe: '독일어',
  languageNameIt: '이탈리아어',
  languageNamePt: '포르투갈어',
  languageNameRu: '러시아어',
  languageNameZhHans: '중국어 (简体)',
  languageNameZhHant: '중국어 (繁體)',
  languageNameKo: '한국어',
  languageNameHi: '힌디어',
  languageNameId: '인도네시아어',
  languageNameTh: '태국어',
  languageNameVi: '베트남어',
  languageNameTr: '튀르키예어',
  languageNameNl: '네덜란드어',
  languageNameSv: '스웨덴어',

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
  tutorialNext: '다음',
  tutorialWelcome: 'Repolog에 오신 것을 환영합니다',
  tutorialDesc1: '매일의 습관을 연결하고 나만의 체인을 만드세요.',
  tutorialDesc2: '습관이 몸에 배도록 체인을 끊지 마세요.',
  tutorialStart: '시작하기',
};

export default dict;