export type Language = 'ru' | 'en';

export const DICTIONARY = {
  ru: {
    // Nav
    nav_shop: 'Магазин',
    nav_orders: 'Заказы',
    nav_reviews: 'Отзывы',
    nav_leaderboard: 'Топ',
    nav_wishlist: 'Избранное',
    nav_profile: 'Кабинет',

    // Header
    header_balance: 'Баланс',
    header_topup: '+ Пополнить',
    header_admin: 'Админ',
    header_x2_badge: 'X2 БОНУС',

    // Hero
    hero_title: 'Kotik Store',
    hero_tagline: 'Магазин лицензий и доступов к лучшим мировым нейросетям',
    hero_instant: 'Автовыдача 24/7',
    hero_warranty: '100% Гарантия',
    hero_rating: 'Рейтинг 5.0 ★',

    // Categories
    cat_all: 'Все',
    cat_text_code: 'Текст и Код',
    cat_voice_video: 'Голос и Видео',
    cat_vpn_security: 'VPN и Защита',
    search_placeholder: 'Найти нейросеть (ChatGPT, Gemini, Claude...)',
    search_reset: 'Сбросить фильтры',
    empty_products: 'Товары не найдены',

    // Product Card
    from: 'от',
    in_stock: 'В наличии',
    pre_order: 'Под заказ',
    order_btn: 'Выбрать тариф',

    // Product Modal
    modal_select_plan: '1. Выберите тариф',
    modal_period: '2. Срок подписки',
    modal_delivery: '3. Контакт для выдачи',
    modal_delivery_placeholder: 'name@example.com или @username в Telegram',
    modal_total: 'Итого к оплате:',
    modal_buy_btn: 'Перейти к оплате',
    modal_guarantee: 'Гарантия на весь период',
    modal_instruction: 'Инструкция по активации',
    modal_edit_admin: 'Редактировать товар (Staff)',
    modal_delete_admin: 'Удалить товар',

    // Checkout
    checkout_title: 'Подтверждение заказа',
    checkout_balance: 'Ваш баланс:',
    checkout_pay: 'Оплатить с баланса',
    checkout_no_funds: 'Недостаточно средств. Пополните баланс',
    checkout_topup_btn: 'Пополнить баланс',

    // Orders
    orders_title: 'Мои подписки и ключи',
    orders_empty: 'У вас пока нет активных заказов',
    orders_empty_desc: 'Приобретите нужную нейросеть в витрине, и доступ появится здесь моментально.',
    orders_go_shop: 'Перейти в каталог',

    // Reviews
    reviews_title: 'Отзывы покупателей',
    reviews_add: 'Оставить отзыв',
    reviews_empty: 'Пока нет отзывов. Будьте первым, кто оценит наш сервис!',

    // Leaderboard
    leaderboard_title: 'Зал славы Kotik Store',
    leaderboard_prize_title: 'Призовой фонд месяца: $10.00',
    leaderboard_prize_desc: 'Победитель месяца в ТОПе получает +$10.00 на баланс и статус «Премиум Котик» 👑!',
    leaderboard_empty: 'В этом периоде пока нет завершенных заказов. Совершите первую покупку, чтобы занять 1-е место!',
    leaderboard_24h: '24 часа',
    leaderboard_7d: '7 дней',
    leaderboard_30d: '30 дней',
    leaderboard_all_time: 'Все время',

    // Wishlist
    wishlist_title: 'Избранные нейросети',
    wishlist_empty: 'Список избранного пуст',
    wishlist_empty_desc: 'Нажмите на сердечко на карточке товара, чтобы сохранить его сюда.',

    // Profile
    profile_title: 'Личный кабинет',
    profile_daily_calendar: 'Календарь наград',
    profile_daily_claim: 'Забрать ежедневную награду',
    profile_daily_claimed: 'Награда за сегодня уже собрана ✓',
    profile_ref_title: 'Реферальная программа (10%)',
    profile_ref_prize: 'Призовой фонд месяца: $10.00',
    profile_ref_desc: 'Тот, кто пригласит больше всех людей за месяц, получит $10.00 на баланс и статус «Премиум Котик» 👑!',
    profile_ref_friends: 'Приглашено друзей',
    profile_ref_earned: 'Заработано (10%)',
    profile_ref_link: 'Ваша реферальная ссылка',
    profile_copy: 'Копировать',
    profile_copied: 'Скопировано',
    profile_ref_leaderboard: 'Топ приглашений (этого месяца)',
    profile_ref_empty: 'В этом месяце ещё никто не пригласил рефералов. Станьте первым!',
    profile_api_title: 'API & Интеграция',
    profile_api_desc: 'Используйте персональный ключ для автоматических закупок подписок через скрипты или ботов.',
    profile_api_open_docs: '📖 Открыть документацию API (cURL, Python, JS)',
    profile_rules: 'Пользовательское соглашение',
    profile_privacy: 'Политика конфиденциальности',
    profile_refund: 'Гарантия и условия возврата',
    profile_admin_btn: 'Панель Администратора',
  },
  en: {
    // Nav
    nav_shop: 'Shop',
    nav_orders: 'Orders',
    nav_reviews: 'Reviews',
    nav_leaderboard: 'Top',
    nav_wishlist: 'Wishlist',
    nav_profile: 'Profile',

    // Header
    header_balance: 'Balance',
    header_topup: '+ Top Up',
    header_admin: 'Admin',
    header_x2_badge: 'X2 BONUS',

    // Hero
    hero_title: 'Kotik Store',
    hero_tagline: 'Premium AI subscriptions, models & instant access store',
    hero_instant: 'Instant Delivery 24/7',
    hero_warranty: '100% Warranty',
    hero_rating: '5.0 ★ Rating',

    // Categories
    cat_all: 'All',
    cat_text_code: 'Text & Code',
    cat_voice_video: 'Voice & Video',
    cat_vpn_security: 'VPN & Security',
    search_placeholder: 'Search AI tools (ChatGPT, Gemini, Claude...)',
    search_reset: 'Reset filters',
    empty_products: 'No products found',

    // Product Card
    from: 'from',
    in_stock: 'In stock',
    pre_order: 'Pre-order',
    order_btn: 'Select Plan',

    // Product Modal
    modal_select_plan: '1. Select Plan',
    modal_period: '2. Duration',
    modal_delivery: '3. Contact for Delivery',
    modal_delivery_placeholder: 'name@example.com or @username on Telegram',
    modal_total: 'Total amount:',
    modal_buy_btn: 'Proceed to Checkout',
    modal_guarantee: 'Full duration warranty',
    modal_instruction: 'Activation instructions',
    modal_edit_admin: 'Edit Product (Staff)',
    modal_delete_admin: 'Delete Product',

    // Checkout
    checkout_title: 'Order Confirmation',
    checkout_balance: 'Your balance:',
    checkout_pay: 'Pay from Balance',
    checkout_no_funds: 'Insufficient funds. Please top up your balance',
    checkout_topup_btn: 'Top Up Balance',

    // Orders
    orders_title: 'My Subscriptions & Keys',
    orders_empty: 'No active orders yet',
    orders_empty_desc: 'Purchase an AI subscription in the catalog and your access credentials will appear here instantly.',
    orders_go_shop: 'Browse Catalog',

    // Reviews
    reviews_title: 'Customer Reviews',
    reviews_add: 'Leave a Review',
    reviews_empty: 'No reviews yet. Be the first to review our service!',

    // Leaderboard
    leaderboard_title: 'Kotik Store Hall of Fame',
    leaderboard_prize_title: 'Monthly Prize Pool: $10.00',
    leaderboard_prize_desc: 'Monthly #1 winner gets +$10.00 balance and «Premium Kotik» 👑 rank!',
    leaderboard_empty: 'No completed orders in this period yet. Make your first purchase to take #1 place!',
    leaderboard_24h: '24 Hours',
    leaderboard_7d: '7 Days',
    leaderboard_30d: '30 Days',
    leaderboard_all_time: 'All Time',

    // Wishlist
    wishlist_title: 'Favorite AI Tools',
    wishlist_empty: 'Wishlist is empty',
    wishlist_empty_desc: 'Click on the heart icon on any card to save it here for quick access.',

    // Profile
    profile_title: 'My Account',
    profile_daily_calendar: 'Daily Rewards',
    profile_daily_claim: 'Claim Daily Reward',
    profile_daily_claimed: 'Reward already claimed today ✓',
    profile_ref_title: 'Referral Program (10%)',
    profile_ref_prize: 'Monthly Prize Pool: $10.00',
    profile_ref_desc: 'Invite the most friends this month to win +$10.00 balance and «Premium Kotik» 👑 rank!',
    profile_ref_friends: 'Friends Invited',
    profile_ref_earned: 'Earned (10%)',
    profile_ref_link: 'Your Referral Link',
    profile_copy: 'Copy',
    profile_copied: 'Copied',
    profile_ref_leaderboard: 'Monthly Referral Leaderboard',
    profile_ref_empty: 'No referrals yet this month. Be the first!',
    profile_api_title: 'API & Integration',
    profile_api_desc: 'Use your personal API key to automate AI account purchases via bots or custom scripts.',
    profile_api_open_docs: '📖 Open API Documentation (cURL, Python, JS)',
    profile_rules: 'Terms of Service',
    profile_privacy: 'Privacy Policy',
    profile_refund: 'Warranty & Refund Policy',
    profile_admin_btn: 'Staff Admin Panel',
  },
};

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ru';

  // 1. Check URL query param ?lang=en or ?lang=ru
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  if (langParam === 'en' || langParam === 'ru') {
    localStorage.setItem('kotik_lang', langParam);
    return langParam;
  }

  // 2. Check localStorage
  const saved = localStorage.getItem('kotik_lang');
  if (saved === 'en' || saved === 'ru') {
    return saved;
  }

  // 3. Telegram WebApp user language
  try {
    const tgLang = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { language_code?: string } } } } })
      ?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (tgLang && tgLang.toLowerCase().startsWith('en')) {
      return 'en';
    }
  } catch {
    // ignore
  }

  return 'ru';
}

