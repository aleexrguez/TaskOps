import { z } from 'zod';

export const analyticsEventNameSchema = z.enum([
  'landing_viewed',
  'demo_started',
  'auth_modal_opened',
  'feedback_submitted',
  'task_created',
  'task_completed',
  'board_viewed',
  'recurrence_viewed',
  'inbox_task_created',
]);

export type AnalyticsEventName = z.infer<typeof analyticsEventNameSchema>;
