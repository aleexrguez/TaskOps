import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';

interface DraggableTaskCardProps {
  task: Task;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  onArchive?: (id: string) => void;
  isDeleting?: boolean;
}

export function DraggableTaskCard({
  task,
  onEdit,
  onDelete,
  onClick,
  onArchive,
  isDeleting,
}: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={onClick}
        onArchive={onArchive}
        isDeleting={isDeleting}
      />
    </div>
  );
}
