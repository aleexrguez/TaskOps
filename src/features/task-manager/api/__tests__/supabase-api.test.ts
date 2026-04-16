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
import { deleteTask, fetchTasks } from '../supabase-api';

// Convenience alias — casts partial builder mocks to the full Supabase type
// without resorting to `as any` in individual tests.
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
    id: 'task-abc',
    user_id: 'user-123',
    title: 'Test task',
    description: null,
    status: 'todo',
    priority: 'medium',
    due_date: null,
    completed_at: null,
    is_archived: false,
    created_at: '2026-04-16T10:00:00.000Z',
    updated_at: '2026-04-16T10:00:00.000Z',
    recurrence_template_id: null,
    recurrence_date_key: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Group: deleteTask — delete guard
// ---------------------------------------------------------------------------

describe('deleteTask — delete guard', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('rejects deleting a generated recurring task', async () => {
    // Arrange: task has a recurrence_date_key
    const mockSingle = vi.fn().mockResolvedValue({
      data: { recurrence_date_key: '2026-04-16' },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    // Act & Assert
    await expect(deleteTask('task-abc')).rejects.toThrow(
      'Cannot delete a recurring task. Complete or archive it instead.',
    );
  });

  it('allows deleting a regular task (no recurrence_date_key)', async () => {
    // Arrange: fetch returns null recurrence_date_key, then delete succeeds
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq });

    const mockSingle = vi.fn().mockResolvedValue({
      data: { recurrence_date_key: null },
      error: null,
    });
    const mockSelectEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

    vi.mocked(supabase.from)
      .mockReturnValueOnce(asFromReturn({ select: mockSelect }))
      .mockReturnValueOnce(asFromReturn({ delete: mockDelete }));

    // Act & Assert — should resolve without throwing
    await expect(deleteTask('task-abc')).resolves.toBeUndefined();
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'task-abc');
  });

  it('throws when task is not found (fetch error)', async () => {
    // Arrange: fetch returns an error
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    // Act & Assert
    await expect(deleteTask('task-abc')).rejects.toThrow(
      'Task not found: task-abc',
    );
  });
});

// ---------------------------------------------------------------------------
// Group: fromDbRow — recurrence field mapping (via fetchTasks)
// ---------------------------------------------------------------------------

describe('fetchTasks — recurrence field mapping', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('maps recurrence fields from a DB row to the domain Task', async () => {
    // Arrange: DB row has populated recurrence fields
    const dbRow = makeDbRow({
      recurrence_template_id: 'tmpl-uuid-001',
      recurrence_date_key: '2026-04-16',
    });

    const mockSelect = vi.fn().mockResolvedValue({
      data: [dbRow],
      error: null,
      count: 1,
    });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    // Act
    const { tasks } = await fetchTasks();

    // Assert
    expect(tasks[0].recurrenceTemplateId).toBe('tmpl-uuid-001');
    expect(tasks[0].recurrenceDateKey).toBe('2026-04-16');
  });

  it('maps null recurrence fields to undefined in the domain Task', async () => {
    // Arrange: DB row has null recurrence fields (regular task)
    const dbRow = makeDbRow({
      recurrence_template_id: null,
      recurrence_date_key: null,
    });

    const mockSelect = vi.fn().mockResolvedValue({
      data: [dbRow],
      error: null,
      count: 1,
    });

    vi.mocked(supabase.from).mockReturnValue(
      asFromReturn({ select: mockSelect }),
    );

    // Act
    const { tasks } = await fetchTasks();

    // Assert
    expect(tasks[0].recurrenceTemplateId).toBeUndefined();
    expect(tasks[0].recurrenceDateKey).toBeUndefined();
  });
});
