import { useTranslation } from 'react-i18next';

interface UpdateBannerProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  const { t } = useTranslation('common');

  return (
    <div
      role="alert"
      className="border-b border-indigo-300 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-950"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
          {t('updateBanner.message')}
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onDismiss}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-900"
          >
            {t('updateBanner.later')}
          </button>
          <button
            onClick={onUpdate}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {t('updateBanner.updateNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
