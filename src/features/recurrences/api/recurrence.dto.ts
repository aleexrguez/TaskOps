import { z } from 'zod';
import {
  recurrenceTemplateSchema,
  createRecurrenceInputSchema,
  updateRecurrenceInputSchema,
} from '../types/recurrence.types';
import type { RecurrenceTemplate } from '../types/recurrence.types';

export const recurrenceResponseSchema = recurrenceTemplateSchema;
export type RecurrenceResponse = z.infer<typeof recurrenceResponseSchema>;

export const recurrenceListResponseSchema = z.object({
  recurrences: z.array(recurrenceTemplateSchema),
  total: z.number(),
});
export type RecurrenceListResponse = z.infer<
  typeof recurrenceListResponseSchema
>;

export const createRecurrenceRequestSchema = createRecurrenceInputSchema;
export type CreateRecurrenceRequest = z.infer<
  typeof createRecurrenceRequestSchema
>;

export const updateRecurrenceRequestSchema = updateRecurrenceInputSchema;
export type UpdateRecurrenceRequest = z.infer<
  typeof updateRecurrenceRequestSchema
>;

export function mapRecurrenceFromApi(
  response: RecurrenceResponse,
): RecurrenceTemplate {
  return response;
}
