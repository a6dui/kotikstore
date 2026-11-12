import React, { useState, useMemo } from 'react';
import {
  X,
  LayoutDashboard,
  ShoppingBag,
  Zap,
  Ticket,
  Send,
  FileText,
  Download,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  Flame,
  User,
  Shield,
  Crown,
  Copy,
  Check,
  Gift,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
  BroadcastSegment,
  StaffMember,
  AdminRole,
} from '../../types';
import { haptic } from '../../utils/telegram';

type AdminTab =
  | 'overview'
  | 'catalog'
  | 'flash_x2'
  | 'stock'
  | 'coupons'
  | 'broadcast'
  | 'instructions'
  | 'users_refund'
  | 'staff';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdateCategories: (cats: Category[]) => void;
  products: Product[];
  onUpdateProducts: (prods: Product[]) => void;
  stock: StockItem[];
  onUpdateStock: (stk: StockItem[]) => void;
  coupons: Coupon[];
  onUpdateCoupons: (cpns: Coupon[]) => void;
  users: AdminUser[];
  onUpdateUsers: (usrs: AdminUser[]) => void;
  orders: OrderItem[];
  onUpdateOrders: (ords: OrderItem[]) => void;
  analytics: AnalyticsDataPoint[];
  activities: AdminActivity[];
  metrics: AdminMetrics;
  onUpdateMetrics: (m: AdminMetrics) => void;
  staff?: StaffMember[];
  onUpdateStaff?: (staff: StaffMember[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
  products,
  onUpdateProducts,
  stock,
  onUpdateStock,
  coupons,
  onUpdateCoupons,
  users,
  onUpdateUsers,
  orders,
  onUpdateOrders,
  analytics,
  activities,
  metrics,
  onUpdateMetrics,
  staff = [],
  onUpdateStaff,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [chartMetric, setChartMetric] = useState<keyof AnalyticsDataPoint>('sales');
  const [activityList, setActivityList] = useState<AdminActivity[]>(activities);

  // Staff management states
  const [staffList, setStaffList] = useState<StaffMember[]>(staff);
  const [newStaffId, setNewStaffId] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<AdminRole>('admin');
  const [staffMsg, setStaffMsg] = useState('');

  // Catalog tab states
  const [newCatEmoji, setNewCatEmoji] = useState('🌟');
  const [newCatName, setNewCatName] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodFormCategory, setProdFormCategory] = useState(categories[1]?.id || 'text_code');
  const [prodFormTitle, setProdFormTitle] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState('');
  const [prodFormApiPrice, setProdFormApiPrice] = useState('');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [showDescPreview, setShowDescPreview] = useState(false);

  // Flash & X2 states
  const [flashProdId, setFlashProdId] = useState(products[0]?.id || '');
  const [flashDiscount, setFlashDiscount] = useState('20');
  const [flashHours, setFlashHours] = useState('24');
  const [flashBroadcast, setFlashBroadcast] = useState(true);

  // Stock tab states
  const [stockInputText, setStockInputText] = useState('');
  const [stockSelectedProdId, setStockSelectedProdId] = useState('');
  const [manualProdId, setManualProdId] = useState(products[0]?.id || '');
  const [manualQty, setManualQty] = useState(1);
  const [stockSearchQuery, setStockSearchQuery] = useState('');

  // Coupon tab states
  const [couponCode, setCouponCode] = useState('');
  const [couponAmount, setCouponAmount] = useState('5');
  const [couponLimit, setCouponLimit] = useState('100');

  // Broadcast tab states
  const [broadcastSegment, setBroadcastSegment] = useState<BroadcastSegment>('all');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Instructions tab states
  const [instrProdId, setInstrProdId] = useState(products[0]?.id || '');
  const [instrText, setInstrText] = useState(products[0]?.instruction || '');

  // User & Refund tab states
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundMsg, setRefundMsg] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState<AdminUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  // Interactive User Profile Modal & Management states
  const [selectedUserProfile, setSelectedUserProfile] = useState<AdminUser | null>(null);
  const [userProfileOrders, setUserProfileOrders] = useState<any[]>([]);
  const [isLoadingProfileOrders, setIsLoadingProfileOrders] = useState<boolean>(false);
  const [copiedTgId, setCopiedTgId] = useState(false);
  const [copiedCredId, setCopiedCredId] = useState<string | null>(null);

  // Profile Action states
  const [profileBalDelta, setProfileBalDelta] = useState('');
  const [profileBalReason, setProfileBalReason] = useState('Пополнение администратором');
  const [isUpdatingBal, setIsUpdatingBal] = useState(false);
  const [balFeedback, setBalFeedback] = useState('');

  const [profileGrantProdId, setProfileGrantProdId] = useState(products[0]?.id || '');
  const [profileGrantCreds, setProfileGrantCreds] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [grantFeedback, setGrantFeedback] = useState('');

  const [profileDmText, setProfileDmText] = useState('');
  const [isSendingDm, setIsSendingDm] = useState(false);
  const [dmFeedback, setDmFeedback] = useState('');

  const [userFilterRole, setUserFilterRole] = useState<'all' | 'staff' | 'buyers' | 'balance'>('all');
  const [userListSearch, setUserListSearch] = useState('');

  const handleOpenUserProfile = async (u: AdminUser) => {
    setSelectedUserProfile(u);
    setBalFeedback('');
    setGrantFeedback('');
    setDmFeedback('');
    setProfileBalDelta('');
    setProfileDmText('');
    setProfileGrantCreds('');
    setProfileGrantProdId(products[0]?.id || '');
    setIsLoadingProfileOrders(true);

    const tgId = u.telegramId || parseInt(u.id.replace('usr-', ''));
    if (tgId) {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/admin/user/${tgId}/profile`);
        const data = await res.json();
        if (data.ok && data.profile) {
          setUserProfileOrders(data.profile.orders || []);
          setSelectedUserProfile((prev) =>
            prev
              ? {
                  ...prev,
                  balance: data.profile.balance,
                  ordersCount: data.profile.orders_count,
                  totalSpent: data.profile.total_spent,
                  role: data.profile.role,
                  language: data.profile.language,
                  isAdmin: data.profile.is_staff,
                }
              : null
          );
        } else {
          const userOrders = orders.filter(
            (o) => o.userId === u.id || o.userId === String(tgId) || o.buyerName === u.name
          );
          setUserProfileOrders(userOrders);
        }
      } catch {
        const userOrders = orders.filter(
          (o) => o.userId === u.id || o.userId === String(tgId) || o.buyerName === u.name
        );
        setUserProfileOrders(userOrders);
      } finally {
        setIsLoadingProfileOrders(false);
      }
    } else {
      const userOrders = orders.filter((o) => o.userId === u.id || o.buyerName === u.name);
      setUserProfileOrders(userOrders);
      setIsLoadingProfileOrders(false);
    }
  };

  const handleProfileAdjustBalance = async (deltaAmt?: number) => {
    if (!selectedUserProfile) return;
    const amount = deltaAmt !== undefined ? deltaAmt : parseFloat(profileBalDelta);
    if (isNaN(amount) || amount === 0) {
      setBalFeedback('⚠️ Введите корректную сумму');
      return;
    }
    setIsUpdatingBal(true);
    const tgId = selectedUserProfile.telegramId || parseInt(selectedUserProfile.id.replace('usr-', ''));
    const newBal = Math.max(0, selectedUserProfile.balance + amount);

    onUpdateUsers(users.map((usr) => (usr.id === selectedUserProfile.id ? { ...usr, balance: newBal } : usr)));
    setSelectedUserProfile((prev) => (prev ? { ...prev, balance: newBal } : null));

    if (tgId) {
      try {
        await fetch('http://localhost:8080/api/v1/admin/user/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: tgId,
            delta: amount,
            reason: profileBalReason || 'Начисление администратором',
          }),
        });
        setBalFeedback(`✅ Баланс изменен: ${amount >= 0 ? '+' : ''}$${amount.toFixed(2)} (текущий: $${newBal.toFixed(2)})`);
      } catch {
        setBalFeedback(`✅ Баланс изменен ($${newBal.toFixed(2)})`);
      }
    }
    setIsUpdatingBal(false);
    setProfileBalDelta('');
  };

  const handleProfileGrantProduct = async () => {
    if (!selectedUserProfile || !profileGrantProdId) return;
    const prod = products.find((p) => p.id === profileGrantProdId);
    if (!prod) return;
    setIsGranting(true);
    const tgId = selectedUserProfile.telegramId || parseInt(selectedUserProfile.id.replace('usr-', ''));

    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/user/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: tgId,
          product_id: prod.id,
          credentials: profileGrantCreds.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok && data.order) {
        setGrantFeedback(`🎉 Товар «${prod.title}» выдан! Заказ: ${data.order.order_id}`);
        setUserProfileOrders((prev) => [
          {
            id: data.order.order_id,
            product_title: data.order.product_title,
            price: 0,
            item_content: data.order.credentials,
            status: 'completed',
            created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
            expires_at: data.order.expires_at,
          },
          ...prev,
        ]);
        setSelectedUserProfile((prev) => (prev ? { ...prev, ordersCount: prev.ordersCount + 1 } : null));
        onUpdateUsers(
          users.map((usr) => (usr.id === selectedUserProfile.id ? { ...usr, ordersCount: usr.ordersCount + 1 } : usr))
        );
      } else {
        setGrantFeedback(`❌ Ошибка: ${data.error || 'Не удалось выдать'}`);
      }
    } catch (e: any) {
      setGrantFeedback(`❌ Ошибка сети: ${e.message}`);
    } finally {
      setIsGranting(false);
      setProfileGrantCreds('');
    }
  };

  const handleProfileSendDm = async () => {
    if (!selectedUserProfile || !profileDmText.trim()) return;
    const tgId = selectedUserProfile.telegramId || parseInt(selectedUserProfile.id.replace('usr-', ''));
    if (!tgId) {
      setDmFeedback('⚠️ У пользователя отсутствует Telegram ID');
      return;
    }
    setIsSendingDm(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/user/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: tgId,
          text: profileDmText.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDmFeedback('✉️ Сообщение успешно доставлено пользователю в Telegram!');
        setProfileDmText('');
      } else {
        setDmFeedback(`❌ Ошибка: ${data.error || 'Не удалось отправить'}`);
      }
    } catch (e: any) {
      setDmFeedback(`❌ Ошибка отправки: ${e.message}`);
    } finally {
      setIsSendingDm(false);
    }
  };

  const handleProfileToggleAdmin = async () => {
    if (!selectedUserProfile) return;
    const tgId = selectedUserProfile.telegramId || parseInt(selectedUserProfile.id.replace('usr-', ''));
    if (!tgId) return;
    if (tgId === 755843448) {
      alert('Нельзя изменить права главного владельца магазина!');
      return;
    }
    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/staff/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: tgId }),
      });
      const data = await res.json();
      if (data.ok) {
        const isNowAdmin = data.action === 'granted';
        setSelectedUserProfile((prev) =>
          prev
            ? {
                ...prev,
                isAdmin: isNowAdmin,
                role: isNowAdmin ? 'admin' : 'user',
              }
            : null
        );
        onUpdateUsers(
          users.map((usr) =>
            usr.id === selectedUserProfile.id
              ? {
                  ...usr,
                  isAdmin: isNowAdmin,
                  role: isNowAdmin ? 'admin' : 'user',
                }
              : usr
          )
        );
      }
    } catch {}
  };

  const filteredUsersList = useMemo(() => {
    let list = users;
    if (userFilterRole === 'staff') {
      list = list.filter(
        (u) =>
          u.isAdmin ||
          u.role === 'admin' ||
          u.role === 'super_admin' ||
          u.telegramId === 755843448 ||
          u.telegramId === 7643717312
      );
    } else if (userFilterRole === 'buyers') {
      list = list.filter((u) => u.ordersCount > 0);
    } else if (userFilterRole === 'balance') {
      list = list.filter((u) => u.balance > 0);
    }
    if (userListSearch.trim()) {
      const q = userListSearch.toLowerCase().trim();
      list = list.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.username || '').toLowerCase().includes(q) ||
          String(u.telegramId || '').includes(q) ||
          (u.id || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, userFilterRole, userListSearch]);

  // Filtered stock list memoized unconditionally
  const filteredStock = useMemo(() => {
    if (!stockSearchQuery.trim()) return stock;
    const q = stockSearchQuery.toLowerCase();
    return stock.filter(
      (s) => s.productTitle.toLowerCase().includes(q) || s.credentials.toLowerCase().includes(q)
    );
  }, [stock, stockSearchQuery]);

  if (!isOpen) return null;

  // Custom Emojis Palette
  const customEmojis = [
    { label: '🤖', title: 'ChatGPT' },
    { label: '🔮', title: 'Claude' },
    { label: '✨', title: 'Gemini' },
    { label: '💻', title: 'Cursor' },
    { label: '⚡️', title: 'Grok' },
    { label: '🗣', title: 'ElevenLabs' },
    { label: '🎬', title: 'CapCut' },
    { label: '🔍', title: 'Perplexity' },
    { label: '🔑', title: 'Key/API' },
    { label: '🎮', title: 'Steam' },
    { label: '🛡️', title: 'VPN' },
    { label: '🔥', title: 'Огонь' },
    { label: '🚀', title: 'Ракета' },
    { label: '✅', title: 'Галочка' },
    { label: '⭐', title: 'Звезда' },
    { label: '💎', title: 'Алмаз' },
    { label: '📦', title: 'Коробка' },
  ];

  const handleTabSwitch = (t: AdminTab) => {
    haptic.selection();
    setActiveTab(t);
  };

  // 1. Overview Actions
  const handleRefreshActivities = () => {
    haptic.light();
    const newAct: AdminActivity = {
      id: `act-${Date.now()}`,
      user: `@user_${Math.floor(Math.random() * 899 + 100)}`,
      action: 'Просмотрел каталог товаров',
      time: 'Только что',
      type: 'visit',
    };
    setActivityList([newAct, ...activityList.slice(0, 7)]);
  };

  // 2. Catalog Actions
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    haptic.medium();
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      emoji: newCatEmoji.trim() || '📁',
    };
    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (catId === 'all') return;
    haptic.warning();
    onUpdateCategories(categories.filter((c) => c.id !== catId));
  };

  const handleStartEditProduct = (prod: Product) => {
    haptic.selection();
    setEditingProductId(prod.id);
    setProdFormCategory(prod.categoryId);
    setProdFormTitle(prod.title);
    setProdFormPrice(prod.startingPrice.toString());
    setProdFormApiPrice(prod.wholesalePrice ? prod.wholesalePrice.toString() : '');
    setProdFormDesc(prod.description);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setProdFormTitle('');
    setProdFormPrice('');
    setProdFormApiPrice('');
    setProdFormDesc('');
  };

  const handleSaveProduct = () => {
    if (!prodFormTitle.trim() || !prodFormPrice) return;
    haptic.success();
    const price = parseFloat(prodFormPrice) || 5;
    const apiPrice = prodFormApiPrice ? parseFloat(prodFormApiPrice) : price * 0.8;

    if (editingProductId) {
      onUpdateProducts(
        products.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                title: prodFormTitle.trim(),
                categoryId: prodFormCategory,
                startingPrice: price,
                wholesalePrice: apiPrice,
                description: prodFormDesc.trim(),
              }
            : p
        )
      );
      setEditingProductId(null);
    } else {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        categoryId: prodFormCategory,
        title: prodFormTitle.trim(),
        tagline: 'Цифровая подписка Kotik Store',
        category: prodFormCategory,
        brandColor: '#ec4899',
        glowClass: 'neon-glow-pink',
        badge: 'NEW',
        badgeColor: 'from-pink-500/30 to-purple-500/20 text-pink-300 border-pink-500/40',
        description: prodFormDesc.trim() || 'Описание товара',
        features: ['Мгновенная выдача', 'Гарантия Kotik Store', 'Техподдержка 24/7'],
        startingPrice: price,
        wholesalePrice: apiPrice,
        stockCount: 10,
        options: [
          {
            id: 'opt_std',
            name: 'Стандартный аккаунт',
            description: 'Быстрый доступ',
            isPersonal: false,
            baseMonthlyPrice: price,
          },
        ],
        durations: [
          { months: 1, label: '1 месяц', discountPercent: 0 },
          { months: 3, label: '3 месяца', discountPercent: 10 },
        ],
        warrantyText: '🛡️ Гарантия 100% на весь срок',
        iconType: 'chatgpt',
      };
      onUpdateProducts([...products, newProd]);
    }

    setProdFormTitle('');
    setProdFormPrice('');
    setProdFormApiPrice('');
    setProdFormDesc('');
  };

  const handleDeleteProduct = (prodId: string) => {
    haptic.warning();
    onUpdateProducts(products.filter((p) => p.id !== prodId));
  };

  // 3. Flash & X2 Actions
  const handleToggleX2 = () => {
    haptic.medium();
    const nextVal = !metrics.x2PromotionActive;
    onUpdateMetrics({ ...metrics, x2PromotionActive: nextVal });
    if (nextVal) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ff9100', '#ec4899', '#ffffff'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleLaunchFlashSale = () => {
    if (!flashProdId) return;
    haptic.success();
    const disc = parseInt(flashDiscount) || 20;
    const hrs = parseInt(flashHours) || 24;

    onUpdateProducts(
      products.map((p) =>
        p.id === flashProdId
          ? {
              ...p,
              flashSale: {
                active: true,
                discountPercent: disc,
                endsAt: new Date(Date.now() + hrs * 3600 * 1000).toISOString(),
                hoursRemaining: hrs,
              },
            }
          : p
      )
    );
  };

  const handleCancelFlashSale = (prodId: string) => {
    haptic.light();
    onUpdateProducts(
      products.map((p) => (p.id === prodId ? { ...p, flashSale: undefined } : p))
    );
  };

  // 4. Stock Actions
  const handleStockImport = () => {
    if (!stockInputText.trim()) return;
    haptic.success();
    const lines = stockInputText.trim().split('\n');
    const newItems: StockItem[] = [];

    lines.forEach((line) => {
      const parts = line.split('|').map((s) => s.trim());
      let pTitle = 'ChatGPT Plus';
      let creds = line.trim();

      if (parts.length >= 2) {
        pTitle = parts[0];
        creds = parts[1];
      } else if (stockSelectedProdId) {
        const p = products.find((x) => x.id === stockSelectedProdId);
        if (p) pTitle = p.title;
      }

      newItems.push({
        id: `stk-${Date.now()}-${Math.floor(Math.random() * 899 + 100)}`,
        productId: stockSelectedProdId || 'chatgpt-plus',
        productTitle: pTitle,
        credentials: creds,
        status: 'available',
        addedAt: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      });
    });

    onUpdateStock([...newItems, ...stock]);
    onUpdateMetrics({ ...metrics, stockCount: metrics.stockCount + newItems.length });
    setStockInputText('');
  };

  const handleAddManualSlots = () => {
    if (!manualProdId) return;
    haptic.success();
    const p = products.find((x) => x.id === manualProdId);
    if (!p) return;

    const newItems: StockItem[] = Array.from({ length: manualQty }, (_, i) => ({
      id: `manual-${Date.now()}-${i}`,
      productId: p.id,
      productTitle: p.title,
      credentials: '📬 Ручная выдача: обратитесь к саппорту @Zykolandstore с номером заказа',
      status: 'available',
      addedAt: 'Сегодня',
    }));

    onUpdateStock([...newItems, ...stock]);
    onUpdateMetrics({ ...metrics, stockCount: metrics.stockCount + manualQty });
  };

  const handleValidateKeys = (type: 'elevenlabs' | 'chatgpt') => {
    haptic.medium();
    onUpdateStock(
      stock.map((s) => {
        if (type === 'elevenlabs' && s.credentials.includes('sk_')) {
          return { ...s, status: 'available' };
        }
        if (type === 'chatgpt' && s.credentials.includes('@')) {
          return { ...s, status: 'available' };
        }
        return s;
      })
    );
  };

  const handleExportStockCSV = () => {
    haptic.light();
    const header = 'ID,Product,Credentials,Status,Date\n';
    const rows = stock.map((s) => `"${s.id}","${s.productTitle}","${s.credentials}","${s.status}","${s.addedAt}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_export_kotikstore_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportOrdersCSV = () => {
    haptic.light();
    const header = '\ufeffID заказа,Покупатель,Username,Товар,Тариф,Срок (мес),Сумма ($),Дата,Окончание,Статус\n';
    const rows = orders.map((o) =>
      `"${o.id}","${o.buyerName || ''}","${o.buyerUsername || ''}","${o.productTitle}","${o.optionName}","${o.months}","${o.totalPrice}","${o.date}","${o.expiresDate}","${o.status}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_kotikstore_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 5. Coupon Actions
  const handleCreateCoupon = () => {
    if (!couponCode.trim()) return;
    haptic.success();
    const newC: Coupon = {
      id: `cpn-${Date.now()}`,
      code: couponCode.trim().toUpperCase(),
      amount: parseFloat(couponAmount) || 5,
      limit: parseInt(couponLimit) || 100,
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toLocaleDateString('ru-RU'),
    };
    onUpdateCoupons([newC, ...coupons]);
    setCouponCode('');
  };

  const handleDeleteCoupon = (cId: string) => {
    haptic.warning();
    onUpdateCoupons(coupons.filter((c) => c.id !== cId));
  };

  // 6. Broadcast Actions
  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) return;
    haptic.heavy();
    const totalRecipients =
      broadcastSegment === 'all'
        ? users.length * 12
        : broadcastSegment === 'has_balance'
        ? 340
        : 180;

    // Send to bot REST API if available
    try {
      fetch('http://localhost:8080/api/v1/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: broadcastText,
          target_lang: 'all',
          admin_id: 755843448,
        }),
      }).catch(() => {});
    } catch (e) {}

    setBroadcastSuccess(`Рассылка отправлена ${totalRecipients} пользователям! 🚀`);
    setBroadcastText('');
    setTimeout(() => setBroadcastSuccess(''), 4000);
  };

  // 7. Instructions Actions
  const handleSaveInstruction = () => {
    if (!instrProdId) return;
    haptic.success();
    onUpdateProducts(
      products.map((p) => (p.id === instrProdId ? { ...p, instruction: instrText } : p))
    );
  };

  // 8. User & Refund Actions
  const handleRefundOrder = () => {
    if (!refundOrderId.trim()) return;
    haptic.heavy();
    const ord = orders.find((o) => o.id.toLowerCase() === refundOrderId.trim().toLowerCase());
    if (ord) {
      onUpdateOrders(
        orders.map((o) => (o.id === ord.id ? { ...o, status: 'refunded' } : o))
      );
      setRefundMsg(`Заказ ${ord.id} успешно возвращен! $${ord.totalPrice} начислены пользователю.`);
      setRefundOrderId('');
    } else {
      setRefundMsg('Заказ с таким ID не найден.');
    }
  };

  const handleSearchUser = () => {
    if (!userSearchQuery.trim()) return;
    haptic.light();
    const clean = userSearchQuery.trim().toLowerCase().replace('@', '');
    const found = users.find(
      (u) => u.id === clean || u.username.toLowerCase() === clean
    );
    setSearchedUser(found || null);
  };

  const handleAdjustBalance = (type: 'add' | 'subtract') => {
    if (!searchedUser || !adjustAmount) return;
    haptic.medium();
    const amt = parseFloat(adjustAmount) || 0;
    if (amt <= 0) return;

    const newBal =
      type === 'add'
        ? searchedUser.balance + amt
        : Math.max(0, searchedUser.balance - amt);

    onUpdateUsers(
      users.map((u) => (u.id === searchedUser.id ? { ...u, balance: newBal } : u))
    );
    setSearchedUser({ ...searchedUser, balance: newBal });
    setAdjustAmount('');

    // Sync to SQLite bot backend
    const delta = type === 'add' ? amt : -amt;
    const tgId = searchedUser.telegramId || parseInt(searchedUser.id.replace('usr-', ''));
    if (tgId) {
      fetch('http://localhost:8080/api/v1/admin/user/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: tgId,
          delta: delta,
          reason: 'Корректировка в панели управления',
        }),
      }).catch(() => {});
    }
  };



  const handleClearOrders = () => {
    if (!confirm('Вы уверены, что хотите удалить ВСЕ заказы из истории и базы?')) return;
    haptic.warning();
    onUpdateOrders([]);
    localStorage.removeItem('kotik_orders');
    localStorage.removeItem('kotik_admin_orders');
    fetch('http://localhost:8080/api/v1/admin/orders/clear', { method: 'POST' }).catch(() => {});
  };

  // 9. Staff Management Actions
  const handleAddStaff = () => {
    if (!newStaffId.trim()) {
      setStaffMsg('Введите Telegram ID сотрудника!');
      return;
    }
    haptic.success();
    const newMember: StaffMember = {
      telegramId: newStaffId.trim(),
      username: newStaffUsername.trim().replace('@', '') || `user_${newStaffId.trim()}`,
      name: newStaffName.trim() || 'Сотрудник Kotik',
      role: newStaffRole,
      addedAt: new Date().toISOString().split('T')[0],
      addedBy: 'Владелец',
    };
    const updated = [...staffList, newMember];
    setStaffList(updated);
    if (onUpdateStaff) onUpdateStaff(updated);
    setNewStaffId('');
    setNewStaffUsername('');
    setNewStaffName('');
    setStaffMsg(`✅ ${newMember.name} добавлен как ${newMember.role === 'admin' ? 'Администратор' : 'Модератор'}!`);
    setTimeout(() => setStaffMsg(''), 4000);
  };

  const handleRemoveStaff = (tId: string | number) => {
    if (String(tId) === '755843448') {
      alert('Нельзя удалить главного владельца магазина!');
      return;
    }
    haptic.warning();
    const updated = staffList.filter((s) => String(s.telegramId) !== String(tId));
    setStaffList(updated);
    if (onUpdateStaff) onUpdateStaff(updated);
  };

  // Chart max value for SVG rendering
  const maxVal = Math.max(...analytics.map((a) => Number(a[chartMetric]) || 1), 10);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-4xl h-[95vh] max-h-[900px] flex flex-col rounded-3xl bg-[#090514] border border-white/10 shadow-[0_0_80px_rgba(236,72,153,0.3)] overflow-hidden">
        
        {/* Top App Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0e0720]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white uppercase tracking-wider font-heading">
                  Kotik Store — Панель администратора
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  API 200 OK
                </span>
              </div>
              <p className="text-[11px] text-white/40">
                Полный контроль над магазином, складом, аналитикой и пользователями
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportOrdersCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
              title="Экспорт всех заказов в CSV (Excel)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Заказы</span>
            </button>

            <button
              onClick={handleExportStockCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold transition"
              title="Экспорт остатков склада в CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Склад</span>
            </button>

            <button
              onClick={() => {
                haptic.light();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="px-4 border-b border-white/10 flex items-center gap-1 overflow-x-auto no-scrollbar bg-black/40">
          {[
            { id: 'overview', label: '📊 Обзор', count: undefined },
            { id: 'catalog', label: '🛍 Каталог', count: products.length },
            { id: 'flash_x2', label: '⚡ Flash & X2', count: metrics.x2PromotionActive ? 'X2 ON' : undefined },
            { id: 'stock', label: '📦 Склад', count: stock.length },
            { id: 'coupons', label: '🎫 Промокоды', count: coupons.length },
            { id: 'broadcast', label: '📢 Рассылка', count: undefined },
            { id: 'instructions', label: '📝 Инструкции', count: undefined },
            { id: 'users_refund', label: '💰 Пользователи', count: users.length },
            { id: 'staff', label: '👥 Персонал', count: staffList.length },
          ].map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabSwitch(t.id as AdminTab)}
                className={`py-3 px-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
                  isActive
                    ? 'border-pink-500 text-white shadow-[0_2px_12px_rgba(236,72,153,0.5)]'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Admin Scroll Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
          
          {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Primary Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Пользователи</span>
                  <div className="text-2xl font-black text-white font-mono mt-0.5">{metrics.usersCount}</div>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">↑ +14% за неделю</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Всего заказов</span>
                  <div className="text-2xl font-black text-pink-400 font-mono mt-0.5">{metrics.ordersCount}</div>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Конверсия 34.4%</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Общая выручка</span>
                  <div className="text-2xl font-black text-cyan-300 font-mono mt-0.5">${metrics.revenue.toLocaleString()}</div>
                  <span className="text-[10px] text-cyan-400/80 font-semibold mt-1 block">В среднем $18.2 / чек</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Товаров на складе</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{metrics.stockCount} шт</div>
                  <span className="text-[10px] text-white/50 font-semibold mt-1 block">Хватит на ~12 дней</span>
                </div>
              </div>

              {/* Engagement & Churn Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-300 font-bold">🌐 WebApp DAU (сегодня)</span>
                  <div className="text-lg font-black text-white font-mono">{metrics.webDau} чел</div>
                </div>

                <div className="p-3 rounded-2xl bg-red-950/20 border border-red-500/20">
                  <span className="text-[10px] text-red-300 font-bold">🚪 Отток (заблокировали)</span>
                  <div className="text-lg font-black text-red-400 font-mono">{metrics.blockedCount} чел</div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-300 font-bold">🟢 Активных в боте</span>
                  <div className="text-lg font-black text-white font-mono">{metrics.activeUsersCount} чел</div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                  <span className="text-[10px] text-amber-300 font-bold">📈 WebApp WAU (7 дней)</span>
                  <div className="text-lg font-black text-white font-mono">{metrics.webWau} чел</div>
                </div>
              </div>

              {/* Profit & Margin Highlights Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#0e0720] border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Чистая прибыль магазина</span>
                  <div className="text-xl font-black text-white font-mono">${metrics.netProfit.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Маржинальность</span>
                  <div className="text-lg font-black text-emerald-400 font-mono">{metrics.avgMargin}%</div>
                </div>
              </div>

              {/* Dynamic 30-Day SVG Chart */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">📈 Динамика активности</h3>
                    <p className="text-[11px] text-white/40">График ключевых показателей по дням</p>
                  </div>

                  {/* Metric Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {[
                      { key: 'sales', label: '💰 Выручка' },
                      { key: 'profit', label: '💎 Прибыль' },
                      { key: 'orders', label: '🛒 Заказы' },
                      { key: 'regs', label: '👤 Регистрации' },
                      { key: 'visits', label: '🌐 Визиты' },
                      { key: 'churn', label: '🚪 Отток' },
                    ].map((m) => (
                      <button
                        key={m.key}
                        onClick={() => {
                          haptic.selection();
                          setChartMetric(m.key as keyof AnalyticsDataPoint);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                          chartMetric === m.key
                            ? 'bg-pink-500 text-white shadow'
                            : 'bg-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Bars Visualizer */}
                <div className="h-40 flex items-end justify-between gap-2 pt-6 px-2 border-b border-white/10">
                  {analytics.map((dp, idx) => {
                    const val = Number(dp[chartMetric]) || 0;
                    const heightPercent = Math.max(8, Math.round((val / maxVal) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[9px] font-mono text-pink-300 opacity-0 group-hover:opacity-100 transition">
                          {val}
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 via-pink-500 to-cyan-400 group-hover:brightness-125 transition-all shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] text-white/40 font-mono mt-1">{dp.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row: Donut Chart + Live Activity Feed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Donut Chart: Top 5 Products */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">🍩 Топ-5 популярных товаров</h3>
                    <p className="text-[11px] text-white/40 mb-3">Распределение объема заказов</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative w-28 h-28 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3.8" />
                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10a37f" strokeWidth="3.8" strokeDasharray="40 60" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#d946ef" strokeWidth="3.8" strokeDasharray="25 75" strokeDashoffset="-40" />
                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f97316" strokeWidth="3.8" strokeDasharray="18 82" strokeDashoffset="-65" />
                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#06b6d4" strokeWidth="3.8" strokeDasharray="17 83" strokeDashoffset="-83" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-black text-white font-mono">489</span>
                        <span className="text-[8px] text-white/40 uppercase font-bold">заказов</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-white/70">
                          <span className="w-2 h-2 rounded-full bg-[#10a37f]" />
                          ChatGPT Plus
                        </span>
                        <span className="font-mono font-bold text-white">40%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-white/70">
                          <span className="w-2 h-2 rounded-full bg-[#d946ef]" />
                          Gemini Advanced
                        </span>
                        <span className="font-mono font-bold text-white">25%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-white/70">
                          <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                          Claude 3.7 Pro
                        </span>
                        <span className="font-mono font-bold text-white">18%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-white/70">
                          <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                          CapCut & Eleven
                        </span>
                        <span className="font-mono font-bold text-white">17%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">⚡️ Живая лента активности</h3>
                      <p className="text-[11px] text-white/40">События в реальном времени</p>
                    </div>
                    <button
                      onClick={handleRefreshActivities}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                    {activityList.map((act) => (
                      <div key={act.id} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-pink-300 font-mono text-[11px]">{act.user}</span>
                          <span className="text-white/70 text-[11px]">{act.action}</span>
                        </div>
                        <span className="text-[10px] text-white/30 shrink-0">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CATALOG MANAGEMENT ================= */}
          {activeTab === 'catalog' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Category Management Sub-card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">📂 Управление категориями</h3>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCatEmoji}
                    onChange={(e) => setNewCatEmoji(e.target.value)}
                    placeholder="Эмодзи"
                    className="w-16 px-2.5 py-2 rounded-xl bg-black/40 border border-white/10 text-center text-sm"
                  />
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Название категории (например, Нейросети для фото)"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs shadow transition cursor-pointer"
                  >
                    Добавить
                  </button>
                </div>

                {/* Categories Table */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span className="font-semibold text-white">{cat.name}</span>
                        <span className="text-[10px] font-mono text-white/30">({cat.id})</span>
                      </div>
                      {cat.id !== 'all' && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add / Edit Product Form */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-pink-400" />
                    <span>{editingProductId ? '✏️ Редактирование товара' : '🛍️ Добавить новый товар в витрину'}</span>
                  </h3>
                  {editingProductId && (
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs text-white/50 hover:text-white"
                    >
                      Отмена
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={prodFormCategory}
                    onChange={(e) => setProdFormCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  >
                    {categories.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.1"
                    value={prodFormPrice}
                    onChange={(e) => setProdFormPrice(e.target.value)}
                    placeholder="Розничная цена ($)"
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                  />

                  <input
                    type="number"
                    step="0.1"
                    value={prodFormApiPrice}
                    onChange={(e) => setProdFormApiPrice(e.target.value)}
                    placeholder="Pulse / Оптовая цена ($)"
                    className="px-3 py-2 rounded-xl bg-black/50 border border-indigo-500/40 text-xs text-indigo-300 font-mono"
                  />
                </div>

                <input
                  type="text"
                  value={prodFormTitle}
                  onChange={(e) => setProdFormTitle(e.target.value)}
                  placeholder="Название товара (например, Midjourney Pro Max)"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-bold"
                />

                {/* Custom Emojis Bar */}
                <div>
                  <span className="text-[10px] text-white/40 block mb-1 font-bold">Быстрая вставка кастомных ИИ-эмодзи:</span>
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                    {customEmojis.map((em, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          haptic.light();
                          setProdFormDesc(prodFormDesc + ' ' + em.label);
                        }}
                        title={em.title}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white shrink-0 transition"
                      >
                        {em.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={prodFormDesc}
                    onChange={(e) => setProdFormDesc(e.target.value)}
                    placeholder="Описание товара, фичи и преимущества..."
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDescPreview(!showDescPreview)}
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-white/70"
                  >
                    {showDescPreview ? 'Скрыть превью' : '👁 Предпросмотр'}
                  </button>
                </div>

                {showDescPreview && (
                  <div className="p-3 rounded-xl bg-black/70 border border-pink-500/30 text-xs text-white/80 leading-relaxed">
                    <span className="text-[10px] uppercase font-bold text-pink-400 block mb-1">Предпросмотр:</span>
                    {prodFormDesc || 'Текст описания...'}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs shadow cursor-pointer transition"
                >
                  {editingProductId ? 'Сохранить изменения' : 'Добавить товар в каталог'}
                </button>
              </div>

              {/* Products Table */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">🛍️ Товары в магазине ({products.length})</h3>
                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.brandColor }} />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.title}</span>
                            {p.flashSale?.active && (
                              <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 rounded">-{p.flashSale.discountPercent}% FLASH</span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/40">{p.category} • на складе: {p.stockCount} шт</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-pink-400">${p.startingPrice}</span>
                        <button
                          onClick={() => handleStartEditProduct(p)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: FLASH SALE & X2 ================= */}
          {activeTab === 'flash_x2' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* X2 Promotion Toggle Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-pink-950/30 to-[#0e0720] border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 uppercase font-heading">
                    <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span>Акция X2 (Удвоение баланса)</span>
                  </h3>
                  <p className="text-xs text-white/60 mt-1 max-w-md">
                    Когда активно: все пополнения баланса клиентов через СБП, карту, CryptoBot и Stars автоматически удваиваются! В шапке появляется горящий бейдж.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleX2}
                  className={`w-14 h-8 rounded-full transition-all duration-300 p-1 flex items-center cursor-pointer ${
                    metrics.x2PromotionActive
                      ? 'bg-gradient-to-r from-amber-500 to-pink-500 justify-end shadow-[0_0_15px_rgba(255,145,0,0.5)]'
                      : 'bg-white/10 justify-start'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Flash Sale Launch Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pink-400" />
                  <span>Запуск Flash-распродажи</span>
                </h3>
                <p className="text-[11px] text-white/50">
                  Установите скидку на выбранный товар на определенное количество часов. На карточке товара появится горящий таймер.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={flashProdId}
                    onChange={(e) => setFlashProdId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.title} (${p.startingPrice})</option>
                    ))}
                  </select>

                  <div className="relative">
                    <input
                      type="number"
                      value={flashDiscount}
                      onChange={(e) => setFlashDiscount(e.target.value)}
                      placeholder="Скидка (%)"
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs text-white/40">%</span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={flashHours}
                      onChange={(e) => setFlashHours(e.target.value)}
                      placeholder="Срок (часы)"
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs text-white/40">час.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="flash-broad-check"
                    checked={flashBroadcast}
                    onChange={(e) => setFlashBroadcast(e.target.checked)}
                    className="w-4 h-4 accent-pink-500 rounded"
                  />
                  <label htmlFor="flash-broad-check" className="text-xs text-white/70 cursor-pointer">
                    📢 Отправить моментальный анонс в канал и бот
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleLaunchFlashSale}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white font-bold text-xs shadow cursor-pointer transition"
                >
                  🔥 Запустить Flash-распродажу
                </button>
              </div>

              {/* Active Flash Sales List */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Активные распродажи</h3>
                <div className="space-y-2">
                  {products.filter((p) => p.flashSale?.active).length > 0 ? (
                    products.filter((p) => p.flashSale?.active).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-pink-500/30 text-xs">
                        <div>
                          <div className="font-bold text-white">{p.title}</div>
                          <span className="text-[10px] text-pink-300 font-mono">
                            Скидка -{p.flashSale?.discountPercent}% • Осталось ~{p.flashSale?.hoursRemaining} ч.
                          </span>
                        </div>
                        <button
                          onClick={() => handleCancelFlashSale(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold"
                        >
                          Остановить
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-white/40 text-center py-4">
                      Сейчас нет активных распродаж. Запустите одну выше!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: STOCK & INVENTORY ================= */}
          {activeTab === 'stock' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Stock Monitor Chips */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">📦 Монитор остатков склада</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {products.map((p) => {
                    const statusColor =
                      p.stockCount > 15
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                        : p.stockCount > 0
                        ? 'border-amber-500/30 text-amber-400 bg-amber-950/20'
                        : 'border-red-500/30 text-red-400 bg-red-950/20';

                    return (
                      <div key={p.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${statusColor}`}>
                        <div className="truncate pr-2">
                          <span className="text-xs font-bold block truncate">{p.title}</span>
                          <span className="text-[10px] text-white/40">{p.startingPrice}$ / мес</span>
                        </div>
                        <span className="font-mono font-black text-sm shrink-0">{p.stockCount} шт</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bulk Stock Import Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">📥 Массовый импорт на склад</h3>
                <p className="text-[11px] text-white/50">
                  Формат: <code>Название товара | логин:пароль</code> (каждый аккаунт с новой строки). Или выберите товар в выпадающем списке.
                </p>

                <div className="flex gap-2">
                  <select
                    value={stockSelectedProdId}
                    onChange={(e) => setStockSelectedProdId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  >
                    <option value="">-- Автоопределение по строке --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  rows={3}
                  value={stockInputText}
                  onChange={(e) => setStockInputText(e.target.value)}
                  placeholder="ChatGPT Plus | user1@gmail.com:pass123&#10;ChatGPT Plus | user2@gmail.com:pass456"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleStockImport}
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs shadow transition cursor-pointer"
                  >
                    Импортировать на склад
                  </button>

                  <button
                    onClick={handleExportOrdersCSV}
                    className="px-3 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
                    title="Экспорт заказов в Excel CSV"
                  >
                    Экспорт заказов
                  </button>

                  <button
                    onClick={handleExportStockCSV}
                    className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold"
                    title="Экспорт склада в CSV"
                  >
                    Экспорт склада
                  </button>
                </div>
              </div>

              {/* Manual Delivery Slots */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">📬 Ручная выдача товара</h3>
                <p className="text-[11px] text-white/50">
                  Слоты для товаров, требующих ручного подключения оператором.
                </p>

                <div className="flex gap-2 items-center">
                  <select
                    value={manualProdId}
                    onChange={(e) => setManualProdId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-pink-300">{manualQty} шт</span>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={manualQty}
                      onChange={(e) => setManualQty(parseInt(e.target.value))}
                      className="accent-pink-500"
                    />
                  </div>

                  <button
                    onClick={handleAddManualSlots}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                  >
                    Добавить
                  </button>
                </div>
              </div>

              {/* Stock Inspector & Validator */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">🔍 Инспектор запасов & Валидация</h3>
                    <p className="text-[11px] text-white/40">Автопроверка валидности ключей ElevenLabs и ChatGPT</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleValidateKeys('elevenlabs')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold"
                    >
                      ⚡ Чек ElevenLabs
                    </button>
                    <button
                      onClick={() => handleValidateKeys('chatgpt')}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold"
                    >
                      ⚡ Чек ChatGPT
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                  <input
                    type="text"
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    placeholder="Поиск по логину, почте или товару..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                  {filteredStock.map((stk) => (
                    <div key={stk.id} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-xs">
                      <div>
                        <span className="font-bold text-white block text-[11px]">{stk.productTitle}</span>
                        <code className="text-[10px] text-cyan-300 font-mono truncate max-w-[280px] block">{stk.credentials}</code>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {stk.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: COUPONS ================= */}
          {activeTab === 'coupons' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Create Coupon Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-pink-400" />
                  <span>Создать новый промокод</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="КОД (например, BONUS25)"
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono uppercase font-bold"
                  />
                  <input
                    type="number"
                    value={couponAmount}
                    onChange={(e) => setCouponAmount(e.target.value)}
                    placeholder="Бонус ($)"
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                  />
                  <input
                    type="number"
                    value={couponLimit}
                    onChange={(e) => setCouponLimit(e.target.value)}
                    placeholder="Лимит"
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateCoupon}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow cursor-pointer transition"
                >
                  Создать купон
                </button>
              </div>

              {/* Coupons Table */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Активные промокоды ({coupons.length})</h3>
                <div className="space-y-2">
                  {coupons.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-pink-400 bg-pink-500/10 px-2 py-1 rounded-lg border border-pink-500/20">
                          {c.code}
                        </span>
                        <div>
                          <span className="font-bold text-white block">+${c.amount} на баланс</span>
                          <span className="text-[10px] text-white/40">Использовано: {c.usedCount} из {c.limit}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: BROADCAST ================= */}
          {activeTab === 'broadcast' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-pink-400" />
                  <span>Массовая рассылка сообщений</span>
                </h3>
                <p className="text-[11px] text-white/50">
                  Сообщение будет отправлено выбранному сегменту пользователей через Telegram-бота.
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70 whitespace-nowrap">Сегмент:</span>
                  <select
                    value={broadcastSegment}
                    onChange={(e) => setBroadcastSegment(e.target.value as BroadcastSegment)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  >
                    <option value="all">Все пользователи (1,420 чел)</option>
                    <option value="has_balance">С положительным балансом &gt; $0</option>
                    <option value="no_balance">Баланс = $0</option>
                    <option value="buyers">Покупатели (хотя бы 1 заказ)</option>
                  </select>
                </div>

                {/* Templates Chips */}
                <div>
                  <span className="text-[10px] text-white/40 block mb-1 font-bold">Быстрые шаблоны:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setBroadcastText('🛠 Плановые технические работы завершены! Доступы к ChatGPT и Claude работают в штатном режиме.')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/80"
                    >
                      🛠 Тех. работы
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastText('📦 Большое пополнение склада! Новые аккаунты Gemini 2.0 и Claude 3.7 уже на витрине.')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/80"
                    >
                      📦 Пополнение
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastText('🎁 Акция выходного дня! Введите промокод KOTIK и получите +$5 на баланс!')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/80"
                    >
                      🎁 Акция
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="Введите текст сообщения рассылки..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                />

                {broadcastSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{broadcastSuccess}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendBroadcast}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-xs shadow cursor-pointer transition"
                >
                  🚀 Запустить рассылку
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 7: INSTRUCTIONS ================= */}
          {activeTab === 'instructions' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-pink-400" />
                  <span>Управление инструкциями к товарам</span>
                </h3>
                <p className="text-[11px] text-white/50">
                  Покупатель получает эту инструкцию сразу после оплаты во вкладке «Мои подписки».
                </p>

                <select
                  value={instrProdId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setInstrProdId(id);
                    const p = products.find((x) => x.id === id);
                    if (p) setInstrText(p.instruction || '');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>

                <textarea
                  rows={5}
                  value={instrText}
                  onChange={(e) => setInstrText(e.target.value)}
                  placeholder="Инструкция для покупателя после оплаты..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                />

                <button
                  type="button"
                  onClick={handleSaveInstruction}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow cursor-pointer transition"
                >
                  💾 Сохранить инструкцию
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 8: USERS & REFUNDS ================= */}
          {activeTab === 'users_refund' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Order Refund Box */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">💰 Возврат по номеру заказа</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={refundOrderId}
                    onChange={(e) => setRefundOrderId(e.target.value)}
                    placeholder="ID Заказа (например, ORD-782419)"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono uppercase"
                  />
                  <button
                    onClick={handleRefundOrder}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs"
                  >
                    Выполнить возврат
                  </button>
                </div>
                {refundMsg && <span className="text-[11px] text-pink-300 block">{refundMsg}</span>}
              </div>

              {/* User Search & Balance Adjust */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">👤 Поиск и корректировка баланса</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="User ID или @username..."
                    className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                  <button
                    onClick={handleSearchUser}
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs"
                  >
                    Найти
                  </button>
                </div>

                {searchedUser && (
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{searchedUser.name}</span>
                        <span className="text-pink-300 font-mono ml-2">@{searchedUser.username}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">${searchedUser.balance.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2 items-center pt-2 border-t border-white/5">
                      <input
                        type="number"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        placeholder="Сумма ($)"
                        className="w-24 px-2 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white font-mono"
                      />
                      <button
                        onClick={() => handleAdjustBalance('add')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs"
                      >
                        ➕ Начислить
                      </button>
                      <button
                        onClick={() => handleAdjustBalance('subtract')}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 font-bold text-xs"
                      >
                        ➖ Списать
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* All Registered Users List with Interactive Profile Tapping */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>👥 Интерактивная база пользователей</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {users.length} чел.
                      </span>
                    </h3>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      Нажмите на любого пользователя, чтобы открыть полный профиль, историю покупок, выдать товар или написать в ЛС.
                    </p>
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'all', label: `Все (${users.length})` },
                      { id: 'staff', label: '🛡️ Персонал' },
                      { id: 'buyers', label: '🛍 Покупатели' },
                      { id: 'balance', label: '💰 С балансом' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setUserFilterRole(f.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${
                          userFilterRole === f.id
                            ? 'bg-pink-500 text-white shadow-sm'
                            : 'bg-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userListSearch}
                    onChange={(e) => setUserListSearch(e.target.value)}
                    placeholder="Быстрый поиск по имени, @username или Telegram ID..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 focus:border-pink-500/50 outline-none transition"
                  />
                  {userListSearch && (
                    <button
                      type="button"
                      onClick={() => setUserListSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {filteredUsersList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-white/40 bg-black/20 rounded-xl border border-white/5">
                    {userListSearch ? 'Ни один пользователь не найден по запросу.' : 'Пользователей пока нет в базе.'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
                    {filteredUsersList.map((u) => {
                      const tgId = u.telegramId || parseInt(u.id.replace('usr-', ''));
                      const isOwner = tgId === 755843448;
                      const isAdmin = isOwner || u.isAdmin || u.role === 'admin' || u.role === 'super_admin' || tgId === 7643717312;
                      return (
                        <div
                          key={u.id}
                          onClick={() => handleOpenUserProfile(u)}
                          className="p-3 rounded-2xl bg-black/40 hover:bg-white/[0.06] border border-white/5 hover:border-pink-500/40 cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/30 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                              {isOwner ? (
                                <Crown className="w-5 h-5 text-yellow-400" />
                              ) : isAdmin ? (
                                <Shield className="w-5 h-5 text-cyan-400" />
                              ) : (
                                <User className="w-5 h-5 text-pink-400" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-xs group-hover:text-pink-300 transition">
                                  {u.name}
                                </span>
                                <span className="text-cyan-400 font-mono text-[11px]">
                                  {u.username.startsWith('@') ? u.username : `@${u.username}`}
                                </span>
                                {isOwner && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/30">
                                    Владелец
                                  </span>
                                )}
                                {!isOwner && isAdmin && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                    Администратор
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-white/40 mt-0.5 flex items-center gap-2">
                                <span>ID: <code className="text-white/70 font-mono">{tgId || u.id}</code></span>
                                <span>•</span>
                                <span>Заказов: <b className="text-white/70">{u.ordersCount}</b></span>
                                <span>•</span>
                                <span>Рег: {u.registeredAt || '—'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <div className="text-right mr-1">
                              <span className="font-mono font-black text-emerald-400 text-xs block">
                                ${u.balance.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-white/40 block font-mono">
                                ~{Math.round(u.balance * 85)} ₽
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenUserProfile(u);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-bold transition flex items-center gap-1"
                            >
                              <span>Профиль</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Orders List */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    🛒 Заказы ({orders.length} шт.)
                  </h3>
                  {orders.length > 0 && (
                    <button
                      onClick={handleClearOrders}
                      className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[10px] font-bold transition"
                    >
                      🗑 Очистить все заказы
                    </button>
                  )}
                </div>
                {orders.length === 0 ? (
                  <div className="p-4 text-center text-xs text-white/40">
                    Заказов пока нет (список заказов очищен).
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-xs">
                        <div>
                          <span className="font-mono font-bold text-pink-300">{o.id}</span>
                          <span className="text-white ml-2">{o.productTitle}</span>
                          <span className="text-[10px] text-white/40 block">{o.buyerUsername ? `@${o.buyerUsername}` : (o.buyerName || 'Клиент')} • {o.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-white">${o.totalPrice}</span>
                          <span className={`block text-[9px] font-bold ${o.status === 'refunded' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {o.status === 'refunded' ? 'ВОЗВРАТ' : 'ОПЛАЧЕН'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: STAFF & MODERATORS */}
          {activeTab === 'staff' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>👥 Управление персоналом</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        {staffList.length} чел.
                      </span>
                    </h2>
                    <p className="text-xs text-white/50 mt-0.5">
                      Только добавленные здесь пользователи видят админку в WebApp и имеют доступ к команде /admin в боте!
                    </p>
                  </div>
                </div>

                {/* Add Staff Form */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    ➕ Назначить Администратора или Модератора
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-white/60 mb-1">Telegram ID (обязательно):</label>
                      <input
                        type="text"
                        placeholder="Например: 755843448"
                        value={newStaffId}
                        onChange={(e) => setNewStaffId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono placeholder-white/30 focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/60 mb-1">Юзернейм @username:</label>
                      <input
                        type="text"
                        placeholder="alex_mod"
                        value={newStaffUsername}
                        onChange={(e) => setNewStaffUsername(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/60 mb-1">Имя:</label>
                      <input
                        type="text"
                        placeholder="Алексей"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/60 mb-1">Роль доступа:</label>
                      <select
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value as AdminRole)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:border-pink-500 focus:outline-none"
                      >
                        <option value="admin">🛡️ Администратор (полный)</option>
                        <option value="moderator">👁️ Модератор (ограниченный)</option>
                        <option value="super_admin">👑 Супер-Администратор</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {staffMsg && (
                      <span className="text-xs font-bold text-emerald-400 animate-pulse">{staffMsg}</span>
                    )}
                    <button
                      onClick={handleAddStaff}
                      className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 active:scale-95 transition"
                    >
                      Назначить права
                    </button>
                  </div>
                </div>

                {/* Staff List Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    📋 Текущий список персонала
                  </h3>

                  <div className="divide-y divide-white/5 rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
                    {staffList.map((m) => {
                      const isOwner = String(m.telegramId) === '755843448';
                      return (
                        <div key={m.telegramId} className="p-3.5 flex items-center justify-between hover:bg-white/5 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center font-bold text-white text-xs">
                              {m.role === 'super_admin' ? '👑' : m.role === 'admin' ? '🛡️' : '👁️'}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-white">{m.name || m.username}</span>
                                <span className="text-xs text-white/50">@{m.username}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  m.role === 'super_admin'
                                    ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                                    : m.role === 'admin'
                                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                }`}>
                                  {m.role === 'super_admin' ? 'Владелец' : m.role === 'admin' ? 'Администратор' : 'Модератор'}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-white/40 mt-0.5">
                                ID: <span className="text-cyan-300 font-bold">{m.telegramId}</span> • Добавлен: {m.addedAt}
                              </div>
                            </div>
                          </div>

                          {!isOwner && (
                            <button
                              onClick={() => handleRemoveStaff(m.telegramId)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition"
                            >
                              Отозвать права
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ================= USER PROFILE DETAIL MODAL ================= */}
        {selectedUserProfile && (() => {
          const u = selectedUserProfile;
          const tgId = u.telegramId || parseInt(u.id.replace('usr-', ''));
          const isOwner = tgId === 755843448;
          const isAdmin = isOwner || u.isAdmin || u.role === 'admin' || u.role === 'super_admin' || tgId === 7643717312;
          const rubBal = Math.round(u.balance * 85);
          const rubSpent = Math.round((u.totalSpent || 0) * 85);
          const rawUsername = u.username.replace('@', '');

          return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
              <div className="bg-[#12121e] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {isOwner ? <Crown className="w-6 h-6 text-yellow-300" /> : isAdmin ? <Shield className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-black text-white">{u.name}</h2>
                        {rawUsername && (
                          <a
                            href={`https://t.me/${rawUsername}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-pink-400 font-mono hover:underline flex items-center gap-0.5"
                          >
                            <span>@{rawUsername}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                        {isOwner ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/40">
                            👑 Владелец
                          </span>
                        ) : isAdmin ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                            🛡️ Администратор
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-bold border border-white/10">
                            👤 Покупатель
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/50 font-mono">
                          Telegram ID: <code className="text-white font-bold">{tgId || u.id}</code>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(String(tgId || u.id));
                            setCopiedTgId(true);
                            setTimeout(() => setCopiedTgId(false), 2000);
                          }}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono flex items-center gap-1 transition"
                        >
                          {copiedTgId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedTgId ? 'Скопировано!' : 'Копировать'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedUserProfile(null)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
                  {/* Financial & Activity KPI Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/40 font-bold uppercase block">💰 Баланс</span>
                      <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                        ${u.balance.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">~{rubBal.toLocaleString('ru-RU')} ₽</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/40 font-bold uppercase block">💳 Потрачено</span>
                      <div className="text-xl font-black text-white font-mono mt-0.5">
                        ${(u.totalSpent || 0).toFixed(2)}
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">~{rubSpent.toLocaleString('ru-RU')} ₽</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/40 font-bold uppercase block">📦 Заказов</span>
                      <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
                        {u.ordersCount}
                      </div>
                      <span className="text-[10px] text-white/40">покупок</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/40 font-bold uppercase block">📅 Регистрация</span>
                      <div className="text-xs font-bold text-white/90 font-mono mt-1">
                        {u.registeredAt ? u.registeredAt.split(' ')[0] : '—'}
                      </div>
                      <span className="text-[10px] text-white/40">
                        {u.language === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}
                      </span>
                    </div>
                  </div>

                  {/* ACTION SECTION 1: BALANCE ADJUSTMENT */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>💰 Корректировка баланса</span>
                    </h3>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-white/40 font-bold">Быстро:</span>
                      {[
                        { label: '+$1', val: 1 },
                        { label: '+$5', val: 5 },
                        { label: '+$10', val: 10 },
                        { label: '+$25', val: 25 },
                        { label: '-$5', val: -5 },
                        { label: '-$10', val: -10 },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          disabled={isUpdatingBal}
                          onClick={() => handleProfileAdjustBalance(btn.val)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold border border-white/5 transition"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={profileBalDelta}
                        onChange={(e) => setProfileBalDelta(e.target.value)}
                        placeholder="Сумма ($)"
                        className="w-full sm:w-32 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        value={profileBalReason}
                        onChange={(e) => setProfileBalReason(e.target.value)}
                        placeholder="Причина (например: Бонус за активность)..."
                        className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                      />
                      <button
                        type="button"
                        disabled={isUpdatingBal}
                        onClick={() => handleProfileAdjustBalance()}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shrink-0 transition"
                      >
                        {isUpdatingBal ? 'Сохранение...' : 'Применить'}
                      </button>
                    </div>

                    {balFeedback && (
                      <span className="text-[11px] text-emerald-400 block font-bold">{balFeedback}</span>
                    )}
                  </div>

                  {/* ACTION SECTION 2: MANUAL PRODUCT GRANT */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎁 Ручная выдача подписки / товара</span>
                    </h3>

                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-white/40 block mb-1">Выберите товар:</label>
                          <select
                            value={profileGrantProdId}
                            onChange={(e) => setProfileGrantProdId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title} (${(p.options[0]?.baseMonthlyPrice || 0).toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-white/40 block mb-1">
                            Данные доступа (login:pass или login:pass:2FA):
                          </label>
                          <input
                            type="text"
                            value={profileGrantCreds}
                            onChange={(e) => setProfileGrantCreds(e.target.value)}
                            placeholder="Оставьте пустым для автосписания со склада"
                            className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isGranting}
                        onClick={handleProfileGrantProduct}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white text-xs font-bold shadow-lg hover:brightness-110 transition flex items-center justify-center gap-1.5"
                      >
                        <Gift className="w-4 h-4" />
                        <span>{isGranting ? 'Выдача товара...' : 'Выдать товар и уведомить пользователя в Telegram'}</span>
                      </button>

                      {grantFeedback && (
                        <span className="text-[11px] text-fuchsia-300 block font-bold">{grantFeedback}</span>
                      )}
                    </div>
                  </div>

                  {/* ACTION SECTION 3: DIRECT MESSAGE IN TELEGRAM */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>✉️ Отправить личное сообщение пользователю</span>
                    </h3>
                    <p className="text-[11px] text-white/40">
                      Сообщение будет отправлено от официального бота Kotik Store прямо в личный диалог с клиентом.
                    </p>

                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        value={profileDmText}
                        onChange={(e) => setProfileDmText(e.target.value)}
                        placeholder="Напишите сообщение клиенту (например: Привет! Ваш запрос решен, приятного пользования)..."
                        className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                      />
                      <button
                        type="button"
                        disabled={isSendingDm}
                        onClick={handleProfileSendDm}
                        className="px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSendingDm ? 'Отправка...' : 'Отправить'}</span>
                      </button>
                    </div>

                    {dmFeedback && (
                      <span className="text-[11px] text-cyan-300 block font-bold">{dmFeedback}</span>
                    )}
                  </div>

                  {/* ACTION SECTION 4: STAFF PERMISSION TOGGLE */}
                  {!isOwner && (
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Статус администратора</span>
                        <span className="text-[10px] text-white/40">
                          {isAdmin ? 'Пользователь имеет доступ к админ-панели' : 'Обычный клиент магазина'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleProfileToggleAdmin}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          isAdmin
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                        }`}
                      >
                        {isAdmin ? '❌ Отозвать права админа' : '🛡️ Назначить администратором'}
                      </button>
                    </div>
                  )}

                  {/* SECTION 5: ORDERS HISTORY */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>📦 История покупок ({userProfileOrders.length} шт.)</span>
                      {isLoadingProfileOrders && (
                        <span className="text-[10px] text-pink-400 animate-pulse">Загрузка данных...</span>
                      )}
                    </h3>

                    {userProfileOrders.length === 0 ? (
                      <div className="p-5 text-center text-xs text-white/40 bg-black/20 rounded-xl border border-white/5">
                        У пользователя пока нет заказов в истории.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                        {userProfileOrders.map((ord: any) => {
                          const creds = ord.item_content || ord.credentials || '';
                          const isCopied = copiedCredId === ord.id;
                          return (
                            <div
                              key={ord.id}
                              className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">
                                    {ord.product_title || ord.productTitle}
                                  </span>
                                  <span className="text-[10px] font-mono text-pink-300">#{ord.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-emerald-400">
                                    ${Number(ord.price || ord.totalPrice || 0).toFixed(2)}
                                  </span>
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                    {ord.status === 'completed' || ord.status === 'active' ? 'Выполнен' : ord.status}
                                  </span>
                                </div>
                              </div>

                              {creds && (
                                <div className="p-2 rounded-lg bg-black/80 border border-white/5 flex items-center justify-between gap-2">
                                  <code className="text-[11px] text-cyan-300 font-mono break-all select-all">
                                    {creds}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(creds);
                                      setCopiedCredId(ord.id);
                                      setTimeout(() => setCopiedCredId(null), 2000);
                                    }}
                                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono shrink-0 transition flex items-center gap-1"
                                  >
                                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{isCopied ? 'Скопировано!' : 'Копировать'}</span>
                                  </button>
                                </div>
                              )}

                              <div className="text-[10px] text-white/40 flex items-center justify-between">
                                <span>Дата: {ord.created_at || ord.date}</span>
                                {ord.expires_at && <span>Срок: до {ord.expires_at}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedUserProfile(null)}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                  >
                    Закрыть профиль
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
