import React, { useState } from 'react';
import {
  Calendar,
  Gift,
  Crown,
  Wallet,
  Users,
  Key,
  Shield,
  FileText,
  RotateCcw,
  Check,
  Copy,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import type { TelegramUser, DailyStreakState, PolicyType } from '../types';
import { triggerHaptic } from '../utils/telegram';

interface ProfileViewProps {
  user: TelegramUser | null;
  balance: number;
  ordersCount: number;
  streakState: DailyStreakState;
  onClaimDailyReward: () => void;
  onOpenTopUp: () => void;
  onOpenPolicy: (type: PolicyType) => void;
  onOpenAdminAuth: () => void;
  x2PromotionActive: boolean;
  isStaff?: boolean;
  onOpenApiDocs?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  balance,
  ordersCount,
  streakState,
  onClaimDailyReward,
  onOpenTopUp,
  onOpenPolicy,
  onOpenAdminAuth,
  x2PromotionActive,
  isStaff = false,
  onOpenApiDocs,
}) => {
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('ktk_live_9f82d1a3c704e6b5');
  const [isPremium, setIsPremium] = useState(false);

  const referralCode = user?.username ? user.username : 'kotik_user';
  const referralLink = `https://t.me/KotikStoreBot?start=ref_${referralCode}`;

  const copyReferral = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const copyApiKey = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  const regenerateApiKey = () => {
    triggerHaptic('medium');
    const newKey = `ktk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    setApiKey(newKey);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* User Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-black/40 to-black/80 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt={user?.first_name || 'User'}
              className="w-16 h-16 rounded-2xl border-2 border-fuchsia-500/40 object-cover shadow-lg shadow-fuchsia-500/20"
            />
            {isPremium && (
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold shadow-md shadow-yellow-400/50">
                <Crown className="w-3.5 h-3.5 fill-black" />
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-white">
                {user?.first_name || 'Гость Kotik Store'}
              </h2>
              {isPremium && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-bold">
                  PREMIUM
                </span>
              )}
            </div>
            <div className="text-xs text-white/50">
              @{user?.username || 'kotik_user'} • ID: {user?.id || '84729104'}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                Баланс: ${balance.toFixed(2)}
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onOpenTopUp();
                }}
                className="text-[11px] font-bold text-fuchsia-300 hover:text-white bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/30 px-2.5 py-1 rounded-lg transition-all"
              >
                + Пополнить
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📅 Календарь наград (Daily Streak Calendar matching ZykoStore) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">Календарь наград</h3>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
            Стрик: {streakState.streakDays} дн.
          </span>
        </div>

        {/* 7-day grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {streakState.rewards.map((rew) => {
            const isCompleted = rew.day < streakState.currentDay;
            const isToday = rew.day === streakState.currentDay;

            return (
              <div
                key={rew.day}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  isToday
                    ? 'border-fuchsia-500 bg-fuchsia-500/15 shadow-md shadow-fuchsia-500/20'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/10 opacity-75'
                    : 'border-white/5 bg-white/[0.02] opacity-45'
                }`}
              >
                <span className="text-[9px] font-bold text-white/50">{rew.day}д</span>
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 my-1" />
                ) : (
                  <Gift
                    className={`w-3.5 h-3.5 my-1 ${
                      isToday ? 'text-fuchsia-400 animate-pulse' : 'text-white/40'
                    }`}
                  />
                )}
                <span className="text-[10px] font-mono font-bold text-white">
                  +${rew.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            triggerHaptic('success');
            onClaimDailyReward();
          }}
          disabled={streakState.claimedToday}
          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            streakState.claimedToday
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-fuchsia-500 text-white shadow-lg shadow-amber-500/20 active:scale-98'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>
            {streakState.claimedToday ? 'Награда за сегодня уже собрана ✓' : 'Забрать ежедневную награду'}
          </span>
        </button>
      </div>

      {/* 📊 Мой дашборд */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-[10px] text-white/40 font-semibold uppercase">Покупки</div>
          <div className="text-base font-extrabold text-white mt-0.5">{ordersCount}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-[10px] text-white/40 font-semibold uppercase">Оборот</div>
          <div className="text-base font-extrabold text-cyan-300 mt-0.5">${(ordersCount * 18.5).toFixed(0)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-[10px] text-white/40 font-semibold uppercase">Ранг</div>
          <div className="text-base font-extrabold text-yellow-400 mt-0.5">Silver</div>
        </div>
      </div>

      {/* 👑 Kotik Store Premium Card */}
      <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-yellow-950/30 via-black to-amber-950/30 p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Kotik Store Premium</h3>
              <p className="text-[10px] text-white/50">Эксклюзивный доступ и привилегии</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('medium');
              setIsPremium(!isPremium);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isPremium
                ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/40'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {isPremium ? 'Активен ✓' : 'Подключить $3.99/мес'}
          </button>
        </div>

        <ul className="text-xs text-white/70 space-y-1.5 pt-1">
          <li className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>+5% дополнительного кэшбэка со всех покупок</span>
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>Приоритетная автовыдача без ожидания очереди</span>
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>Доступ к закрытым дропам API-токенов</span>
          </li>
        </ul>
      </div>

      {/* 💰 Пополнение баланса */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold text-white">Пополнение баланса</h3>
          </div>
          {x2PromotionActive && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white animate-pulse">
              🔥 X2 БОНУС
            </span>
          )}
        </div>
        <p className="text-xs text-white/60">
          Пополняйте баланс через CryptoBot (USDT, TON), Карты РФ / СБП или Telegram Stars.
        </p>
        <button
          onClick={() => {
            triggerHaptic('medium');
            onOpenTopUp();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          <span>Перейти к пополнению</span>
        </button>
      </div>

      {/* 👥 Реферальная программа & Призовой фонд месяца */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-fuchsia-400" />
            <h3 className="text-sm font-extrabold text-white">Реферальная программа (10%)</h3>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
            🏆 $10 + Премиум
          </span>
        </div>

        {/* Призовой фонд месяца баннер */}
        <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-950/40 via-amber-950/30 to-black p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>Призовой фонд месяца: $10.00</span>
            </div>
            <span className="text-[9px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
              Ежемесячно
            </span>
          </div>
          <p className="text-[11px] text-white/70">
            Тот, кто пригласит больше всех людей за месяц, получит <b className="text-yellow-400">$10.00 на баланс</b> и эксклюзивный статус <b className="text-fuchsia-300">«Премиум Котик» 👑</b>!
          </p>
        </div>

        {/* Личная статистика приглашений */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] text-white/40 uppercase font-semibold">Приглашено друзей</div>
            <div className="text-sm font-black text-white mt-0.5">0 чел.</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] text-white/40 uppercase font-semibold">Заработано (10%)</div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">$0.00</div>
          </div>
        </div>

        {/* Ваша реферальная ссылка */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/60">Ваша реферальная ссылка</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-white/80 focus:outline-none"
            />
            <button
              onClick={copyReferral}
              className="px-3.5 py-2 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copiedReferral ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReferral ? 'Скопировано' : 'Копировать'}</span>
            </button>
          </div>
        </div>

        {/* Топ по приглашениям месяца */}
        <div className="pt-1 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white/70">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Топ приглашений (этого месяца)</span>
            </span>
            <span className="text-[10px] text-white/40">Реальное время</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-xs text-white/60">
              В этом месяце ещё никто не пригласил рефералов.
            </p>
            <p className="text-[11px] text-yellow-400 font-bold mt-1">
              🚀 Пригласите первого друга и станьте ТОП-1 месяца!
            </p>
          </div>
        </div>
      </div>

      {/* 🔑 API & Интеграция */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-white">API & Интеграция</h3>
          </div>
          <button
            onClick={regenerateApiKey}
            className="text-[10px] text-white/50 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Обновить</span>
          </button>
        </div>
        <p className="text-xs text-white/60">
          Используйте персональный ключ для автоматических закупок подписок и аккаунтов через ваших ботов, сайты или скрипты.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none"
          />
          <button
            onClick={copyApiKey}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {copiedApiKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedApiKey ? 'Готово' : 'Копия'}</span>
          </button>
        </div>

        {/* Кнопка открытия полной документации API */}
        <button
          onClick={() => {
            triggerHaptic('light');
            if (onOpenApiDocs) onOpenApiDocs();
          }}
          className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>📖 Открыть документацию API (cURL, Python, JS)</span>
        </button>
      </div>

      {/* 📜 Информация и правила (User Agreement / Privacy / Refund) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-xl backdrop-blur-md divide-y divide-white/5">
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenPolicy('rules');
          }}
          className="w-full p-3 flex items-center justify-between text-left text-xs text-white/80 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-fuchsia-400" />
            <span>Пользовательское соглашение</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40" />
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenPolicy('privacy');
          }}
          className="w-full p-3 flex items-center justify-between text-left text-xs text-white/80 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Политика конфиденциальности</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40" />
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenPolicy('refund');
          }}
          className="w-full p-3 flex items-center justify-between text-left text-xs text-white/80 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-yellow-400" />
            <span>Гарантия и условия возврата</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40" />
        </button>
      </div>

      {/* Admin Panel Entry (ONLY for verified staff & owners) */}
      {isStaff && (
        <div className="pt-2 text-center animate-fade-in">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenAdminAuth();
            }}
            className="text-xs text-pink-400 hover:text-pink-300 transition-colors inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Панель Администратора</span>
          </button>
        </div>
      )}
    </div>
  );
};
