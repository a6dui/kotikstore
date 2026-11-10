import React, { useState } from 'react';
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  Key,
  Sparkles,
} from 'lucide-react';
import type { OrderItem } from '../types';
import type { Language } from '../utils/i18n';
import { haptic } from '../utils/telegram';

interface MySubscriptionsProps {
  orders: OrderItem[];
  onOpenStore: () => void;
  lang?: Language;
}

export const MySubscriptions: React.FC<MySubscriptionsProps> = ({
  orders,
  onOpenStore,
  lang = 'ru',
}) => {
  const isEn = lang === 'en';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    haptic.success();
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleAccordion = (id: string) => {
    haptic.light();
    setOpenAccordionId(openAccordionId === id ? null : id);
  };

  if (orders.length === 0) {
    return (
      <div className="w-full px-4 py-16 max-w-md mx-auto text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-4">
          <Key className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          {isEn ? 'No active subscriptions yet' : 'У вас пока нет активных подписок'}
        </h3>
        <p className="text-xs text-white/50 max-w-[260px] mb-5">
          {isEn
            ? 'Choose an AI subscription from the store — instant access in 60s!'
            : 'Выберите нужную нейросеть на витрине — выдадим доступ за 60 секунд!'}
        </p>
        <button
          onClick={() => {
            haptic.medium();
            onOpenStore();
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-lg"
        >
          {isEn ? 'Browse Storefront' : 'Перейти на витрину'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pb-24 max-w-md mx-auto space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-black/40 border border-pink-500/20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{isEn ? 'My Subscriptions' : 'Мои подписки'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">
                {orders.length} {isEn ? 'ACTIVE' : 'АКТИВНЫХ'}
              </span>
            </h2>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isEn ? 'All issued credentials and activation keys are stored here.' : 'Все выданные доступы и ключи активации хранятся здесь.'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order) => {
          const isOpen = openAccordionId === order.id;
          const isCopied = copiedId === order.id;

          return (
            <div
              key={order.id}
              className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg transition-all"
              style={{
                boxShadow: `0 8px 25px -10px ${order.brandColor}22`,
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {order.productTitle}
                    </h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isEn ? 'Active' : 'Активна'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {order.optionName} • {order.months} {isEn ? 'mo.' : 'мес.'}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-pink-400 font-mono">
                    ${order.totalPrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-white/40 flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span>{isEn ? 'until' : 'до'} {order.expiresDate}</span>
                  </div>
                </div>
              </div>

              {/* Login Data Box */}
              {order.loginData && (
                <div className="my-3 p-3 rounded-xl bg-black/50 border border-white/10 relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      {isEn ? 'Account Credentials:' : 'Данные аккаунта:'}
                    </span>
                    <button
                      onClick={() => handleCopy(order.id, order.loginData || '')}
                      className="flex items-center gap-1 text-[11px] font-bold text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">{isEn ? 'Copied' : 'Скопировано'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{isEn ? 'Copy data' : 'Скопировать данные'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="text-xs font-mono text-cyan-300 whitespace-pre-wrap break-all select-all">
                    {order.loginData}
                  </pre>
                </div>
              )}

              {/* Accordion Toggle: Instructions */}
              <button
                type="button"
                onClick={() => toggleAccordion(order.id)}
                className="w-full flex items-center justify-between py-2 text-xs font-semibold text-white/70 hover:text-white border-t border-white/5 mt-1"
              >
                <span>{isEn ? 'Usage Instructions' : 'Инструкция по использованию'}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-white/50" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/50" />
                )}
              </button>

              {/* Expanded Instructions Content */}
              {isOpen && (
                <div className="pt-2 pb-1 space-y-1.5 text-[11px] text-white/60 animate-in fade-in duration-200">
                  {order.instructions.map((inst, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-pink-400 font-bold">•</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isEn ? 'Protected by Kotik Store Warranty' : 'Подписка защищена гарантией Kotik Store'}
                    </span>
                    <button
                      onClick={() => {
                        haptic.medium();
                        onOpenStore();
                      }}
                      className="text-[11px] font-bold text-pink-400 hover:underline"
                    >
                      {isEn ? 'Renew' : 'Продлить'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
