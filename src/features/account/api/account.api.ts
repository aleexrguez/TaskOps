import { supabase } from '@/shared/services/supabase';

export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
}
