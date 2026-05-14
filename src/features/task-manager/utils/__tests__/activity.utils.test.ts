import { describe, it, expect } from 'vitest';
import { formatEventDescription } from '../activity.utils';
import type { ActivityEvent } from '../../types/activity.types';

function makeEvent(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
  return {
    id: crypto.randomUUID(),
    taskId: crypto.randomUUID(),
    eventType: 'task_created',
    fromValue: null,
    toValue: null,
    metadata: {},
    createdAt: '2026-05-14T12:00:00.000Z',
    ...overrides,
  };
}

describe('formatEventDescription', () => {
  it('returns "Task created" for task_created', () => {
    expect(formatEventDescription(makeEvent())).toBe('Task created');
  });

  it('returns status labels for task_status_changed', () => {
    const event = makeEvent({
      eventType: 'task_status_changed',
      fromValue: 'todo',
      toValue: 'in-progress',
    });
    expect(formatEventDescription(event)).toBe(
      'Moved from Todo to In Progress',
    );
  });

  it('handles all status transitions for task_status_changed', () => {
    const event = makeEvent({
      eventType: 'task_status_changed',
      fromValue: 'in-progress',
      toValue: 'done',
    });
    expect(formatEventDescription(event)).toBe(
      'Moved from In Progress to Done',
    );
  });

  it('returns priority change description', () => {
    const event = makeEvent({
      eventType: 'task_priority_changed',
      fromValue: 'medium',
      toValue: 'high',
    });
    expect(formatEventDescription(event)).toBe(
      'Priority changed from medium to high',
    );
  });

  it('handles null fromValue in priority change', () => {
    const event = makeEvent({
      eventType: 'task_priority_changed',
      fromValue: null,
      toValue: 'high',
    });
    expect(formatEventDescription(event)).toBe(
      'Priority changed from none to high',
    );
  });

  it('returns due date change with formatted date', () => {
    const event = makeEvent({
      eventType: 'task_due_date_changed',
      toValue: '2026-05-15',
    });
    expect(formatEventDescription(event)).toContain('Due date changed to');
  });

  it('returns "Due date removed" when toValue is null', () => {
    const event = makeEvent({
      eventType: 'task_due_date_changed',
      fromValue: '2026-05-15',
      toValue: null,
    });
    expect(formatEventDescription(event)).toBe('Due date removed');
  });

  it('returns "Task completed" for task_completed', () => {
    const event = makeEvent({
      eventType: 'task_completed',
      fromValue: 'in-progress',
      toValue: 'done',
    });
    expect(formatEventDescription(event)).toBe('Task completed');
  });

  it('returns "Task archived" for task_archived', () => {
    expect(
      formatEventDescription(makeEvent({ eventType: 'task_archived' })),
    ).toBe('Task archived');
  });

  it('returns "Task restored" for task_unarchived', () => {
    expect(
      formatEventDescription(makeEvent({ eventType: 'task_unarchived' })),
    ).toBe('Task restored');
  });

  it('returns checklist item created with title', () => {
    const event = makeEvent({
      eventType: 'checklist_item_created',
      metadata: { title: 'Buy milk' },
    });
    expect(formatEventDescription(event)).toBe(
      'Added checklist item "Buy milk"',
    );
  });

  it('returns checklist item completed with title', () => {
    const event = makeEvent({
      eventType: 'checklist_item_completed',
      metadata: { title: 'Buy milk' },
    });
    expect(formatEventDescription(event)).toBe(
      'Completed checklist item "Buy milk"',
    );
  });

  it('returns checklist item deleted with title', () => {
    const event = makeEvent({
      eventType: 'checklist_item_deleted',
      metadata: { title: 'Buy milk' },
    });
    expect(formatEventDescription(event)).toBe(
      'Removed checklist item "Buy milk"',
    );
  });

  it('falls back to "item" when checklist metadata has no title', () => {
    const event = makeEvent({
      eventType: 'checklist_item_created',
      metadata: {},
    });
    expect(formatEventDescription(event)).toBe('Added checklist item "item"');
  });

  it('returns recurrence description', () => {
    expect(
      formatEventDescription(
        makeEvent({ eventType: 'recurrence_generated_task' }),
      ),
    ).toBe('Auto-generated from recurrence');
  });
});
