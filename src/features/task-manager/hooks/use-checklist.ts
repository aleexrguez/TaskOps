import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchChecklistItems,
  fetchChecklistSummaries,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
} from '../api';
import type { ChecklistSummaries } from '../api/checklist-api';
import type {
  ChecklistItem,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
  ReorderChecklistItem,
} from '../types/checklist.types';
import { useAuth } from '@/features/auth/hooks';
import { checklistKeys } from './checklist.keys';

export function useChecklist(taskId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: checklistKeys.list(taskId),
    queryFn: () => fetchChecklistItems(taskId),
    enabled: !!user && !!taskId,
  });
}

export function useChecklistSummaries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: checklistKeys.summaries(),
    queryFn: fetchChecklistSummaries,
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useCreateChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChecklistItemInput) =>
      createChecklistItem(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) });
      queryClient.invalidateQueries({
        queryKey: checklistKeys.summaries(),
      });
    },
  });
}

export function useUpdateChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateChecklistItemInput;
    }) => updateChecklistItem(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({
        queryKey: checklistKeys.list(taskId),
      });
      await queryClient.cancelQueries({
        queryKey: checklistKeys.summaries(),
      });

      const previousItems = queryClient.getQueryData<ChecklistItem[]>(
        checklistKeys.list(taskId),
      );
      const previousSummaries = queryClient.getQueryData<ChecklistSummaries>(
        checklistKeys.summaries(),
      );

      if (previousItems) {
        queryClient.setQueryData<ChecklistItem[]>(
          checklistKeys.list(taskId),
          previousItems.map((item) =>
            item.id === id ? { ...item, ...input } : item,
          ),
        );
      }

      if (previousSummaries && input.isCompleted !== undefined) {
        const summary = previousSummaries[taskId];
        if (summary) {
          const delta = input.isCompleted ? 1 : -1;
          const completed = Math.max(
            0,
            Math.min(summary.total, summary.completed + delta),
          );
          queryClient.setQueryData<ChecklistSummaries>(
            checklistKeys.summaries(),
            {
              ...previousSummaries,
              [taskId]: { ...summary, completed },
            },
          );
        }
      }

      return { previousItems, previousSummaries };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          checklistKeys.list(taskId),
          context.previousItems,
        );
      }
      if (context?.previousSummaries) {
        queryClient.setQueryData(
          checklistKeys.summaries(),
          context.previousSummaries,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) });
      queryClient.invalidateQueries({
        queryKey: checklistKeys.summaries(),
      });
    },
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChecklistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) });
      queryClient.invalidateQueries({
        queryKey: checklistKeys.summaries(),
      });
    },
  });
}

export function useReorderChecklistItems(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderChecklistItem[]) =>
      reorderChecklistItems(taskId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) });
    },
  });
}
