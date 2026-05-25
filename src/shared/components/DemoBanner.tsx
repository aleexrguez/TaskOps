import { useTranslation } from 'react-i18next';

interface DemoBannerProps {
  onSignUpClick: () => void;
}

export function DemoBanner({ onSignUpClick }: DemoBannerProps) {
  const { t } = useTranslation('common');

  return (
    <div
      role="status"
      className="border-b border-amber-300 bg-amber-50 px-4 py-2 dark:border-amber-800 dark:bg-amber-950"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          {t('demo.bannerMessage')}
        </p>
        <button
          onClick={onSignUpClick}
          className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
        >
          {t('demo.signUp')}
        </button>
      </div>
    </div>
  );
}
