import { useDroppable } from '@dnd-kit/core';
import type { Task } from '../types';
import type { TaskStatus } from '../types';
import { DraggableTaskCard } from './DraggableTaskCard';

interface BoardColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  onArchive?: (id: string) => void;
  deletingId?: string | null;
}

export function BoardColumn({
  title,
  tasks,
  status,
  onEdit,
  onDelete,
  onClick,
  onArchive,
  deletingId = null,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
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
      {tasks.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">No tasks</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onClick}
              onArchive={onArchive}
              isDeleting={deletingId === task.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
