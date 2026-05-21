import i18n from '@/i18n/i18n';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import type { Language } from '@/shared/types/preferences.types';

export function LanguageToggle() {
  const language = useAppPreferencesStore((s) => s.language);
  const setLanguage = useAppPreferencesStore((s) => s.setLanguage);

  function handleToggle(): void {
    const next: Language = language === 'en' ? 'es' : 'en';
    setLanguage(next);
    void i18n.changeLanguage(next);
  }

  const nextLabel = language === 'en' ? 'Español' : 'English';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Switch to ${nextLabel}`}
      className="cursor-pointer rounded-md p-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
    >
      {language.toUpperCase()}
    </button>
  );
}
