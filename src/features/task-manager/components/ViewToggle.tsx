import { useTranslation } from 'react-i18next';
import type { ViewMode } from '../types';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const baseClass =
  'cursor-pointer px-3 py-1.5 text-sm font-medium transition-colors';
const inactiveClass =
  'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800';
const activeClass = 'bg-indigo-600 text-white';

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  const { t } = useTranslation('task');

  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        aria-pressed={viewMode === 'list'}
        onClick={() => onViewModeChange('list')}
        className={`rounded-l-lg ${baseClass} ${viewMode === 'list' ? activeClass : inactiveClass}`}
      >
        {t('view.list')}
      </button>
      <button
        aria-pressed={viewMode === 'board'}
        onClick={() => onViewModeChange('board')}
        className={`rounded-r-lg ${baseClass} ${viewMode === 'board' ? activeClass : inactiveClass}`}
      >
        {t('view.board')}
      </button>
    </div>
  );
}
