import React, { useState } from 'react';
import {
  CheckCircle,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import type { OrderItem } from '../types';
import { haptic } from '../utils/telegram';

interface OrderSuccessModalProps {
  order: OrderItem | null;
  onClose: () => void;
  onGoToSubscriptions: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onGoToSubscriptions,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!order) return null;

  const handleCopy = () => {
    if (order.loginData) {
      navigator.clipboard.writeText(order.loginData);
      setCopied(true);
      haptic.success();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={() => {
          haptic.light();
          onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-[28px] bg-gradient-to-b from-[#160d2e] via-[#0d071d] to-[#07040d] border border-pink-500/30 p-5 shadow-[0_0_50px_-10px_rgba(236,72,153,0.4)] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Animated Check Icon */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] mx-auto mb-3 shadow-[0_0_20px_#10b98166]">
          <div className="w-full h-full rounded-full bg-[#0a0514] flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-0.5">
            Заказ #{order.id} оформлен
          </span>
          <h3 className="text-lg font-black text-white">
            Поздравляем с покупкой! 🎉
          </h3>
          <p className="text-xs text-white/60 mt-1">
            {order.productTitle} — {order.optionName} ({order.months} мес.)
          </p>
        </div>

        {/* Login Credentials Box */}
        {order.loginData && (
          <div className="mb-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                Данные для доступа:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-bold text-pink-400 hover:text-pink-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-xs font-mono text-cyan-300 whitespace-pre-wrap break-all bg-black/40 p-2.5 rounded-xl border border-white/5 select-all">
              {order.loginData}
            </pre>
          </div>
        )}

        {/* Quick Instructions list */}
        <div className="mb-4 space-y-1.5 text-[11px] text-white/70">
          <div className="flex items-center gap-1 text-white/50 text-[10px] uppercase font-bold tracking-wider">
            <BookOpen className="w-3 h-3" />
            <span>Инструкция:</span>
          </div>
          {order.instructions.map((inst, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-pink-400 font-bold">•</span>
              <span>{inst}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              haptic.medium();
              onGoToSubscriptions();
            }}
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Перейти в Мои подписки</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              haptic.light();
              onClose();
            }}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.98] text-white/60 hover:text-white font-medium text-xs transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
