import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import type { Category, ProductCategory } from '../types';
import { haptic } from '../utils/telegram';

interface CategoryFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  categories: Category[];
  counts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  counts,
}) => {
  const handleCategoryClick = (catId: ProductCategory) => {
    if (selectedCategory !== catId) {
      haptic.selection();
      onSelectCategory(catId);
    }
  };

  return (
    <div className="w-full px-4 mb-4 max-w-md mx-auto space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Найти нейросеть (ChatGPT, Gemini, Claude...)"
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/35 text-xs focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/50 backdrop-blur-md transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => {
              haptic.light();
              onSearchChange('');
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = counts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 text-white shadow-[0_0_15px_-2px_rgba(236,72,153,0.5)] border border-pink-400/40'
                  : 'bg-white/5 text-white/70 hover:text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-xs">
                {cat.emoji || <Sparkles className="w-3.5 h-3.5" />}
              </span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
