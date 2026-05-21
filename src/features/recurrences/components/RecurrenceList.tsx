import { useTranslation } from 'react-i18next';
import type { RecurrenceTemplate } from '../types/recurrence.types';
import { RecurrenceCard } from './RecurrenceCard';

interface RecurrenceListProps {
  templates: RecurrenceTemplate[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export function RecurrenceList({
  templates,
  onEdit,
  onDelete,
  emptyMessage,
}: RecurrenceListProps) {
  const { t } = useTranslation('recurrence');
  const resolvedEmptyMessage = emptyMessage ?? t('empty.notFound');
  if (templates.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {resolvedEmptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {templates.map((template) => (
        <RecurrenceCard
          key={template.id}
          template={template}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
