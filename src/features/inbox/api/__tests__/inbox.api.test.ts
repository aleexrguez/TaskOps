import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@/shared/services/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}));

vi.mock('@/shared/services/auth.guard', () => ({
  requireAuthenticatedUser: vi.fn().mockResolvedValue('user-123'),
}));

vi.mock('@/features/task-manager/api', () => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
}));

import { supabase } from '@/shared/services/supabase';
import {
  fetchInboxItems,
  createInboxItem,
  updateInboxItem,
  deleteInboxItem,
  convertInboxItemToTask,
  AlreadyConvertedError,
} from '../inbox.api';
import { createTask, deleteTask } from '@/features/task-manager/api';

function asFromReturn(
  partial: Record<string, unknown>,
): ReturnType<SupabaseClient['from']> {
  return partial as unknown as ReturnType<SupabaseClient['from']>;
}

function makeDbRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'inbox-abc',
    user_id: 'user-123',
    title: 'Quick idea',
    notes: null,
    created_at: '2026-05-16T10:00:00.000Z',
    converted_task_id: null,
    converted_at: null,
    ...overrides,
  };
}

describe('fetchInboxItems', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('filters by converted_at IS NULL and orders by created_at DESC', async () => {
    const rows = [
      makeDbRow(),
      makeDbRow({ id: 'inbox-def', title: 'Another' }),
    ];
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: rows, error: null, count: 2 });
    const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ is: mockIs });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    const result = await fetchInboxItems();

    expect(supabase.from).toHaveBeenCalledWith('inbox_items');
    expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
    expect(mockIs).toHaveBeenCalledWith('converted_at', null);
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('inbox-abc');
    expect(result.total).toBe(2);
  });

  it('returns mapped domain objects (camelCase)', async () => {
    const row = makeDbRow({
      id: 'inbox-xyz',
      title: 'Test',
      notes: 'Some notes',
      created_at: '2026-05-16T12:00:00.000Z',
    });
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: [row], error: null, count: 1 });
    const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ is: mockIs });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    const result = await fetchInboxItems();

    expect(result.items[0]).toEqual({
      id: 'inbox-xyz',
      title: 'Test',
      notes: 'Some notes',
      createdAt: '2026-05-16T12:00:00.000Z',
      convertedTaskId: null,
      convertedAt: null,
    });
  });

  it('throws on supabase error', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
      count: 0,
    });
    const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ is: mockIs });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    await expect(fetchInboxItems()).rejects.toThrow('DB error');
  });
});

describe('createInboxItem', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('validates input, inserts with user_id, and returns mapped item', async () => {
    const row = makeDbRow({ title: 'New idea' });
    const mockSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const mockSelectAfterInsert = vi
      .fn()
      .mockReturnValue({ single: mockSingle });
    const mockInsert = vi
      .fn()
      .mockReturnValue({ select: mockSelectAfterInsert });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    const result = await createInboxItem({ title: 'New idea' });

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      title: 'New idea',
      notes: null,
    });
    expect(result.title).toBe('New idea');
    expect(result.id).toBe('inbox-abc');
  });

  it('trims title before inserting', async () => {
    const row = makeDbRow({ title: 'Trimmed' });
    const mockSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const mockSelectAfterInsert = vi
      .fn()
      .mockReturnValue({ single: mockSingle });
    const mockInsert = vi
      .fn()
      .mockReturnValue({ select: mockSelectAfterInsert });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await createInboxItem({ title: '  Trimmed  ' });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Trimmed' }),
    );
  });

  it('rejects empty title (Zod validation)', async () => {
    await expect(createInboxItem({ title: '' })).rejects.toThrow();
  });

  it('rejects title > 200 chars', async () => {
    await expect(createInboxItem({ title: 'a'.repeat(201) })).rejects.toThrow();
  });

  it('passes notes through when provided', async () => {
    const row = makeDbRow({ title: 'With notes', notes: 'Details' });
    const mockSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const mockSelectAfterInsert = vi
      .fn()
      .mockReturnValue({ single: mockSingle });
    const mockInsert = vi
      .fn()
      .mockReturnValue({ select: mockSelectAfterInsert });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await createInboxItem({ title: 'With notes', notes: 'Details' });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'Details' }),
    );
  });

  it('throws on supabase error', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } });
    const mockSelectAfterInsert = vi
      .fn()
      .mockReturnValue({ single: mockSingle });
    const mockInsert = vi
      .fn()
      .mockReturnValue({ select: mockSelectAfterInsert });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await expect(createInboxItem({ title: 'Test' })).rejects.toThrow(
      'Insert failed',
    );
  });
});

