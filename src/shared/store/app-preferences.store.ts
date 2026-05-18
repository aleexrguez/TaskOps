import { create } from 'zustand';
import type {
  ThemePreference,
  RetentionPolicy,
} from '@/shared/types/preferences.types';

const THEME_KEY = 'task-manager-theme';
const RETENTION_KEY = 'task-manager-retention-policy';
const SIDEBAR_KEY = 'task-manager-sidebar-collapsed';
const REMINDERS_KEY = 'task-manager-reminders-enabled';
const ANIMATED_BG_KEY = 'task-manager-animated-bg';

interface AppPreferencesState {
  theme: ThemePreference;
  retentionPolicy: RetentionPolicy;
  isSidebarCollapsed: boolean;
  remindersEnabled: boolean;
  animatedBackground: boolean;

  setTheme: (theme: ThemePreference) => void;
  setRetentionPolicy: (policy: RetentionPolicy) => void;
  toggleSidebar: () => void;
  toggleReminders: () => void;
  toggleAnimatedBackground: () => void;
}

function getInitialTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    // Migrate from old boolean dark mode key
    const oldDarkMode = localStorage.getItem('task-manager-dark-mode');
    if (oldDarkMode === 'true') return 'dark';
    if (oldDarkMode === 'false') return 'light';
    return 'system';
  } catch {
    return 'system';
  }
}

function getInitialRetentionPolicy(): RetentionPolicy {
  try {
    const stored = localStorage.getItem(RETENTION_KEY);
    if (
      stored === '5d' ||
      stored === '7d' ||
      stored === '30d' ||
      stored === 'never'
    ) {
      return stored;
    }
    return 'never';
  } catch {
    return 'never';
  }
}

function getInitialSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  } catch {
    return false;
  }
}

function getInitialRemindersEnabled(): boolean {
  try {
    const stored = localStorage.getItem(REMINDERS_KEY);
    if (stored === null) return true;
    return stored !== 'false';
  } catch {
    return true;
  }
}

function getInitialAnimatedBackground(): boolean {
  try {
    return localStorage.getItem(ANIMATED_BG_KEY) === 'true';
  } catch {
    return false;
  }
}

export const useAppPreferencesStore = create<AppPreferencesState>((set) => ({
  theme: getInitialTheme(),
  retentionPolicy: getInitialRetentionPolicy(),
  isSidebarCollapsed: getInitialSidebarCollapsed(),
  remindersEnabled: getInitialRemindersEnabled(),
  animatedBackground: getInitialAnimatedBackground(),

  setTheme: (theme) =>
    set(() => {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        // ignore
      }
      return { theme };
    }),

  setRetentionPolicy: (policy) =>
    set(() => {
      try {
        localStorage.setItem(RETENTION_KEY, policy);
      } catch {
        // ignore
      }
      return { retentionPolicy: policy };
    }),

  toggleSidebar: () =>
    set((state) => {
      const next = !state.isSidebarCollapsed;
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next));
      } catch {
        // ignore
      }
      return { isSidebarCollapsed: next };
    }),

  toggleReminders: () =>
    set((state) => {
      const next = !state.remindersEnabled;
      try {
        localStorage.setItem(REMINDERS_KEY, String(next));
      } catch {
        // ignore
      }
      return { remindersEnabled: next };
    }),

  toggleAnimatedBackground: () =>
    set((state) => {
      const next = !state.animatedBackground;
      try {
        localStorage.setItem(ANIMATED_BG_KEY, String(next));
      } catch {
        // ignore
      }
      return { animatedBackground: next };
    }),
}));
