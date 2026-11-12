import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CheckoutModal } from './components/CheckoutModal';
import { TopUpModal } from './components/TopUpModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { MySubscriptions } from './components/MySubscriptions';
import { ReviewsView } from './components/ReviewsView';
import { ReviewModal } from './components/ReviewModal';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { PolicyModal } from './components/PolicyModal';
import { BottomNav } from './components/BottomNav';
import { AdminAuthModal } from './components/Admin/AdminAuthModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ApiDocsModal } from './components/ApiDocsModal';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_STOCK,
  INITIAL_COUPONS,
  INITIAL_ADMIN_USERS,
  INITIAL_ADMIN_ORDERS,
  INITIAL_ANALYTICS,
  INITIAL_ACTIVITIES,
  INITIAL_METRICS,
  INITIAL_REVIEWS,
  INITIAL_LEADERBOARD,
  INITIAL_DAILY_STREAK,
  INITIAL_STAFF,
} from './data/initialData';
import type {
  ActiveView,
  Category,
  Product,
  ProductCategory,
  ProductOption,
  DurationOption,
  OrderItem,
  TelegramUser,
  StockItem,
  Coupon,
  AdminUser,
  AdminActivity,
  AdminMetrics,
  Review,
  LeaderboardUser,
  DailyStreakState,
  PolicyType,
  StaffMember,
} from './types';
import { initTelegramApp, getTelegramUser, triggerHaptic, isStaffUser } from './utils/telegram';
import { getInitialLanguage, getLocalizedProduct, type Language } from './utils/i18n';
import { Heart, ShoppingBag } from 'lucide-react';

// Storage migration to clean all legacy mock data to fresh 0 baseline
const STORAGE_VERSION_KEY = 'kotik_storage_version';
const CURRENT_STORAGE_VERSION = 'kotik_v8_purge_all_reviews';

