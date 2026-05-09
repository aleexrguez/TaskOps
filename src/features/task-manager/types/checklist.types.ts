import { z } from 'zod';

export const checklistItemSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  title: z.string().min(1).max(500),
  isCompleted: z.boolean(),
  position: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const createChecklistItemInputSchema = z.object({
  title: z.string().min(1).max(500),
});
export type CreateChecklistItemInput = z.infer<
  typeof createChecklistItemInputSchema
>;

export const updateChecklistItemInputSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  isCompleted: z.boolean().optional(),
});
export type UpdateChecklistItemInput = z.infer<
  typeof updateChecklistItemInputSchema
>;

export const reorderChecklistItemSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int(),
});
export type ReorderChecklistItem = z.infer<typeof reorderChecklistItemSchema>;
