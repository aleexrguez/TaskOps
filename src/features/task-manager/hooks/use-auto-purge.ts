import { useRef, useEffect } from 'react';
import { purgeTasks } from '../api';
import { getExpiredTaskIds } from '../utils';
import { useAppPreferencesStore } from '@/shared/store/app-preferences.store';
import type { Task } from '../types';

export function useAutoPurge(tasks: Task[]): void {
  const retentionPolicy = useAppPreferencesStore((s) => s.retentionPolicy);
  const lastPurgedRef = useRef<string>('');

  useEffect(() => {
    if (retentionPolicy === 'never') return;
    if (tasks.length === 0) return;

    const expiredIds = getExpiredTaskIds(tasks, retentionPolicy);
    if (expiredIds.length === 0) return;

    const key = [...expiredIds].sort().join(',');
    if (key === lastPurgedRef.current) return;

    lastPurgedRef.current = key;
    purgeTasks(expiredIds);
  }, [tasks, retentionPolicy]);
}
