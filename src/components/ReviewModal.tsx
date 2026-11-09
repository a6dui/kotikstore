import React, { useState } from 'react';
import { X, Star, Sparkles, Send } from 'lucide-react';
import type { Product, Review } from '../types';
import { triggerHaptic } from '../utils/telegram';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmitReview: (review: Omit<Review, 'id' | 'createdAt' | 'sellerReply'>) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  products,
  onSubmitReview,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || 'chatgpt-plus'
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    triggerHaptic('success');
    const selectedProduct = products.find((p) => p.id === selectedProductId);

    onSubmitReview({
      userId: `tg_${Math.floor(100000 + Math.random() * 900000)}`,
      username: authorName.trim() || 'Покупатель Kotik',
      productId: selectedProductId,
      productName: selectedProduct ? selectedProduct.title : 'Нейросеть',
      rating,
      comment: comment.trim(),
      isVerifiedPurchase: true,
    });

    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-0 animate-fade-in sm:items-center sm:p-4">
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0d0914] p-6 shadow-2xl space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center text-black font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Оставить отзыв</h3>
              <p className="text-[11px] text-white/50">Поделитесь вашим впечатлением</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating stars */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2 text-center">
              Ваша оценка:
            </label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      triggerHaptic('selection');
                      setRating(star);
                    }}
                    className="p-1.5 transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isFilled
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                          : 'fill-white/5 text-white/20'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product selector */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Купленный товар:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-fuchsia-500 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Author Name */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Ваше имя (или никнейм):
            </label>
            <input
              type="text"
              placeholder="Например: Алексей или @alex_ai"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-fuchsia-500 focus:outline-none"
            />
          </div>

          {/* Review text */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Текст отзыва:
            </label>
            <textarea
              required
              rows={3}
              placeholder="Как прошла активация? Довольны ли скоростью выдачи и стабильностью?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-fuchsia-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!comment.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-fuchsia-500 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Опубликовать отзыв</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
