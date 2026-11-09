import type {
  Category,
  Product,
  StockItem,
  Coupon,
  AdminUser,
  OrderItem,
  AnalyticsDataPoint,
  AdminActivity,
  AdminMetrics,
  Review,
  LeaderboardUser,
  DailyStreakState,
  StaffMember,
} from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'Все', emoji: '✨' },
  { id: 'text_code', name: 'Текст и Код', emoji: '💻' },
  { id: 'voice_video', name: 'Голос и Видео', emoji: '🎬' },
  { id: 'vpn_security', name: 'VPN и Защита', emoji: '🛡️' },
  { id: 'gaming_tools', name: 'Игры & Софт', emoji: '🎮' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'chatgpt-plus',
    categoryId: 'text_code',
    title: 'ChatGPT Plus',
    tagline: 'GPT-4o, o1 Reasoning, DALL·E 3 и анализ кода',
    category: 'text_code',
    brandColor: '#10a37f',
    brandSecondaryColor: '#06b6d4',
    glowClass: 'neon-glow-emerald',
    badge: '🔥 ХИТ ПРОДАЖ',
    badgeColor: 'from-emerald-500/30 to-teal-500/20 text-emerald-400 border-emerald-500/40',
    description:
      'Официальная подписка на ChatGPT Plus. Доступ к флагманским моделям GPT-4o, o1, o3-mini, безлимитному анализу файлов, визуализации кода, созданию собственных GPTs и генерации фото через DALL-E 3.',
    features: [
      'Доступ к топовым моделям o1 и GPT-4o',
      'Генерация изображений без лимитов DALL·E 3',
      'Глубокий анализ документов, PDF и таблиц',
      'Память диалогов и доступ к магазину GPTs',
    ],
    startingPrice: 5,
    wholesalePrice: 3.8,
    stockCount: 42,
    options: [
      {
        id: 'opt_shared',
        name: 'Общий аккаунт (Shared)',
        description: 'Готовый общий аккаунт с выделенным профилем. Экономия 80%.',
        isPersonal: false,
        baseMonthlyPrice: 5,
      },
      {
        id: 'opt_personal',
        name: 'На личный аккаунт (Upgrade)',
        description: 'Официальная активация прямо на вашу почту. 100% приватность.',
        isPersonal: true,
        baseMonthlyPrice: 22,
      },
    ],
    durations: [
      { months: 1, label: '1 месяц', discountPercent: 0 },
      { months: 3, label: '3 месяца', discountPercent: 12 },
      { months: 12, label: '12 месяцев', discountPercent: 20 },
    ],
    warrantyText: '🛡️ Гарантия 100% на весь срок подписки с моментальной заменой',
    iconType: 'chatgpt',
    instruction:
      '1. Перейдите на chatgpt.com\n2. Нажмите Log in\n3. Введите логин и пароль\n4. В случае запроса 2FA напишите боту @KotikSupport',
    flashSale: {
      active: true,
      discountPercent: 15,
      endsAt: '2026-11-10T12:00:00Z',
      hoursRemaining: 14,
    },
  },
  {
    id: 'gemini-advanced',
    categoryId: 'text_code',
    title: 'Gemini Advanced',
    tagline: '2,000,000 токенов контекста + 2TB Google One',
    category: 'text_code',
    brandColor: '#d946ef',
    brandSecondaryColor: '#9333ea',
    glowClass: 'neon-glow-pink',
    badge: '✨ ВЫБОР КОТИКА',
    badgeColor: 'from-fuchsia-500/30 to-pink-500/20 text-fuchsia-300 border-fuchsia-500/40',
    description:
      'Премиальный ИИ от Google с гигантским контекстным окном в 2 миллиона токенов. Анализирует часовые видео, огромные книги и целые репозитории кода. Включает 2 ТБ облачного хранилища в Google One.',
    features: [
      'Модели Gemini 1.5 Pro и 2.0 Flash',
      'Контекст до 2 000 000 токенов (книги, базы кода)',
      'Интеграция с Google Docs, Gmail, YouTube',
      'Бонус: 2 ТБ в облаке Google One',
    ],
    startingPrice: 10,
    wholesalePrice: 7.5,
    stockCount: 18,
    options: [
      {
        id: 'opt_invite',
        name: 'Семейный инвайт (Personal Invite)',
        description: 'Приглашение в семью Google One на ваш личный Gmail.',
        isPersonal: true,
        baseMonthlyPrice: 10,
      },
      {
        id: 'opt_ready',
        name: 'Готовый аккаунт (Ready Account)',
        description: 'Новый чистый аккаунт Google с активным планом Advanced.',
        isPersonal: false,
        baseMonthlyPrice: 12,
      },
    ],
    durations: [
      { months: 1, label: '1 месяц', discountPercent: 0 },
      { months: 6, label: '6 месяцев', discountPercent: 15 },
      { months: 12, label: '12 месяцев', discountPercent: 25 },
    ],
    warrantyText: '🛡️ Полная гарантия на весь период от Kotik Store',
    iconType: 'gemini',
    instruction:
      'Инвайт отправлен на указанную почту Gmail. Откройте письмо от Google One Family и нажмите Принять приглашение.',
  },
  {
    id: 'claude-3-7-pro',
    categoryId: 'text_code',
    title: 'Claude 3.7 Sonnet Pro',
    tagline: 'Гибридное мышление (Hybrid Thinking) и Claude Code',
    category: 'text_code',
    brandColor: '#f97316',
    brandSecondaryColor: '#ea580c',
    glowClass: 'neon-glow-amber',
    badge: '💻 ТОП ДЛЯ КОДА',
    badgeColor: 'from-amber-500/30 to-orange-500/20 text-amber-400 border-amber-500/40',
    description:
      'Флагманская модель Claude 3.7 Sonnet с поддержкой режима расширенного мышления (Extended Thinking). Лучший ИИ в мире по бенчмаркам программирования SWE-bench, рефакторингу архитектуры и интерактивным Артефактам.',
    features: [
      'Новейший Claude 3.7 Sonnet с Extended Thinking',
      'Интерактивные Артефакты (код, UI, графика на лету)',
      'Увеличенные лимиты сообщений в 5 раз',
      'Идеален для разработчиков и авторов текста',
    ],
    startingPrice: 24,
    wholesalePrice: 19.0,
    stockCount: 9,
    options: [
      {
        id: 'opt_claude_ready',
        name: 'Готовый аккаунт с гарантией',
        description: 'Личный проверенный аккаунт Anthropic с привязанной почтой и гарантией.',
        isPersonal: false,
        baseMonthlyPrice: 24,
      },
    ],
    durations: [
      { months: 1, label: '1 месяц', discountPercent: 0 },
      { months: 3, label: '3 месяца', discountPercent: 11 },
    ],
    warrantyText: '🛡️ Автозамена 24/7 в случае любых блокировок сервиса',
    iconType: 'claude',
    instruction:
      'Перейдите на claude.ai, авторизуйтесь с выданным email и кодом доступа из почты.',
  },
  {
    id: 'grok-ai',
    categoryId: 'text_code',
    title: 'Grok AI (X Premium+)',
    tagline: 'Нейросеть без цензуры в реальном времени от xAI',
    category: 'text_code',
    brandColor: '#e2e8f0',
    brandSecondaryColor: '#94a3b8',
    glowClass: 'neon-glow-cyan',
    badge: '🚀 БЕЗ ЦЕНЗУРЫ',
    badgeColor: 'from-slate-300/25 to-zinc-400/15 text-slate-200 border-slate-400/40',
    description:
      'ИИ нового поколения от Илона Маска. Мгновенный доступ к свежей информации и трендам из сети X, отсутствие идеологической цензуры, режим юмора и генератор картинок FLUX. Включает синюю галочку X Premium+.',
    features: [
      'Grok 3 с мощным режимом рассуждений',
      'Данные из реального времени без задержек',
      'Генерация реалистичных изображений FLUX',
      'Синяя галочка верификации в X (Twitter)',
    ],
    startingPrice: 16,
    wholesalePrice: 12.5,
    stockCount: 14,
    options: [
      {
        id: 'opt_grok_personal',
        name: 'Личная активация на ваш X',
        description: 'Подключение подписки Premium+ прямо на ваш текущий профиль X.',
        isPersonal: true,
        baseMonthlyPrice: 16,
      },
      {
        id: 'opt_grok_ready',
        name: 'Готовый аккаунт X Premium+',
        description: 'Готовый верифицированный профиль с активированным Grok AI.',
        isPersonal: false,
        baseMonthlyPrice: 18,
      },
    ],
    durations: [
      { months: 1, label: '1 месяц', discountPercent: 0 },
      { months: 12, label: '12 месяцев', discountPercent: 18 },
    ],
    warrantyText: '🛡️ Официальное подключение, 100% безопасность аккаунта',
    iconType: 'grok',
    instruction:
      'Войдите в аккаунт X (Twitter) через полученный auth token или свяжитесь с поддержкой для личной активации.',
  },
  {
    id: 'elevenlabs',
    categoryId: 'voice_video',
    title: 'ElevenLabs Pro',
    tagline: 'Идеальное клонирование голоса и аудио-генерация',
    category: 'voice_video',
    brandColor: '#6366f1',
    brandSecondaryColor: '#818cf8',
    glowClass: 'neon-glow-purple',
    badge: '🎙 AI ОЗВУЧКА',
    badgeColor: 'from-indigo-500/30 to-violet-500/20 text-indigo-300 border-indigo-500/40',
    description:
      'Лучшая в индустрии платформа для генерации реалистичной речи и мгновенного клонирования любого голоса. Идеально подходит для озвучки YouTube, Shorts, аудиокниг, подкастов и дубляжа на 30+ языках.',
    features: [
      'Мгновенное клонирование любого голоса по 1 минуте аудио',
      'Синтез речи с передачей тончайших эмоций и интонаций',
      'Коммерческие права на все сгенерированные файлы',
      'Генерация звуковых эффектов Sound Effects',
    ],
    startingPrice: 6,
    wholesalePrice: 4.5,
    stockCount: 27,
    options: [
      {
        id: 'opt_eleven_starter',
        name: 'Starter Plan (30,000 знаков)',
        description: '30,000 кредитов/мес, клонирование до 3 собственных голосов.',
        isPersonal: false,
        baseMonthlyPrice: 6,
      },
      {
        id: 'opt_eleven_creator',
        name: 'Creator Plan (100,000 знаков)',
        description: '100,000 кредитов/мес, профессиональный клон голоса в Studio качестве.',
        isPersonal: false,
        baseMonthlyPrice: 20,
      },
    ],
    durations: [
      { months: 1, label: '1 месяц', discountPercent: 0 },
      { months: 3, label: '3 месяца', discountPercent: 10 },
    ],
    warrantyText: '🛡️ Пополнение кредитов и поддержка на весь срок',
    iconType: 'elevenlabs',
    instruction:
      'Перейдите на elevenlabs.io, войдите под полученным аккаунтом. API Key находится в Profile -> API Keys.',
  },
  {
    id: 'capcut-pro',
    categoryId: 'voice_video',
    title: 'CapCut Pro',
    tagline: 'Авто-субтитры, удаление фона и 4K эффекты',
    category: 'voice_video',
    brandColor: '#06b6d4',
    brandSecondaryColor: '#0891b2',
    glowClass: 'neon-glow-cyan',
    badge: '🎬 ДЛЯ РИЛС/ТИКТОК',
    badgeColor: 'from-cyan-500/30 to-blue-500/20 text-cyan-300 border-cyan-500/40',
    description:
      'Самый популярный видеоредактор для TikTok, Instagram Reels и YouTube Shorts. Автоматические анимированные субтитры, умное удаление фона без хромакея, Pro-фильтры, переходы и экспорт без водяного знака.',
    features: [
      'Автоматические субтитры с трендовыми стилями',
      'ИИ-инструменты: удаление шума, авто-ретушь лица',
      'Экспорт в 4K 60FPS без водяного знака',
      'Облачное хранилище CapCut Cloud 100GB',
    ],
    startingPrice: 4,
    wholesalePrice: 2.8,
    stockCount: 35,
    options: [
      {
        id: 'opt_capcut_cloud',
        name: 'Общий Cloud Pro аккаунт',
        description: 'Вход на ПК и телефон, моментальный доступ ко всем Pro-функциям.',
        isPersonal: false,
        baseMonthlyPrice: 4,
      },
      {
        id: 'opt_capcut_personal',
        name: 'Персональный QR-вход',
        description: 'Вход на ваше личное устройство по одноразовому QR-коду без передачи паролей.',
        isPersonal: true,
        baseMonthlyPrice: 7,
      },
    ],
    durations: [
      { months: 1, label: '1 месяц', discountPercent: 0 },
      { months: 6, label: '6 месяцев', discountPercent: 14 },
      { months: 12, label: '12 месяцев', discountPercent: 22 },
    ],
    warrantyText: '🛡️ Гарантия бесперебойной работы и моментальная замена',
    iconType: 'capcut',
    instruction:
      'Откройте приложение CapCut на телефоне или ПК -> войдите в выданный аккаунт. Все Pro-эффекты разблокированы.',
  },
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'stk-101',
    productId: 'chatgpt-plus',
    productTitle: 'ChatGPT Plus',
    credentials: 'gpt_plus_fast1@kotikstore.ai:KotikFast2026',
    status: 'available',
    addedAt: '2026-11-09 14:20',
  },
  {
    id: 'stk-102',
    productId: 'chatgpt-plus',
    productTitle: 'ChatGPT Plus',
    credentials: 'gpt_plus_fast2@kotikstore.ai:KotikUltraPass88',
    status: 'available',
    addedAt: '2026-11-09 14:22',
  },
  {
    id: 'stk-103',
    productId: 'elevenlabs',
    productTitle: 'ElevenLabs Pro',
    credentials: 'sk_eleven_9941a87b22f1c8d00923e',
    status: 'available',
    addedAt: '2026-11-09 15:05',
  },
  {
    id: 'stk-104',
    productId: 'claude-3-7-pro',
    productTitle: 'Claude 3.7 Sonnet Pro',
    credentials: 'claude_coder_pro@kotikstore.ai:ClaudeThinking99',
    status: 'available',
    addedAt: '2026-11-09 15:40',
  },
  {
    id: 'stk-105',
    productId: 'capcut-pro',
    productTitle: 'CapCut Pro',
    credentials: 'capcut_pro_cloud88@kotikstore.ai:CapCutFast4K',
    status: 'available',
    addedAt: '2026-11-09 16:10',
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'KOTIK',
    amount: 5,
    limit: 500,
    usedCount: 142,
    isActive: true,
    createdAt: '2026-11-01',
  },
  {
    id: 'cpn-2',
    code: 'START50',
    amount: 10,
    limit: 100,
    usedCount: 68,
    isActive: true,
    createdAt: '2026-11-05',
  },
  {
    id: 'cpn-3',
    code: 'AI2026',
    amount: 7,
    limit: 200,
    usedCount: 95,
    isActive: true,
    createdAt: '2026-11-08',
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    telegramId: 755843448,
    username: 'kirabakuta',
    name: 'Владелец (Owner)',
    role: 'super_admin',
    addedAt: '2026-11-04 14:54',
    addedBy: 'Система',
  },
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: '819230192',
    username: 'alex_dev',
    name: 'Алексей Иванов',
    balance: 24.5,
    ordersCount: 4,
    status: 'active',
    registeredAt: '2026-10-15',
  },
  {
    id: '501928341',
    username: 'dmitry_ai',
    name: 'Дмитрий Смирнов',
    balance: 5.0,
    ordersCount: 2,
    status: 'active',
    registeredAt: '2026-10-20',
  },
  {
    id: '671928401',
    username: 'olga_design',
    name: 'Ольга Васильева',
    balance: 0.0,
    ordersCount: 1,
    status: 'active',
    registeredAt: '2026-10-28',
  },
  {
    id: '992817261',
    username: 'spammer_bot',
    name: 'Bot Tester',
    balance: 0.0,
    ordersCount: 0,
    status: 'blocked',
    registeredAt: '2026-11-02',
  },
  {
    id: '719284910',
    username: 'mikhail_coder',
    name: 'Михаил Резников',
    balance: 52.0,
    ordersCount: 6,
    status: 'active',
    registeredAt: '2026-11-04',
  },
];

