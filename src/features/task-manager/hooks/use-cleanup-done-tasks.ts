import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkArchiveTasks, createActivityEvents } from '../api';
import type { TaskListResponse } from '../api';
import { taskKeys } from './task.keys';
import { getStartOfDay } from '../utils';

export function useCleanupDoneTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateIds: string[]) => {
      if (candidateIds.length === 0)
        return { archivedCount: 0, archivedIds: [] as string[] };

      const completedBefore = getStartOfDay().toISOString();
      const archivedIds = await bulkArchiveTasks(candidateIds, completedBefore);

      if (archivedIds.length > 0) {
        createActivityEvents(
          archivedIds.map((taskId) => ({
            taskId,
            eventType: 'task_archived' as const,
          })),
        ).catch((err) =>
          console.error('[Cleanup] Activity events failed:', err),
        );
      }

      return { archivedCount: archivedIds.length, archivedIds };
    },

    onMutate: async (candidateIds) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = queryClient.getQueryData<TaskListResponse>(
        taskKeys.lists(),
      );

      if (previous) {
        const idSet = new Set(candidateIds);
        queryClient.setQueryData<TaskListResponse>(taskKeys.lists(), {
          ...previous,
          tasks: previous.tasks.map((t) =>
            idSet.has(t.id) ? { ...t, isArchived: true } : t,
          ),
        });
      }

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.lists(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
