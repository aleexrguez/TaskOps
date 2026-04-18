import { useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getPendingGenerations } from '../utils/recurrence.utils';
import { generateTasks } from '../api/recurrence-api';
import { taskKeys } from '@/features/task-manager/hooks/task.keys';
import type { RecurrenceTemplate } from '../types/recurrence.types';
import type { Task } from '@/features/task-manager/types/task.types';

export function useAutoGenerate(
  templates: RecurrenceTemplate[],
  tasks: Task[],
): void {
  const queryClient = useQueryClient();
  const lastRunRef = useRef<string>('');

  useEffect(() => {
    console.log('[useAutoGenerate] effect fired');
    console.log('[useAutoGenerate] templates:', templates.length, templates);
    console.log('[useAutoGenerate] tasks:', tasks.length);

    const pending = getPendingGenerations(templates, tasks);
    console.log('[useAutoGenerate] pending:', pending.length, pending);

    if (pending.length === 0) {
      console.log('[useAutoGenerate] nothing pending — skipping');
      return;
    }

    const key = pending
      .map((p) => `${p.templateId}:${p.dateKey}`)
      .sort()
      .join(',');
    console.log('[useAutoGenerate] key:', key);
    console.log('[useAutoGenerate] lastRunRef:', lastRunRef.current);

    if (key === lastRunRef.current) {
      console.log('[useAutoGenerate] key matches lastRun — skipping');
      return;
    }
    lastRunRef.current = key;

    console.log('[useAutoGenerate] calling generateTasks...');
    generateTasks(pending)
      .then(() => {
        console.log('[useAutoGenerate] generateTasks SUCCESS — invalidating');
        queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      })
      .catch((err) => {
        console.error('[useAutoGenerate] generateTasks FAILED:', err);
      });
  }, [templates, tasks, queryClient]);
}
