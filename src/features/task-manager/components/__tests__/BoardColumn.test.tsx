import { render, screen, within, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { vi } from 'vitest';
import type { Task } from '../../types';
import { BoardColumn } from '../BoardColumn';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'test-id-1',
    title: 'Test Task',
    status: 'todo',
    priority: 'medium',
    isArchived: false,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
    ...overrides,
  };
}

function renderWithDndContext(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

describe('BoardColumn', () => {
  it('renders the column title', () => {
    renderWithDndContext(<BoardColumn title="Todo" tasks={[]} status="todo" />);

    expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument();
  });

  it('renders the task count as a badge', () => {
    const tasks = [
      makeTask({ id: 'id-1', title: 'Task 1' }),
      makeTask({ id: 'id-2', title: 'Task 2' }),
      makeTask({ id: 'id-3', title: 'Task 3' }),
    ];

    renderWithDndContext(
      <BoardColumn title="Todo" tasks={tasks} status="todo" />,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders a TaskCard for each task in the column', () => {
    const tasks = [
      makeTask({ id: 'id-1', title: 'First Task' }),
      makeTask({ id: 'id-2', title: 'Second Task' }),
    ];

    renderWithDndContext(
      <BoardColumn title="Todo" tasks={tasks} status="todo" />,
    );

    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();
  });

  it('renders an empty state message when tasks array is empty', () => {
    renderWithDndContext(<BoardColumn title="Done" tasks={[]} status="done" />);

    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
  });

  it('passes onEdit callback through to TaskCard components', () => {
    const onEdit = vi.fn();
    const tasks = [makeTask({ id: 'task-abc', title: 'Editable Task' })];

    renderWithDndContext(
      <BoardColumn title="Todo" tasks={tasks} onEdit={onEdit} status="todo" />,
    );

    // Use fireEvent.click to bypass dnd-kit's onPointerDown interception in jsdom
    const article = screen.getByRole('article');
    fireEvent.click(within(article).getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith('task-abc');
  });

  it('passes onDelete callback through to TaskCard components', () => {
    const onDelete = vi.fn();
    const tasks = [makeTask({ id: 'task-abc', title: 'Deletable Task' })];

    renderWithDndContext(
      <BoardColumn
        title="Todo"
        tasks={tasks}
        onDelete={onDelete}
        status="todo"
      />,
    );

    const article = screen.getByRole('article');
    fireEvent.click(within(article).getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith('task-abc');
  });

  it('renders task cards with draggable accessibility attributes (DraggableTaskCard)', () => {
    const tasks = [makeTask({ id: 'drag-task-1', title: 'Draggable Task' })];

    const { container } = renderWithDndContext(
      <BoardColumn title="Todo" tasks={tasks} status="todo" />,
    );

    // DraggableTaskCard wraps each task in a div with role="button" aria-roledescription="draggable"
    // This distinguishes DraggableTaskCard from a plain TaskCard render
    const draggableWrapper = container.querySelector(
      '[aria-roledescription="draggable"]',
    );
    expect(draggableWrapper).toBeInTheDocument();
  });

  it('does not apply over-indicator ring in normal (non-dragging) state', () => {
    const { container } = renderWithDndContext(
      <BoardColumn title="Todo" tasks={[]} status="todo" />,
    );

    const columnRoot = container.firstElementChild;
    expect(columnRoot).not.toHaveClass('ring-2');
  });
});
