import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useCleanupDoneTasks } from '../use-cleanup-done-tasks';
import { taskKeys } from '../task.keys';
import { bulkArchiveTasks, createActivityEvents } from '../../api';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../api', () => ({
  bulkArchiveTasks: vi.fn(),
  createActivityEvents: vi.fn(),
  fetchTasks: vi.fn(),
  fetchTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  archiveTask: vi.fn(),
  unarchiveTask: vi.fn(),
  purgeTasks: vi.fn(),
  reorderTasks: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeTask(overrides: Record<string, unknown> = {}) {
  return {
    id: 'task-1',
    title: 'Test Task',
    status: 'done' as const,
    priority: 'medium' as const,
    isArchived: false,
    completedAt: '2026-05-13T10:00:00.000Z',
    position: 0,
    createdAt: '2026-05-13T08:00:00.000Z',
    updatedAt: '2026-05-13T10:00:00.000Z',
    ...overrides,
  };
}

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
// useCleanupDoneTasks
// ---------------------------------------------------------------------------

describe('useCleanupDoneTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (bulkArchiveTasks as ReturnType<typeof vi.fn>).mockResolvedValue([
      'task-1',
    ]);
    (createActivityEvents as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
  });

  it('calls bulkArchiveTasks with the candidateIds passed to mutate', async () => {
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(taskKeys.lists(), {
      tasks: [makeTask({ id: 'task-1' }), makeTask({ id: 'task-2' })],
      total: 2,
    });

    const { result } = renderHook(() => useCleanupDoneTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate(['task-1', 'task-2']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(bulkArchiveTasks).toHaveBeenCalledWith(
      ['task-1', 'task-2'],
      expect.any(String),
    );
  });

  it('calls bulkArchiveTasks with the exact IDs even after onMutate marks them archived in cache', async () => {
    // This test covers the v2.1.0 bug: onMutate runs before mutationFn
    // and sets isArchived=true in cache. The old code re-read candidates
    // from the poisoned cache and found 0 candidates.
    const { queryClient, Wrapper } = createWrapper();
    const task = makeTask({ id: 'task-1' });
    queryClient.setQueryData(taskKeys.lists(), {
      tasks: [task],
      total: 1,
    });

    (bulkArchiveTasks as ReturnType<typeof vi.fn>).mockImplementation(
      async (ids: string[]) => {
        // Verify the IDs arrive here even though cache already has isArchived=true
        expect(ids).toEqual(['task-1']);

        // Verify cache was already optimistically updated by onMutate
        const cached = queryClient.getQueryData<{
          tasks: Array<{ id: string; isArchived: boolean }>;
        }>(taskKeys.lists());
        expect(cached?.tasks[0].isArchived).toBe(true);

        return ['task-1'];
      },
    );

    const { result } = renderHook(() => useCleanupDoneTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate(['task-1']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(bulkArchiveTasks).toHaveBeenCalledTimes(1);
    expect(result.current.data?.archivedCount).toBe(1);
  });

  it('returns archivedCount from the server response, not from input length', async () => {
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(taskKeys.lists(), {
      tasks: [makeTask({ id: 'task-1' }), makeTask({ id: 'task-2' })],
      total: 2,
    });

    // Server only archives 1 of the 2 candidates (defensive query filtered one out)
    (bulkArchiveTasks as ReturnType<typeof vi.fn>).mockResolvedValue([
      'task-1',
    ]);

    const { result } = renderHook(() => useCleanupDoneTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate(['task-1', 'task-2']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.archivedCount).toBe(1);
    expect(result.current.data?.archivedIds).toEqual(['task-1']);
  });

  it('does not call bulkArchiveTasks when candidateIds is empty', async () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useCleanupDoneTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate([]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(bulkArchiveTasks).not.toHaveBeenCalled();
    expect(result.current.data?.archivedCount).toBe(0);
  });

  it('optimistically sets isArchived to true for all candidateIds', async () => {
    const { queryClient, Wrapper } = createWrapper();
    const task1 = makeTask({ id: 'task-1' });
    const task2 = makeTask({ id: 'task-2', status: 'todo' as const });
    queryClient.setQueryData(taskKeys.lists(), {
      tasks: [task1, task2],
      total: 2,
    });

    const { result } = renderHook(() => useCleanupDoneTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate(['task-1']);

    await waitFor(() => {
      const cached = queryClient.getQueryData<{
        tasks: Array<{ id: string; isArchived: boolean }>;
      }>(taskKeys.lists());
      expect(cached?.tasks[0].isArchived).toBe(true);
      expect(cached?.tasks[1].isArchived).toBe(false);
    });
  });

  it('rolls back cache on error', async () => {
    (bulkArchiveTasks as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error'),
    );
    const { queryClient, Wrapper } = createWrapper();
    const task = makeTask({ id: 'task-1' });
    queryClient.setQueryData(taskKeys.lists(), {
      tasks: [task],
      total: 1,
    });

    const { result } = renderHook(() => useCleanupDoneTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate(['task-1']);

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cached = queryClient.getQueryData<{
      tasks: Array<{ id: string; isArchived: boolean }>;
    }>(taskKeys.lists());
    expect(cached?.tasks[0].isArchived).toBe(false);
  });

  it('invalidates task list queries on settle', async () => {
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(taskKeys.lists(), {
      tasks: [makeTask()],
      total: 1,
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCleanupDoneTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate(['task-1']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: taskKeys.lists() }),
    );
  });

  it('records activity events only for actually archived IDs', async () => {
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(taskKeys.lists(), {
      tasks: [makeTask({ id: 'task-1' }), makeTask({ id: 'task-2' })],
      total: 2,
    });

    // Server only archived task-2 (task-1 was filtered by defensive query)
    (bulkArchiveTasks as ReturnType<typeof vi.fn>).mockResolvedValue([
      'task-2',
    ]);

    const { result } = renderHook(() => useCleanupDoneTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate(['task-1', 'task-2']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createActivityEvents).toHaveBeenCalledWith([
      { taskId: 'task-2', eventType: 'task_archived' },
    ]);
  });

  it('does not record activity events when server archives 0 tasks', async () => {
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(taskKeys.lists(), {
      tasks: [makeTask({ id: 'task-1' })],
      total: 1,
    });

    (bulkArchiveTasks as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const { result } = renderHook(() => useCleanupDoneTasks(), {
      wrapper: Wrapper,
    });

    result.current.mutate(['task-1']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createActivityEvents).not.toHaveBeenCalled();
  });
});
