import React, { useState, useEffect } from 'react';
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
  Target,
  ExternalLink,
  Share2,
} from 'lucide-react';
import type { TelegramUser, DailyStreakState, PolicyType } from '../types';
import type { Language } from '../utils/i18n';
import { triggerHaptic } from '../utils/telegram';

interface QuestItem {
  id: string;
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  reward: number;
  icon: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  actionUrl?: string;
  actionType: 'channel' | 'share' | 'review' | 'order';
}

interface ProfileViewProps {
  user: TelegramUser | null;
  balance: number;
  ordersCount: number;
  streakState: DailyStreakState;
  onClaimDailyReward: () => void;
  onClaimQuestReward?: (questId: string, amount: number) => void;
  onOpenTopUp: () => void;
  onOpenPolicy: (type: PolicyType) => void;
  onOpenAdminAuth: () => void;
  x2PromotionActive: boolean;
  isStaff?: boolean;
  onOpenApiDocs?: () => void;
  lang?: Language;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  balance,
  ordersCount,
  streakState,
  onClaimDailyReward,
  onClaimQuestReward,
  onOpenTopUp,
  onOpenPolicy,
  onOpenAdminAuth,
  x2PromotionActive,
  isStaff = false,
  onOpenApiDocs,
  lang = 'ru',
}) => {
  const isEn = lang === 'en';
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('ktk_live_9f82d1a3c704e6b5');
  const [isPremium, setIsPremium] = useState(false);

  // Quests & Bounties State
  const [quests, setQuests] = useState<QuestItem[]>(() => {
    const saved = localStorage.getItem('kotik_quests_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'quest_channel',
        title: 'Подписка на канал @KotikNews_shop',
        titleEn: 'Subscribe to @KotikNews_shop',
        desc: 'Подпишитесь на новостной канал с дропами и скидками',
        descEn: 'Subscribe to our official channel with drops & discounts',
        reward: 0.50,
        icon: '📢',
        target: 1,
        progress: 0,
        completed: false,
        claimed: false,
        actionUrl: 'https://t.me/KotikNews_shop',
        actionType: 'channel',
      },
      {
        id: 'quest_invite_3',
        title: 'Пригласи 3 друзей',
        titleEn: 'Invite 3 Friends',
        desc: 'Поделись ссылкой на бота с друзьями',
        descEn: 'Share your referral link with friends',
        reward: 1.00,
        icon: '👥',
        target: 3,
        progress: 1,
        completed: false,
        claimed: false,
        actionType: 'share',
      },
      {
        id: 'quest_review',
        title: 'Оставь отзыв с фото',
        titleEn: 'Leave a Review with Photo',
        desc: 'Напиши отзыв о покупке в канале отзывов',
        descEn: 'Share your purchase review with a screenshot',
        reward: 0.50,
        icon: '⭐',
        target: 1,
        progress: 0,
        completed: false,
        claimed: false,
        actionUrl: 'https://t.me/KotikNews_shop',
        actionType: 'review',
      },
      {
        id: 'quest_first_order',
        title: 'Первая покупка в витрине',
        titleEn: 'First Purchase in Store',
        desc: 'Оформи любую подписку или ключ в магазине',
        descEn: 'Buy any AI subscription or key in store',
        reward: 1.00,
        icon: '🛒',
        target: 1,
        progress: ordersCount >= 1 ? 1 : 0,
        completed: ordersCount >= 1,
        claimed: false,
        actionType: 'order',
      },
    ];
  });

  // Save quests to localStorage
  useEffect(() => {
    localStorage.setItem('kotik_quests_v1', JSON.stringify(quests));
  }, [quests]);

  // Update order quest if order completed
  useEffect(() => {
    if (ordersCount >= 1) {
      setQuests((prev) =>
        prev.map((q) => (q.id === 'quest_first_order' ? { ...q, progress: 1, completed: true } : q))
      );
    }
  }, [ordersCount]);

  const handleQuestAction = (quest: QuestItem) => {
    triggerHaptic('light');
    if (quest.actionType === 'channel' || quest.actionType === 'review') {
      window.open(quest.actionUrl || 'https://t.me/KotikNews_shop', '_blank');
      setQuests((prev) =>
        prev.map((q) => (q.id === quest.id ? { ...q, progress: 1, completed: true } : q))
      );
    } else if (quest.actionType === 'share') {
      navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id === quest.id) {
            const nextProgress = Math.min(q.target, q.progress + 1);
            return {
              ...q,
              progress: nextProgress,
              completed: nextProgress >= q.target,
            };
          }
          return q;
        })
      );
    } else if (quest.actionType === 'order') {
      if (ordersCount >= 1) {
        setQuests((prev) =>
          prev.map((q) => (q.id === quest.id ? { ...q, progress: 1, completed: true } : q))
        );
      }
    }
  };

  const handleClaimQuest = (quest: QuestItem) => {
    if (!quest.completed || quest.claimed) return;
    triggerHaptic('success');
    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, claimed: true } : q))
    );
    if (onClaimQuestReward) {
      onClaimQuestReward(quest.id, quest.reward);
    }
  };

  const referralCode = user?.username ? user.username : 'kotik_user';
  const referralLink = `https://t.me/Kot11kstore_bot?start=ref_${referralCode}`;

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
                {user?.first_name || (isEn ? 'Kotik Store Guest' : 'Гость Kotik Store')}
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
                {isEn ? 'Balance:' : 'Баланс:'} ${balance.toFixed(2)}
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onOpenTopUp();
                }}
                className="text-[11px] font-bold text-fuchsia-300 hover:text-white bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/30 px-2.5 py-1 rounded-lg transition-all"
              >
                {isEn ? '+ Top Up' : '+ Пополнить'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Задания и бонусы (Quests & Bounties) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-md space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {isEn ? 'Quests & Bonuses' : 'Задания и награды'}
              </h3>
              <p className="text-[10px] text-white/50">
                {isEn ? 'Complete tasks to earn free balance' : 'Выполняй задания и получай $ на баланс'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300">
            {quests.filter((q) => q.claimed).length}/{quests.length} {isEn ? 'Done' : 'Готово'}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {quests.map((quest) => {
            const isCompleted = quest.completed;
            const isClaimed = quest.claimed;

            return (
              <div
                key={quest.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{quest.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {isEn ? quest.titleEn : quest.title}
                      </h4>
                      <span className="text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                        +${quest.reward.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 truncate">
                      {isEn ? quest.descEn : quest.desc}
                    </p>
                    {quest.target > 1 && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-white/40">
                          {quest.progress}/{quest.target}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {isEn ? 'Claimed' : 'Получено'}
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaimQuest(quest)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-[11px] shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 animate-pulse"
                    >
                      <Sparkles className="w-3 h-3 fill-black" />
                      {isEn ? 'Claim' : 'Забрать'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleQuestAction(quest)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-[10px] active:scale-95 transition-all flex items-center gap-1"
                    >
                      {quest.actionType === 'share' ? (
                        <>
                          <Share2 className="w-3 h-3 text-cyan-400" />
                          <span>{isEn ? 'Invite' : 'Позвать'}</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3 h-3 text-fuchsia-400" />
                          <span>{isEn ? 'Go' : 'Перейти'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📅 Календарь наград (Daily Streak Calendar matching ZykoStore) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">
              {isEn ? 'Daily Rewards' : 'Календарь наград'}
            </h3>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
            {isEn ? 'Streak:' : 'Стрик:'} {streakState.streakDays} {isEn ? 'd.' : 'дн.'}
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
                <span className="text-[9px] font-bold text-white/50">{rew.day}{isEn ? 'd' : 'д'}</span>
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
            {streakState.claimedToday
              ? (isEn ? 'Reward already claimed today ✓' : 'Награда за сегодня уже собрана ✓')
              : (isEn ? 'Claim Daily Reward' : 'Забрать ежедневную награду')}
          </span>
        </button>
      </div>

      {/* 📊 Мой дашборд */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-[10px] text-white/40 font-semibold uppercase">
            {isEn ? 'Purchases' : 'Покупки'}
          </div>
          <div className="text-base font-extrabold text-white mt-0.5">{ordersCount}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-[10px] text-white/40 font-semibold uppercase">
            {isEn ? 'Volume' : 'Оборот'}
          </div>
          <div className="text-base font-extrabold text-cyan-300 mt-0.5">${(ordersCount * 18.5).toFixed(0)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-[10px] text-white/40 font-semibold uppercase">
            {isEn ? 'Rank' : 'Ранг'}
          </div>
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
              <p className="text-[10px] text-white/50">
                {isEn ? 'Exclusive access & privileges' : 'Эксклюзивный доступ и привилегии'}
              </p>
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
            {isPremium
              ? (isEn ? 'Active ✓' : 'Активен ✓')
              : (isEn ? 'Subscribe $3.99/mo' : 'Подключить $3.99/мес')}
          </button>
        </div>

        <ul className="text-xs text-white/70 space-y-1.5 pt-1">
          <li className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>
              {isEn ? '+5% extra cashback on all purchases' : '+5% дополнительного кэшбэка со всех покупок'}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>
              {isEn ? 'Priority instant auto-delivery with no queues' : 'Приоритетная автовыдача без ожидания очереди'}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>
              {isEn ? 'Access to exclusive API token drops' : 'Доступ к закрытым дропам API-токенов'}
            </span>
          </li>
        </ul>
      </div>

      {/* 💰 Пополнение баланса */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold text-white">
              {isEn ? 'Top Up Balance' : 'Пополнение баланса'}
            </h3>
          </div>
          {x2PromotionActive && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white animate-pulse">
              {isEn ? '🔥 X2 BONUS' : '🔥 X2 БОНУС'}
            </span>
          )}
        </div>
        <p className="text-xs text-white/60">
          {isEn
            ? 'Top up via CryptoBot (USDT, TON), Cards / SBP or Telegram Stars.'
            : 'Пополняйте баланс через CryptoBot (USDT, TON), Карты РФ / СБП или Telegram Stars.'}
        </p>
        <button
          onClick={() => {
            triggerHaptic('medium');
            onOpenTopUp();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          <span>{isEn ? 'Proceed to Top Up' : 'Перейти к пополнению'}</span>
        </button>
      </div>

      {/* 👥 Реферальная программа & Призовой фонд месяца */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-fuchsia-400" />
            <h3 className="text-sm font-extrabold text-white">
              {isEn ? 'Referral Program (10%)' : 'Реферальная программа (10%)'}
            </h3>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
            {isEn ? '🏆 $10 + Premium' : '🏆 $10 + Премиум'}
          </span>
        </div>

        {/* Призовой фонд месяца баннер */}
        <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-950/40 via-amber-950/30 to-black p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>{isEn ? 'Monthly Prize Pool: $10.00' : 'Призовой фонд месяца: $10.00'}</span>
            </div>
            <span className="text-[9px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
              {isEn ? 'Monthly' : 'Ежемесячно'}
            </span>
          </div>
          <p className="text-[11px] text-white/70">
            {isEn ? (
              <>
                The user who invites the most people this month gets <b className="text-yellow-400">$10.00 balance</b> and exclusive status <b className="text-fuchsia-300">«Premium Kotik» 👑</b>!
              </>
            ) : (
              <>
                Тот, кто пригласит больше всех людей за месяц, получит <b className="text-yellow-400">$10.00 на баланс</b> и эксклюзивный статус <b className="text-fuchsia-300">«Премиум Котик» 👑</b>!
              </>
            )}
          </p>
        </div>

        {/* Личная статистика приглашений */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] text-white/40 uppercase font-semibold">
              {isEn ? 'Friends Invited' : 'Приглашено друзей'}
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {isEn ? '0 users' : '0 чел.'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] text-white/40 uppercase font-semibold">
              {isEn ? 'Earned (10%)' : 'Заработано (10%)'}
            </div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">$0.00</div>
          </div>
        </div>

        {/* Ваша реферальная ссылка */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/60">
            {isEn ? 'Your Referral Link' : 'Ваша реферальная ссылка'}
          </label>
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
              <span>{copiedReferral ? (isEn ? 'Copied' : 'Скопировано') : (isEn ? 'Copy' : 'Копировать')}</span>
            </button>
          </div>
        </div>

        {/* Топ по приглашениям месяца */}
        <div className="pt-1 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white/70">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>{isEn ? 'Monthly Referral Leaderboard' : 'Топ приглашений (этого месяца)'}</span>
            </span>
            <span className="text-[10px] text-white/40">
              {isEn ? 'Real-time' : 'Реальное время'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-xs text-white/60">
              {isEn
                ? 'No referrals yet this month. Invite friends and earn 10%!'
                : 'В этом месяце ещё никто не пригласил рефералов.'}
            </p>
            <p className="text-[11px] text-yellow-400 font-bold mt-1">
              {isEn
                ? '🚀 Invite your first friend and become TOP-1 this month!'
                : '🚀 Пригласите первого друга и станьте ТОП-1 месяца!'}
            </p>
          </div>
        </div>
      </div>

      {/* 🔑 API & Интеграция */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-white">
              {isEn ? 'API & Integration' : 'API & Интеграция'}
            </h3>
          </div>
          <button
            onClick={regenerateApiKey}
            className="text-[10px] text-white/50 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isEn ? 'Refresh' : 'Обновить'}</span>
          </button>
        </div>
        <p className="text-xs text-white/60">
          {isEn
            ? 'Use your personal API key for automated subscriptions & accounts purchases via bots, websites or custom scripts.'
            : 'Используйте персональный ключ для автоматических закупок подписок и аккаунтов через ваших ботов, сайты или скрипты.'}
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
            <span>{copiedApiKey ? (isEn ? 'Done' : 'Готово') : (isEn ? 'Copy' : 'Копия')}</span>
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
          <span>{isEn ? '📖 Open API Documentation (cURL, Python, JS)' : '📖 Открыть документацию API (cURL, Python, JS)'}</span>
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
            <span>{isEn ? 'Terms of Service' : 'Пользовательское соглашение'}</span>
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
            <span>{isEn ? 'Privacy Policy' : 'Политика конфиденциальности'}</span>
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
            <span>{isEn ? 'Warranty & Refund Policy' : 'Гарантия и условия возврата'}</span>
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
            <span>{isEn ? 'Staff Admin Panel' : 'Панель Администратора'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
