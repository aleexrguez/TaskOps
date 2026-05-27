import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApplyTheme } from '@/shared/hooks/use-apply-theme';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import { LanguageToggle } from '@/shared/components/LanguageToggle';
import { Footer } from '@/shared/components/Footer';
import { FeedbackSectionContainer } from '../containers/FeedbackSectionContainer';
import { MilestonesSection } from './MilestonesSection';
import { RoadmapSection } from './RoadmapSection';
import { TechStackSection } from './TechStackSection';
import type { ThemePreference } from '@/shared/types/preferences.types';

const featureKeys = [
  'kanban',
  'recurring',
  'reminders',
  'ordering',
  'inbox',
  'reports',
] as const;

function nextTheme(current: ThemePreference): ThemePreference {
  if (current === 'light') return 'dark';
  return 'light';
}

function themeIcon(current: ThemePreference): string {
  if (current === 'dark' || current === 'system') return '☀️';
  return '🌙';
}

export function LandingPage() {
  useApplyTheme();
  const { t } = useTranslation('landing');

  const theme = useAppPreferencesStore((s) => s.theme);
  const setTheme = useAppPreferencesStore((s) => s.setTheme);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/Logo.png"
              alt="TaskOps"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              TaskOps
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(nextTheme(theme))}
              aria-label={t('nav.themeToggle', { nextTheme: nextTheme(theme) })}
              className="cursor-pointer rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
            >
              {themeIcon(theme)}
            </button>
            <LanguageToggle />
            <Link
              to="/login"
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              {t('nav.getStarted')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="cursor-pointer rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {t('hero.cta.getStarted')}
            </Link>
            <Link
              to="/login"
              className="cursor-pointer rounded-lg border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t('hero.cta.login')}
            </Link>
            {import.meta.env.VITE_DEMO_EMAIL && (
              <Link
                to="/demo"
                className="cursor-pointer rounded-lg border border-indigo-300 px-6 py-3 text-base font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-950"
              >
                {t('hero.cta.tryDemo')}
              </Link>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-gray-200 bg-white px-4 py-16 dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('features.heading')}
            </h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {featureKeys.map((key) => (
                <div
                  key={key}
                  className="rounded-lg border border-gray-200 p-6 dark:border-gray-700"
                >
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t(`features.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MilestonesSection />
        <RoadmapSection />
        <TechStackSection />

        <FeedbackSectionContainer />
      </main>

      <Footer />
    </div>
  );
}
