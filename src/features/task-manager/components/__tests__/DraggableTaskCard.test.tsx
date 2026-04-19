import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import type { Task } from '../../types';
import { DraggableTaskCard } from '../DraggableTaskCard';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-drag-1',
    title: 'Draggable Task',
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

describe('DraggableTaskCard', () => {
  it('renders the task title', () => {
    renderWithDndContext(<DraggableTaskCard task={makeTask()} />);

    expect(screen.getByText('Draggable Task')).toBeInTheDocument();
  });

  it('exposes draggable role so dnd-kit accessibility attributes are present', () => {
    const { container } = renderWithDndContext(
      <DraggableTaskCard task={makeTask()} />,
    );

    // dnd-kit useDraggable spreads attributes including role="button" and aria-roledescription="draggable"
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute('role', 'button');
    expect(wrapper).toHaveAttribute('aria-roledescription', 'draggable');
  });

  it('renders the task title for tasks in all statuses', () => {
    const inProgressTask = makeTask({
      id: 'task-ip-1',
      title: 'In Progress Task',
      status: 'in-progress',
    });

    renderWithDndContext(<DraggableTaskCard task={inProgressTask} />);

    expect(screen.getByText('In Progress Task')).toBeInTheDocument();
  });

  it('renders the inner TaskCard as an article', () => {
    renderWithDndContext(<DraggableTaskCard task={makeTask()} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
