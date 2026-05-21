import { useEffect } from 'react';
import i18n from './i18n';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';

export function useLanguageSync(): void {
  const language = useAppPreferencesStore((s) => s.language);

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);
}
