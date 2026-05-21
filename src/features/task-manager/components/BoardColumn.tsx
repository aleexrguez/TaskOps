import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import type { Task, TaskStatus } from '../types';
import type { ChecklistSummaries } from '../api/checklist-api';
import { SortableTaskCard } from './SortableTaskCard';

interface BoardColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  deletingId?: string | null;
  checklistSummaries?: ChecklistSummaries;
}

export function BoardColumn({
  title,
  tasks,
  status,
  onDelete,
  onClick,
  onArchive,
  onDuplicate,
  deletingId = null,
  checklistSummaries,
}: BoardColumnProps) {
  const { t } = useTranslation('task');
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label={t('a11y.columnLabel', { title })}
      className={`flex flex-col rounded-lg bg-gray-50 p-4 dark:bg-gray-900${isOver ? ' ring-2 ring-indigo-400 dark:ring-indigo-500' : ''}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {title}
        </h2>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>
      <SortableContext
        id={status}
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-[80px] flex-col gap-2">
          {tasks.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-400 dark:text-gray-500">
              {t('board.emptyColumn')}
            </p>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onDelete={onDelete}
                onClick={onClick}
                onArchive={onArchive}
                onDuplicate={onDuplicate}
                isDeleting={deletingId === task.id}
                checklistSummary={checklistSummaries?.[task.id]}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
