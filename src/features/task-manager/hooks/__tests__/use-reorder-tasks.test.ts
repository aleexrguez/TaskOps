import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useReorderTasks } from '../../hooks';
import { taskKeys } from '../../hooks';
import { reorderTasks } from '../../api';
import type { ReorderUpdate } from '../../types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../api', () => ({
  reorderTasks: vi.fn(),
  fetchTasks: vi.fn(),
  fetchTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  archiveTask: vi.fn(),
  unarchiveTask: vi.fn(),
  purgeTasks: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  }

  return { queryClient, Wrapper };
}

// ---------------------------------------------------------------------------
// useReorderTasks
// ---------------------------------------------------------------------------

describe('useReorderTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (reorderTasks as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  it('calls reorderTasks API with the provided updates', async () => {
    const { Wrapper } = createWrapper();
    const updates: ReorderUpdate[] = [
      { id: 'task-1', position: 0 },
      { id: 'task-2', position: 1 },
    ];

    const { result } = renderHook(() => useReorderTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate(updates);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reorderTasks).toHaveBeenCalledWith(updates);
    expect(reorderTasks).toHaveBeenCalledTimes(1);
  });

  it('invalidates the task list query on success', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useReorderTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate([{ id: 'task-1', position: 0 }]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: taskKeys.lists(),
    });
  });

  it('surfaces errors from the API', async () => {
    (reorderTasks as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('DB error'),
    );

    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useReorderTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate([{ id: 'task-1', position: 0 }]);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('DB error'));
  });
});
