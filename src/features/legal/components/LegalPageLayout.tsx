import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import { LanguageToggle } from '@/shared/components/LanguageToggle';
import { Footer } from '@/shared/components/Footer';
import type { ThemePreference } from '@/shared/types/preferences.types';

function nextTheme(current: ThemePreference): ThemePreference {
  if (current === 'light') return 'dark';
  return 'light';
}

function themeIcon(current: ThemePreference): string {
  if (current === 'dark' || current === 'system') return '☀️';
  return '🌙';
}

interface LegalPageLayoutProps {
  children: React.ReactNode;
}

export function LegalPageLayout({ children }: LegalPageLayoutProps) {
  useApplyTheme();
  const { t } = useTranslation('legal');
  const theme = useAppPreferencesStore((s) => s.theme);
  const setTheme = useAppPreferencesStore((s) => s.setTheme);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <img
              src="/Logo.png"
              alt="TaskOps"
              className="h-6 w-6 object-contain"
            />
            &larr; {t('nav.backToHome')}
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(nextTheme(theme))}
              aria-label={`Switch to ${nextTheme(theme)} theme`}
              className="cursor-pointer rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
            >
              {themeIcon(theme)}
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}
