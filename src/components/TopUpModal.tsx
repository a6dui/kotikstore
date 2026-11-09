import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Coins,
  Star,
  CheckCircle2,
  Loader2,
  Wallet,
  Sparkles,
  Flame,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PaymentMethod } from '../types';
import { haptic } from '../utils/telegram';

interface TopUpModalProps {
  currentBalance: number;
  onAddBalance: (amount: number) => void;
  onClose: () => void;
  x2PromotionActive?: boolean;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  currentBalance,
  onAddBalance,
  onClose,
  x2PromotionActive = false,
}) => {
  const [amount, setAmount] = useState<number>(10);
  const [customInput, setCustomInput] = useState<string>('10');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card_sbp');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const presets = [5, 10, 25, 50, 100];

  const methods = [
    {
      id: 'cryptobot' as PaymentMethod,
      name: 'CryptoBot (USDT, TON, BTC)',
      badge: '0% комиссия',
      icon: <Coins className="w-4 h-4 text-emerald-400" />,
      rate: '1.0 USDT / $',
    },
    {
      id: '2328' as PaymentMethod,
      name: 'Бот 2328 (Telegram Pay / Карты)',
      badge: 'Автовыдача',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      rate: '~98 ₽ / $',
    },
    {
      id: 'platega' as PaymentMethod,
      name: 'Platega (СБП, МИР, T-Pay, Сбер)',
      badge: 'Без комиссии',
      icon: <CreditCard className="w-4 h-4 text-cyan-400" />,
      rate: '~98 ₽ / $',
    },
    {
      id: 'enot' as PaymentMethod,
      name: 'Enot.io (Карты СНГ, ЮMoney)',
      badge: 'Моментально',
      icon: <Sparkles className="w-4 h-4 text-fuchsia-400" />,
      rate: '~100 ₽ / $',
    },
    {
      id: 'stars' as PaymentMethod,
      name: 'Telegram Stars ⭐',
      badge: 'В Telegram',
      icon: <Star className="w-4 h-4 text-yellow-300 fill-yellow-400" />,
      rate: '75 ⭐ / $',
    },
  ];

  const handlePresetClick = (val: number) => {
    haptic.selection();
    setAmount(val);
    setCustomInput(val.toString());
  };

  const handleCustomInputChange = (val: string) => {
    setCustomInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const finalCreditAmount = x2PromotionActive ? amount * 2 : amount;

  const handleTopUpSubmit = () => {
    if (amount <= 0) return;

    haptic.heavy();
    setIsProcessing(true);

    setTimeout(() => {
      onAddBalance(finalCreditAmount);
      setIsProcessing(false);
      haptic.success();

      try {
        confetti({
          particleCount: x2PromotionActive ? 90 : 60,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#10b981', '#ec4899', '#06b6d4', '#ff9100'],
        });
      } catch {
        // ignore
      }

      onClose();
    }, 1200);
  };

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
      <div className="relative w-full max-w-md rounded-t-[32px] bg-[#0c081c] border-t border-x border-white/15 p-5 pb-8 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 flex flex-col">
        {/* Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Пополнение баланса
              </h2>
              <p className="text-[11px] text-white/50">
                Текущий баланс:{' '}
                <span className="text-pink-300 font-mono font-bold">
                  ${currentBalance.toFixed(2)}
                </span>
              </p>
            </div>
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

        {/* X2 Promotion Banner if active */}
        {x2PromotionActive && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-pink-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-300 block uppercase tracking-wider font-heading">
                  АКЦИЯ X2 АКТИВНА!
                </span>
                <span className="text-[10px] text-white/70">
                  Все пополнения удваиваются на баланс
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
              x2
            </span>
          </div>
        )}

        {/* Quick Amount Presets */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-white/70">
              Сумма пополнения (USD):
            </label>
            {x2PromotionActive && (
              <span className="text-[10px] text-amber-300 font-mono font-bold">
                Начислим: ${finalCreditAmount.toFixed(2)} 🔥
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1.5 mb-2.5">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handlePresetClick(val)}
                className={`py-2 rounded-xl text-xs font-bold font-mono transition-all duration-200 ${
                  amount === val
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)] border border-pink-400'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                +${val}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-base font-mono font-bold text-pink-400">
              $
            </span>
            <input
              type="number"
              min="1"
              max="1000"
              value={customInput}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono font-bold text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              placeholder="Другая сумма"
            />
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[11px] text-white/40">
              USD
            </span>
          </div>

          <div className="mt-1.5 text-[11px] text-white/40 flex items-center justify-between px-1">
            <span>К оплате примерно:</span>
            <span className="text-cyan-300 font-mono font-medium">
              ~{(amount * 96).toLocaleString('ru-RU')} ₽ / {amount} USDT
            </span>
          </div>
        </div>

        {/* Method Selector */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-white/70 mb-2">
            Способ пополнения:
          </label>
          <div className="space-y-2">
            {methods.map((m) => {
              const isSelected = selectedMethod === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    haptic.selection();
                    setSelectedMethod(m.id);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-950/50 to-purple-950/40 border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.25)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      {m.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">
                        {m.name}
                      </div>
                      <div className="text-[10px] text-white/40">{m.rate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                      {m.badge}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500 text-white'
                          : 'border-white/30'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleTopUpSubmit}
          disabled={isProcessing || amount <= 0}
          type="button"
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm shadow-[0_0_25px_-5px_rgba(236,72,153,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Пополнение...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {x2PromotionActive
                  ? `Пополнить на $${amount.toFixed(2)} (получить $${finalCreditAmount.toFixed(2)} 🔥)`
                  : `Пополнить баланс на $${amount.toFixed(2)}`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