export const INITIAL_ADMIN_ORDERS: OrderItem[] = [
  {
    id: 'ORD-782419',
    productId: 'chatgpt-plus',
    productTitle: 'ChatGPT Plus',
    optionName: 'Личный аккаунт (Upgrade)',
    months: 1,
    totalPrice: 22.0,
    date: '09.11.2026 18:20',
    expiresDate: '09.12.2026',
    status: 'active',
    loginData: 'Почта: alex_dev@kotikstore.ai\nПароль: KotikAI#2026!Plus\nКлюч сессии: KOTIK-GPT-88A9-92F1',
    instructions: [
      'Перейдите на https://chatgpt.com и нажмите «Log In».',
      'Введите логин и пароль, указанные выше.',
      'Для личного тарифа инвайт отправлен на ваш основной email.',
    ],
    brandColor: '#10a37f',
    buyerName: 'Алексей Иванов',
    buyerUsername: 'alex_dev',
    buyerId: '819230192',
  },
  {
    id: 'ORD-782418',
    productId: 'claude-3-7-pro',
    productTitle: 'Claude 3.7 Sonnet Pro',
    optionName: 'Готовый аккаунт с гарантией',
    months: 3,
    totalPrice: 64.0,
    date: '09.11.2026 17:05',
    expiresDate: '09.02.2027',
    status: 'active',
    loginData: 'claude_coder_pro@kotikstore.ai:ClaudeThinking99',
    instructions: ['Авторизуйтесь на сайте claude.ai с полученными данными.'],
    brandColor: '#f97316',
    buyerName: 'Михаил Резников',
    buyerUsername: 'mikhail_coder',
    buyerId: '719284910',
  },
  {
    id: 'ORD-782417',
    productId: 'capcut-pro',
    productTitle: 'CapCut Pro',
    optionName: 'Cloud Account',
    months: 6,
    totalPrice: 21.0,
    date: '09.11.2026 15:42',
    expiresDate: '09.05.2027',
    status: 'active',
    loginData: 'capcut_pro_cloud88@kotikstore.ai:CapCutFast4K',
    instructions: ['Войдите в аккаунт CapCut на смартфоне или ПК.'],
    brandColor: '#06b6d4',
    buyerName: 'Ольга Васильева',
    buyerUsername: 'olga_design',
    buyerId: '671928401',
  },
  {
    id: 'ORD-782416',
    productId: 'elevenlabs',
    productTitle: 'ElevenLabs Pro',
    optionName: 'Starter Plan',
    months: 1,
    totalPrice: 6.0,
    date: '09.11.2026 14:11',
    expiresDate: '09.12.2026',
    status: 'active',
    loginData: 'API Key: sk_eleven_9941a87b22f1c8d00923e',
    instructions: ['Используйте API-ключ в настройках elevenlabs.io.'],
    brandColor: '#6366f1',
    buyerName: 'Дмитрий Смирнов',
    buyerUsername: 'dmitry_ai',
    buyerId: '501928341',
  },
  {
    id: 'ORD-782415',
    productId: 'gemini-advanced',
    productTitle: 'Gemini Advanced',
    optionName: 'Семейный инвайт',
    months: 1,
    totalPrice: 10.0,
    date: '08.11.2026 21:30',
    expiresDate: '08.12.2026',
    status: 'refunded',
    loginData: 'Инвайт отправлен',
    instructions: ['Примите инвайт на почте.'],
    brandColor: '#d946ef',
    buyerName: 'Иван Петров',
    buyerUsername: 'ivan_p',
    buyerId: '491029381',
  },
];

