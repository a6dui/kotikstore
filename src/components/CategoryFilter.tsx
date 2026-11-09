import React, { useState } from 'react';
import { Search, X, Sparkles, Plus, Edit2, Trash2, Check } from 'lucide-react';
import type { Category, ProductCategory } from '../types';
import { haptic } from '../utils/telegram';

interface CategoryFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  categories: Category[];
  counts: Record<string, number>;
  isStaff?: boolean;
  onAddCategory?: (category: Category) => void;
  onUpdateCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  counts,
  isStaff = false,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('✨');

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCategoryClick = (catId: ProductCategory) => {
    if (selectedCategory !== catId) {
      haptic.selection();
      onSelectCategory(catId);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !onAddCategory) return;
    haptic.success();
    const id = `cat_${Date.now()}`;
    onAddCategory({
      id,
      name: newCatName.trim(),
      emoji: newCatEmoji.trim() || '✨',
    });
    setNewCatName('');
    setIsAdding(false);
  };

  const handleSaveCategoryName = (cat: Category) => {
    if (!editName.trim() || !onUpdateCategory) return;
    haptic.success();
    onUpdateCategory({
      ...cat,
      name: editName.trim(),
    });
    setEditingCatId(null);
  };

  const handleDelete = (catId: string, name: string) => {
    if (!onDeleteCategory) return;
    if (window.confirm(`Удалить категорию «${name}»?`)) {
      haptic.warning();
      onDeleteCategory(catId);
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
          const isCurrentEditing = editingCatId === cat.id;

          if (isCurrentEditing) {
            return (
              <div key={cat.id} className="flex items-center gap-1 bg-black/80 border border-pink-500 px-2 py-1 rounded-xl">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-transparent text-xs text-white w-24 outline-none font-bold"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveCategoryName(cat)}
                  className="text-emerald-400 p-1 hover:text-white"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingCatId(null)}
                  className="text-white/40 p-1 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          return (
            <div key={cat.id} className="relative group shrink-0 flex items-center">
              <button
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

              {/* Admin quick category actions for non-default categories */}
              {isStaff && cat.id !== 'all' && isActive && (
                <div className="ml-1 flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic.light();
                      setEditingCatId(cat.id);
                      setEditName(cat.name);
                    }}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
                    title="Переименовать категорию"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cat.id, cat.name);
                    }}
                    className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                    title="Удалить категорию"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Admin "+ Категория" button */}
        {isStaff && (
          <button
            onClick={() => {
              haptic.medium();
              setIsAdding(!isAdding);
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Категория</span>
          </button>
        )}
      </div>

      {/* Admin Add Category Popover */}
      {isAdding && (
        <form onSubmit={handleCreateCategory} className="p-3 rounded-2xl bg-black/80 border border-pink-500/40 flex items-center gap-2 animate-fade-in">
          <input
            type="text"
            value={newCatEmoji}
            onChange={(e) => setNewCatEmoji(e.target.value)}
            className="w-10 px-2 py-1.5 rounded-xl bg-white/10 border border-white/20 text-center text-xs text-white"
            placeholder="✨"
            maxLength={2}
          />
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/30"
            placeholder="Название категории..."
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-pink-500 text-white font-bold text-xs shadow-md"
          >
            Добавить
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-2 py-1.5 text-white/50 hover:text-white text-xs"
          >
            Отмена
          </button>
        </form>
      )}
    </div>
  );
};
