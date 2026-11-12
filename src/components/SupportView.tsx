import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Gift,
  CheckCircle2,
  Headphones,
  Users,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptic, openTelegramOrWeb } from '../utils/telegram';
import type { Coupon } from '../types';

interface SupportViewProps {
  onAddBonusBalance: (amount: number) => void;
  coupons?: Coupon[];
  onOpenAdmin: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({
  onAddBonusBalance,
  coupons = [],
  onOpenAdmin,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoSuccess, setPromoSuccess] = useState<string>('');
  const [promoError, setPromoError] = useState<string>('');
  const [isRedeemed, setIsRedeemed] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  const refLink = 'https://t.me/Kot11kstore_bot?start=ref_784920';

  const faqs = [
    {
      q: 'Как происходит выдача подписки?',
      a: 'После подтверждения оплаты данные (логин/пароль или инвайт-ссылка) выдаются моментально прямо в окне заказа и дублируются во вкладку «Мои подписки». Для готовых аккаунтов вы получаете доступы сразу 24/7. Для личных подключений (Upgrade) мы отправляем официальное приглашение на вашу почту в течение 5–15 минут.',
    },
    {
      q: 'Какая гарантия предоставляется и каковы правила возврата?',
      a: 'На все тарифы действует 100% гарантия на весь оплаченный период (1, 3, 6 или 12 месяцев). Первичная проверка качества осуществляется в течение 15 минут. Если при покупке аккаунт оказался невалиден, при наличии непрерывной видеозаписи проверки мы моментально выдаём замену либо возвращаем средства на баланс магазина.',
    },
    {
      q: 'Зачем требуется непрерывное видео с момента покупки?',
      a: 'Согласно регламенту сервиса, видеозапись экрана (от момента нажатия кнопки оплаты до первой попытки входа без пауз и склеек) является единственным объективным подтверждением того, что данные были нерабочими в момент передачи, а не изменены покупателем.',
    },
    {
      q: 'Что делать, если слетел доступ к подписке в процессе использования?',
      a: 'Просто напишите нашему саппорту @Zykolandstore в Telegram. Укажите номер вашего заказа из вкладки «Мои подписки» и приложите скриншот проблемы. Оператор ответит в течение 2–5 минут и восстановит доступ.',
    },
    {
      q: 'Какие способы пополнения баланса и оплаты доступны?',
      a: 'Мы поддерживаем все популярные методы: CryptoBot (USDT, TON, BTC), Bot 2328, Platega (СБП и банковские карты РФ), Enot.io и Telegram Stars.',
    },
    {
      q: 'Как работает акция X2 при пополнении?',
      a: 'Когда администрация включает акцию X2, сумма любого пополнения баланса удваивается автоматически! Например, при пополнении на $10 вы моментально получаете $20 на внутренний баланс.',
    },
  ];

  const toggleFaq = (index: number) => {
    haptic.light();
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedRef(true);
    haptic.success();
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleRedeemPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (isRedeemed) {
      haptic.warning();
      setPromoError('Вы уже активировали промокод в этой сессии!');
      return;
    }

    // Check dynamic coupons or fallback codes
    const matchedCoupon = coupons.find((c) => c.code.toUpperCase() === code && c.isActive);
    let bonusAmount = 5.0;

    if (matchedCoupon) {
      bonusAmount = matchedCoupon.amount;
    } else if (code === 'KOTIK' || code === 'GEMINI' || code === 'START' || code === 'AI2026') {
      bonusAmount = 5.0;
    } else {
      haptic.warning();
      setPromoError('Неверный промокод. Попробуйте код «KOTIK»!');
      return;
    }

    haptic.success();
    setIsRedeemed(true);
    setPromoSuccess(`Промокод ${code} активирован! На ваш баланс начислено +$${bonusAmount.toFixed(2)} 🎁`);
    setPromoError('');
    onAddBonusBalance(bonusAmount);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#ec4899', '#06b6d4', '#10b981'],
      });
    } catch {
      // ignore
    }
  };

  const handleOpenSupport = () => {
    haptic.medium();
    openTelegramOrWeb('https://t.me/Zykolandstore');
  };

  const handleOpenChannel = () => {
    haptic.medium();
    openTelegramOrWeb('https://t.me/KotikNews_shop');
  };

  return (
    <div className="w-full px-4 pb-24 max-w-md mx-auto space-y-4">
      {/* Support Hero Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-[#0c081c] border border-pink-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-heading">
              <span>Служба заботы Kotik Store</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h2>
            <p className="text-[11px] text-white/50 mt-0.5">
              Операторы онлайн 24/7. Среднее время ответа — 3 минуты.
            </p>
          </div>
        </div>

        {/* CTA Support Buttons */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <button
            onClick={handleOpenSupport}
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 font-bold text-xs transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-pink-400" />
            <span>@Zykolandstore</span>
          </button>

          <button
            onClick={handleOpenChannel}
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>Наш канал</span>
          </button>
        </div>
      </div>

      {/* ZykoStore Instructions for Return & Replacement */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border border-amber-500/30 backdrop-blur-md space-y-2.5">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Регламент гарантийных обращений (ZykoStore)</span>
        </div>
        <p className="text-[11px] text-white/70 leading-relaxed">
          Для оперативной замены или возврата средств при возникновении неисправностей:
        </p>
        <ol className="text-[11px] text-white/85 space-y-1.5 list-decimal list-inside bg-black/40 p-3 rounded-xl border border-white/5 font-medium">
          <li>
            <b>Приложите скриншот ошибки</b> или нерабочего аккаунта в чат с поддержкой.
          </li>
          <li>
            <b>Приложите непрерывное видео:</b> запись экрана от момента нажатия кнопки покупки до первой авторизации/ввода без монтажа и пауз (претензии принимаются строго в течение 15 минут).
          </li>
          <li>
            <b>Укажите ID заказа</b> из вкладки «Мои подписки» и опишите проблему.
          </li>
        </ol>
      </div>

      {/* Referral Program Card (from Zyko) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-purple-950/20 to-black/30 border border-cyan-500/30 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white font-heading">
              Реферальная программа (10% кэшбэк)
            </h3>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
            10%
          </span>
        </div>

        <p className="text-[11px] text-white/50 mb-3 leading-relaxed">
          Делитесь вашей персональной ссылкой с друзьями. Получайте 10% от всех их покупок на ваш баланс автоматически!
        </p>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/50 border border-white/10">
          <input
            type="text"
            readOnly
            value={refLink}
            className="flex-1 bg-transparent text-[11px] font-mono text-cyan-300 select-all outline-none"
          />
          <button
            onClick={handleCopyRef}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] shrink-0 transition"
          >
            {copiedRef ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Скопировано</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Копировать</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Promo Code Card */}
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-4 h-4 text-pink-400" />
          <h3 className="text-xs font-bold text-white font-heading">
            Активация промокода
          </h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-semibold">
            Бонус
          </span>
        </div>
        <p className="text-[11px] text-white/50 mb-3">
          Есть промокод от блогера или канала? Введите его и получите бонус на баланс.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              setPromoError('');
            }}
            placeholder="Введите промокод (например, KOTIK)"
            className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 uppercase font-mono font-bold focus:outline-none focus:border-pink-500"
          />
          <button
            onClick={handleRedeemPromo}
            type="button"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            Применить
          </button>
        </div>

        {promoSuccess && (
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{promoSuccess}</span>
          </div>
        )}

        {promoError && (
          <div className="mt-2 text-xs text-red-400 font-medium">
            {promoError}
          </div>
        )}
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1 mb-1">
          <HelpCircle className="w-4 h-4 text-white/50" />
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider font-heading">
            Часто задаваемые вопросы (FAQ)
          </h3>
        </div>

        {faqs.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-white hover:text-pink-300 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-pink-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3.5 text-xs text-white/60 leading-relaxed border-t border-white/5 pt-2 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin Panel Quick Entry Trigger */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            haptic.medium();
            onOpenAdmin();
          }}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-pink-400 border border-white/10 hover:border-pink-500/40 px-3.5 py-1.5 rounded-full bg-white/5 transition"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Панель администратора (Вход по паролю)</span>
        </button>
      </div>

      {/* Trust Footer Notice */}
      <div className="pt-1 text-center text-[11px] text-white/30 space-y-1">
        <p>Kotik Store © 2026. Все права защищены.</p>
        <p>Надёжный сервис покупки ИИ-подписок в Telegram.</p>
      </div>
    </div>
  );
};
