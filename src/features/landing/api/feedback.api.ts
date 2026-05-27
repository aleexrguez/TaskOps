import { supabase } from '@/shared/services/supabase';
import type { SubmitFeedbackInput } from '../types/feedback.types';

export async function submitFeedback(
  input: SubmitFeedbackInput,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // feedback table not yet in database.types.ts — cast to untyped client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('feedback').insert({
    message: input.message,
    category: input.category,
    email: input.email === '' ? null : (input.email ?? null),
    user_id: user?.id ?? null,
  });

  if (error) throw new Error(error.message);
}
