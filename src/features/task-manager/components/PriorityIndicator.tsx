import { useTranslation } from 'react-i18next';
import type { TaskPriority } from '../types';

interface PriorityIndicatorProps {
  priority: TaskPriority;
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

export function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  const { t } = useTranslation('common');

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
      <span
        className={`h-2 w-2 rounded-full ${PRIORITY_DOT[priority]}`}
        aria-hidden="true"
      />
      {t(`priority.${priority}`)}
    </span>
  );
}
