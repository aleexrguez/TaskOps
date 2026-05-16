import { z } from 'zod';

export const inboxItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).nullable(),
  createdAt: z.string().datetime(),
  convertedTaskId: z.string().uuid().nullable(),
  convertedAt: z.string().datetime().nullable(),
});
export type InboxItem = z.infer<typeof inboxItemSchema>;

export const createInboxItemInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  notes: z
    .string()
    .max(2000)
    .nullish()
    .transform((v) => v || null),
});
export type CreateInboxItemInput = z.infer<typeof createInboxItemInputSchema>;

export const updateInboxItemInputSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  notes: z
    .string()
    .max(2000)
    .nullish()
    .transform((v) => (v === undefined ? undefined : v || null)),
});
export type UpdateInboxItemInput = z.infer<typeof updateInboxItemInputSchema>;
