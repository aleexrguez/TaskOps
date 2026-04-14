import { useEffect } from 'react';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';

export function useApplyTheme(): void {
  const theme = useAppPreferencesStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      return;
    }

    if (theme === 'light') {
      root.classList.remove('dark');
      return;
    }

    // theme === 'system'
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    function apply() {
      if (mq.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}
