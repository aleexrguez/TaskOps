import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EditTaskContainer } from '../EditTaskContainer';
import { useTaskUIStore } from '../../store/task-ui.store';

vi.mock('../../hooks/use-tasks', () => ({
  useTask: () => ({
    data: {
      id: 'task-1',
      title: 'Test task',
      status: 'todo',
      priority: 'medium',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
    },
    isLoading: false,
  }),
  useUpdateTask: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock('@/shared/store/toast.store', () => ({
  useToastStore: vi.fn(
    (selector: (s: { addToast: ReturnType<typeof vi.fn> }) => unknown) =>
      selector({ addToast: vi.fn() }),
  ),
}));

vi.mock('../../utils/confetti', () => ({
  celebrateTaskDone: vi.fn(),
  getConfettiOriginFromElement: vi.fn(),
}));

describe('EditTaskContainer — dialog accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTaskUIStore.setState({
      isCreateModalOpen: false,
      isEditModalOpen: false,
      selectedTaskId: null,
    });
  });

  it('renders with role="dialog" and aria-modal="true" when open', () => {
    useTaskUIStore.setState({
      isEditModalOpen: true,
      selectedTaskId: 'task-1',
    });
    render(<EditTaskContainer />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to the modal title', () => {
    useTaskUIStore.setState({
      isEditModalOpen: true,
      selectedTaskId: 'task-1',
    });
    render(<EditTaskContainer />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'edit-task-title');

    const title = document.getElementById('edit-task-title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('Edit Task');
  });

  it('does not render dialog when modal is closed', () => {
    render(<EditTaskContainer />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