if (typeof window !== 'undefined') {
  const currentVer = localStorage.getItem(STORAGE_VERSION_KEY);
  if (currentVer !== CURRENT_STORAGE_VERSION) {
    const keysToPurge = [
      'kotik_orders',
      'kotik_favorites',
      'kotik_reviews',
      'kotik_leaderboard',
      'kotik_products',
      'kotik_stock',
      'kotik_coupons',
      'kotik_admin_users',
      'kotik_admin_orders',
      'kotik_activities',
      'kotik_metrics',
      'kotik_categories',
      'kotik_balance',
    ];
    keysToPurge.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
  }
}

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('shop');
  const [user] = useState<TelegramUser>(() => getTelegramUser());
  const [lang, setLang] = useState<Language>(() => getInitialLanguage());

  const handleToggleLanguage = () => {
    setLang((prev) => {
      const next = prev === 'ru' ? 'en' : 'ru';
      localStorage.setItem('kotik_lang', next);
      return next;
    });
  };

  // Persistent User State (Starts 100% clean with 0)
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('kotik_balance');
    return saved !== null ? parseFloat(saved) : 0.0;
  });

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('kotik_orders');
    return saved !== null ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('kotik_favorites');
    return saved !== null ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('kotik_reviews');
    return saved !== null ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [leaderboard] = useState<Record<string, LeaderboardUser[]>>(() => {
    const saved = localStorage.getItem('kotik_leaderboard');
    return saved !== null ? JSON.parse(saved) : INITIAL_LEADERBOARD;
  });

  const [streakState, setStreakState] = useState<DailyStreakState>(() => {
    const saved = localStorage.getItem('kotik_streak');
    return saved !== null ? JSON.parse(saved) : INITIAL_DAILY_STREAK;
  });

  // Admin Data State (synchronous with storefront)
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kotik_categories');
    return saved !== null ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kotik_products');
    return saved !== null ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('kotik_stock');
    return saved !== null ? JSON.parse(saved) : INITIAL_STOCK;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('kotik_coupons');
    return saved !== null ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('kotik_admin_users');
    return saved !== null ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
  });

  const [adminOrders, setAdminOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('kotik_admin_orders');
    return saved !== null ? JSON.parse(saved) : INITIAL_ADMIN_ORDERS;
  });

  const [activities, setActivities] = useState<AdminActivity[]>(() => {
    const saved = localStorage.getItem('kotik_activities');
    return saved !== null ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [metrics, setMetrics] = useState<AdminMetrics>(() => {
    const saved = localStorage.getItem('kotik_metrics');
    return saved !== null ? JSON.parse(saved) : INITIAL_METRICS;
  });

  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('kotik_staff');
    return saved !== null ? JSON.parse(saved) : INITIAL_STAFF;
  });

  // Calculate if current user has staff permissions (Owner/Admin/Moderator)
  const isStaff = useMemo(() => {
    return isStaffUser(user.id, staffList);
  }, [user.id, staffList]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState<boolean>(false);
  const [checkoutConfig, setCheckoutConfig] = useState<{
    product: Product;
    option: ProductOption;
    duration: DurationOption;
    contact: string;
    totalPrice: number;
  } | null>(null);
  const [successOrder, setSuccessOrder] = useState<OrderItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);

  // Admin Modals
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);

  // Live Inline Storefront Product & Category Handlers
  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProduct(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setSelectedProduct(null);
  };

  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleUpdateCategory = (updatedCat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (selectedCategory === categoryId) {
      setSelectedCategory('all');
    }
  };

  // Initialize Telegram WebApp SDK on mount
  useEffect(() => {
    initTelegramApp();

    // Fetch real SQLite registered users from backend API
    fetch('http://localhost:8080/api/v1/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.users) && data.users.length > 0) {
          const mapped: AdminUser[] = data.users.map((u: any) => ({
            id: `usr-${u.telegram_id}`,
            telegramId: u.telegram_id,
            name: u.first_name || (u.username ? `@${u.username}` : `User ${u.telegram_id}`),
            username: u.username ? `@${u.username}` : `id${u.telegram_id}`,
            balance: u.balance,
            ordersCount: u.orders_count,
            status: 'active',
            registeredAt: u.created_at || new Date().toISOString().split('T')[0],
          }));
          setAdminUsers(mapped);
        }
      })
      .catch(() => {});

    // Fetch real staff members from SQLite to ensure new admins have immediate access
    fetch('http://localhost:8080/api/v1/staff')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.staff) && data.staff.length > 0) {
          const mappedStaff: StaffMember[] = data.staff.map((s: any) => ({
            telegramId: s.telegram_id,
            username: s.username,
            name: s.name,
            role: s.role,
            addedAt: s.added_at,
            addedBy: s.added_by,
          }));
          setStaffList(mappedStaff);
          localStorage.setItem('kotik_staff', JSON.stringify(mappedStaff));
        }
      })
      .catch(() => {});
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('kotik_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('kotik_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('kotik_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('kotik_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('kotik_streak', JSON.stringify(streakState));
  }, [streakState]);

  useEffect(() => {
    localStorage.setItem('kotik_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kotik_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kotik_stock', JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('kotik_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('kotik_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('kotik_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('kotik_admin_orders', JSON.stringify(adminOrders));
  }, [adminOrders]);

  useEffect(() => {
    localStorage.setItem('kotik_metrics', JSON.stringify(metrics));
  }, [metrics]);

  // Favorite toggle
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Localized products based on current active language
  const localizedProducts = useMemo(() => {
    return products.map((p) => getLocalizedProduct(p, lang));
  }, [products, lang]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return localizedProducts.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        item.categoryId === selectedCategory ||
        item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [localizedProducts, searchQuery, selectedCategory]);

  const favoriteProducts = useMemo(() => {
    return localizedProducts.filter((p) => favorites.includes(p.id));
  }, [localizedProducts, favorites]);

  // Handlers for checkout flow
  const handleProceedToCheckout = (config: {
    product: Product;
    option: ProductOption;
    duration: DurationOption;
    contact: string;
    totalPrice: number;
  }) => {
    setSelectedProduct(null);
    setCheckoutConfig(config);
  };

  const handleDeductBalance = (amount: number) => {
    setBalance((prev) => Math.max(0, parseFloat((prev - amount).toFixed(2))));
  };

  const handleAddBalance = (amount: number) => {
    const finalAmount = metrics.x2PromotionActive ? amount * 2 : amount;
    setBalance((prev) => parseFloat((prev + finalAmount).toFixed(2)));

    // Add activity
    const newAct: AdminActivity = {
      id: `act-${Date.now()}`,
      user: `@${user.username || 'kotik_user'}`,
      action: `Пополнил баланс на +$${finalAmount.toFixed(2)}${metrics.x2PromotionActive ? ' (X2 Бонус)' : ''}`,
      time: 'Только что',
      type: 'topup',
    };
    setActivities((prev) => [newAct, ...prev]);

    // Update metrics
    setMetrics((prev) => ({
      ...prev,
      revenue: parseFloat((prev.revenue + finalAmount).toFixed(2)),
    }));
  };

  const handleOrderSuccess = (newOrder: OrderItem) => {
    setOrders((prev) => [newOrder, ...prev]);
    setAdminOrders((prev) => [newOrder, ...prev]);
    setSuccessOrder(newOrder);

    // Update metrics
    setMetrics((prev) => ({
      ...prev,
      ordersCount: prev.ordersCount + 1,
      revenue: parseFloat((prev.revenue + newOrder.totalPrice).toFixed(2)),
      stockCount: Math.max(0, prev.stockCount - 1),
    }));

    // Update stock if matching
    setStock((prev) => {
      const idx = prev.findIndex((s) => s.productId === newOrder.productId && s.status === 'available');
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status: 'sold' };
        return updated;
      }
      return prev;
    });

    // Add activity
    const newAct: AdminActivity = {
      id: `act-${Date.now()}`,
      user: `@${user.username || 'kotik_user'}`,
      action: `Купил ${newOrder.productTitle} ($${newOrder.totalPrice})`,
      time: 'Только что',
      type: 'buy',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Daily Streak Claim
  const handleClaimDailyReward = () => {
    if (streakState.claimedToday) return;

    const currentReward = streakState.rewards.find((r) => r.day === streakState.currentDay);
    const amount = currentReward ? currentReward.amount : 0.05;

    setBalance((prev) => parseFloat((prev + amount).toFixed(2)));
    setStreakState((prev) => ({
      ...prev,
      streakDays: prev.streakDays + 1,
      currentDay: prev.currentDay >= 7 ? 1 : prev.currentDay + 1,
      claimedToday: true,
      lastClaimDate: new Date().toISOString(),
    }));

    // Add activity
    const newAct: AdminActivity = {
      id: `act-${Date.now()}`,
      user: `@${user.username || 'kotik_user'}`,
      action: `Забрал ежедневный бонус (+$${amount.toFixed(2)})`,
      time: 'Только что',
      type: 'topup',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Quest Reward Claim
  const handleClaimQuestReward = (_questId: string, amount: number) => {
    setBalance((prev) => parseFloat((prev + amount).toFixed(2)));
    const newAct: AdminActivity = {
      id: `act-${Date.now()}`,
      user: `@${user.username || 'kotik_user'}`,
      action: `Выполнил задание и получил бонус (+$${amount.toFixed(2)})`,
      time: 'Только что',
      type: 'topup',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Submit Review
  const handleSubmitReview = (newRevData: Omit<Review, 'id' | 'createdAt' | 'sellerReply'>) => {
    const newReview: Review = {
      ...newRevData,
      id: `rev-${Date.now()}`,
      createdAt: 'Только что',
      sellerReply: 'Благодарим за выбор Kotik Store! Ваша поддержка вдохновляет нас 🤍',
    };
    setReviews((prev) => [newReview, ...prev]);

    // Add activity
    const newAct: AdminActivity = {
      id: `act-${Date.now()}`,
      user: `@${newReview.username}`,
      action: `Оставил отзыв 5★ на ${newReview.productName}`,
      time: 'Только что',
      type: 'visit',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#07040d] text-white flex flex-col font-sans selection:bg-fuchsia-500 selection:text-white">
      {/* Sticky Header with Balance & Admin Button */}
      <Header
        user={user}
        balance={balance}
        onOpenTopUp={() => setIsTopUpOpen(true)}
        onOpenAdmin={() => setIsAdminAuthOpen(true)}
        x2PromotionActive={metrics.x2PromotionActive}
        isStaff={isStaff}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pb-28 pt-2">
        {/* VIEW: Shop (Магазин) */}
        {activeView === 'shop' && (
          <div className="space-y-4 animate-fade-in">
            {/* Mascot Banner */}
            <HeroBanner lang={lang} />

            {/* Search & Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isStaff={isStaff}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              lang={lang}
              counts={categories.reduce((acc, cat) => {
                acc[cat.id] =
                  cat.id === 'all'
                    ? products.length
                    : products.filter(
                        (p) => p.categoryId === cat.id || p.category === cat.id
                      ).length;
                return acc;
              }, {} as Record<string, number>)}
            />

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favorites.includes(product.id)}
                    onSelect={() => setSelectedProduct(product)}
                    onToggleFavorite={toggleFavorite}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-3xl bg-white/[0.03] border border-white/10 my-6">
                <p className="text-sm text-white/50 mb-2">
                  {lang === 'en' ? 'No products found' : 'Товары не найдены'}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-fuchsia-500 text-white text-xs font-bold"
                >
                  {lang === 'en' ? 'Reset filters' : 'Сбросить фильтры'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: Orders (Заказы) */}
        {activeView === 'orders' && (
          <div className="pt-2 animate-fade-in">
            <MySubscriptions
              orders={orders}
              onOpenStore={() => setActiveView('shop')}
              lang={lang}
            />
          </div>
        )}

        {/* VIEW: Reviews (Отзывы) */}
        {activeView === 'reviews' && (
          <div className="pt-2 animate-fade-in">
            <ReviewsView
              reviews={reviews}
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
              lang={lang}
            />
          </div>
        )}

        {/* VIEW: Leaderboard (Топ) */}
        {activeView === 'leaderboard' && (
          <div className="pt-2 animate-fade-in">
            <LeaderboardView leaderboardData={leaderboard} lang={lang} />
          </div>
        )}

        {/* VIEW: Wishlist (Избранное) */}
        {activeView === 'wishlist' && (
          <div className="pt-2 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                  <span>{lang === 'en' ? 'Favorite AI Tools' : 'Избранные нейросети'}</span>
                </h2>
                <p className="text-xs text-white/50">
                  {lang === 'en'
                    ? 'Saved subscriptions for quick access'
                    : 'Сохраненные подписки для быстрого доступа'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {favoriteProducts.length}
              </span>
            </div>

            {favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {favoriteProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={true}
                    onSelect={() => setSelectedProduct(product)}
                    onToggleFavorite={toggleFavorite}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white/[0.03] border border-white/10 my-4 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-3">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {lang === 'en' ? 'Wishlist is empty' : 'Список избранного пуст'}
                </h3>
                <p className="text-xs text-white/50 max-w-[240px] mb-4">
                  {lang === 'en'
                    ? 'Click on the heart icon on any product card in the storefront to save it here.'
                    : 'Нажмите на сердечко на карточке товара в витрине, чтобы сохранить его сюда.'}
                </p>
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    setActiveView('shop');
                  }}
                  className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Browse Catalog' : 'Перейти к покупкам'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: Profile (Кабинет) */}
        {activeView === 'profile' && (
          <div className="pt-2 animate-fade-in">
            <ProfileView
              user={user}
              balance={balance}
              ordersCount={orders.length}
              streakState={streakState}
              onClaimDailyReward={handleClaimDailyReward}
              onClaimQuestReward={handleClaimQuestReward}
              onOpenTopUp={() => setIsTopUpOpen(true)}
              onOpenPolicy={(type) => setActivePolicy(type)}
              onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
              x2PromotionActive={metrics.x2PromotionActive}
              isStaff={isStaff}
              onOpenApiDocs={() => setIsApiDocsOpen(true)}
              lang={lang}
            />
          </div>
        )}
      </main>

      {/* Product Drawer (Bottom Sheet) */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProceedToCheckout={handleProceedToCheckout}
        isStaff={isStaff}
        categories={categories}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        lang={lang}
      />

      {/* REST API Live Documentation & Code Samples Modal */}
      <ApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => setIsApiDocsOpen(false)}
        apiKey="ktk_live_9f82d1a3c704e6b5"
      />

      {/* Checkout Confirmation Modal */}
      <CheckoutModal
        orderConfig={checkoutConfig}
        userBalance={balance}
        onDeductBalance={handleDeductBalance}
        onOpenTopUp={() => setIsTopUpOpen(true)}
        onClose={() => setCheckoutConfig(null)}
        onOrderSuccess={handleOrderSuccess}
        lang={lang}
      />

      {/* Balance Top-Up Modal (with X2 support) */}
      {isTopUpOpen && (
        <TopUpModal
          currentBalance={balance}
          onAddBalance={handleAddBalance}
          onClose={() => setIsTopUpOpen(false)}
          x2PromotionActive={metrics.x2PromotionActive}
          lang={lang}
        />
      )}

      {/* Order Success Celebratory Modal */}
      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
        onGoToSubscriptions={() => {
          setSuccessOrder(null);
          setActiveView('orders');
        }}
        lang={lang}
      />

      {/* Review Creation Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        products={products}
        onSubmitReview={handleSubmitReview}
      />

      {/* Policies & Rules Modal */}
      <PolicyModal
        isOpen={activePolicy !== null}
        type={activePolicy}
        onClose={() => setActivePolicy(null)}
        lang={lang}
      />

      {/* Admin Auth Modal (Master Passcode) */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Master Admin Dashboard Modal (16 ZykoStore cards + Staff Management) */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        categories={categories}
        onUpdateCategories={setCategories}
        products={products}
        onUpdateProducts={setProducts}
        stock={stock}
        onUpdateStock={setStock}
        coupons={coupons}
        onUpdateCoupons={setCoupons}
        users={adminUsers}
        onUpdateUsers={setAdminUsers}
        orders={adminOrders}
        onUpdateOrders={setAdminOrders}
        analytics={INITIAL_ANALYTICS}
        activities={activities}
        metrics={metrics}
        onUpdateMetrics={setMetrics}
        staff={staffList}
        onUpdateStaff={setStaffList}
      />

      {/* Floating Bottom Navigation (6 ZykoStore tabs) */}
      <BottomNav
        activeView={activeView}
        onChangeView={setActiveView}
        ordersCount={orders.length}
        wishlistCount={favorites.length}
        isAdmin={isStaff}
        lang={lang}
      />
    </div>
  );
}

export default App;
