import { describe, it, expect } from 'vitest';
import i18n from '@/i18n/i18n';
import { formatEventDescription } from '../activity.utils';
import type { ActivityEvent } from '../../types/activity.types';

const t = i18n.t.bind(i18n);

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
    expect(formatEventDescription(makeEvent(), t)).toBe('Task created');
  });

  it('returns status labels for task_status_changed', () => {
    const event = makeEvent({
      eventType: 'task_status_changed',
      fromValue: 'todo',
      toValue: 'in-progress',
    });
    expect(formatEventDescription(event, t)).toBe(
      'Moved from Todo to In Progress',
    );
  });

  it('handles all status transitions for task_status_changed', () => {
    const event = makeEvent({
      eventType: 'task_status_changed',
      fromValue: 'in-progress',
      toValue: 'done',
    });
    expect(formatEventDescription(event, t)).toBe(
      'Moved from In Progress to Done',
    );
  });

  it('returns priority change description', () => {
    const event = makeEvent({
      eventType: 'task_priority_changed',
      fromValue: 'medium',
      toValue: 'high',
    });
    expect(formatEventDescription(event, t)).toBe(
      'Priority changed from Medium to High',
    );
  });

  it('handles null fromValue in priority change', () => {
    const event = makeEvent({
      eventType: 'task_priority_changed',
      fromValue: null,
      toValue: 'high',
    });
    expect(formatEventDescription(event, t)).toBe(
      'Priority changed from none to High',
    );
  });

  it('returns due date change with formatted date', () => {
    const event = makeEvent({
      eventType: 'task_due_date_changed',
      toValue: '2026-05-15',
    });
    expect(formatEventDescription(event, t)).toContain('Due date changed to');
  });

  it('returns "Due date removed" when toValue is null', () => {
    const event = makeEvent({
      eventType: 'task_due_date_changed',
      fromValue: '2026-05-15',
      toValue: null,
    });
    expect(formatEventDescription(event, t)).toBe('Due date removed');
  });

  it('returns "Task completed" for task_completed', () => {
    const event = makeEvent({
      eventType: 'task_completed',
      fromValue: 'in-progress',
      toValue: 'done',
    });
    expect(formatEventDescription(event, t)).toBe('Task completed');
  });

  it('returns "Task archived" for task_archived', () => {
    expect(
      formatEventDescription(makeEvent({ eventType: 'task_archived' }), t),
    ).toBe('Task archived');
  });

  it('returns "Task restored" for task_unarchived', () => {
    expect(
      formatEventDescription(makeEvent({ eventType: 'task_unarchived' }), t),
    ).toBe('Task restored');
  });

  it('returns checklist item created with title', () => {
    const event = makeEvent({
      eventType: 'checklist_item_created',
      metadata: { title: 'Buy milk' },
    });
    expect(formatEventDescription(event, t)).toBe(
      'Added checklist item "Buy milk"',
    );
  });

  it('returns checklist item completed with title', () => {
    const event = makeEvent({
      eventType: 'checklist_item_completed',
      metadata: { title: 'Buy milk' },
    });
    expect(formatEventDescription(event, t)).toBe(
      'Completed checklist item "Buy milk"',
    );
  });

  it('returns checklist item deleted with title', () => {
    const event = makeEvent({
      eventType: 'checklist_item_deleted',
      metadata: { title: 'Buy milk' },
    });
    expect(formatEventDescription(event, t)).toBe(
      'Removed checklist item "Buy milk"',
    );
  });

  it('falls back to "item" when checklist metadata has no title', () => {
    const event = makeEvent({
      eventType: 'checklist_item_created',
      metadata: {},
    });
    expect(formatEventDescription(event, t)).toBe(
      'Added checklist item "item"',
    );
  });

  it('returns recurrence description', () => {
    expect(
      formatEventDescription(
        makeEvent({ eventType: 'recurrence_generated_task' }),
        t,
      ),
    ).toBe('Auto-generated from recurrence');
  });
});