export const INITIAL_ANALYTICS: AnalyticsDataPoint[] = [
  { day: '11/01', sales: 120, profit: 48, orders: 8, regs: 15, visits: 110, churn: 1 },
  { day: '11/02', sales: 195, profit: 78, orders: 12, regs: 22, visits: 165, churn: 0 },
  { day: '11/03', sales: 240, profit: 96, orders: 15, regs: 28, visits: 210, churn: 2 },
  { day: '11/04', sales: 310, profit: 124, orders: 19, regs: 34, visits: 290, churn: 1 },
  { day: '11/05', sales: 420, profit: 168, orders: 25, regs: 42, visits: 380, churn: 3 },
  { day: '11/06', sales: 380, profit: 152, orders: 22, regs: 36, visits: 340, churn: 1 },
  { day: '11/07', sales: 490, profit: 196, orders: 29, regs: 49, visits: 450, churn: 2 },
  { day: '11/08', sales: 610, profit: 244, orders: 36, regs: 58, visits: 540, churn: 2 },
  { day: '11/09', sales: 740, profit: 296, orders: 42, regs: 67, visits: 680, churn: 1 },
];

export const INITIAL_ACTIVITIES: AdminActivity[] = [
  {
    id: 'act-1',
    user: '@alex_dev',
    action: 'Оформил заказ ChatGPT Plus (Upgrade)',
    time: '2 мин назад',
    type: 'buy',
  },
  {
    id: 'act-2',
    user: '@dmitry_ai',
    action: 'Пополнил баланс на +$25.00 через СБП',
    time: '8 мин назад',
    type: 'topup',
  },
  {
    id: 'act-3',
    user: '@mikhail_coder',
    action: 'Активировал купон KOTIK (+$5.00)',
    time: '15 мин назад',
    type: 'coupon',
  },
  {
    id: 'act-4',
    user: '@olga_design',
    action: 'Купила CapCut Pro (Cloud 6 мес.)',
    time: '24 мин назад',
    type: 'buy',
  },
  {
    id: 'act-5',
    user: '@ivan_p',
    action: 'Возврат заказа ORD-782415 ($10.00)',
    time: '1 час назад',
    type: 'refund',
  },
  {
    id: 'act-6',
    user: '@guest_812',
    action: 'Открыл WebApp витрину магазина',
    time: '2 часа назад',
    type: 'visit',
  },
];

