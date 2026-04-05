import type { TaskPriority } from '../types';

interface PriorityIndicatorProps {
  priority: TaskPriority;
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
      <span
        className={`h-2 w-2 rounded-full ${PRIORITY_DOT[priority]}`}
        aria-hidden="true"
      />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
