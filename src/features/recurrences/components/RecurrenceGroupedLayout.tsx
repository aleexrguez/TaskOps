import type { FrequencyGroups } from '../utils/recurrence.utils';
import { RecurrenceList } from './RecurrenceList';

interface RecurrenceGroupedLayoutProps {
  groups: FrequencyGroups;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const SECTION_LABELS: Record<keyof FrequencyGroups, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function RecurrenceGroupedLayout({
  groups,
  onEdit,
  onDelete,
}: RecurrenceGroupedLayoutProps) {
  const hasAny =
    groups.daily.length > 0 ||
    groups.weekly.length > 0 ||
    groups.monthly.length > 0;

  if (!hasAny) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No recurrences found.
      </p>
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
