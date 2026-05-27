import { z } from 'zod';

export const FEEDBACK_CATEGORIES = [
  'bug',
  'feature_request',
  'ux_improvement',
  'other',
] as const;
export const feedbackCategorySchema = z.enum(FEEDBACK_CATEGORIES);
export type FeedbackCategory = z.infer<typeof feedbackCategorySchema>;

export const submitFeedbackInputSchema = z.object({
  message: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1).max(1000)),
  category: feedbackCategorySchema,
  email: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.union([z.literal(''), z.string().email()])),
});
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackInputSchema>;
