import { useTranslation } from 'react-i18next';
import type { TaskStatus } from '../types';
import { getDueDateDaysRemaining } from '../utils';

interface DueDateDisplayProps {
  dueDate: string | undefined;
  status: TaskStatus;
  today?: string;
}

const GREEN =
  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
const AMBER =
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
const RED = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
const RED_OVERDUE =
  'bg-red-100 text-red-700 font-semibold dark:bg-red-900/40 dark:text-red-300';

function getBadgeConfig(days: number): {
  labelKey: string;
  colorClass: string;
  count?: number;
} {
  if (days < 0) {
    return { labelKey: 'date.overdue', colorClass: RED_OVERDUE };
  }
  if (days === 0) {
    return { labelKey: 'date.dueToday', colorClass: RED };
  }
  if (days === 1) {
    return { labelKey: 'date.tomorrow', colorClass: AMBER };
  }
  if (days <= 3) {
    return { labelKey: 'date.daysLeft', colorClass: AMBER, count: days };
  }
  return { labelKey: 'date.daysLeft', colorClass: GREEN, count: days };
}

export function DueDateDisplay({
  dueDate,
  status,
  today,
}: DueDateDisplayProps) {
  const { t } = useTranslation('common');

  if (!dueDate) return null;
  if (status === 'done') return null;

  const days = getDueDateDaysRemaining(dueDate, today);
  const { labelKey, colorClass, count } = getBadgeConfig(days);
  const label = count !== undefined ? t(labelKey, { count }) : t(labelKey);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}
