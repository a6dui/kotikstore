import React from 'react';
import { ShoppingBag, ClipboardList, MessageSquare, Trophy, Heart, User, Sliders } from 'lucide-react';
import type { ActiveView } from '../types';
import { triggerHaptic } from '../utils/telegram';

interface BottomNavProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  ordersCount: number;
  wishlistCount: number;
  isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onChangeView,
  ordersCount,
  wishlistCount,
  isAdmin = false,
}) => {
  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'shop',
      label: 'Магазин',
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'Заказы',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: ordersCount > 0 ? ordersCount : undefined,
    },
    {
      id: 'reviews',
      label: 'Отзывы',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'leaderboard',
      label: 'Топ',
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: 'wishlist',
      label: 'Избранное',
      icon: <Heart className="w-4 h-4" />,
      badge: wishlistCount > 0 ? wishlistCount : undefined,
    },
    {
      id: 'profile',
      label: 'Кабинет',
      icon: <User className="w-4 h-4" />,
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Админка',
      icon: <Sliders className="w-4 h-4" />,
    });
  }

  const handleTabClick = (viewId: ActiveView) => {
    if (activeView !== viewId) {
      triggerHaptic('selection');
      onChangeView(viewId);
    }
  };

  return (
    <div className="fixed bottom-2 inset-x-2 max-w-md mx-auto z-40">
      <nav className="px-1 py-1 rounded-2xl bg-[#0c0717]/95 backdrop-blur-2xl border border-white/10 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.9)] flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex-1 py-1.5 px-1 flex flex-col items-center justify-center transition-all rounded-xl ${
                isActive
                  ? 'text-white font-extrabold bg-gradient-to-b from-fuchsia-500/20 to-cyan-500/10 border border-fuchsia-500/30 shadow-md shadow-fuchsia-500/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <div className="relative">
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''}`}>
                  {item.icon}
                </div>
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-[9px] font-black text-white flex items-center justify-center shadow-md shadow-pink-500/40">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] mt-0.5 tracking-tight truncate max-w-[50px] ${isActive ? 'text-white font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
