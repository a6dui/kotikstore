import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import type { PolicyType } from '../types';
import { POLICIES_TEXT } from '../data/initialData';
import { triggerHaptic } from '../utils/telegram';

interface PolicyModalProps {
  isOpen: boolean;
  type: PolicyType | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  const policy = POLICIES_TEXT[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md max-h-[85vh] rounded-3xl border border-white/10 bg-[#0d0914] p-6 shadow-2xl flex flex-col space-y-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-white">{policy.title}</h3>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs text-white/80 whitespace-pre-line leading-relaxed space-y-3 font-sans">
          {policy.content}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all"
          >
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
