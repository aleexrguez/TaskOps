import type { TaskStatus } from '../types';

export const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  'in-progress':
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

/** Maps TaskStatus values to common:status.* i18n keys for use with t() in components */
export const STATUS_I18N_KEYS: Record<TaskStatus, string> = {
  todo: 'status.todo',
  'in-progress': 'status.inProgress',
  done: 'status.done',
};
