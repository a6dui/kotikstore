import React from 'react';
import { ShieldCheck, Zap, Star } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative w-full px-4 pt-2 pb-5 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-pink-600/20 rounded-full blur-[90px] pointer-events-none -z-10" />
      <div className="absolute top-10 left-4 w-40 h-40 bg-cyan-500/15 rounded-full blur-[70px] pointer-events-none -z-10" />
      <div className="absolute top-20 right-4 w-48 h-48 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Hero Mascot Container */}
      <div className="relative max-w-md mx-auto">
        <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/15 via-pink-500/20 to-purple-500/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(236,72,153,0.35)] overflow-hidden">
          
          {/* Inner card with dark cosmic background */}
          <div className="relative rounded-[22px] bg-gradient-to-b from-[#140c26]/90 via-[#0a0614]/95 to-[#07040d] p-3 overflow-hidden">
            
            {/* Mascot Image with floating animation */}
            <div className="relative w-full aspect-square max-h-[300px] mx-auto rounded-2xl overflow-hidden flex items-center justify-center">
              
              {/* Pulsing neon backlight behind cat */}
              <div className="absolute inset-0 bg-radial from-pink-500/30 via-purple-600/20 to-transparent blur-xl animate-pulse-subtle" />
              
              <img
                src={`${import.meta.env.BASE_URL}kotik-hero.jpg`}
                alt="Kotik Store AI & Subscriptions Mascot"
                className="w-full h-full object-cover rounded-xl animate-float transition-transform duration-700 hover:scale-105"
              />

              {/* Edge blending gradient overlay */}
              <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-white/10 bg-gradient-to-t from-[#07040d]/60 via-transparent to-black/20" />
            </div>

            {/* Quick Slogan / Subtitle */}
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-bold tracking-wide uppercase text-cyan-300">
                  Лучшие ИИ-сервисы в один клик
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed max-w-[320px] mx-auto">
                Официальные доступы к ChatGPT Plus, Gemini Advanced, Claude 3.7 и CapCut без зарубежных карт.
              </p>
            </div>
          </div>
        </div>

        {/* Status Ticker Bar */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-950/40 to-purple-950/30 border border-pink-500/20 backdrop-blur-md">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
              <Zap className="w-4 h-4 fill-pink-400/30 text-pink-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white leading-tight">Моментально</span>
              <span className="text-[10px] text-white/50 leading-tight">Автовыдача 24/7</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/20 backdrop-blur-md">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white leading-tight">100% Защита</span>
              <span className="text-[10px] text-white/50 leading-tight">Гарантия на весь срок</span>
            </div>
          </div>
        </div>

        {/* Small Social Proof Bar */}
        <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-white/40">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-white/80 font-semibold">4.9/5</span>
            <span>(2 400+ отзывов)</span>
          </div>
          <span>•</span>
          <span className="text-emerald-400/90 font-medium">Работаем без перебоев</span>
        </div>
      </div>
    </div>
  );
};
