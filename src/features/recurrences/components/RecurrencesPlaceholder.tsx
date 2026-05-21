import { useTranslation } from 'react-i18next';

export function RecurrencesPlaceholder() {
  const { t } = useTranslation('recurrence');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {t('heading')}
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {t('placeholder.comingSoon')}
      </p>
    </div>
  );
}
