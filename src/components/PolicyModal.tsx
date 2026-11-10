import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import type { PolicyType } from '../types';
import { POLICIES_TEXT } from '../data/initialData';
import type { Language } from '../utils/i18n';
import { triggerHaptic } from '../utils/telegram';

const POLICIES_TEXT_EN: Record<PolicyType, { title: string; content: string }> = {
  rules: {
    title: '📜 Terms of Service',
    content: `1. General Terms
1.1. These Terms of Service ("Agreement") govern the use of the Kotik Store service ("Service").
1.2. By launching the Telegram bot, opening the WebApp, or purchasing any subscriptions, you agree to these Terms in full.
1.3. If you do not agree with any part of these Terms, please discontinue using the Service.

2. Digital Goods and Subscriptions
2.1. The Service provides digital subscriptions, license activations, and accounts for artificial intelligence platforms.
2.2. All access credentials and activation keys are delivered automatically upon successful payment.
2.3. The customer receives 24/7 technical support and warranty for the entire duration of the purchased subscription.

3. Customer Responsibilities
3.1. Customers must not resell, abuse, or modify shared account credentials.
3.2. Any breach of platform security or violation of AI provider guidelines may lead to access revocation without refund.`,
  },
  privacy: {
    title: '🛡️ Privacy Policy',
    content: `1. Information We Collect
1.1. We only process your Telegram public user ID and username necessary for order delivery and customer support.
1.2. We do not store or process sensitive banking details. All transactions are securely handled by official payment gateways.

2. Data Protection
2.1. All stored information is protected using industry-standard encryption protocols.
2.2. We never sell, lease, or share your data with unauthorized third parties.`,
  },
  refund: {
    title: '🔄 Warranty & Refund Policy',
    content: `1. Full Duration Warranty
1.1. Kotik Store provides 100% warranty on all purchased AI subscriptions for their entire validity period.
1.2. If an account or subscription stops functioning, our support team will restore access or provide an instant replacement within 24 hours.

2. Refund Policy
2.1. If an issue cannot be resolved by support, the customer is entitled to a full or prorated refund back to their store balance or original payment method.
2.2. For warranty claims or technical support, contact @Zykolandstore.`,
  },
};

interface PolicyModalProps {
  isOpen: boolean;
  type: PolicyType | null;
  onClose: () => void;
  lang?: Language;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, type, onClose, lang = 'ru' }) => {
  if (!isOpen || !type) return null;

  const policy = lang === 'en' ? POLICIES_TEXT_EN[type] : POLICIES_TEXT[type];

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
            {lang === 'en' ? 'Close' : 'Понятно, закрыть'}
          </button>
        </div>
      </div>
    </div>
  );
};
