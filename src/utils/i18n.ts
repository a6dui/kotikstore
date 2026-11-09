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
