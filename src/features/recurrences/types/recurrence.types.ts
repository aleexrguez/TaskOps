import { z } from 'zod';
import { taskPrioritySchema } from '@/features/task-manager/types/task.types';

export const recurrenceFrequencySchema = z.enum(['daily', 'weekly', 'monthly']);
export type RecurrenceFrequency = z.infer<typeof recurrenceFrequencySchema>;

export const recurrenceTemplateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: taskPrioritySchema,
  frequency: recurrenceFrequencySchema,
  weeklyDays: z.array(z.number().int().min(1).max(7)).optional(), // 1=Mon..7=Sun
  monthlyDay: z.number().int().min(1).max(31).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type RecurrenceTemplate = z.infer<typeof recurrenceTemplateSchema>;

export const createRecurrenceInputSchema = z.discriminatedUnion('frequency', [
  z.object({
    frequency: z.literal('daily'),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    priority: taskPrioritySchema.default('medium'),
  }),
  z.object({
    frequency: z.literal('weekly'),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    priority: taskPrioritySchema.default('medium'),
    weeklyDays: z
      .array(z.number().int().min(1).max(7))
      .min(1)
      .refine(
        (days) => new Set(days).size === days.length,
        'No duplicate days',
      ),
  }),
  z.object({
    frequency: z.literal('monthly'),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    priority: taskPrioritySchema.default('medium'),
    monthlyDay: z.number().int().min(1).max(31),
  }),
]);
export type CreateRecurrenceInput = z.infer<typeof createRecurrenceInputSchema>;

export const updateRecurrenceInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: taskPrioritySchema.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateRecurrenceInput = z.infer<typeof updateRecurrenceInputSchema>;
