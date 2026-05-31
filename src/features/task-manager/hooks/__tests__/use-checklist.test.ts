import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useChecklist,
  useChecklistSummaries,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
  useReorderChecklistItems,
} from '../../hooks';
import { checklistKeys } from '../../hooks';
import {
  fetchChecklistItems,
  fetchChecklistSummaries,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
} from '../../api';
import { createMockChecklistItem } from '@/test/factories/checklist.factory';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../api', () => ({
  // task API exports (needed so existing hooks don't break)
  fetchTasks: vi.fn(),
  fetchTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  archiveTask: vi.fn(),
  unarchiveTask: vi.fn(),
  purgeTasks: vi.fn(),
  reorderTasks: vi.fn(),
  // checklist API exports
  fetchChecklistSummaries: vi.fn(),
  fetchChecklistItems: vi.fn(),
  createChecklistItem: vi.fn(),
  updateChecklistItem: vi.fn(),
  deleteChecklistItem: vi.fn(),
  reorderChecklistItems: vi.fn(),
}));

vi.mock('@/features/auth/hooks', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { id: 'user-123' } }),
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

const TASK_ID = 'task-001';

// ---------------------------------------------------------------------------
// useChecklist
// ---------------------------------------------------------------------------

describe('useChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches checklist items for the given taskId', async () => {
    const items = [
      createMockChecklistItem({ id: 'item-1', taskId: TASK_ID }),
      createMockChecklistItem({ id: 'item-2', taskId: TASK_ID, position: 1 }),
    ];
    (fetchChecklistItems as ReturnType<typeof vi.fn>).mockResolvedValue(items);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useChecklist(TASK_ID), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchChecklistItems).toHaveBeenCalledWith(TASK_ID);
    expect(result.current.data).toEqual(items);
  });

  it('uses checklistKeys.list(taskId) as query key', async () => {
    (fetchChecklistItems as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const { Wrapper, queryClient } = createWrapper();
    renderHook(() => useChecklist(TASK_ID), { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        queryClient.getQueryState(checklistKeys.list(TASK_ID)),
      ).toBeDefined(),
    );
  });

  it('is disabled when taskId is empty', () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useChecklist(''), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchChecklistItems).not.toHaveBeenCalled();
  });

  it('surfaces errors from the API', async () => {
    (fetchChecklistItems as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Fetch failed'),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useChecklist(TASK_ID), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Fetch failed'));
  });
});

// ---------------------------------------------------------------------------
// useChecklistSummaries
// ---------------------------------------------------------------------------

describe('useChecklistSummaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches checklist summaries', async () => {
    const summaries = { 'task-1': { total: 3, completed: 1 } };
    (fetchChecklistSummaries as ReturnType<typeof vi.fn>).mockResolvedValue(
      summaries,
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useChecklistSummaries(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchChecklistSummaries).toHaveBeenCalled();
    expect(result.current.data).toEqual(summaries);
  });

  it('uses checklistKeys.summaries() as query key', async () => {
    (fetchChecklistSummaries as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const { Wrapper, queryClient } = createWrapper();
    renderHook(() => useChecklistSummaries(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        queryClient.getQueryState(checklistKeys.summaries()),
      ).toBeDefined(),
    );
  });
});

// ---------------------------------------------------------------------------
// useCreateChecklistItem
// ---------------------------------------------------------------------------

describe('useCreateChecklistItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createChecklistItem as ReturnType<typeof vi.fn>).mockResolvedValue(
      createMockChecklistItem(),
    );
  });

  it('calls createChecklistItem API with the provided input', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ title: 'New item' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createChecklistItem).toHaveBeenCalledWith(TASK_ID, {
      title: 'New item',
    });
  });

  it('invalidates checklistKeys.list(taskId) on success', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ title: 'New item' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: checklistKeys.list(TASK_ID),
    });
  });

  it('invalidates checklistKeys.summaries() on success', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ title: 'New item' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: checklistKeys.summaries(),
    });
  });

  it('surfaces errors from the API', async () => {
    (createChecklistItem as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Create failed'),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ title: 'New item' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Create failed'));
  });
});

// ---------------------------------------------------------------------------
// useUpdateChecklistItem
// ---------------------------------------------------------------------------

