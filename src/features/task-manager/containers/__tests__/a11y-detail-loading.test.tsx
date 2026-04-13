import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';
import { useTaskUIStore } from '../../store/task-ui.store';
import { useToastStore } from '../../store/toast.store';
import { TaskDetailContainer } from '../TaskDetailContainer';

vi.mock('@/features/auth/hooks', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    session: null,
    isLoading: false,
  }),
}));

vi.mock('@/features/task-manager/api', () => ({
  fetchTasks: vi.fn(),
  fetchTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

import { fetchTaskById } from '@/features/task-manager/api';

const mockFetchTaskById = fetchTaskById as MockedFunction<typeof fetchTaskById>;

function renderWithProviders(taskId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/app/tasks/${taskId}`]}>
        <Routes>
          <Route path="/app/tasks/:id" element={<TaskDetailContainer />} />
          <Route path="/app" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TaskDetailContainer loading accessibility', () => {
  beforeEach(() => {
    useTaskUIStore.setState({
      isEditModalOpen: false,
      selectedTaskId: null,
    });
    useToastStore.setState({ toasts: [] });
    vi.clearAllMocks();
  });

  it('loading skeleton has role="status" and aria-label', () => {
    mockFetchTaskById.mockReturnValue(new Promise(() => {}));

    renderWithProviders('task-uuid-001');

    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/loading/i),
    );
  });
});
