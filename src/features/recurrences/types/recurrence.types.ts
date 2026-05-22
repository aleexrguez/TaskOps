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
  leadTimeDays: z.number().int().min(0).max(14).default(0),
  interval: z.number().int().min(1).max(365),
  startDate: z.string().date(),
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
    interval: z.number().int().min(1).max(365).default(1),
    startDate: z.string().date(),
  }),
  z.object({
    frequency: z.literal('weekly'),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    priority: taskPrioritySchema.default('medium'),
    interval: z.number().int().min(1).max(365).default(1),
    startDate: z.string().date(),
    weeklyDays: z
      .array(z.number().int().min(1).max(7))
      .min(1)
      .refine(
        (days) => new Set(days).size === days.length,
        'No duplicate days',
      ),
    leadTimeDays: z.number().int().min(0).max(7).default(0),
  }),
  z.object({
    frequency: z.literal('monthly'),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    priority: taskPrioritySchema.default('medium'),
    interval: z.number().int().min(1).max(365).default(1),
    startDate: z.string().date(),
    monthlyDay: z.number().int().min(1).max(31),
    leadTimeDays: z.number().int().min(0).max(14).default(0),
  }),
]);
export type CreateRecurrenceInput = z.infer<typeof createRecurrenceInputSchema>;

export const updateRecurrenceInputSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    priority: taskPrioritySchema.optional(),
    isActive: z.boolean().optional(),
    frequency: recurrenceFrequencySchema.optional(),
    weeklyDays: z.array(z.number().int().min(1).max(7)).optional(),
    monthlyDay: z.number().int().min(1).max(31).optional(),
    leadTimeDays: z.number().int().min(0).max(14).optional(),
    interval: z.number().int().min(1).max(365).optional(),
    startDate: z.string().date().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.frequency === 'daily' &&
      data.leadTimeDays !== undefined &&
      data.leadTimeDays !== 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'leadTimeDays must be 0 for daily frequency',
        path: ['leadTimeDays'],
      });
    }
    if (
      data.frequency === 'weekly' &&
      data.leadTimeDays !== undefined &&
      data.leadTimeDays > 7
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'leadTimeDays cannot exceed 7 for weekly frequency',
        path: ['leadTimeDays'],
      });
    }
    if (
      data.frequency === 'monthly' &&
      data.leadTimeDays !== undefined &&
      data.leadTimeDays > 14
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'leadTimeDays cannot exceed 14 for monthly frequency',
        path: ['leadTimeDays'],
      });
    }
  });
export type UpdateRecurrenceInput = z.infer<typeof updateRecurrenceInputSchema>;
