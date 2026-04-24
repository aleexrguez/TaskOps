import { z } from 'zod';

export const taskStatusSchema = z.enum(['todo', 'in-progress', 'done']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: z.string().date().optional(),
  completedAt: z.iso.datetime().optional(),
  isArchived: z.boolean().default(false),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  recurrenceTemplateId: z.string().uuid().optional(),
  recurrenceDateKey: z.string().optional(), // YYYY-MM-DD
  position: z.number().int().default(0),
});
export type Task = z.infer<typeof taskSchema>;

export const createTaskInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  dueDate: z.string().date().optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export const updateTaskInputSchema = createTaskInputSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

export const reorderUpdateSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().min(0),
  status: taskStatusSchema.optional(),
});
export type ReorderUpdate = z.infer<typeof reorderUpdateSchema>;

export {
  retentionPolicySchema,
  type RetentionPolicy,
} from '@/shared/types/preferences.types';

export const viewModeSchema = z.enum(['list', 'board']);
export type ViewMode = z.infer<typeof viewModeSchema>;
