import type { ChangeEvent } from 'react';
import type { TaskStatus, TaskPriority } from '../types';

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  searchQuery: string;
  onStatusChange: (status: TaskStatus | 'all') => void;
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
}

export function TaskFilters({
  statusFilter,
  priorityFilter,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onReset,
}: TaskFiltersProps) {
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
    'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search tasks..."
        className={controlClass}
      />

      <select
        value={statusFilter}
        onChange={handleStatusChange}
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
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        Reset
      </button>
    </div>
  );
}
