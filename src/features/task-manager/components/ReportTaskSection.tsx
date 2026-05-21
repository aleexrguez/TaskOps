import { useTranslation } from 'react-i18next';
import type { Task } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityIndicator } from './PriorityIndicator';

interface ReportTaskSectionProps {
  title: string;
  description?: string;
  tasks: Task[];
  emptyMessage?: string;
  renderExtra?: (task: Task) => React.ReactNode;
}

export function ReportTaskSection({
  title,
  description,
  tasks,
  emptyMessage,
  renderExtra,
}: ReportTaskSectionProps) {
  const { t } = useTranslation('reports');
  const empty = emptyMessage ?? t('section.emptySection');
  return (
    <details
      open
      className="rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-gray-100">
        <span>{title}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {tasks.length}
        </span>
      </summary>

      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        {description && (
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
        {tasks.length === 0 ? (
          <p className="py-2 text-sm text-gray-400 dark:text-gray-500">
            {empty}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-gray-900 dark:text-gray-100">
                  {task.title}
                </span>
                <StatusBadge status={task.status} />
                <PriorityIndicator priority={task.priority} />
                {renderExtra?.(task)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