export function t(key: keyof typeof DICTIONARY['ru'], lang: Language): string {
  return DICTIONARY[lang][key] || DICTIONARY['ru'][key] || key;
}

import type { Product } from '../types';

export const PRODUCT_EN_DATA: Record<string, {
  tagline: string;
  description: string;
  features: string[];
  warrantyText: string;
  badge: string;
  instruction?: string;
  options?: Record<string, { name: string; description: string }>;
}> = {
  'chatgpt-plus': {
    tagline: 'GPT-4o, o1 Reasoning, DALL-E 3 & Code Analysis',
    description: 'Official ChatGPT Plus subscription. Unlimited access to flagship models GPT-4o, o1, Canvas, deep file analysis, custom GPTs and DALL-E 3 generation.',
    features: [
      'Access to top o1 and GPT-4o models',
      'Unlimited image generation via DALL-E 3',
      'Deep document, PDF and spreadsheet analysis',
      'Chat memory & access to GPTs store',
    ],
    warrantyText: '100% full duration warranty with instant replacement',
    badge: 'BESTSELLER',
    instruction: '1. Go to chatgpt.com\n2. Click Log in\n3. Enter credentials\n4. For 2FA help contact @Zykolandstore',
    options: {
      opt_shared: {
        name: 'Shared Account',
        description: 'Ready-to-use shared account with dedicated profile. Save 80%.',
      },
      opt_personal: {
        name: 'Personal Account Upgrade',
        description: 'Official activation directly on your email. 100% private.',
      },
    },
  },
  'gemini-advanced': {
    tagline: '2,000,000 token context + 2TB Google One storage',
    description: "Google's flagship AI with a massive 2 million token context window. Analyzes full-length videos, entire books, and full codebases. Includes 2TB Google One cloud.",
    features: [
      'Gemini 1.5 Pro and 2.0 Flash models',
      'Up to 2,000,000 token context (books, code repos)',
      'Integrated in Google Docs, Gmail, YouTube',
      'Bonus: 2TB Google One cloud storage',
    ],
    warrantyText: 'Full duration warranty by Kotik Store',
    badge: "KOTIK'S PICK",
    instruction: 'Check your Gmail inbox for Google One Family invitation and click Accept.',
    options: {
      opt_invite: {
        name: 'Family Invite (Personal Gmail)',
        description: 'Google One family invite sent to your personal Gmail.',
      },
      opt_ready: {
        name: 'Ready Account',
        description: 'Fresh Google account with active Advanced subscription.',
      },
    },
  },
  'claude-3-7-pro': {
    tagline: 'Hybrid Thinking & Claude Code for developers',
    description: "Anthropic's flagship model Claude 3.7 Sonnet with Extended Thinking. #1 AI model in the world for coding benchmarks, architectural refactoring and interactive Artifacts.",
    features: [
      'Latest Claude 3.7 Sonnet with Extended Thinking',
      'Interactive Artifacts (code, UI, graphics on the fly)',
      '5x higher usage limits than free plan',
      'Perfect for software engineers and writers',
    ],
    warrantyText: '24/7 instant auto-replacement on any issue',
    badge: 'TOP FOR CODE',
    instruction: 'Visit claude.ai and log in with the provided credentials.',
    options: {
      opt_claude_ready: {
        name: 'Ready Account with Warranty',
        description: 'Verified Anthropic account with personal credentials and warranty.',
      },
    },
  },
  'grok-ai': {
    tagline: 'Uncensored real-time AI by xAI with FLUX generation',
    description: "Elon Musk's next-gen AI. Real-time news and trending topics from X, zero ideological censorship, humor mode, and FLUX image generator. Includes X Premium+ blue checkmark.",
    features: [
      'Grok 3 with powerful reasoning engine',
      'Real-time information without delays',
      'Realistic FLUX image generation',
      'X (Twitter) Premium+ verification badge',
    ],
    warrantyText: 'Official connection, 100% account safety',
    badge: 'UNCENSORED',
    instruction: 'Log in to X (Twitter) using the provided token or contact support.',
    options: {
      opt_grok_personal: {
        name: 'Personal Upgrade on your X',
        description: 'Premium+ activated on your personal X profile.',
      },
      opt_grok_ready: {
        name: 'Ready X Premium+ Account',
        description: 'Pre-activated verified profile with Grok AI enabled.',
      },
    },
  },
  'elevenlabs': {
    tagline: 'Realistic voice cloning & generative audio platform',
    description: 'Industry-standard voice synthesis and instant voice cloning. Ideal for YouTube, Shorts, audiobooks, podcasts, and dubbing in 30+ languages.',
    features: [
      'Instant voice cloning from 1 minute of sample',
      'Subtle emotions and human-like intonations',
      'Commercial rights on all generated audio',
      'AI Sound Effects generator included',
    ],
    warrantyText: 'Credit refill and support for full duration',
    badge: 'AI VOICE',
    instruction: 'Log in at elevenlabs.io. Your API key is under Profile -> API Keys.',
    options: {
      opt_eleven_starter: {
        name: 'Starter Plan (30,000 credits)',
        description: '30,000 characters per month, up to 3 custom voice clones.',
      },
      opt_eleven_creator: {
        name: 'Creator Plan (100,000 credits)',
        description: '100,000 characters per month, studio-grade voice clones.',
      },
    },
  },
  'capcut-pro': {
    tagline: 'Auto-captions, AI background removal & 4K render',
    description: 'Top video editor for TikTok, Instagram Reels, and YouTube Shorts. Animated captions, smart background cutout, Pro filters, transitions, and export without watermark.',
    features: [
      'Animated captions with trending styles',
      'AI tools: background removal, auto face touchup',
      '4K 60FPS export without watermark',
      'CapCut Cloud 100GB storage included',
    ],
    warrantyText: '30-day warranty • Multi-device access',
    badge: 'REELS / TIKTOK',
    instruction: 'Log in to CapCut app on PC or mobile with the provided credentials.',
    options: {
      opt_capcut_cloud: {
        name: 'Shared Cloud Pro Account',
        description: 'PC and mobile login, instant access to all Pro features.',
      },
      opt_capcut_personal: {
        name: 'Personal QR Code Login',
        description: 'One-time QR code login directly on your personal device.',
      },
    },
  },
};

export function getLocalizedProduct(product: Product, lang: Language): Product {
  if (lang !== 'en') return product;
  const enData = PRODUCT_EN_DATA[product.id];
  if (!enData) return product;

  return {
    ...product,
    tagline: enData.tagline || product.tagline,
    description: enData.description || product.description,
    features: enData.features || product.features,
    warrantyText: enData.warrantyText || product.warrantyText,
    badge: enData.badge || product.badge,
    instruction: enData.instruction || product.instruction,
    options: product.options.map((opt) => {
      const optEn = enData.options?.[opt.id];
      if (!optEn) return opt;
      return {
        ...opt,
        name: optEn.name || opt.name,
        description: optEn.description || opt.description,
      };
    }),
  };
}
