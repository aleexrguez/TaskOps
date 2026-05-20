import type { TFunction } from 'i18next';
import { formatDate } from './date.utils';
import type { DateLang } from './date.utils';
import type { ActivityEvent } from '../types/activity.types';

export function formatEventDescription(
  event: ActivityEvent,
  t: TFunction,
  lang: DateLang = 'en',
): string {
  switch (event.eventType) {
    case 'task_created':
      return t('task:activity.taskCreated');
    case 'task_status_changed':
      return t('task:activity.statusChanged', {
        from: event.fromValue
          ? t(`common:status.${statusKey(event.fromValue)}`)
          : t('task:activity.unknownStatus'),
        to: event.toValue
          ? t(`common:status.${statusKey(event.toValue)}`)
          : t('task:activity.unknownStatus'),
      });
    case 'task_priority_changed':
      return t('task:activity.priorityChanged', {
        from: event.fromValue
          ? t(`common:priority.${event.fromValue}`)
          : t('task:activity.noneValue'),
        to: event.toValue
          ? t(`common:priority.${event.toValue}`)
          : t('task:activity.noneValue'),
      });
    case 'task_due_date_changed':
      return event.toValue
        ? t('task:activity.dueDateChanged', {
            date: formatDate(event.toValue, lang),
          })
        : t('task:activity.dueDateRemoved');
    case 'task_completed':
      return t('task:activity.taskCompleted');
    case 'task_archived':
      return t('task:activity.taskArchived');
    case 'task_unarchived':
      return t('task:activity.taskUnarchived');
    case 'checklist_item_created': {
      const title = (event.metadata?.title as string) ?? 'item';
      return t('task:activity.checklistItemCreated', { title });
    }
    case 'checklist_item_completed': {
      const title = (event.metadata?.title as string) ?? 'item';
      return t('task:activity.checklistItemCompleted', { title });
    }
    case 'checklist_item_deleted': {
      const title = (event.metadata?.title as string) ?? 'item';
      return t('task:activity.checklistItemDeleted', { title });
    }
    case 'recurrence_generated_task':
      return t('task:activity.recurrenceGenerated');
    default:
      return t('task:activity.default');
  }
}

/** Map status values (with hyphens) to i18n keys (camelCase). */
function statusKey(value: string): string {
  if (value === 'in-progress') return 'inProgress';
  return value;
}
