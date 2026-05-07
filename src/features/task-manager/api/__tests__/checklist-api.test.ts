import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock supabase — must come before any import that touches the module
vi.mock('@/shared/services/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}));

// Mock auth guard
vi.mock('@/shared/services/auth.guard', () => ({
  requireAuthenticatedUser: vi.fn().mockResolvedValue('user-123'),
}));

import { supabase } from '@/shared/services/supabase';
import { requireAuthenticatedUser } from '@/shared/services/auth.guard';
import {
  fetchChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
} from '../checklist-api';

// Convenience alias
function asFromReturn(
  partial: Record<string, unknown>,
): ReturnType<SupabaseClient['from']> {
  return partial as unknown as ReturnType<SupabaseClient['from']>;
}

// ---------------------------------------------------------------------------
// Helpers — build a minimal DB row for tests
// ---------------------------------------------------------------------------

function makeDbRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'item-abc',
    task_id: 'task-001',
    user_id: 'user-123',
    title: 'Test checklist item',
    is_completed: false,
    position: 0,
    created_at: '2026-05-07T10:00:00.000Z',
    updated_at: '2026-05-07T10:00:00.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// fetchChecklistItems
// ---------------------------------------------------------------------------

describe('fetchChecklistItems', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('maps DB rows to domain ChecklistItem objects', async () => {
    const dbRow = makeDbRow({ is_completed: true, position: 2 });

    const mockOrder = vi.fn().mockResolvedValue({ data: [dbRow], error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    const items = await fetchChecklistItems('task-001');

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      id: 'item-abc',
      taskId: 'task-001',
      title: 'Test checklist item',
      isCompleted: true,
      position: 2,
      createdAt: '2026-05-07T10:00:00.000Z',
      updatedAt: '2026-05-07T10:00:00.000Z',
    });
  });

  it('filters by task_id', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    await fetchChecklistItems('task-xyz');

    expect(mockEq).toHaveBeenCalledWith('task_id', 'task-xyz');
  });

  it('orders results by position', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    await fetchChecklistItems('task-001');

    expect(mockOrder).toHaveBeenCalledWith('position');
  });

  it('returns empty array when no items exist', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    const items = await fetchChecklistItems('task-001');

    expect(items).toEqual([]);
  });

  it('throws when supabase returns an error', async () => {
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    await expect(fetchChecklistItems('task-001')).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// createChecklistItem
// ---------------------------------------------------------------------------

describe('createChecklistItem', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
    vi.mocked(requireAuthenticatedUser).mockResolvedValue('user-123');
  });

  it('calls requireAuthenticatedUser', async () => {
    const dbRow = makeDbRow();

    const mockSingle = vi.fn().mockResolvedValue({ data: dbRow, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await createChecklistItem('task-001', { title: 'New item' });

    expect(requireAuthenticatedUser).toHaveBeenCalled();
  });

  it('inserts with user_id from auth, not from client input', async () => {
    const dbRow = makeDbRow();

    const mockSingle = vi.fn().mockResolvedValue({ data: dbRow, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await createChecklistItem('task-001', { title: 'New item' });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        task_id: 'task-001',
        title: 'New item',
      }),
    );
  });

  it('maps the returned row to a domain ChecklistItem', async () => {
    const dbRow = makeDbRow({ title: 'New item' });

    const mockSingle = vi.fn().mockResolvedValue({ data: dbRow, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    const item = await createChecklistItem('task-001', { title: 'New item' });

    expect(item.title).toBe('New item');
    expect(item.taskId).toBe('task-001');
  });

  it('throws when supabase returns an error', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ insert: mockInsert }),
    );

    await expect(
      createChecklistItem('task-001', { title: 'New item' }),
    ).rejects.toThrow('Insert failed');
  });
});

// ---------------------------------------------------------------------------
// updateChecklistItem
// ---------------------------------------------------------------------------

describe('updateChecklistItem', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('sets updated_at explicitly in the update payload', async () => {
    const dbRow = makeDbRow();

    const mockSingle = vi.fn().mockResolvedValue({ data: dbRow, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    await updateChecklistItem('item-abc', { title: 'Updated' });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        updated_at: expect.any(String),
      }),
    );
  });

  it('maps title to the update payload', async () => {
    const dbRow = makeDbRow({ title: 'Updated' });

    const mockSingle = vi.fn().mockResolvedValue({ data: dbRow, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    await updateChecklistItem('item-abc', { title: 'Updated' });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated' }),
    );
  });

  it('maps isCompleted to is_completed in the update payload', async () => {
    const dbRow = makeDbRow({ is_completed: true });

    const mockSingle = vi.fn().mockResolvedValue({ data: dbRow, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    await updateChecklistItem('item-abc', { isCompleted: true });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ is_completed: true }),
    );
  });

  it('filters update by id', async () => {
    const dbRow = makeDbRow();

    const mockSingle = vi.fn().mockResolvedValue({ data: dbRow, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    await updateChecklistItem('item-abc', { title: 'Updated' });

    expect(mockEq).toHaveBeenCalledWith('id', 'item-abc');
  });

  it('throws when supabase returns an error', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Update failed' } });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    await expect(
      updateChecklistItem('item-abc', { title: 'Updated' }),
    ).rejects.toThrow('Update failed');
  });
});

// ---------------------------------------------------------------------------
// deleteChecklistItem
// ---------------------------------------------------------------------------

describe('deleteChecklistItem', () => {
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

    await deleteChecklistItem('item-abc');

    expect(mockEqId).toHaveBeenCalledWith('id', 'item-abc');
    expect(mockEqUserId).toHaveBeenCalledWith('user_id', 'user-123');
  });

  it('resolves to undefined on success', async () => {
    const mockEqUserId = vi.fn().mockResolvedValue({ error: null });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqUserId });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEqId });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ delete: mockDelete }),
    );

    await expect(deleteChecklistItem('item-abc')).resolves.toBeUndefined();
  });

  it('throws when supabase returns an error', async () => {
    const mockEqUserId = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqUserId });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEqId });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ delete: mockDelete }),
    );

    await expect(deleteChecklistItem('item-abc')).rejects.toThrow(
      'Delete failed',
    );
  });
});

// ---------------------------------------------------------------------------
// reorderChecklistItems
// ---------------------------------------------------------------------------

describe('reorderChecklistItems', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('is a no-op and resolves when given an empty array', async () => {
    await expect(
      reorderChecklistItems('task-001', []),
    ).resolves.toBeUndefined();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('updates position and updated_at for each item', async () => {
    const mockEqTaskId = vi.fn().mockResolvedValue({ error: null });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqTaskId });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqId });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    await reorderChecklistItems('task-001', [
      { id: 'item-1', position: 0 },
      { id: 'item-2', position: 1 },
    ]);

    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ position: 0, updated_at: expect.any(String) }),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ position: 1, updated_at: expect.any(String) }),
    );
  });

  it('filters each update by id and task_id', async () => {
    const mockEqTaskId = vi.fn().mockResolvedValue({ error: null });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqTaskId });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqId });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    await reorderChecklistItems('task-001', [{ id: 'item-1', position: 0 }]);

    expect(mockEqId).toHaveBeenCalledWith('id', 'item-1');
    expect(mockEqTaskId).toHaveBeenCalledWith('task_id', 'task-001');
  });

  it('throws when any individual update fails', async () => {
    const mockEqTaskId = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Reorder failed' } });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqTaskId });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqId });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ update: mockUpdate }),
    );

    await expect(
      reorderChecklistItems('task-001', [{ id: 'item-1', position: 0 }]),
    ).rejects.toThrow('Reorder failed');
  });
});
