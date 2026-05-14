import { STATUS_LABELS } from '../components/status.constants';
import { formatDate } from './date.utils';
import type { ActivityEvent } from '../types/activity.types';
import type { TaskStatus } from '../types/task.types';

function statusLabel(value: string | null): string {
  if (!value) return 'unknown';
  return STATUS_LABELS[value as TaskStatus] ?? value;
}

export function formatEventDescription(event: ActivityEvent): string {
  switch (event.eventType) {
    case 'task_created':
      return 'Task created';
    case 'task_status_changed':
      return `Moved from ${statusLabel(event.fromValue)} to ${statusLabel(event.toValue)}`;
    case 'task_priority_changed':
      return `Priority changed from ${event.fromValue ?? 'none'} to ${event.toValue ?? 'none'}`;
    case 'task_due_date_changed':
      return event.toValue
        ? `Due date changed to ${formatDate(event.toValue)}`
        : 'Due date removed';
    case 'task_completed':
      return 'Task completed';
    case 'task_archived':
      return 'Task archived';
    case 'task_unarchived':
      return 'Task restored';
    case 'checklist_item_created': {
      const title = (event.metadata?.title as string) ?? 'item';
      return `Added checklist item "${title}"`;
    }
    case 'checklist_item_completed': {
      const title = (event.metadata?.title as string) ?? 'item';
      return `Completed checklist item "${title}"`;
    }
    case 'checklist_item_deleted': {
      const title = (event.metadata?.title as string) ?? 'item';
      return `Removed checklist item "${title}"`;
    }
    case 'recurrence_generated_task':
      return 'Auto-generated from recurrence';
    default:
      return 'Activity recorded';
  }
}
