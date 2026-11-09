import type { TelegramUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        enableClosingConfirmation?: () => void;
        openTelegramLink?: (url: string) => void;
        openLink?: (url: string) => void;
        initDataUnsafe?: {
          user?: TelegramUser;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
      };
    };
  }
}

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const initTelegramApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#07040d');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#07040d');
      if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
    } catch (e) {
      console.warn('Error initializing Telegram WebApp SDK:', e);
    }
  }
};

export const haptic = {
  light: () => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    } catch {
      // ignore
    }
  },
  medium: () => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    } catch {
      // ignore
    }
  },
  heavy: () => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
    } catch {
      // ignore
    }
  },
  success: () => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch {
      // ignore
    }
  },
  warning: () => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning');
    } catch {
      // ignore
    }
  },
  selection: () => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    } catch {
      // ignore
    }
  },
};

export const getTelegramUser = (): TelegramUser => {
  const tg = getTelegramWebApp();
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user;
  }
  return {
    first_name: 'Котик',
    last_name: 'Гость',
    username: 'kotik_friend',
    photo_url: '',
  };
};

export const triggerHaptic = (
  style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'selection' = 'light'
) => {
  if (style === 'selection') {
    haptic.selection();
  } else if (style === 'success' || style === 'warning') {
    haptic[style]();
  } else {
    haptic[style]();
  }
};

export const openTelegramOrWeb = (url: string) => {

  const tg = getTelegramWebApp();
  if (tg?.openTelegramLink && url.startsWith('https://t.me/')) {
    tg.openTelegramLink(url);
  } else if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank');
  }
};
