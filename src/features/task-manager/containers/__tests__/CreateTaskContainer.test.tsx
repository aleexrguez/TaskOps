import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CreateTaskContainer } from '../CreateTaskContainer';
import { useTaskUIStore } from '../../store/task-ui.store';

vi.mock('../../hooks/use-tasks', () => ({
  useCreateTaskWithChecklist: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock('../../hooks/use-activity-recorder', () => ({
  useActivityRecorder: () => ({
    recordTaskCreated: vi.fn(),
    recordTaskUpdate: vi.fn(),
    recordArchive: vi.fn(),
    recordUnarchive: vi.fn(),
    recordChecklistItemCreated: vi.fn(),
    recordChecklistItemCompleted: vi.fn(),
    recordChecklistItemDeleted: vi.fn(),
  }),
}));

vi.mock('@/shared/store/toast.store', () => ({
  useToastStore: vi.fn(
    (selector: (s: { addToast: ReturnType<typeof vi.fn> }) => unknown) =>
      selector({ addToast: vi.fn() }),
  ),
}));

describe('CreateTaskContainer — dialog accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTaskUIStore.setState({
      isCreateModalOpen: false,
      isEditModalOpen: false,
      selectedTaskId: null,
    });
  });

  it('renders with role="dialog" and aria-modal="true" when open', () => {
    useTaskUIStore.setState({ isCreateModalOpen: true });
    render(<CreateTaskContainer />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to the modal title', () => {
    useTaskUIStore.setState({ isCreateModalOpen: true });
    render(<CreateTaskContainer />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'create-task-title');

    const title = document.getElementById('create-task-title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('New Task');
  });

  it('does not render dialog when modal is closed', () => {
    render(<CreateTaskContainer />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
