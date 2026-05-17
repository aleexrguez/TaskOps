import { useState } from 'react';
import { updatePassword } from '@/features/auth/api';

export function useChangePassword() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function changePassword(password: string): Promise<void> {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);
    try {
      await updatePassword(password);
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to change password',
      );
    } finally {
      setIsPending(false);
    }
  }

  function reset() {
    setError(null);
    setIsSuccess(false);
  }

  return { changePassword, isPending, error, isSuccess, reset };
}
