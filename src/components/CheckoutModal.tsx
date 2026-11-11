import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Coins,
  Star,
  Wallet,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Zap,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Product, ProductOption, DurationOption, PaymentMethod, OrderItem } from '../types';
import type { Language } from '../utils/i18n';
import { BrandIconRenderer } from './BrandIcons';
import { haptic } from '../utils/telegram';

interface CheckoutModalProps {
  orderConfig: {
    product: Product;
    option: ProductOption;
    duration: DurationOption;
    contact: string;
    totalPrice: number;
  } | null;
  userBalance: number;
  onDeductBalance: (amount: number) => void;
  onOpenTopUp: () => void;
  onClose: () => void;
  onOrderSuccess: (order: OrderItem) => void;
  lang?: Language;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  orderConfig,
  userBalance,
  onDeductBalance,
  onOpenTopUp,
  onClose,
  onOrderSuccess,
  lang = 'ru',
}) => {
  const isEn = lang === 'en';
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('balance');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Promo Code State
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!orderConfig) return null;

  const { product, option, duration, contact, totalPrice } = orderConfig;

  // Calculate dynamic discounted price with promo code
  const finalPrice = appliedCoupon
    ? Math.max(0.5, Math.round(totalPrice * (1 - appliedCoupon.discountPercent / 100) * 100) / 100)
    : totalPrice;

  const discountSavings = Math.round((totalPrice - finalPrice) * 100) / 100;

  const handleApplyCoupon = () => {
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) return;

    // Standard pre-defined promo codes
    const couponMap: Record<string, number> = {
      KOTIK10: 10,
      KOTIKNEWS: 15,
      WELCOME: 5,
      PREMIUM: 20,
    };

    if (couponMap[cleanCode]) {
      haptic.success();
      setAppliedCoupon({ code: cleanCode, discountPercent: couponMap[cleanCode] });
      setCouponFeedback({
        message: isEn
          ? `Promo code ${cleanCode} applied! -${couponMap[cleanCode]}% discount`
          : `Промокод ${cleanCode} применён! Скидка -${couponMap[cleanCode]}%`,
        type: 'success',
      });
    } else {
      haptic.warning();
      setCouponFeedback({
        message: isEn ? 'Invalid or expired promo code' : 'Неверный или недействительный промокод',
        type: 'error',
      });
    }
  };

  const handleRemoveCoupon = () => {
    haptic.light();
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponFeedback(null);
  };

  const paymentMethods: {
    id: PaymentMethod;
    name: string;
    badge: string;
    icon: React.ReactNode;
    description: string;
    badgeColor: string;
  }[] = [
    {
      id: 'balance',
      name: isEn
        ? `Store Balance ($${userBalance.toFixed(2)})`
        : `Баланс магазина ($${userBalance.toFixed(2)})`,
      badge:
        userBalance >= finalPrice
          ? isEn
            ? 'Sufficient'
            : 'Хватает'
          : isEn
          ? 'Insufficient'
          : 'Недостаточно',
      icon: <Wallet className="w-5 h-5 text-pink-400" />,
      description:
        userBalance >= finalPrice
          ? isEn
            ? 'Instant 1-click debit without fees'
            : 'Мгновенное списание в 1 клик без комиссий'
          : isEn
          ? `Need +$${(finalPrice - userBalance).toFixed(2)}. Click to top up`
          : `Не хватает $${(finalPrice - userBalance).toFixed(2)}. Нажмите, чтобы пополнить`,
      badgeColor:
        userBalance >= finalPrice
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          : 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      id: 'cryptobot',
      name: 'CryptoBot (USDT / TON / BTC)',
      badge: isEn ? '0% fee' : '0% комиссия',
      icon: <Coins className="w-4 h-4 text-emerald-400" />,
      description: isEn
        ? 'Pay via @CryptoBot (TON, USDT TRC20, BTC)'
        : 'Оплата в Telegram через @CryptoBot (TON, USDT TRC20, BTC)',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: '2328',
      name: isEn ? 'Bot 2328 (Telegram Pay / Cards)' : 'Бот 2328 (Telegram Pay / SBP)',
      badge: isEn ? 'Auto Delivery' : 'Автовыдача',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      description: isEn
        ? 'Pay via Russian cards, Faster Payments & Telegram invoices'
        : 'Оплата картами РФ, СБП и через Telegram-инвойсы',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'platega',
      name: isEn ? 'Platega (Cards / SBP)' : 'Platega (СБП, Карты РФ, T-Pay)',
      badge: isEn ? 'No fee' : 'Без комиссии',
      icon: <CreditCard className="w-4 h-4 text-cyan-400" />,
      description: isEn
        ? 'Direct bank transfer or card payment'
        : 'Прямой перевод по СБП или банковской карте МИР',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'enot',
      name: isEn ? 'Enot.io (CIS Cards / E-Wallets)' : 'Enot.io (Карты СНГ, ЮMoney)',
      badge: isEn ? 'Instant' : 'Моментально',
      icon: <Sparkles className="w-4 h-4 text-fuchsia-400" />,
      description: isEn
        ? 'CIS bank cards and digital wallets'
        : 'Оплата банковскими картами СНГ, ЮMoney и кошельками',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
    },
    {
      id: 'stars',
      name: 'Telegram Stars ⭐',
      badge: isEn ? 'Official' : 'Официально',
      icon: <Star className="w-4 h-4 text-yellow-300 fill-yellow-400" />,
      description: isEn
        ? 'Debit stars directly from your Telegram account'
        : 'Списание звёзд Telegram напрямую со счёта аккаунта',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    },
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    haptic.selection();
    if (method === 'balance' && userBalance < finalPrice) {
      // Trigger top-up
      onOpenTopUp();
      return;
    }
    setSelectedMethod(method);
    setErrorMsg('');
  };

  const handlePay = () => {
    if (selectedMethod === 'balance') {
      if (userBalance < finalPrice) {
        haptic.warning();
        setErrorMsg(
          isEn
            ? 'Insufficient funds on balance. Please top up your account.'
            : 'Недостаточно средств на балансе. Пополните счёт.'
        );
        return;
      }
    }

    haptic.heavy();
    setIsProcessing(true);

    // Simulate real payment checkout processing
    setTimeout(() => {
      if (selectedMethod === 'balance') {
        onDeductBalance(finalPrice);
      }

      haptic.success();
      setIsProcessing(false);

      // Launch confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#06b6d4', '#a855f7', '#ffffff'],
        });
      } catch {
        // ignore
      }

      // Generate realistic order & credentials
      const now = new Date();
      const expires = new Date();
      expires.setMonth(expires.getMonth() + duration.months);

      const generatedKey = `KOTIK-${product.id.slice(0, 4).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const newOrder: OrderItem = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        productId: product.id,
        productTitle: product.title,
        optionName: option.name,
        months: duration.months,
        totalPrice,
        date: now.toLocaleDateString(isEn ? 'en-US' : 'ru-RU'),
        expiresDate: expires.toLocaleDateString(isEn ? 'en-US' : 'ru-RU'),
        status: 'active',
        loginData: option.isPersonal
          ? (isEn
              ? `Account connected to: ${contact || 'Telegram Profile'}\nVerification Key: ${generatedKey}`
              : `Активация на контакты: ${contact || 'Указанный профиль'}\nКлюч верификации: ${generatedKey}`)
          : (isEn
              ? `Login: kotik_${product.id}_${Math.floor(Math.random() * 899 + 100)}@kotikstore.ai\nPassword: KotikPass#${Math.floor(Math.random() * 8999 + 1000)}\nAccess Token: ${generatedKey}`
              : `Логин: kotik_${product.id}_${Math.floor(Math.random() * 899 + 100)}@kotikstore.ai\nПароль: KotikPass#${Math.floor(Math.random() * 8999 + 1000)}\nКод доступа: ${generatedKey}`),
        instructions: isEn
          ? [
              'Log in to the official service website with provided credentials.',
              'For personal upgrades, invite is sent directly to your email/profile.',
              'If 2FA is required, contact 24/7 support @Zykolandstore.',
            ]
          : [
              'Авторизуйтесь на официальном сайте сервиса с полученными данными.',
              'В случае личного подключения инвайт отправлен на указанную почту/профиль.',
              'Если потребуется код 2FA — напишите саппорту @Zykolandstore, выдача 24/7.',
            ],
        brandColor: product.brandColor,
      };

      onOrderSuccess(newOrder);
    }, 1800);
  };

  const durationText = isEn
    ? duration.months === 1
      ? '1 month'
      : duration.months === 12
      ? '1 year'
      : `${duration.months} months`
    : duration.label;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!isProcessing) {
            haptic.light();
            onClose();
          }
        }}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto no-scrollbar rounded-t-[32px] bg-[#0c081c] border-t border-x border-white/15 p-5 pb-8 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 flex flex-col">
        {/* Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              {isEn ? 'Order Checkout' : 'Оформление заказа'}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">
              {isEn ? 'STEP 2 OF 2' : 'ШАГ 2 ИЗ 2'}
            </span>
          </div>

          {!isProcessing && (
            <button
              onClick={() => {
                haptic.light();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Order Summary Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center p-1.5"
                style={{
                  backgroundColor: `${product.brandColor}22`,
                  color: product.brandColor,
                  border: `1px solid ${product.brandColor}40`,
                }}
              >
                <BrandIconRenderer type={product.iconType} size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{product.title}</div>
                <div className="text-[11px] text-white/50">{option.name}</div>
              </div>
            </div>

            <div className="text-right">
              {appliedCoupon ? (
                <div>
                  <div className="text-xs text-white/40 line-through font-mono">
                    ${totalPrice.toFixed(2)}
                  </div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    ${finalPrice.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="text-sm font-bold text-pink-400 font-mono">
                  ${totalPrice.toFixed(2)}
                </div>
              )}
              <div className="text-[10px] text-white/40">{durationText}</div>
            </div>
          </div>

          {contact && (
            <div className="pt-2 border-t border-white/5 text-[11px] text-white/60 flex items-center justify-between">
              <span>{isEn ? 'Contact:' : 'Контакт:'}</span>
              <span className="font-mono text-cyan-300 font-medium">{contact}</span>
            </div>
          )}
        </div>

        {/* 🎟 Promo Code Box */}
        <div className="mb-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
              <span>🎟</span>
              <span>{isEn ? 'Have a promo code?' : 'Есть промокод?'}</span>
            </span>
            {appliedCoupon && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                -{appliedCoupon.discountPercent}%
              </span>
            )}
          </div>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {appliedCoupon.code}
                </span>
                <span className="text-[11px] text-emerald-400/80">
                  (-${discountSavings.toFixed(2)})
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-[11px] text-white/50 hover:text-white underline cursor-pointer"
              >
                {isEn ? 'Remove' : 'Удалить'}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponFeedback(null);
                }}
                placeholder={isEn ? 'e.g. KOTIKNEWS' : 'напр. KOTIKNEWS или KOTIK10'}
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 uppercase font-mono"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isEn ? 'Apply' : 'Применить'}
              </button>
            </div>
          )}

          {couponFeedback && (
            <div
              className={`mt-2 text-[11px] font-medium ${
                couponFeedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {couponFeedback.message}
            </div>
          )}
        </div>

        {/* Payment Methods Section */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-white/70 mb-2">
            {isEn ? 'Select payment method:' : 'Выберите способ оплаты:'}
          </label>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id;

              return (
                <div
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-950/60 to-purple-950/40 border-pink-500 shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      {method.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {method.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${method.badgeColor}`}
                        >
                          {method.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500 text-white'
                          : 'border-white/30 bg-transparent'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Security & Guarantee Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/40 mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isEn
              ? 'Secure checkout • Protected by end-to-end encryption'
              : 'Безопасная оплата • Данные защищены сквозным шифрованием'}
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={handlePay}
          disabled={isProcessing}
          type="button"
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm shadow-[0_0_25px_-5px_rgba(236,72,153,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>{isEn ? 'Processing payment...' : 'Обработка платежа...'}</span>
            </>
          ) : (
            <>
              <span>
                {isEn
                  ? `Pay $${finalPrice.toFixed(2)}`
                  : `Оплатить $${finalPrice.toFixed(2)}`}
              </span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
