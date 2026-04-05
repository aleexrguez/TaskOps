import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { Task } from '../../types';
import { TaskCard } from '../TaskCard';

const mockTask: Task = {
  id: 'task-uuid-001',
  title: 'Fix login bug',
  description: 'Users cannot log in with email containing plus signs',
  status: 'in-progress',
  priority: 'high',
  assignee: 'Jane Doe',
  createdAt: '2026-03-15T10:00:00.000Z',
  updatedAt: '2026-03-20T15:30:00.000Z',
};

describe('TaskCard', () => {
  it('calls onClick with task id when card body is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<TaskCard task={mockTask} onClick={onClick} />);

    await user.click(screen.getByRole('article'));

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith('task-uuid-001');
  });

  it('does not call onClick when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onEdit = vi.fn();

    render(<TaskCard task={mockTask} onClick={onClick} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(onClick).not.toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('does not call onClick when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onDelete = vi.fn();

    render(<TaskCard task={mockTask} onClick={onClick} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(onClick).not.toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('does not throw when onClick is not provided', async () => {
    const user = userEvent.setup();

    render(<TaskCard task={mockTask} />);

    await expect(
      user.click(screen.getByText('Fix login bug')),
    ).resolves.not.toThrow();
  });
});
