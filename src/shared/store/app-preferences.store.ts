import { create } from 'zustand';
import type {
  ThemePreference,
  RetentionPolicy,
} from '@/shared/types/preferences.types';

const THEME_KEY = 'task-manager-theme';
const RETENTION_KEY = 'task-manager-retention-policy';
const SIDEBAR_KEY = 'task-manager-sidebar-collapsed';

interface AppPreferencesState {
  theme: ThemePreference;
  retentionPolicy: RetentionPolicy;
  isSidebarCollapsed: boolean;

  setTheme: (theme: ThemePreference) => void;
  setRetentionPolicy: (policy: RetentionPolicy) => void;
  toggleSidebar: () => void;
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

export const useAppPreferencesStore = create<AppPreferencesState>((set) => ({
  theme: getInitialTheme(),
  retentionPolicy: getInitialRetentionPolicy(),
  isSidebarCollapsed: getInitialSidebarCollapsed(),

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
}));
