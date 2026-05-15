import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useReport } from '../../hooks';
import type { Task } from '../../types';
import type { ActivityEvent } from '../../types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFetchTasks = vi.fn();
const mockFetchActivityEventsByDateRange = vi.fn();

vi.mock('../../api', () => ({
  fetchTasks: (...args: unknown[]) => mockFetchTasks(...args),
  fetchActivityEventsByDateRange: (...args: unknown[]) =>
    mockFetchActivityEventsByDateRange(...args),
  // Prevent real API calls from transitive imports
  fetchTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  archiveTask: vi.fn(),
  unarchiveTask: vi.fn(),
  purgeTasks: vi.fn(),
  bulkArchiveTasks: vi.fn(),
  reorderTasks: vi.fn(),
}));

vi.mock('@/features/auth/hooks', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Task',
    status: 'todo',
    priority: 'medium',
    isArchived: false,
    position: 0,
    createdAt: '2026-05-13T10:00:00.000Z',
    updatedAt: '2026-05-13T10:00:00.000Z',
    ...overrides,
  };
}

function makeEvent(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
  return {
    id: crypto.randomUUID(),
    taskId: crypto.randomUUID(),
    eventType: 'task_created',
    fromValue: null,
    toValue: null,
    metadata: {},
    createdAt: '2026-05-13T10:00:00.000Z',
    ...overrides,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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
// useReport
// ---------------------------------------------------------------------------

describe('useReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isLoading true while queries are pending', () => {
    mockFetchTasks.mockReturnValue(new Promise(() => {})); // never resolves
    mockFetchActivityEventsByDateRange.mockReturnValue(new Promise(() => {}));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReport('this-week'), {
      wrapper: Wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.report).toBeNull();
  });

  it('returns report data when both queries resolve', async () => {
    const tasks = [
      makeTask({
        status: 'done',
        completedAt: '2026-05-13T10:00:00.000Z',
      }),
    ];
    const events = [makeEvent({ eventType: 'checklist_item_completed' })];

    mockFetchTasks.mockResolvedValue({ tasks, total: tasks.length });
    mockFetchActivityEventsByDateRange.mockResolvedValue(events);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReport('this-week'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.report).not.toBeNull());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.report).toBeDefined();
    expect(result.current.report!.summary.checklistItemsCompleted).toBe(1);
  });

  it('returns null report when no tasks match period', async () => {
    mockFetchTasks.mockResolvedValue({ tasks: [], total: 0 });
    mockFetchActivityEventsByDateRange.mockResolvedValue([]);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReport('this-week'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.report).not.toBeNull();
    expect(result.current.report!.summary.tasksCompleted).toBe(0);
    expect(result.current.report!.summary.tasksCreated).toBe(0);
  });

  it('returns isError true on query failure', async () => {
    mockFetchTasks.mockResolvedValue({ tasks: [], total: 0 });
    mockFetchActivityEventsByDateRange.mockRejectedValue(
      new Error('Network error'),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReport('this-week'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('provides dateRange with startIso and endIso', () => {
    mockFetchTasks.mockReturnValue(new Promise(() => {}));
    mockFetchActivityEventsByDateRange.mockReturnValue(new Promise(() => {}));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReport('this-week'), {
      wrapper: Wrapper,
    });

    expect(result.current.dateRange.startIso).toBeDefined();
    expect(result.current.dateRange.endIso).toBeDefined();
    expect(result.current.dateRange.label).toBeDefined();
  });

  it('sends UTC ISO strings (with Z) to fetchActivityEventsByDateRange, not local timestamps', async () => {
    mockFetchTasks.mockResolvedValue({ tasks: [], total: 0 });
    mockFetchActivityEventsByDateRange.mockResolvedValue([]);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReport('this-week'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const [startArg, endArg] = mockFetchActivityEventsByDateRange.mock.calls[0];

    // DB-safe: must end with Z (UTC)
    expect(startArg).toMatch(/Z$/);
    expect(endArg).toMatch(/Z$/);

    // Must NOT be the raw local string (which has no Z)
    expect(startArg).not.toBe(result.current.dateRange.startIso);
    expect(endArg).not.toBe(result.current.dateRange.endIso);

    // Must represent the same absolute point in time
    expect(new Date(startArg).getTime()).toBe(
      new Date(result.current.dateRange.startIso).getTime(),
    );
    expect(new Date(endArg).getTime()).toBe(
      new Date(result.current.dateRange.endIso).getTime(),
    );
  });

  it('dateRange still exposes local boundaries and display label', () => {
    mockFetchTasks.mockReturnValue(new Promise(() => {}));
    mockFetchActivityEventsByDateRange.mockReturnValue(new Promise(() => {}));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReport('this-week'), {
      wrapper: Wrapper,
    });

    // Local ISO: no Z suffix
    expect(result.current.dateRange.startIso).not.toMatch(/Z$/);
    expect(result.current.dateRange.endIso).not.toMatch(/Z$/);

    // Has display label
    expect(result.current.dateRange.label).toMatch(/–/);
  });
});