describe('useUpdateChecklistItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (updateChecklistItem as ReturnType<typeof vi.fn>).mockResolvedValue(
      createMockChecklistItem(),
    );
  });

  it('calls updateChecklistItem API with id and input', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'item-1', input: { isCompleted: true } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateChecklistItem).toHaveBeenCalledWith('item-1', {
      isCompleted: true,
    });
  });

  it('invalidates checklistKeys.list(taskId) on success', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'item-1', input: { title: 'Updated' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: checklistKeys.list(TASK_ID),
    });
  });

  it('invalidates checklistKeys.summaries() on success', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'item-1', input: { isCompleted: true } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: checklistKeys.summaries(),
    });
  });

  it('surfaces errors from the API', async () => {
    (updateChecklistItem as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Update failed'),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'item-1', input: { isCompleted: true } });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Update failed'));
  });

  describe('optimistic updates', () => {
    it('optimistically updates the items cache on toggle', async () => {
      const items = [
        createMockChecklistItem({
          id: 'item-1',
          taskId: TASK_ID,
          isCompleted: false,
        }),
        createMockChecklistItem({
          id: 'item-2',
          taskId: TASK_ID,
          isCompleted: true,
          position: 1,
        }),
      ];
      (updateChecklistItem as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}),
      );

      const { Wrapper, queryClient } = createWrapper();
      queryClient.setQueryData(checklistKeys.list(TASK_ID), items);

      const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
        wrapper: Wrapper,
      });

      result.current.mutate({ id: 'item-1', input: { isCompleted: true } });

      await waitFor(() => {
        const cached = queryClient.getQueryData<typeof items>(
          checklistKeys.list(TASK_ID),
        );
        expect(cached?.find((i) => i.id === 'item-1')?.isCompleted).toBe(true);
      });
    });

    it('optimistically updates the summaries cache on toggle', async () => {
      const items = [
        createMockChecklistItem({
          id: 'item-1',
          taskId: TASK_ID,
          isCompleted: false,
        }),
      ];
      const summaries = { [TASK_ID]: { total: 3, completed: 1 } };
      (updateChecklistItem as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}),
      );

      const { Wrapper, queryClient } = createWrapper();
      queryClient.setQueryData(checklistKeys.list(TASK_ID), items);
      queryClient.setQueryData(checklistKeys.summaries(), summaries);

      const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
        wrapper: Wrapper,
      });

      result.current.mutate({ id: 'item-1', input: { isCompleted: true } });

      await waitFor(() => {
        const cached = queryClient.getQueryData<typeof summaries>(
          checklistKeys.summaries(),
        );
        expect(cached?.[TASK_ID]?.completed).toBe(2);
      });
    });

    it('rolls back items cache on error', async () => {
      const items = [
        createMockChecklistItem({
          id: 'item-1',
          taskId: TASK_ID,
          isCompleted: false,
        }),
      ];
      (updateChecklistItem as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API error'),
      );

      const { Wrapper, queryClient } = createWrapper();
      queryClient.setQueryData(checklistKeys.list(TASK_ID), items);

      const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
        wrapper: Wrapper,
      });

      result.current.mutate({ id: 'item-1', input: { isCompleted: true } });

      await waitFor(() => expect(result.current.isError).toBe(true));

      const cached = queryClient.getQueryData<typeof items>(
        checklistKeys.list(TASK_ID),
      );
      expect(cached?.find((i) => i.id === 'item-1')?.isCompleted).toBe(false);
    });

    it('rolls back summaries cache on error', async () => {
      const items = [
        createMockChecklistItem({
          id: 'item-1',
          taskId: TASK_ID,
          isCompleted: false,
        }),
      ];
      const summaries = { [TASK_ID]: { total: 3, completed: 1 } };
      (updateChecklistItem as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API error'),
      );

      const { Wrapper, queryClient } = createWrapper();
      queryClient.setQueryData(checklistKeys.list(TASK_ID), items);
      queryClient.setQueryData(checklistKeys.summaries(), summaries);

      const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
        wrapper: Wrapper,
      });

      result.current.mutate({ id: 'item-1', input: { isCompleted: true } });

      await waitFor(() => expect(result.current.isError).toBe(true));

      const cached = queryClient.getQueryData<typeof summaries>(
        checklistKeys.summaries(),
      );
      expect(cached?.[TASK_ID]?.completed).toBe(1);
    });

    it('does not update summaries when only title changes', async () => {
      const items = [
        createMockChecklistItem({
          id: 'item-1',
          taskId: TASK_ID,
          isCompleted: false,
        }),
      ];
      const summaries = { [TASK_ID]: { total: 3, completed: 1 } };
      (updateChecklistItem as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}),
      );

      const { Wrapper, queryClient } = createWrapper();
      queryClient.setQueryData(checklistKeys.list(TASK_ID), items);
      queryClient.setQueryData(checklistKeys.summaries(), summaries);

      const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
        wrapper: Wrapper,
      });

      result.current.mutate({ id: 'item-1', input: { title: 'New title' } });

      await waitFor(() => {
        const cached = queryClient.getQueryData<typeof items>(
          checklistKeys.list(TASK_ID),
        );
        expect(cached?.find((i) => i.id === 'item-1')?.title).toBe('New title');
      });

      const cachedSummaries = queryClient.getQueryData<typeof summaries>(
        checklistKeys.summaries(),
      );
      expect(cachedSummaries?.[TASK_ID]?.completed).toBe(1);
    });

    it('cancels in-flight queries before optimistic update', async () => {
      (updateChecklistItem as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}),
      );

      const { Wrapper, queryClient } = createWrapper();
      const cancelSpy = vi.spyOn(queryClient, 'cancelQueries');

      const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
        wrapper: Wrapper,
      });

      result.current.mutate({ id: 'item-1', input: { isCompleted: true } });

      await waitFor(() => expect(cancelSpy).toHaveBeenCalled());

      expect(cancelSpy).toHaveBeenCalledWith({
        queryKey: checklistKeys.list(TASK_ID),
      });
      expect(cancelSpy).toHaveBeenCalledWith({
        queryKey: checklistKeys.summaries(),
      });
    });

    it('clamps summary completed count between 0 and total', async () => {
      const items = [
        createMockChecklistItem({
          id: 'item-1',
          taskId: TASK_ID,
          isCompleted: true,
        }),
      ];
      const summaries = { [TASK_ID]: { total: 2, completed: 0 } };
      (updateChecklistItem as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}),
      );

      const { Wrapper, queryClient } = createWrapper();
      queryClient.setQueryData(checklistKeys.list(TASK_ID), items);
      queryClient.setQueryData(checklistKeys.summaries(), summaries);

      const { result } = renderHook(() => useUpdateChecklistItem(TASK_ID), {
        wrapper: Wrapper,
      });

      result.current.mutate({ id: 'item-1', input: { isCompleted: false } });

      await waitFor(() => {
        const cached = queryClient.getQueryData<typeof summaries>(
          checklistKeys.summaries(),
        );
        expect(cached?.[TASK_ID]?.completed).toBe(0);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// useDeleteChecklistItem
// ---------------------------------------------------------------------------

describe('useDeleteChecklistItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (deleteChecklistItem as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
  });

  it('calls deleteChecklistItem API with the provided id', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate('item-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteChecklistItem).toHaveBeenCalledWith('item-1');
  });

  it('invalidates checklistKeys.list(taskId) on success', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate('item-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: checklistKeys.list(TASK_ID),
    });
  });

  it('invalidates checklistKeys.summaries() on success', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate('item-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: checklistKeys.summaries(),
    });
  });

  it('surfaces errors from the API', async () => {
    (deleteChecklistItem as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Delete failed'),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteChecklistItem(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate('item-1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Delete failed'));
  });
});

// ---------------------------------------------------------------------------
// useReorderChecklistItems
// ---------------------------------------------------------------------------

describe('useReorderChecklistItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (reorderChecklistItems as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
  });

  it('calls reorderChecklistItems API with taskId and the provided items', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReorderChecklistItems(TASK_ID), {
      wrapper: Wrapper,
    });

    const items = [
      { id: 'item-1', position: 0 },
      { id: 'item-2', position: 1 },
    ];
    result.current.mutate(items);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reorderChecklistItems).toHaveBeenCalledWith(TASK_ID, items);
  });

  it('invalidates checklistKeys.list(taskId) on success', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useReorderChecklistItems(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate([{ id: 'item-1', position: 0 }]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: checklistKeys.list(TASK_ID),
    });
  });

  it('surfaces errors from the API', async () => {
    (reorderChecklistItems as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Reorder failed'),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReorderChecklistItems(TASK_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate([{ id: 'item-1', position: 0 }]);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Reorder failed'));
  });
});
