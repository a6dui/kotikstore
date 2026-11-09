import React from 'react';
import { ArrowRight, Heart, Zap } from 'lucide-react';
import type { Product } from '../types';
import type { Language } from '../utils/i18n';
import { BrandIconRenderer } from './BrandIcons';
import { haptic } from '../utils/telegram';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
  lang?: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  lang = 'ru',
}) => {
  const handleClick = () => {
    haptic.medium();
    onSelect(product);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.light();
    if (onToggleFavorite) onToggleFavorite(product.id);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md cursor-pointer overflow-hidden shadow-lg select-none"
      style={{
        boxShadow: `0 8px 30px -10px ${product.brandColor}22`,
      }}
    >
      {/* Individual Brand Glow on Top-Right Corner */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${product.brandColor} 0%, transparent 70%)`,
        }}
      />

      {/* Top Row: Icon + Badge + Favorite */}
      <div>
        <div className="flex items-start justify-between gap-1.5 mb-2.5">
          {/* Brand Icon Box */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center p-2 relative shadow-md transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundColor: `${product.brandColor}18`,
              border: `1px solid ${product.brandColor}35`,
              color: product.brandColor,
            }}
          >
            <BrandIconRenderer type={product.iconType} size={22} />
          </div>

          <div className="flex items-center gap-1">
            {/* Badge */}
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-gradient-to-r whitespace-nowrap tracking-tight ${product.badgeColor}`}
            >
              {product.badge}
            </span>

            {/* Favorite button */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={handleHeartClick}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 transition text-white/40 hover:text-pink-400"
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isFavorite ? 'fill-pink-500 text-pink-500' : 'text-white/40'
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Flash Sale Banner if active */}
        {product.flashSale?.active && (
          <div className="mb-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/30 flex items-center justify-between text-[9px] font-bold text-amber-300">
            <span className="flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              FLASH -{product.flashSale.discountPercent}%
            </span>
            <span className="font-mono text-white/50">~{product.flashSale.hoursRemaining}ч</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-bold text-white tracking-tight leading-snug group-hover:text-pink-300 transition-colors">
          {product.title}
        </h3>

        {/* Short Tagline */}
        <p className="text-[11px] text-white/50 line-clamp-2 mt-1 leading-normal">
          {product.tagline}
        </p>

        {/* Stock indicator badge */}
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{lang === 'en' ? `Stock: ${product.stockCount} pcs` : `Склад: ${product.stockCount} шт`}</span>
        </div>
      </div>

      {/* Bottom Section: Price & Action */}
      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">
            {lang === 'en' ? 'Price' : 'Цена'}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span
              className="text-xs font-bold font-mono"
              style={{ color: product.brandColor }}
            >
              {lang === 'en' ? 'from' : 'от'} ${product.startingPrice}
            </span>
            <span className="text-[9px] text-white/40">{lang === 'en' ? '/mo' : '/мес'}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/10 text-white group-hover:text-white transition-all duration-300 group-hover:scale-110 active:scale-90"
          style={{
            backgroundColor: `${product.brandColor}25`,
            color: product.brandColor,
            border: `1px solid ${product.brandColor}50`,
          }}
          aria-label={`Выбрать ${product.title}`}
        >
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
