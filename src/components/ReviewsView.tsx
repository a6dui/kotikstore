import React, { useState } from 'react';
import { Star, MessageSquare, Plus, CheckCircle, ShieldCheck } from 'lucide-react';
import type { Review } from '../types';
import { triggerHaptic } from '../utils/telegram';

interface ReviewsViewProps {
  reviews: Review[];
  onOpenReviewModal: () => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ reviews, onOpenReviewModal }) => {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const filteredReviews = filterRating === 'all'
    ? reviews
    : reviews.filter((r) => r.rating === filterRating);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header card with average rating */}
      <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 via-black/40 to-black/80 p-5 text-center shadow-xl backdrop-blur-md">
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-yellow-500/10 blur-2xl" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-2xl" />

        <div className="relative z-10">
          <div className="text-4xl font-black text-yellow-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            {avgRating}
          </div>
          <div className="flex justify-center items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
              />
            ))}
          </div>
          <div className="text-xs text-white/60 font-medium">
            Основано на {reviews.length} подтвержденных отзывах
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenReviewModal();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-fuchsia-500/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Оставить отзыв</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => {
            triggerHaptic('selection');
            setFilterRating('all');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filterRating === 'all'
              ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/30'
              : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
          }`}
        >
          Все ({reviews.length})
        </button>
        {[5, 4, 3].map((star) => {
          const count = reviews.filter((r) => r.rating === star).length;
          return (
            <button
              key={star}
              onClick={() => {
                triggerHaptic('selection');
                setFilterRating(star);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                filterRating === star
                  ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              <span>{star}</span>
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/50 text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Отзывов в этой категории пока нет.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 shadow-lg backdrop-blur-md space-y-3 transition-all hover:border-white/20"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={rev.username}
                    className="w-8 h-8 rounded-full border border-fuchsia-500/30 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{rev.username}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="flex items-center gap-0.5 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>Куплено</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-white/40">{rev.createdAt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-white/10 text-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Product tag */}
              <div className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-300">
                {rev.productName}
              </div>

              {/* Review Comment */}
              <p className="text-xs text-white/85 leading-relaxed">
                {rev.comment}
              </p>

              {/* Seller Reply */}
              {rev.sellerReply && (
                <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-2.5 text-[11px] text-white/80 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-fuchsia-400 text-[10px]">
                    <CheckCircle className="w-3 h-3" />
                    <span>Ответ команды Kotik Store:</span>
                  </div>
                  <p className="italic text-white/70">{rev.sellerReply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
