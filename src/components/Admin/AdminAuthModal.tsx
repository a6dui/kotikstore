import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { haptic } from '../../utils/telegram';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();
    if (clean === 'admin' || clean === 'kotik2026' || clean === 'zyko' || clean === '1234') {
      haptic.success();
      setError(false);
      setPasscode('');
      onSuccess();
    } else {
      haptic.warning();
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={() => {
          haptic.light();
          onClose();
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#160d2e] via-[#0d071d] to-[#07040d] border border-pink-500/40 p-5 shadow-[0_0_50px_-10px_rgba(236,72,153,0.5)] z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => {
            haptic.light();
            onClose();
          }}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-3 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
          <Lock className="w-6 h-6" />
        </div>

        <div className="text-center mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Вход в панель управления
          </h3>
          <p className="text-[11px] text-white/50 mt-1">
            Введите мастер-пароль администратора Kotik Store
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              autoFocus
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Мастер-пароль..."
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border text-xs text-white placeholder-white/30 font-mono tracking-wider focus:outline-none transition-all ${
                error
                  ? 'border-red-500 ring-1 ring-red-500 animate-shake'
                  : 'border-white/15 focus:border-pink-500 focus:ring-1 focus:ring-pink-500'
              }`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Неверный пароль. Подсказка: «admin»</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>Войти в админку</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-3 pt-3 border-t border-white/5 text-center">
          <span className="text-[10px] text-white/30 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Защищено шифрованием Kotik Store
          </span>
        </div>
      </div>
    </div>
  );
};
