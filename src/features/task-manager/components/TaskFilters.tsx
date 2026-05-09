import { useState } from 'react';
import type { ChangeEvent } from 'react';
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
        Filters
        {activeFilterCount > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-100 px-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {activeFilterCount}
          </span>
        )}
      </button>

      <div
        id="task-filters-panel"
        className={`${isFiltersExpanded ? 'flex' : 'hidden'} flex-wrap items-center gap-3 md:flex`}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search tasks..."
          aria-label="Search tasks"
          className={controlClass}
        />

        <select
          value={statusFilter}
          onChange={handleStatusChange}
          aria-label="Filter by status"
          className={controlClass}
        >
          <option value="all">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={handlePriorityChange}
          aria-label="Filter by priority"
          className={controlClass}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button
          type="button"
          onClick={onReset}
          className="min-h-[44px] cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Reset
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
          {showArchived ? 'Hide archived' : 'Show archived'}
        </button>
      </div>
    </div>
  );
}
