import React, { useState } from 'react';
import { Trophy, Medal, Sparkles, Crown, Flame } from 'lucide-react';
import type { LeaderboardPeriod, LeaderboardUser } from '../types';
import { triggerHaptic } from '../utils/telegram';

interface LeaderboardViewProps {
  leaderboardData: Record<string, LeaderboardUser[]>;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboardData }) => {
  const [period, setPeriod] = useState<LeaderboardPeriod>('7d');

  const users = leaderboardData[period] || [];
  const top1 = users.find((u) => u.rank === 1);
  const top2 = users.find((u) => u.rank === 2);
  const top3 = users.find((u) => u.rank === 3);
  const others = users.filter((u) => u.rank > 3);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Title & Description */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>Зал славы Kotik Store</span>
        </div>
        <h2 className="text-lg font-black text-white tracking-wide">
          Топ активных покупателей
        </h2>
        <p className="text-xs text-white/50 max-w-xs mx-auto">
          Совершайте покупки, попадайте в топ и получайте бонусные $ на баланс и статус Kotik VIP!
        </p>
      </div>

      {/* Period Switcher Tabs (exact ZykoStore style) */}
      <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 gap-1">
        {[
          { id: '24h', label: '24 часа' },
          { id: '7d', label: '7 дней' },
          { id: '30d', label: '30 дней' },
          { id: 'all_time', label: 'Все время' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic('selection');
              setPeriod(tab.id as LeaderboardPeriod);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              period === tab.id
                ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white shadow-md shadow-fuchsia-500/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rewards Banner - Monthly Prize Pool */}
      <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-950/40 via-amber-950/30 to-fuchsia-950/30 p-4 backdrop-blur-md flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-400 flex items-center justify-center text-black shrink-0 shadow-lg shadow-yellow-500/20 font-black">
          <Crown className="w-6 h-6 fill-black" />
        </div>
        <div className="text-xs space-y-0.5">
          <div className="font-extrabold text-white flex items-center gap-1.5">
            <span>Призовой фонд месяца: $10.00</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <p className="text-white/80 text-[11px]">
            Победитель месяца в ТОПе получает <b className="text-yellow-400">+$10.00 на баланс</b> и статус <b className="text-fuchsia-300">«Премиум Котик» 👑</b>!
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-white/[0.03] border border-white/10 my-4 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-3">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            Рейтинг пока формируется
          </h3>
          <p className="text-xs text-white/50 max-w-[280px] mb-2">
            В этом периоде пока нет завершенных заказов. Совершите первую покупку или пригласите друга, чтобы занять 1-е место!
          </p>
          <div className="text-[11px] font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-xl">
            🏆 Награда ТОП-1: $10.00 + Премиум Котик 👑
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="pt-6 pb-2 px-2 flex items-end justify-center gap-3">
            {/* 2nd Place */}
            {top2 && (
              <div className="flex-1 flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src={top2.avatar}
                    alt={top2.name}
                    className="w-14 h-14 rounded-full border-2 border-slate-300 object-cover shadow-lg shadow-slate-300/20"
                  />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center border-2 border-[#07040d]">
                    2
                  </span>
                </div>
                <span className="text-xs font-bold text-white max-w-[85px] truncate text-center">
                  {top2.name}
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-300">
                  ${top2.spent.toFixed(0)}
                </span>
                <div className="w-full mt-2 h-20 rounded-t-2xl bg-gradient-to-t from-slate-400/20 to-slate-400/5 border-t-2 border-slate-300/40 flex items-center justify-center">
                  <Medal className="w-6 h-6 text-slate-300 opacity-60" />
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top1 && (
              <div className="flex-1 flex flex-col items-center -mt-4">
                <div className="relative mb-2">
                  <Crown className="w-6 h-6 text-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-bounce" />
                  <img
                    src={top1.avatar}
                    alt={top1.name}
                    className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover shadow-xl shadow-yellow-400/30"
                  />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 text-yellow-950 font-black text-xs flex items-center justify-center border-2 border-[#07040d]">
                    1
                  </span>
                </div>
                <span className="text-xs font-black text-yellow-300 max-w-[95px] truncate text-center">
                  {top1.name}
                </span>
                <span className="text-xs font-mono font-extrabold text-yellow-400">
                  ${top1.spent.toFixed(0)}
                </span>
                <div className="w-full mt-2 h-28 rounded-t-2xl bg-gradient-to-t from-yellow-500/25 to-yellow-500/10 border-t-2 border-yellow-400/50 flex flex-col items-center justify-center shadow-lg shadow-yellow-500/10">
                  <Trophy className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                  <span className="text-[10px] font-bold text-yellow-300 mt-1">ТОП 1</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <div className="flex-1 flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src={top3.avatar}
                    alt={top3.name}
                    className="w-14 h-14 rounded-full border-2 border-amber-600 object-cover shadow-lg shadow-amber-600/20"
                  />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center border-2 border-[#07040d]">
                    3
                  </span>
                </div>
                <span className="text-xs font-bold text-white max-w-[85px] truncate text-center">
                  {top3.name}
                </span>
                <span className="text-[11px] font-mono font-bold text-fuchsia-300">
                  ${top3.spent.toFixed(0)}
                </span>
                <div className="w-full mt-2 h-16 rounded-t-2xl bg-gradient-to-t from-amber-700/20 to-amber-700/5 border-t-2 border-amber-600/40 flex items-center justify-center">
                  <Medal className="w-6 h-6 text-amber-600 opacity-60" />
                </div>
              </div>
            )}
          </div>

          {/* Rest of the leaderboard table (4 to 10) */}
          {others.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden">
              <div className="p-3 border-b border-white/10 text-xs font-bold text-white/50 flex items-center justify-between">
                <span>Рейтинг участников</span>
                <span>Всего покупок</span>
              </div>
              <div className="divide-y divide-white/5">
                {others.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-mono font-bold text-xs text-white/50">
                        #{u.rank}
                      </span>
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-fuchsia-300 font-normal">
                              {u.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/40 flex items-center gap-2">
                          <span>@{u.username}</span>
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Flame className="w-3 h-3" />
                            <span>{u.streak} дн.</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        ${u.spent.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-white/40">
                        {u.ordersCount} заказов
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
