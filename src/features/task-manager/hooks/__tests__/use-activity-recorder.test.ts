import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { useActivityRecorder } from '../use-activity-recorder';
import type { Task } from '../../types/task.types';

vi.mock('../../api', () => ({
  createActivityEvent: vi.fn(),
  createActivityEvents: vi.fn(),
}));

import { createActivityEvent, createActivityEvents } from '../../api';

const mockCreate = createActivityEvent as ReturnType<typeof vi.fn>;
const mockBatch = createActivityEvents as ReturnType<typeof vi.fn>;

const flushPromises = () => new Promise((r) => setTimeout(r, 0));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Test',
    status: 'todo',
    priority: 'medium',
    isArchived: false,
    position: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe('useActivityRecorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue(undefined);
    mockBatch.mockResolvedValue(undefined);
  });

  // --- Dedup: unchanged values produce no event ---

  it('does not record when status is unchanged (todo → todo)', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate('task-1', makeTask({ status: 'todo' }), {
      status: 'todo',
    });

    expect(mockBatch).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('does not record when priority is unchanged (medium → medium)', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate(
      'task-1',
      makeTask({ priority: 'medium' }),
      { priority: 'medium' },
    );

    expect(mockBatch).not.toHaveBeenCalled();
  });

  it('does not record when dueDate is unchanged', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate(
      'task-1',
      makeTask({ dueDate: '2026-05-15' }),
      { dueDate: '2026-05-15' },
    );

    expect(mockBatch).not.toHaveBeenCalled();
  });

  // --- Dedup: done transition = task_completed only ---

  it('records task_completed (not task_status_changed) for todo → done', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate('task-1', makeTask({ status: 'todo' }), {
      status: 'done',
    });

    expect(mockBatch).toHaveBeenCalledWith([
      expect.objectContaining({
        eventType: 'task_completed',
        fromValue: 'todo',
        toValue: 'done',
      }),
    ]);
  });

  it('records task_completed (not task_status_changed) for in-progress → done', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate(
      'task-1',
      makeTask({ status: 'in-progress' }),
      { status: 'done' },
    );

    expect(mockBatch).toHaveBeenCalledWith([
      expect.objectContaining({
        eventType: 'task_completed',
        fromValue: 'in-progress',
        toValue: 'done',
      }),
    ]);
  });

  // --- Dedup: non-done status = task_status_changed ---

  it('records task_status_changed for todo → in-progress', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate('task-1', makeTask({ status: 'todo' }), {
      status: 'in-progress',
    });

    expect(mockBatch).toHaveBeenCalledWith([
      expect.objectContaining({
        eventType: 'task_status_changed',
        fromValue: 'todo',
        toValue: 'in-progress',
      }),
    ]);
  });

  it('records task_status_changed for done → todo', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate('task-1', makeTask({ status: 'done' }), {
      status: 'todo',
    });

    expect(mockBatch).toHaveBeenCalledWith([
      expect.objectContaining({
        eventType: 'task_status_changed',
        fromValue: 'done',
        toValue: 'todo',
      }),
    ]);
  });

  // --- Batching multi-field changes ---

  it('batches priority + dueDate events in a single call', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate(
      'task-1',
      makeTask({ priority: 'medium', dueDate: '2026-05-10' }),
      { priority: 'high', dueDate: '2026-05-15' },
    );

    expect(mockBatch).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ eventType: 'task_priority_changed' }),
        expect.objectContaining({ eventType: 'task_due_date_changed' }),
      ]),
    );
    expect(mockBatch.mock.calls[0][0]).toHaveLength(2);
  });

  it('records only priority when status is unchanged', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate(
      'task-1',
      makeTask({ status: 'todo', priority: 'medium' }),
      { status: 'todo', priority: 'high' },
    );

    expect(mockBatch).toHaveBeenCalledWith([
      expect.objectContaining({ eventType: 'task_priority_changed' }),
    ]);
    expect(mockBatch.mock.calls[0][0]).toHaveLength(1);
  });

  // --- Error isolation ---

  it('logs error when activity insert fails (does not throw)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCreate.mockRejectedValue(new Error('insert failed'));

    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskCreated('task-1');

    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[ActivityRecorder] Failed to record event:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it('logs error when batch insert fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBatch.mockRejectedValue(new Error('batch failed'));

    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskUpdate('task-1', makeTask({ status: 'todo' }), {
      status: 'in-progress',
    });

    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[ActivityRecorder] Failed to record batch:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  // --- Invalidation on success ---

  it('calls createActivityEvent for recordTaskCreated', () => {
    const { result } = renderHook(() => useActivityRecorder(), {
      wrapper: createWrapper(),
    });

    result.current.recordTaskCreated('task-1');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'task-1',
        eventType: 'task_created',
      }),
    );
  });
});
