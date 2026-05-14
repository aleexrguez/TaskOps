import { z } from 'zod';

export const activityEventTypeSchema = z.enum([
  'task_created',
  'task_status_changed',
  'task_priority_changed',
  'task_due_date_changed',
  'task_completed',
  'task_archived',
  'task_unarchived',
  'checklist_item_created',
  'checklist_item_completed',
  'checklist_item_deleted',
  'recurrence_generated_task',
]);
export type ActivityEventType = z.infer<typeof activityEventTypeSchema>;

export const activityEventSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  eventType: activityEventTypeSchema,
  fromValue: z.string().nullable(),
  toValue: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.iso.datetime(),
});
export type ActivityEvent = z.infer<typeof activityEventSchema>;

export const createActivityEventInputSchema = z.object({
  taskId: z.string().uuid(),
  eventType: activityEventTypeSchema,
  fromValue: z.string().nullable().optional(),
  toValue: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type CreateActivityEventInput = z.infer<
  typeof createActivityEventInputSchema
>;