describe('updateInboxItem', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('updates only provided fields and filters by converted_at IS NULL', async () => {
    const row = makeDbRow({ title: 'Updated' });
    const mockSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const mockSelectAfterUpdate = vi
      .fn()
      .mockReturnValue({ single: mockSingle });
    const mockIs = vi.fn().mockReturnValue({ select: mockSelectAfterUpdate });
    const mockEqUserId = vi.fn().mockReturnValue({ is: mockIs });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqUserId });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqId });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    const result = await updateInboxItem('inbox-abc', { title: 'Updated' });

    expect(mockUpdate).toHaveBeenCalledWith({ title: 'Updated' });
    expect(mockEqId).toHaveBeenCalledWith('id', 'inbox-abc');
    expect(mockEqUserId).toHaveBeenCalledWith('user_id', 'user-123');
    expect(mockIs).toHaveBeenCalledWith('converted_at', null);
    expect(result.title).toBe('Updated');
  });

  it('rejects invalid title (empty after trim)', async () => {
    await expect(
      updateInboxItem('inbox-abc', { title: '   ' }),
    ).rejects.toThrow();
  });

  it('rejects title > 200 chars', async () => {
    await expect(
      updateInboxItem('inbox-abc', { title: 'a'.repeat(201) }),
    ).rejects.toThrow();
  });

  it('throws on supabase error (e.g. item already converted)', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'No rows found' },
    });
    const mockSelectAfterUpdate = vi
      .fn()
      .mockReturnValue({ single: mockSingle });
    const mockIs = vi.fn().mockReturnValue({ select: mockSelectAfterUpdate });
    const mockEqUserId = vi.fn().mockReturnValue({ is: mockIs });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqUserId });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqId });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    await expect(
      updateInboxItem('inbox-abc', { title: 'New title' }),
    ).rejects.toThrow('No rows found');
  });
});

describe('deleteInboxItem', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('deletes by id and user_id', async () => {
    const mockEqUserId = vi.fn().mockResolvedValue({ error: null });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqUserId });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEqId });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ delete: mockDelete }),
    );

    await expect(deleteInboxItem('inbox-abc')).resolves.toBeUndefined();

    expect(supabase.from).toHaveBeenCalledWith('inbox_items');
    expect(mockEqId).toHaveBeenCalledWith('id', 'inbox-abc');
    expect(mockEqUserId).toHaveBeenCalledWith('user_id', 'user-123');
  });

  it('throws on supabase error', async () => {
    const mockEqUserId = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqUserId });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEqId });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ delete: mockDelete }),
    );

    await expect(deleteInboxItem('inbox-abc')).rejects.toThrow('Delete failed');
  });
});

