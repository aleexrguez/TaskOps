import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useInboxItems,
  useCreateInboxItem,
  useUpdateInboxItem,
  useDeleteInboxItem,
  useConvertInboxItem,
} from '../use-inbox';
import { inboxKeys } from '../inbox.keys';
import { taskKeys } from '@/features/task-manager/hooks/task.keys';
import { checklistKeys } from '@/features/task-manager/hooks/checklist.keys';
import {
  fetchInboxItems,
  createInboxItem,
  updateInboxItem,
  deleteInboxItem,
  convertInboxItemToTask,
} from '../../api';

vi.mock('../../api', () => ({
  fetchInboxItems: vi.fn(),
  createInboxItem: vi.fn(),
  updateInboxItem: vi.fn(),
  deleteInboxItem: vi.fn(),
  convertInboxItemToTask: vi.fn(),
  mapInboxItemRowToInboxItem: vi.fn(),
}));

vi.mock('@/features/auth/hooks', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { id: 'user-123' } }),
}));

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

describe('useInboxItems', () => {
  beforeEach(() => {
    vi.mocked(fetchInboxItems).mockReset();
  });

  it('calls fetchInboxItems as queryFn', async () => {
    const mockData = { items: [], total: 0 };
    vi.mocked(fetchInboxItems).mockResolvedValue(mockData);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useInboxItems(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchInboxItems).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useCreateInboxItem', () => {
  beforeEach(() => {
    vi.mocked(createInboxItem).mockReset();
  });

  it('invalidates inboxKeys.lists() on success', async () => {
    const mockItem = {
      id: 'new-1',
      title: 'Test',
      notes: null,
      createdAt: '2026-05-16T10:00:00.000Z',
      convertedTaskId: null,
      convertedAt: null,
    };
    vi.mocked(createInboxItem).mockResolvedValue(mockItem);

    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateInboxItem(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ title: 'Test' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: inboxKeys.lists(),
    });
  });
});

describe('useUpdateInboxItem', () => {
  beforeEach(() => {
    vi.mocked(updateInboxItem).mockReset();
  });

  it('invalidates inboxKeys.lists() on success', async () => {
    const mockItem = {
      id: 'item-1',
      title: 'Updated',
      notes: null,
      createdAt: '2026-05-16T10:00:00.000Z',
      convertedTaskId: null,
      convertedAt: null,
    };
    vi.mocked(updateInboxItem).mockResolvedValue(mockItem);

    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateInboxItem(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'item-1', input: { title: 'Updated' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: inboxKeys.lists(),
    });
  });
});

describe('useDeleteInboxItem', () => {
  beforeEach(() => {
    vi.mocked(deleteInboxItem).mockReset();
  });

  it('invalidates inboxKeys.lists() on success', async () => {
    vi.mocked(deleteInboxItem).mockResolvedValue(undefined);

    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteInboxItem(), {
      wrapper: Wrapper,
    });

    result.current.mutate('item-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: inboxKeys.lists(),
    });
  });
});

describe('useConvertInboxItem', () => {
  beforeEach(() => {
    vi.mocked(convertInboxItemToTask).mockReset();
  });

  it('invalidates inboxKeys.lists(), taskKeys.lists(), and checklistKeys.summaries() on success', async () => {
    vi.mocked(convertInboxItemToTask).mockResolvedValue({
      inboxItem: {
        id: 'item-1',
        title: 'Test',
        notes: null,
        createdAt: '2026-05-16T10:00:00.000Z',
        convertedTaskId: 'task-1',
        convertedAt: '2026-05-16T12:00:00.000Z',
      },
      task: {
        id: 'task-1',
        title: 'Test',
        status: 'todo',
        priority: 'medium',
        isArchived: false,
        position: 0,
        createdAt: '2026-05-16T12:00:00.000Z',
        updatedAt: '2026-05-16T12:00:00.000Z',
      },
    });

    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useConvertInboxItem(), {
      wrapper: Wrapper,
    });

    result.current.mutate({
      inboxItemId: 'item-1',
      taskInput: { title: 'Test', status: 'todo', priority: 'medium' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: inboxKeys.lists(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: taskKeys.lists(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: checklistKeys.summaries(),
    });
  });
});
