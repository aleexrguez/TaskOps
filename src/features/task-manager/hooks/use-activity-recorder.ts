import { useQueryClient } from '@tanstack/react-query';
import { createActivityEvent, createActivityEvents } from '../api';
import { activityKeys } from './activity.keys';
import type { CreateActivityEventInput } from '../types/activity.types';
import type { Task, UpdateTaskInput } from '../types/task.types';

export function useActivityRecorder() {
  const queryClient = useQueryClient();

  function record(input: CreateActivityEventInput): void {
    createActivityEvent(input)
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: activityKeys.list(input.taskId),
        }),
      )
      .catch((err) =>
        console.error('[ActivityRecorder] Failed to record event:', err),
      );
  }

  function recordBatch(inputs: CreateActivityEventInput[]): void {
    if (inputs.length === 0) return;

    const taskId = inputs[0].taskId;
    createActivityEvents(inputs)
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: activityKeys.list(taskId),
        }),
      )
      .catch((err) =>
        console.error('[ActivityRecorder] Failed to record batch:', err),
      );
  }

  function recordTaskCreated(taskId: string): void {
    record({ taskId, eventType: 'task_created' });
  }

  function recordTaskUpdate(
    taskId: string,
    oldTask: Task,
    newData: Partial<UpdateTaskInput>,
  ): void {
    const events: CreateActivityEventInput[] = [];

    if (newData.status !== undefined && newData.status !== oldTask.status) {
      if (newData.status === 'done') {
        events.push({
          taskId,
          eventType: 'task_completed',
          fromValue: oldTask.status,
          toValue: 'done',
        });
      } else {
        events.push({
          taskId,
          eventType: 'task_status_changed',
          fromValue: oldTask.status,
          toValue: newData.status,
        });
      }
    }

    if (
      newData.priority !== undefined &&
      newData.priority !== oldTask.priority
    ) {
      events.push({
        taskId,
        eventType: 'task_priority_changed',
        fromValue: oldTask.priority,
        toValue: newData.priority,
      });
    }

    if (
      newData.dueDate !== undefined &&
      newData.dueDate !== (oldTask.dueDate ?? null)
    ) {
      events.push({
        taskId,
        eventType: 'task_due_date_changed',
        fromValue: oldTask.dueDate ?? null,
        toValue: newData.dueDate ?? null,
      });
    }

    if (events.length === 0) return;
    recordBatch(events);
  }

  function recordArchive(taskId: string): void {
    record({ taskId, eventType: 'task_archived' });
  }

  function recordUnarchive(taskId: string): void {
    record({ taskId, eventType: 'task_unarchived' });
  }

  function recordChecklistItemCreated(taskId: string, title: string): void {
    record({
      taskId,
      eventType: 'checklist_item_created',
      metadata: { title },
    });
  }

  function recordChecklistItemCompleted(taskId: string, title: string): void {
    record({
      taskId,
      eventType: 'checklist_item_completed',
      metadata: { title },
    });
  }

  function recordChecklistItemDeleted(taskId: string, title: string): void {
    record({
      taskId,
      eventType: 'checklist_item_deleted',
      metadata: { title },
    });
  }

  return {
    recordTaskCreated,
    recordTaskUpdate,
    recordArchive,
    recordUnarchive,
    recordChecklistItemCreated,
    recordChecklistItemCompleted,
    recordChecklistItemDeleted,
  };
}