describe('convertInboxItemToTask', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
    vi.mocked(createTask as ReturnType<typeof vi.fn>).mockReset();
    vi.mocked(deleteTask as ReturnType<typeof vi.fn>).mockReset();
  });

  function setupFetchItem(row: Record<string, unknown>) {
    const mockSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const mockEqUserId = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqUserId });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEqId });
    return { select: mockSelect };
  }

  function setupUpdateConversion(rows: Record<string, unknown>[]) {
    const mockSelect = vi.fn().mockResolvedValue({ data: rows, error: null });
    const mockIs = vi.fn().mockReturnValue({ select: mockSelect });
    const mockEqUserId = vi.fn().mockReturnValue({ is: mockIs });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqUserId });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqId });
    return { update: mockUpdate };
  }

  it('creates task and marks inbox item as converted', async () => {
    const unconvertedRow = makeDbRow({ id: 'item-1' });
    const convertedRow = makeDbRow({
      id: 'item-1',
      converted_task_id: 'task-1',
      converted_at: '2026-05-16T12:00:00.000Z',
    });

    const fetchMock = setupFetchItem(unconvertedRow);
    const updateMock = setupUpdateConversion([convertedRow]);

    // First call: select (fetch item), second call: update
    let callCount = 0;
    vi.mocked(supabase.from).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return asFromReturn(fetchMock);
      return asFromReturn(updateMock);
    });

    vi.mocked(createTask as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'task-1',
      title: 'My task',
      status: 'todo',
      priority: 'medium',
    });

    const result = await convertInboxItemToTask('item-1', {
      title: 'My task',
      status: 'todo',
      priority: 'medium',
    });

    expect(createTask).toHaveBeenCalledWith({
      title: 'My task',
      status: 'todo',
      priority: 'medium',
    });
    expect(result.task.id).toBe('task-1');
    expect(result.inboxItem.convertedTaskId).toBe('task-1');
  });

  it('throws AlreadyConvertedError when item is already converted (pre-check)', async () => {
    const alreadyConvertedRow = makeDbRow({
      id: 'item-1',
      converted_at: '2026-05-16T10:00:00.000Z',
      converted_task_id: 'task-old',
    });

    const fetchMock = setupFetchItem(alreadyConvertedRow);
    vi.mocked(supabase.from).mockReturnValue(asFromReturn(fetchMock));

    await expect(
      convertInboxItemToTask('item-1', {
        title: 'Test',
        status: 'todo',
        priority: 'medium',
      }),
    ).rejects.toThrow(AlreadyConvertedError);

    // Should NOT have tried to create a task
    expect(createTask).not.toHaveBeenCalled();
  });

  it('deletes task and throws AlreadyConvertedError on race condition (0 rows updated)', async () => {
    const unconvertedRow = makeDbRow({ id: 'item-1' });
    const fetchMock = setupFetchItem(unconvertedRow);
    // Update returns 0 rows (race condition)
    const updateMock = setupUpdateConversion([]);

    let callCount = 0;
    vi.mocked(supabase.from).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return asFromReturn(fetchMock);
      return asFromReturn(updateMock);
    });

    vi.mocked(createTask as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'task-new',
      title: 'Test',
    });
    vi.mocked(deleteTask as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    await expect(
      convertInboxItemToTask('item-1', {
        title: 'Test',
        status: 'todo',
        priority: 'medium',
      }),
    ).rejects.toThrow(AlreadyConvertedError);

    // Should have cleaned up the created task
    expect(deleteTask).toHaveBeenCalledWith('task-new');
  });

  it('batch inserts checklist items with sequential positions 0, 1, 2', async () => {
    const unconvertedRow = makeDbRow({ id: 'item-1' });
    const convertedRow = makeDbRow({
      id: 'item-1',
      converted_task_id: 'task-1',
      converted_at: '2026-05-16T12:00:00.000Z',
    });

    const fetchMock = setupFetchItem(unconvertedRow);
    const mockChecklistInsert = vi.fn().mockResolvedValue({ error: null });
    const updateMock = setupUpdateConversion([convertedRow]);

    let callCount = 0;
    vi.mocked(supabase.from).mockImplementation((table) => {
      callCount++;
      if (callCount === 1) return asFromReturn(fetchMock);
      if (table === 'checklist_items')
        return asFromReturn({ insert: mockChecklistInsert });
      return asFromReturn(updateMock);
    });

    vi.mocked(createTask as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'task-1',
      title: 'Test',
    });

    await convertInboxItemToTask(
      'item-1',
      { title: 'Test', status: 'todo', priority: 'medium' },
      ['Step A', 'Step B', 'Step C'],
    );

    expect(mockChecklistInsert).toHaveBeenCalledWith([
      { task_id: 'task-1', user_id: 'user-123', title: 'Step A', position: 0 },
      { task_id: 'task-1', user_id: 'user-123', title: 'Step B', position: 1 },
      { task_id: 'task-1', user_id: 'user-123', title: 'Step C', position: 2 },
    ]);
  });

  it('does not touch checklist_items when no checklist provided', async () => {
    const unconvertedRow = makeDbRow({ id: 'item-1' });
    const convertedRow = makeDbRow({
      id: 'item-1',
      converted_task_id: 'task-1',
      converted_at: '2026-05-16T12:00:00.000Z',
    });

    const fetchMock = setupFetchItem(unconvertedRow);
    const updateMock = setupUpdateConversion([convertedRow]);

    let callCount = 0;
    vi.mocked(supabase.from).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return asFromReturn(fetchMock);
      return asFromReturn(updateMock);
    });

    vi.mocked(createTask as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'task-1',
      title: 'Test',
    });

    await convertInboxItemToTask('item-1', {
      title: 'Test',
      status: 'todo',
      priority: 'medium',
    });

    // supabase.from should only be called for inbox_items (fetch + update), not checklist_items
    const calls = vi.mocked(supabase.from).mock.calls;
    expect(calls.every(([table]) => table === 'inbox_items')).toBe(true);
  });

  it('deletes task if checklist batch insert fails', async () => {
    const unconvertedRow = makeDbRow({ id: 'item-1' });
    const fetchMock = setupFetchItem(unconvertedRow);
    const mockChecklistInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Checklist insert failed' } });

    let callCount = 0;
    vi.mocked(supabase.from).mockImplementation((table) => {
      callCount++;
      if (callCount === 1) return asFromReturn(fetchMock);
      if (table === 'checklist_items')
        return asFromReturn({ insert: mockChecklistInsert });
      return asFromReturn({});
    });

    vi.mocked(createTask as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'task-cleanup',
      title: 'Test',
    });
    vi.mocked(deleteTask as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    await expect(
      convertInboxItemToTask(
        'item-1',
        { title: 'Test', status: 'todo', priority: 'medium' },
        ['Fail item'],
      ),
    ).rejects.toThrow('Checklist insert failed');

    expect(deleteTask).toHaveBeenCalledWith('task-cleanup');
  });
});