export const INITIAL_METRICS: AdminMetrics = {
  usersCount: 1420,
  ordersCount: 489,
  revenue: 8940.0,
  stockCount: 145,
  webDau: 312,
  webWau: 1140,
  blockedCount: 18,
  activeUsersCount: 1402,
  netProfit: 3576.0,
  avgMargin: 40,
  x2PromotionActive: false,
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userId: 'tg_771234',
    username: 'Алексей С.',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    productId: 'chatgpt-plus',
    productName: 'ChatGPT Plus',
    rating: 5,
    comment: 'Купил готовый аккаунт ChatGPT Plus. Моментально выдали логин с паролем, всё работает без сбоев уже 2 месяца! Модель o1-preview доступна.',
    createdAt: 'Вчера, 19:42',
    sellerReply: 'Спасибо за отзыв! Приятной работы с o1 и ChatGPT Plus 🤍',
    isVerifiedPurchase: true,
  },
  {
    id: 'rev-2',
    userId: 'tg_889211',
    username: 'Дмитрий В.',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    productId: 'claude-pro',
    productName: 'Claude 3.7 Sonnet Pro',
    rating: 5,
    comment: 'Для программирования Claude 3.7 — просто разрыв. Личная активация прошла за 5 минут через поддержку. Рекомендую!',
    createdAt: '2 дня назад',
    sellerReply: 'Рады стараться! Claude 3.7 действительно лучший для кода сейчас 🔥',
    isVerifiedPurchase: true,
  },
  {
    id: 'rev-3',
    userId: 'tg_992144',
    username: 'Катерина М.',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    productId: 'elevenlabs',
    productName: 'ElevenLabs Pro',
    rating: 5,
    comment: 'Брала Creator Plan для дубляжа роликов. Клонирование голоса супер реалистичное, на балансе все обещанные символы.',
    createdAt: '3 дня назад',
    sellerReply: 'Творите и создавайте вирусные видео! 🎬',
    isVerifiedPurchase: true,
  },
  {
    id: 'rev-4',
    userId: 'tg_441029',
    username: 'Максим',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    productId: 'gemini-advanced',
    productName: 'Gemini Advanced',
    rating: 5,
    comment: 'Gemini 2.5 Flash с окном 2M токенов работает молниеносно. Подключили семейный инвайт, Google Drive тоже расширился до 2TB.',
    createdAt: '5 дней назад',
    sellerReply: 'Отличный выбор, спасибо за доверие! ✨',
    isVerifiedPurchase: true,
  },
  {
    id: 'rev-5',
    userId: 'tg_552199',
    username: 'Сергей К.',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    productId: 'capcut-pro',
    productName: 'CapCut Pro',
    rating: 5,
    comment: 'CapCut Pro по QR зашел идеально, все PRO эффекты и умное удаление фона активировались на ПК и телефоне.',
    createdAt: 'Неделю назад',
    sellerReply: 'Приятного монтажа! ✂️',
    isVerifiedPurchase: true,
  },
];

