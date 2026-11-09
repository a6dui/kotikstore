export type ProductCategory = string;

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface ProductOption {
  id: string;
  name: string;
  description: string;
  isPersonal: boolean; // requires user email/telegram
  baseMonthlyPrice: number;
}

export interface DurationOption {
  months: number;
  label: string;
  discountPercent: number; // e.g. 15 for 15% discount
}

export interface FlashSale {
  active: boolean;
  discountPercent: number;
  endsAt: string; // ISO string or human string
  hoursRemaining: number;
}

export interface Product {
  id: string;
  categoryId: string;
  title: string;
  tagline: string;
  category: 'text_code' | 'voice_video' | string;
  brandColor: string; // hex
  brandSecondaryColor?: string;
  glowClass: string;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
  startingPrice: number;
  wholesalePrice?: number; // FunPay / Pulse wholesale price
  stockCount: number;
  options: ProductOption[];
  durations: DurationOption[];
  warrantyText: string;
  iconType: string;
  flashSale?: FlashSale;
  isManualDelivery?: boolean;
  instruction?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  optionName: string;
  months: number;
  totalPrice: number;
  date: string;
  expiresDate: string;
  status: 'active' | 'processing' | 'expired' | 'refunded';
  loginData?: string;
  instructions: string[];
  brandColor: string;
  buyerName?: string;
  buyerUsername?: string;
  buyerId?: string;
}

export type PaymentMethod =
  | 'cryptobot'
  | 'card_sbp'
  | 'platega'
  | 'enot'
  | '2328'
  | 'stars'
  | 'balance';

export interface TelegramUser {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface StockItem {
  id: string;
  productId: string;
  productTitle: string;
  credentials: string; // login:pass or key
  status: 'available' | 'sold' | 'invalid';
  addedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  amount: number;
  limit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export type BroadcastSegment = 'all' | 'has_balance' | 'no_balance' | 'premium' | 'buyers';

export interface AdminActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'buy' | 'topup' | 'coupon' | 'refund' | 'visit';
}

export interface AnalyticsDataPoint {
  day: string;
  sales: number;
  profit: number;
  orders: number;
  regs: number;
  visits: number;
  churn: number;
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface StaffMember {
  telegramId: string | number;
  username: string;
  name?: string;
  role: AdminRole;
  addedAt: string;
  addedBy: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  balance: number;
  ordersCount: number;
  status: 'active' | 'blocked';
  registeredAt: string;
  role?: AdminRole;
}

export type ActiveView = 'shop' | 'orders' | 'reviews' | 'leaderboard' | 'wishlist' | 'profile' | 'admin';

export interface Review {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  productId: string;
  productName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  sellerReply?: string;
  isVerifiedPurchase?: boolean;
}

export type LeaderboardPeriod = '24h' | '7d' | '30d' | 'all_time';

export interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  spent: number;
  ordersCount: number;
  streak: number;
  rank: number;
  badge?: string;
}

export interface DailyReward {
  day: number;
  amount: number;
  label: string;
  bonusItem?: string;
}

export interface DailyStreakState {
  currentDay: number;
  streakDays: number;
  claimedToday: boolean;
  lastClaimDate: string | null;
  rewards: DailyReward[];
}

export type PolicyType = 'rules' | 'privacy' | 'refund';

export interface UserDashboard {
  totalSpent: number;
  purchaseCount: number;
  reviewsCount: number;
  partnerXp: number;
  isPremium: boolean;
  premiumUntil: string | null;
  apiKey: string;
}

export interface AdminMetrics {
  usersCount: number;
  ordersCount: number;
  revenue: number;
  stockCount: number;
  webDau: number;
  webWau: number;
  blockedCount: number;
  activeUsersCount: number;
  netProfit: number;
  avgMargin: number;
  x2PromotionActive: boolean;
}


