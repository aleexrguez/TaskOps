import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { TaskBoard } from '../utils';
import type { TaskStatus } from '../types';
import { BoardColumn } from './BoardColumn';

interface BoardViewProps {
  board: TaskBoard;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  onArchive?: (id: string) => void;
  deletingId?: string | null;
  onTaskDrop?: (taskId: string, newStatus: TaskStatus) => void;
}

export function BoardView({
  board,
  onEdit,
  onDelete,
  onClick,
  onArchive,
  deletingId,
  onTaskDrop,
}: BoardViewProps) {
  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || !onTaskDrop) return;
    onTaskDrop(String(active.id), over.id as TaskStatus);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BoardColumn
          title="Todo"
          tasks={board.todo}
          status="todo"
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          onArchive={onArchive}
          deletingId={deletingId}
        />
        <BoardColumn
          title="In Progress"
          tasks={board['in-progress']}
          status="in-progress"
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          onArchive={onArchive}
          deletingId={deletingId}
        />
        <BoardColumn
          title="Done"
          tasks={board.done}
          status="done"
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          onArchive={onArchive}
          deletingId={deletingId}
        />
      </div>
    </DndContext>
  );
}
