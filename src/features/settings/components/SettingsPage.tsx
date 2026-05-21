import { useTranslation } from 'react-i18next';
import type {
  Language,
  RetentionPolicy,
  ThemePreference,
} from '@/shared/types/preferences.types';
import { RetentionPolicySelect } from '@/shared/components/RetentionPolicySelect';
import { ThemeSelector } from './ThemeSelector';

interface SettingsPageProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  retentionPolicy: RetentionPolicy;
  onRetentionPolicyChange: (policy: RetentionPolicy) => void;
  remindersEnabled: boolean;
  onToggleReminders: () => void;
  animatedBackground: boolean;
  onToggleAnimatedBackground: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const CARD = 'bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm';

export function SettingsPage({
  theme,
  onThemeChange,
  retentionPolicy,
  onRetentionPolicyChange,
  remindersEnabled,
  onToggleReminders,
  animatedBackground,
  onToggleAnimatedBackground,
  language,
  onLanguageChange,
}: SettingsPageProps) {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {t('title')}
      </h1>

      {/* Section 1 — Appearance */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('appearance.heading')}
        </h2>
        <ThemeSelector theme={theme} onThemeChange={onThemeChange} />
        <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={animatedBackground}
            onChange={onToggleAnimatedBackground}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          {t('appearance.animatedBg')}
        </label>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t('appearance.animatedBgDesc')}
        </p>
      </section>

      {/* Section 2 — Data Retention */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('dataRetention.heading')}
        </h2>
        <label
          htmlFor="retention-policy"
          className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300"
        >
          {t('dataRetention.autoArchive')}
          <RetentionPolicySelect
            id="retention-policy"
            retentionPolicy={retentionPolicy}
            onRetentionChange={onRetentionPolicyChange}
          />
        </label>
      </section>

      {/* Section 3 — Notifications */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('notifications.heading')}
        </h2>
        <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={remindersEnabled}
            onChange={onToggleReminders}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          {t('notifications.reminders')}
        </label>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t('notifications.remindersDesc')}
        </p>
      </section>

      {/* Section 4 — Language */}
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('language.heading')}
        </h2>
        <label
          htmlFor="language-select"
          className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300"
        >
          {t('language.label')}
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="en">{t('language.en')}</option>
            <option value="es">{t('language.es')}</option>
          </select>
        </label>
      </section>
    </div>
  );
}
