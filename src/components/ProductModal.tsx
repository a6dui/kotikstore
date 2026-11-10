import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Zap,
  Mail,
  ChevronRight,
  User,
  Package,
  Edit3,
  Trash2,
  Save,
} from 'lucide-react';
import type { Product, ProductOption, DurationOption, Category } from '../types';
import { getLocalizedProduct, type Language } from '../utils/i18n';
import { BrandIconRenderer } from './BrandIcons';
import { haptic } from '../utils/telegram';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onProceedToCheckout: (orderConfig: {
    product: Product;
    option: ProductOption;
    duration: DurationOption;
    contact: string;
    totalPrice: number;
  }) => void;
  isStaff?: boolean;
  categories?: Category[];
  onUpdateProduct?: (updated: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  lang?: Language;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onProceedToCheckout,
  isStaff = false,
  categories = [],
  onUpdateProduct,
  onDeleteProduct,
  lang = 'ru',
}) => {
  const [customOptionId, setCustomOptionId] = useState<string | null>(null);
  const [customMonths, setCustomMonths] = useState<number | null>(null);
  const [contact, setContact] = useState<string>('');
  const [contactError, setContactError] = useState<string>('');

  // Admin inline editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editStartingPrice, setEditStartingPrice] = useState(0);
  const [editStockCount, setEditStockCount] = useState(0);
  const [editBadge, setEditBadge] = useState('');
  const [editCategory, setEditCategory] = useState('text_code');
  const [editDescription, setEditDescription] = useState('');
  const [editWarranty, setEditWarranty] = useState('');
  const [editInstruction, setEditInstruction] = useState('');

  useEffect(() => {
    if (product) {
      setEditTitle(product.title);
      setEditTagline(product.tagline);
      setEditStartingPrice(product.startingPrice);
      setEditStockCount(product.stockCount);
      setEditBadge(product.badge);
      setEditCategory(product.category);
      setEditDescription(product.description);
      setEditWarranty(product.warrantyText);
      setEditInstruction(product.instruction || '');
      setIsEditing(false);
      setCustomOptionId(null);
      setCustomMonths(null);
      setContact('');
      setContactError('');
    }
  }, [product]);

  if (!product) return null;

  // Localize for display if English
  const displayProduct = getLocalizedProduct(product, lang);

  const selectedOption =
    (customOptionId ? displayProduct.options.find((o) => o.id === customOptionId) : null) ||
    displayProduct.options[0];

  const selectedDuration =
    (customMonths !== null ? displayProduct.durations.find((d) => d.months === customMonths) : null) ||
    displayProduct.durations[0];

  // Calculate dynamic price with discounts
  const rawTotal = selectedOption.baseMonthlyPrice * selectedDuration.months;
  const discountAmount = (rawTotal * selectedDuration.discountPercent) / 100;
  const totalPrice = Math.round((rawTotal - discountAmount) * 100) / 100;
  const monthlyEquivalent = (totalPrice / selectedDuration.months).toFixed(1);

  const handleOptionSelect = (opt: ProductOption) => {
    haptic.selection();
    setCustomOptionId(opt.id);
    setContactError('');
  };

  const handleDurationSelect = (dur: DurationOption) => {
    haptic.selection();
    setCustomMonths(dur.months);
  };

  const handleClose = () => {
    setIsEditing(false);
    setCustomOptionId(null);
    setCustomMonths(null);
    setContact('');
    setContactError('');
    onClose();
  };

  const handleBuyClick = () => {
    if (selectedOption.isPersonal && !contact.trim()) {
      haptic.warning();
      setContactError(
        lang === 'en'
          ? 'Please provide your Email or @username for connection'
          : 'Пожалуйста, укажите ваш Email или @username для связи'
      );
      return;
    }

    haptic.heavy();
    onProceedToCheckout({
      product: displayProduct,
      option: selectedOption,
      duration: selectedDuration,
      contact: contact.trim(),
      totalPrice,
    });
    handleClose();
  };

  const handleSaveProductEdits = () => {
    if (!product || !onUpdateProduct) return;
    haptic.success();
    const updated: Product = {
      ...product,
      title: editTitle.trim() || product.title,
      tagline: editTagline.trim() || product.tagline,
      startingPrice: Number(editStartingPrice) || product.startingPrice,
      stockCount: Number(editStockCount) || 0,
      badge: editBadge.trim() || product.badge,
      category: editCategory as any,
      description: editDescription.trim() || product.description,
      warrantyText: editWarranty.trim() || product.warrantyText,
      instruction: editInstruction.trim() || product.instruction,
    };
    onUpdateProduct(updated);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!product || !onDeleteProduct) return;
    if (window.confirm(`Вы уверены, что хотите удалить товар «${product.title}»?`)) {
      haptic.warning();
      onDeleteProduct(product.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          haptic.light();
          handleClose();
        }}
      />

      {/* Slide-up Sheet */}
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto no-scrollbar rounded-t-[32px] bg-[#0d081d] border-t border-x border-white/15 p-5 pb-8 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 flex flex-col"
        style={{
          boxShadow: `0 -15px 50px -10px ${product.brandColor}33`,
        }}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center p-2.5 relative shadow-lg shrink-0"
              style={{
                backgroundColor: `${displayProduct.brandColor}22`,
                border: `1px solid ${displayProduct.brandColor}40`,
                color: displayProduct.brandColor,
              }}
            >
              <BrandIconRenderer type={displayProduct.iconType} size={28} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {displayProduct.title}
                </h2>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-gradient-to-r ${displayProduct.badgeColor}`}
                >
                  {displayProduct.badge}
                </span>
              </div>
              <p className="text-xs text-white/50">{displayProduct.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isStaff && (
              <button
                onClick={() => {
                  haptic.medium();
                  setIsEditing(!isEditing);
                }}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  isEditing
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-500/15 text-pink-300 border border-pink-500/30 hover:bg-pink-500/25'
                }`}
                title="Редактировать товар (Админ)"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => {
                haptic.light();
                handleClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stock / Availability Banner */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 mb-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-white/60">
            <span
              className={`w-2 h-2 rounded-full ${
                displayProduct.stockCount > 0 ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>
              {displayProduct.stockCount > 0
                ? (lang === 'en' ? `In stock: ${displayProduct.stockCount} pcs` : `В наличии на складе: ${displayProduct.stockCount} шт.`)
                : (lang === 'en' ? 'Pre-order (0 in stock) • Instant setup' : 'Под заказ (0 шт. на складе) • Быстрая выдача')}
            </span>
          </div>
          <span className="font-mono text-cyan-300 font-bold">
            {lang === 'en' ? 'from' : 'от'} ${displayProduct.startingPrice}{lang === 'en' ? '/mo' : '/мес'}
          </span>
        </div>

        {/* === ADMIN INLINE EDITING FORM === */}
        {isEditing ? (
          <div className="space-y-3.5 my-2 p-4 rounded-2xl bg-black/60 border border-pink-500/40 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-pink-500/20">
              <h3 className="text-xs font-extrabold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Редактирование товара (Админ)</span>
              </h3>
              <span className="text-[10px] text-white/40 font-mono">ID: {product.id}</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/70 uppercase block mb-1">
                Название товара:
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/70 uppercase block mb-1">
                Краткий слоган / особенности:
              </label>
              <input
                type="text"
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-white/70 uppercase block mb-1">
                  Категория:
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji || '✨'} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/70 uppercase block mb-1">
                  Бейдж:
                </label>
                <input
                  type="text"
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  placeholder="🔥 ХИТ ПРОДАЖ"
                  className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-white/70 uppercase block mb-1">
                  Цена «от $» (/мес):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editStartingPrice}
                  onChange={(e) => setEditStartingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/70 uppercase block mb-1">
                  Склад (шт.):
                </label>
                <input
                  type="number"
                  value={editStockCount}
                  onChange={(e) => setEditStockCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/70 uppercase block mb-1">
                Описание товара:
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/70 uppercase block mb-1">
                Текст гарантии:
              </label>
              <input
                type="text"
                value={editWarranty}
                onChange={(e) => setEditWarranty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/70 uppercase block mb-1">
                Инструкция покупателю:
              </label>
              <textarea
                rows={2}
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveProductEdits}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Сохранить товар</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-xs font-bold transition"
              >
                Отмена
              </button>
              {onDeleteProduct && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold border border-red-500/30 transition"
                  title="Удалить товар"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Product Warranty Badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-medium text-emerald-200">
                {displayProduct.warrantyText}
              </span>
            </div>

            {/* Key Features Checklist */}
            <div className="mb-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                {lang === 'en' ? 'Included in subscription:' : 'Что входит в подписку:'}
              </span>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {displayProduct.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selector 1: Account Type */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-white/70 mb-2">
                {lang === 'en' ? '1. Select Account Type:' : '1. Выберите тип подключения:'}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {displayProduct.options.map((opt) => {
                  const isSelected = selectedOption.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt)}
                      className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-950/50 to-purple-950/40 border-pink-500/60 shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-pink-500 text-white'
                              : 'bg-white/10 text-white/50'
                          }`}
                        >
                          {opt.isPersonal ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {opt.name}
                          </div>
                          <div className="text-[10px] text-white/50 max-w-[210px]">
                            {opt.description}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-pink-300 font-mono">
                          ${opt.baseMonthlyPrice}
                        </span>
                        <span className="text-[10px] text-white/40 block">
                          {lang === 'en' ? '/mo' : '/мес'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selector 2: Duration */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white/70">
                  {lang === 'en' ? '2. Duration:' : '2. Длительность подписки:'}
                </label>
                {selectedDuration.discountPercent > 0 && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {lang === 'en' ? `Discount ${selectedDuration.discountPercent}%` : `Скидка ${selectedDuration.discountPercent}%`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {displayProduct.durations.map((dur) => {
                  const isSelected = selectedDuration.months === dur.months;
                  const durLabel = lang === 'en'
                    ? dur.months === 1 ? '1 month' : dur.months === 12 ? '1 year' : `${dur.months} months`
                    : dur.label;
                  return (
                    <button
                      key={dur.months}
                      type="button"
                      onClick={() => handleDurationSelect(dur)}
                      className={`p-2.5 rounded-xl border text-center transition-all duration-200 relative ${
                        isSelected
                          ? 'bg-gradient-to-b from-pink-600/30 to-purple-600/20 border-pink-400 text-white shadow-[0_0_12px_-2px_rgba(236,72,153,0.4)]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {dur.discountPercent > 0 && (
                        <span className="absolute -top-1.5 -right-1 text-[8px] font-black px-1.5 py-0.2 rounded-full bg-pink-500 text-white shadow-sm">
                          -{dur.discountPercent}%
                        </span>
                      )}
                      <div className="text-xs font-bold">{durLabel}</div>
                      <div className="text-[10px] text-white/40 font-mono mt-0.5">
                        {dur.months === 1
                          ? `$${selectedOption.baseMonthlyPrice}${lang === 'en' ? '/mo' : '/мес'}`
                          : `~$${Math.round(
                              (selectedOption.baseMonthlyPrice *
                                (100 - dur.discountPercent)) /
                                100
                            )}${lang === 'en' ? '/mo' : '/мес'}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Required Input for Personal Upgrades / Invites */}
            {selectedOption.isPersonal && (
              <div className="mb-4 p-3 rounded-2xl bg-pink-950/20 border border-pink-500/30">
                <label className="text-xs font-bold text-pink-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Delivery Contact (Email or @Telegram): *' : 'Данные для подключения (Email или @Telegram): *'}</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (contactError) setContactError('');
                  }}
                  placeholder={lang === 'en' ? 'name@example.com or @username' : 'name@example.com или @username'}
                  className={`w-full px-3 py-2 rounded-xl bg-black/40 border text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-all ${
                    contactError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white/15 focus:border-pink-500 focus:ring-pink-500'
                  }`}
                />
                {contactError && (
                  <span className="text-[11px] text-red-400 mt-1 block">
                    {contactError}
                  </span>
                )}
              </div>
            )}

            {/* Price Breakdown & Instant Delivery notice */}
            <div className="mt-auto pt-2">
              <div className="flex items-center justify-between py-2 border-t border-white/10 mb-3">
                <div>
                  <span className="text-xs text-white/50 block">{lang === 'en' ? 'Total to pay:' : 'Итого к оплате:'}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-white font-mono">
                      ${totalPrice.toFixed(2)}
                    </span>
                    {selectedDuration.discountPercent > 0 && (
                      <span className="text-xs text-white/40 line-through font-mono">
                        ${rawTotal.toFixed(2)}
                      </span>
                    )}
                    <span className="text-[11px] text-pink-400 font-semibold ml-1">
                      (${monthlyEquivalent}{lang === 'en' ? '/mo' : '/мес'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Instant 1 min' : 'Автовыдача 1 мин'}</span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <button
                onClick={handleBuyClick}
                type="button"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-[0.98] text-white font-bold text-sm shadow-[0_0_25px_-5px_rgba(236,72,153,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{lang === 'en' ? `Buy Now for $${totalPrice.toFixed(2)}` : `Купить сейчас за $${totalPrice.toFixed(2)}`}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
