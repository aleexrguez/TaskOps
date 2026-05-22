import { useState } from 'react';
import { deleteAccount } from '../api/account.api';

export function useDeleteAccount() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function performDelete(): Promise<boolean> {
    setIsPending(true);
    setError(null);
    try {
      await deleteAccount();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      return false;
    } finally {
      setIsPending(false);
    }
  }

  function reset() {
    setError(null);
  }

  return { deleteAccount: performDelete, isPending, error, reset };
}
