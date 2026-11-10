import React from 'react';
import { Plus, Wallet, Sparkles, SlidersHorizontal, Flame } from 'lucide-react';
import type { TelegramUser } from '../types';
import type { Language } from '../utils/i18n';
import { haptic } from '../utils/telegram';

interface HeaderProps {
  user: TelegramUser;
  balance: number;
  onOpenTopUp: () => void;
  onOpenAdmin: () => void;
  x2PromotionActive?: boolean;
  isStaff?: boolean;
  lang?: Language;
  onToggleLanguage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  balance,
  onOpenTopUp,
  onOpenAdmin,
  x2PromotionActive = false,
  isStaff = false,
  lang = 'ru',
  onToggleLanguage,
}) => {
  const handleTopUpClick = () => {
    haptic.medium();
    onOpenTopUp();
  };

  const handleAdminClick = () => {
    haptic.heavy();
    onOpenAdmin();
  };

  const displayName = user.first_name 
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}` 
    : user.username 
    ? `@${user.username}` 
    : (lang === 'en' ? 'Kotik Friend' : 'Котик-Друг');

  return (
    <header className="sticky top-0 z-30 w-full px-4 py-3 bg-[#07040d]/85 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400">
              <div className="w-full h-full rounded-full bg-[#0d091a] flex items-center justify-center overflow-hidden">
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-base font-bold bg-gradient-to-br from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    🐱
                  </div>
                )}
              </div>
            </div>
            {/* Online Pulse Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#07040d] rounded-full shadow-[0_0_8px_#10b981]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/50 font-medium">
                {lang === 'en' ? 'Hello,' : 'Привет,'}
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[105px]">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-pink-400/90 font-medium">
              <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
              <span>Kotik Club</span>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Pill */}
          <button
            onClick={() => {
              haptic.light();
              if (onToggleLanguage) onToggleLanguage();
            }}
            type="button"
            title="Переключить язык / Switch Language"
            className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black text-white/90 hover:text-white transition-all flex items-center gap-1 active:scale-95 shadow-sm"
          >
            <span>{lang === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}</span>
          </button>

          {/* Admin Access Button (ONLY for verified staff & owners) */}
          {isStaff && (
            <button
              onClick={handleAdminClick}
              type="button"
              title="Панель администратора"
              className="w-8 h-8 rounded-full bg-pink-500/20 hover:bg-pink-500/30 active:scale-95 border border-pink-500/40 text-pink-300 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(236,72,153,0.3)] animate-pulse"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Interactive Balance Pill */}
          <button
            onClick={handleTopUpClick}
            className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-950/60 via-pink-950/50 to-purple-950/60 border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(236,72,153,0.25)] active:scale-95"
          >
            {x2PromotionActive && (
              <span className="absolute -top-2 -right-1 text-[8px] font-black px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow animate-pulse flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-white text-white" />
                X2
              </span>
            )}

            <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:rotate-12 transition-transform">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white font-mono tracking-tight">
              ${balance.toFixed(2)}
            </span>
            <div className="w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