export const INITIAL_LEADERBOARD: Record<string, LeaderboardUser[]> = {
  '24h': [
    { id: '1', name: 'Alexander G.', username: 'alex_code', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', spent: 184.0, ordersCount: 6, streak: 14, rank: 1, badge: '👑 VIP Котик' },
    { id: '2', name: 'Dmitry K.', username: 'dimon_ai', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', spent: 96.0, ordersCount: 4, streak: 8, rank: 2, badge: '🥈 Мастер' },
    { id: '3', name: 'Maxim V.', username: 'max_studio', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', spent: 68.0, ordersCount: 3, streak: 5, rank: 3, badge: '🥉 Эксперт' },
    { id: '4', name: 'Elena R.', username: 'elena_design', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', spent: 44.0, ordersCount: 2, streak: 4, rank: 4 },
    { id: '5', name: 'Kirill P.', username: 'kir_prod', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', spent: 38.0, ordersCount: 2, streak: 3, rank: 5 },
  ],
  '7d': [
    { id: '1', name: 'Dmitry K.', username: 'dimon_ai', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', spent: 480.0, ordersCount: 16, streak: 19, rank: 1, badge: '👑 Топ Недели' },
    { id: '2', name: 'Alexander G.', username: 'alex_code', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', spent: 395.0, ordersCount: 12, streak: 14, rank: 2, badge: '🥈 Звезда' },
    { id: '3', name: 'Stanislav N.', username: 'stan_lead', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', spent: 270.0, ordersCount: 9, streak: 12, rank: 3, badge: '🥉 Эксперт' },
    { id: '4', name: 'Maxim V.', username: 'max_studio', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', spent: 195.0, ordersCount: 7, streak: 5, rank: 4 },
    { id: '5', name: 'Olga T.', username: 'olga_ai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', spent: 160.0, ordersCount: 5, streak: 7, rank: 5 },
  ],
  '30d': [
    { id: '1', name: 'Dmitry K.', username: 'dimon_ai', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', spent: 1420.0, ordersCount: 42, streak: 30, rank: 1, badge: '👑 Легенда Месяца' },
    { id: '2', name: 'Studio Pixel', username: 'pixel_media', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', spent: 1180.0, ordersCount: 35, streak: 26, rank: 2, badge: '🥈 Корпоративный' },
    { id: '3', name: 'Alexander G.', username: 'alex_code', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', spent: 890.0, ordersCount: 28, streak: 14, rank: 3, badge: '🥉 Магнат' },
  ],
  'all_time': [
    { id: '1', name: 'Dmitry K.', username: 'dimon_ai', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', spent: 3450.0, ordersCount: 110, streak: 45, rank: 1, badge: '💎 Властелин Сетей' },
    { id: '2', name: 'Studio Pixel', username: 'pixel_media', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', spent: 2840.0, ordersCount: 78, streak: 32, rank: 2, badge: '👑 Титан' },
    { id: '3', name: 'Alexander G.', username: 'alex_code', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', spent: 1920.0, ordersCount: 54, streak: 22, rank: 3, badge: '🥇 Чемпион' },
  ],
};

export const INITIAL_DAILY_STREAK: DailyStreakState = {
  currentDay: 1,
  streakDays: 3,
  claimedToday: false,
  lastClaimDate: null,
  rewards: [
    { day: 1, amount: 0.05, label: 'День 1' },
    { day: 2, amount: 0.10, label: 'День 2' },
    { day: 3, amount: 0.15, label: 'День 3' },
    { day: 4, amount: 0.25, label: 'День 4' },
    { day: 5, amount: 0.40, label: 'День 5' },
    { day: 6, amount: 0.60, label: 'День 6' },
    { day: 7, amount: 1.00, label: 'День 7', bonusItem: 'Секретный промокод + Kotik VIP' },
  ],
};

export const POLICIES_TEXT = {
  rules: {
    title: '📜 Пользовательское соглашение',
    content: `1. Общие положения
1.1. Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует порядок использования онлайн-сервиса Kotik Store (далее — «Сервис»), предоставляемого Администрацией.
1.2. Используя Сервис, включая запуск Telegram-бота, WebApp, регистрацию, оплату услуг или получение доступа к материалам и подпискам, Пользователь подтверждает, что полностью ознакомился с условиями настоящего Соглашения и принимает их в полном объёме.
1.3. В случае несогласия с условиями Соглашения Пользователь обязан прекратить использование Сервиса.

2. Характер услуг и цифровых товаров
2.1. Сервис предоставляет цифровые товары и услуги нематериального характера, включая, но не ограничиваясь: доступ к нейросетям, премиум-подпискам, ключам активации и сервисным услугам.
2.2. Материалы и доступы, предоставляемые через Сервис, могут включать:
• информацию из открытых и партнерских источников;
• авторские материалы Администрации и/или третьих лиц;
• лицензионные ключи, инвайты, выделенные профили и структурированные данные.
2.3. Пользователь осознаёт и соглашается, что ценность цифровых товаров и услуг Сервиса заключается в автоматизированной доставке, систематизации, анализе, сопровождении, технической поддержке 24/7 и регулярных обновлениях, а не в эксклюзивности отдельных фрагментов информации или стороннего ПО.
2.4. Сервис не заявляет и не гарантирует уникальность, исключительность или недоступность отдельных элементов материалов вне Сервиса.

3. Отказ от гарантий и ответственности
3.1. Сервис предоставляется на условиях «AS IS» («как есть»).
3.2. Администрация не гарантирует:
• соответствие сторонних нейросетей субъективным ожиданиям Пользователя;
• достижение Пользователем каких-либо финансовых, коммерческих или иных результатов;
• бесперебойную и безошибочную работу сторонних серверов AI (OpenAI, Anthropic, Google и др.).
3.3. Администрация не несёт ответственности за:
• любые прямые или косвенные убытки, включая упущенную выгоду;
• последствия применения Пользователем полученных материалов и генераций нейросетей;
• действия или бездействие третьих лиц, провайдеров интернета и блокировки со стороны сторонних платформ;
• временные технические сбои и ограничения доступа на стороне провайдеров.
3.4. Все решения о применении материалов, генераций и услуг принимаются Пользователем самостоятельно и на его риск.

4. Законность использования
4.1. Сервис не предназначен для поощрения, организации или содействия противоправной деятельности.
4.2. Пользователь обязуется использовать Сервис исключительно в рамках применимого законодательства и правил (Terms of Service) соответствующих провайдеров нейросетей.
4.3. Ответственность за законность использования материалов и услуг Сервиса полностью возлагается на Пользователя.

5. Интеллектуальная собственность
5.1. Все материалы, элементы интерфейса, графики и тексты, размещённые в Сервисе, охраняются законодательством об интеллектуальной собственности.
5.2. Пользователю запрещается копировать, распространять, перепродавать, передавать третьим лицам или иным образом отчуждать полученные аккаунты и материалы без письменного согласия Администрации.
5.3. Нарушение прав влечёт немедленное прекращение обслуживания без возврата средств.

6. Ограничение доступа
6.1. Администрация вправе приостановить или ограничить доступ Пользователя к Сервису в случае:
• нарушения условий настоящего Соглашения;
• выявления злоупотреблений, спама, агрессивного поведения в отношении поддержки;
• требований платёжных шлюзов или законодательства.
6.2. Ограничение доступа не освобождает Пользователя от ранее возникших обязательств.

7. Платежи и возвраты
7.1. Оплата услуг и цифровых товаров производится на условиях, указанных в Сервисе до момента оплаты (через CryptoBot, Bot 2328, Platega, Enot.io, Stars).
7.2. В связи с нематериальным характером цифровых товаров и услуг, возврат денежных средств после предоставления доступа не осуществляется, за исключением гарантийных случаев, предусмотренных Правилами возврата.
7.3. Возврат средств возможен, если товар объективно неработоспособен при первой выдаче и Пользователем предоставлена непрерывная видеозапись проверки.
7.4. Пользователь подтверждает, что обязуется не инициировать чарджбэк (chargeback) через платёжные шлюзы без предварительного обращения в службу поддержки Сервиса.

8. Контактная информация
По всем вопросам Пользователь может обратиться в службу поддержки: @KotikSupport`,
  },
  privacy: {
    title: '🔒 Политика конфиденциальности',
    content: `1. Общие положения
1.1. Настоящая Политика конфиденциальности (далее — «Политика») регулирует порядок обработки и защиты информации, которую Пользователь передаёт при использовании сервиса Kotik Store (далее — «Сервис»).
1.2. Используя Сервис, Пользователь подтверждает своё полное согласие с условиями Политики. Если Пользователь не согласен с условиями — он обязан прекратить использование Сервиса.

2. Сбор информации
2.1. Сервис собирает исключительно минимально необходимые технические данные для функционирования:
• идентификаторы Telegram (ID, username, first_name);
• историю заказов, состояние внутреннего баланса и начисленный кешбэк;
• техническую информацию (IP-адрес, тип клиента Telegram, дату и время запросов).
2.2. Сервис НЕ собирает и не требует предоставления паспортных данных, документов, номеров банковских карт или приватных ключей кошельков. Все платежи проходят через защищённые шлюзы провайдеров.

3. Использование информации
3.1. Полученная информация используется исключительно для:
• идентификации Пользователя и безопасной моментальной автовыдачи оплаченных товаров;
• связи с Пользователем и решения технических инцидентов службой поддержки;
• начисления реферальных вознаграждений (10%) и персональных скидок.

4. Передача информации третьим лицам
4.1. Администрация не передаёт полученные данные третьим лицам, за исключением случаев:
• исполнения технических запросов платёжных шлюзов (CryptoBot, Bot 2328, Platega, Enot.io) для проведения транзакций;
• требований применимого законодательства;
• прямого согласия Пользователя.

5. Хранение и защита данных
5.1. Данные хранятся на защищённых серверах с шифрованием и ограничением доступа.
5.2. Администрация принимает все разумные меры для предотвращения утечек данных, но напоминает, что передача информации в сети интернет всегда сопряжена с базовыми рисками безопасности каналов связи.

6. Изменения в Политике
6.1. Администрация вправе изменять условия Политики в одностороннем порядке. Актуальная редакция публикуется непосредственно в боте и WebApp.`,
  },
  refund: {
    title: '🛡️ Правила возврата и гарантии',
    content: `1. Гарантийный период на цифровые товары
1.1. На все цифровые товары магазина предоставляется базовая проверка качества в течение 15 минут с момента автоматической выдачи в боте.
1.2. На оплаченные подписки (1, 3, 6 или 12 месяцев) действует гарантия обслуживания на весь оплаченный период (при соблюдении правил использования).

2. Обязательные условия для возврата или замены (SLA)
2.1. ПРЕДОСТАВЛЕНИЕ НЕПРЕРЫВНОЙ ВИДЕОЗАПИСИ:
Для получения замены или возврата средств при неработоспособности товара обязательно наличие непрерывной видеозаписи (запись экрана):
• Запись должна начинаться ДО нажатия кнопки оплаты/покупки в боте;
• Видео должно непрерывно продолжаться до момента первой авторизации/ввода данных и фиксации ошибки;
• Видеозапись не должна содержать монтажа, пауз, склеек или скрытых областей экрана.
Без видеозаписи претензии по невалидности аккаунтов не принимаются!

2.2. СРОКИ ПОДАЧИ ПРЕТЕНЗИЙ:
Претензия по первоначальной невалидности данных принимается строго в течение 15 минут после совершения сделки.
Обращения по вопросам гарантийного обслуживания активной подписки принимаются в течение 24 часов с момента возникновения проблемы.

3. Когда возврат и гарантийная замена НЕ производятся:
• Отсутствует непрерывная видеозапись покупки и первой проверки.
• Истёк установленный гарантийный период.
• Пользователь приобрел товар по ошибке или передумал после получения валидных данных.
• Нарушены правила пользования аккаунтом (попытка смены почты, пароля, привязки телефона на общем аккаунте, где это запрещено).
• Блокировка аккаунта вызвана нарушением пользователем правил самой нейросети (OpenAI, Claude ToS и др.).
• Локальные проблемы на стороне клиента (отсутствие необходимого VPN, нестабильный интернет, несовместимость устройства или браузера).

4. Порядок компенсации:
4.1. При подтверждении неработоспособности товара служба поддержки производит моментальную замену на аналогичный товар.
4.2. В случае отсутствия товара для замены средства зачисляются на внутренний баланс в WebApp либо возвращаются на исходные платежные реквизиты в течение 3–7 рабочих дней.

5. Рассмотрение обращений:
Заявления рассматриваются оператором поддержки @KotikSupport в течение 2–15 минут (максимум до 24 часов в пиковые часы).`,
  },
};

