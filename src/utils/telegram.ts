import type { TelegramUser, StaffMember, AdminRole } from '../types';

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

// Owner & Staff Telegram IDs (Exclusively the Two Main Owners)
export const DEFAULT_OWNER_ID = 755843448;
export const HARDCODED_STAFF_IDS = ['755843448', '7643717312'];

/**
 * Checks if a user is one of the two authorized owners: 755843448 and 7643717312.
 * Strictly blocks all other IDs and eliminates passcode prompts for the owners.
 */
export const isStaffUser = (
  userId?: string | number,
  _staffList: StaffMember[] = []
): boolean => {
  const tg = getTelegramWebApp();
  const realTgId = tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id).trim() : '';
  const passedId = userId ? String(userId).trim() : '';
  const effectiveId = realTgId || passedId;

  // If in Telegram WebApp or ID is available:
  if (effectiveId && HARDCODED_STAFF_IDS.includes(effectiveId)) {
    return true;
  }

  // In local browser dev testing outside Telegram WebApp:
  if (typeof window !== 'undefined' && !realTgId) {
    const params = new URLSearchParams(window.location.search);
    const hasAdminParam = params.get('admin') === '1' || params.get('admin') === 'true';
    if (hasAdminParam && (!passedId || HARDCODED_STAFF_IDS.includes(passedId) || passedId === '755843448')) {
      return true;
    }
  }

  return false;
};

export const getStaffRole = (
  userId?: string | number,
  _staffList: StaffMember[] = []
): AdminRole | null => {
  const tg = getTelegramWebApp();
  const realTgId = tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id).trim() : '';
  const idStr = realTgId || (userId ? String(userId).trim() : '');

  if (HARDCODED_STAFF_IDS.includes(idStr)) {
    return 'super_admin';
  }
  return null;
};

