import { useTranslation } from 'react-i18next';
import type { ThemePreference } from '@/shared/types/preferences.types';

interface ThemeSelectorProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

export function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  const { t } = useTranslation('settings');

  const options: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: t('appearance.light') },
    { value: 'dark', label: t('appearance.dark') },
    { value: 'system', label: t('appearance.system') },
  ];

  return (
    <fieldset className="border-0 m-0 p-0">
      <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {t('appearance.theme')}
      </legend>

      <div className="flex gap-2">
        {options.map(({ value, label }) => (
          <label
            key={value}
            className={[
              'flex flex-1 items-center justify-center gap-2 cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
              theme === value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-400'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750',
            ].join(' ')}
          >
            <input
              type="radio"
              name="theme"
              value={value}
              checked={theme === value}
              onChange={() => onThemeChange(value)}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
