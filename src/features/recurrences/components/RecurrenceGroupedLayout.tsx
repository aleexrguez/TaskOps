import { useTranslation } from 'react-i18next';
import type { FrequencyGroups } from '../utils/recurrence.utils';
import { RecurrenceList } from './RecurrenceList';

interface RecurrenceGroupedLayoutProps {
  groups: FrequencyGroups;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreateNew?: () => void;
}

export function RecurrenceGroupedLayout({
  groups,
  onEdit,
  onDelete,
  onCreateNew,
}: RecurrenceGroupedLayoutProps) {
  const { t } = useTranslation('recurrence');

  const SECTION_LABELS: Record<keyof FrequencyGroups, string> = {
    daily: t('form.frequency.daily'),
    weekly: t('form.frequency.weekly'),
    monthly: t('form.frequency.monthly'),
  };

  const hasAny =
    groups.daily.length > 0 ||
    groups.weekly.length > 0 ||
    groups.monthly.length > 0;

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
        <div className="mb-3 text-4xl" aria-hidden="true">
          🔄
        </div>
        <p className="text-base font-bold text-gray-700 dark:text-gray-300">
          {t('empty.noRecurrences')}
        </p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          {t('empty.setupMessage')}
        </p>
        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {t('empty.createButton')}
          </button>
        )}
      </div>
    );
  }

  const frequencies = ['daily', 'weekly', 'monthly'] as const;

  return (
    <div className="space-y-8">
      {frequencies.map((freq) => {
        const templates = groups[freq];
        if (templates.length === 0) return null;

        return (
          <section key={freq}>
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
              {SECTION_LABELS[freq]}
            </h2>
            <RecurrenceList
              templates={templates}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </section>
        );
      })}
    </div>
  );
}
