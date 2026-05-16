import { describe, it, expect } from 'vitest';
import { mapInboxItemRowToInboxItem } from '../inbox.dto';
import type { DbInboxItemRow } from '../inbox.dto';

describe('mapInboxItemRowToInboxItem', () => {
  it('maps unconverted row correctly', () => {
    const row: DbInboxItemRow = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: 'user-123',
      title: 'Quick idea',
      notes: 'Some notes here',
      created_at: '2026-05-16T10:00:00.000Z',
      converted_task_id: null,
      converted_at: null,
    };

    const result = mapInboxItemRowToInboxItem(row);

    expect(result).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Quick idea',
      notes: 'Some notes here',
      createdAt: '2026-05-16T10:00:00.000Z',
      convertedTaskId: null,
      convertedAt: null,
    });
  });

  it('maps converted row correctly', () => {
    const row: DbInboxItemRow = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: 'user-123',
      title: 'Converted idea',
      notes: null,
      created_at: '2026-05-15T08:00:00.000Z',
      converted_task_id: 'task-uuid-456',
      converted_at: '2026-05-16T12:00:00.000Z',
    };

    const result = mapInboxItemRowToInboxItem(row);

    expect(result).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Converted idea',
      notes: null,
      createdAt: '2026-05-15T08:00:00.000Z',
      convertedTaskId: 'task-uuid-456',
      convertedAt: '2026-05-16T12:00:00.000Z',
    });
  });

  it('does not include user_id in domain model', () => {
    const row: DbInboxItemRow = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      user_id: 'user-123',
      title: 'Test',
      notes: null,
      created_at: '2026-05-16T10:00:00.000Z',
      converted_task_id: null,
      converted_at: null,
    };

    const result = mapInboxItemRowToInboxItem(row);

    expect(result).not.toHaveProperty('user_id');
    expect(result).not.toHaveProperty('userId');
  });
});
