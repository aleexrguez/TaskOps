import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { TaskStatus, TaskPriority } from '../types';

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  searchQuery: string;
  showArchived: boolean;
  onStatusChange: (status: TaskStatus | 'all') => void;
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  onToggleArchived: () => void;
}

export function TaskFilters({
  statusFilter,
  priorityFilter,
  searchQuery,
  showArchived,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onReset,
  onToggleArchived,
}: TaskFiltersProps) {
  const { t } = useTranslation();
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const activeFilterCount = [
    searchQuery.trim() !== '',
    statusFilter !== 'all',
    priorityFilter !== 'all',
    showArchived === true,
  ].filter(Boolean).length;

  function handleStatusChange(e: ChangeEvent<HTMLSelectElement>): void {
    onStatusChange(e.target.value as TaskStatus | 'all');
  }

  function handlePriorityChange(e: ChangeEvent<HTMLSelectElement>): void {
    onPriorityChange(e.target.value as TaskPriority | 'all');
  }

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>): void {
    onSearchChange(e.target.value);
  }

  const controlClass =
    'min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <button
        type="button"
        onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
        aria-expanded={isFiltersExpanded}
        aria-controls="task-filters-panel"
        className="flex min-h-[44px] items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:hidden dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        {t('task:filter.button')}
        {activeFilterCount > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-100 px-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {activeFilterCount}
          </span>
        )}
      </button>

      {showArchived && !isFiltersExpanded && (
        <div className="flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-700 md:hidden dark:bg-indigo-900/30 dark:text-indigo-300">
          <span>{t('task:filter.viewingArchived')}</span>
          <button
            type="button"
            onClick={onToggleArchived}
            className="ml-auto cursor-pointer text-xs font-medium underline"
          >
            {t('task:filter.hide')}
          </button>
        </div>
      )}

      <div
        id="task-filters-panel"
        className={`${isFiltersExpanded ? 'flex' : 'hidden'} flex-wrap items-center gap-3 md:flex`}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t('task:filter.searchPlaceholder')}
          aria-label={t('task:filter.searchLabel')}
          className={controlClass}
        />

        <select
          value={statusFilter}
          onChange={handleStatusChange}
          aria-label={t('task:filter.statusLabel')}
          className={controlClass}
        >
          <option value="all">{t('task:filter.allStatuses')}</option>
          <option value="todo">{t('common:status.todo')}</option>
          <option value="in-progress">{t('common:status.inProgress')}</option>
          <option value="done">{t('common:status.done')}</option>
        </select>

        <select
          value={priorityFilter}
          onChange={handlePriorityChange}
          aria-label={t('task:filter.priorityLabel')}
          className={controlClass}
        >
          <option value="all">{t('task:filter.allPriorities')}</option>
          <option value="low">{t('common:priority.low')}</option>
          <option value="medium">{t('common:priority.medium')}</option>
          <option value="high">{t('common:priority.high')}</option>
        </select>

        <button
          type="button"
          onClick={onReset}
          className="min-h-[44px] cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          {t('task:filter.reset')}
        </button>

        <button
          type="button"
          onClick={onToggleArchived}
          aria-pressed={showArchived}
          className={
            showArchived
              ? 'min-h-[44px] cursor-pointer rounded-md border border-indigo-300 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
              : 'min-h-[44px] cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
          }
        >
          {showArchived
            ? t('task:filter.hideArchived')
            : t('task:filter.showArchived')}
        </button>
      </div>
    </div>
  );
}
