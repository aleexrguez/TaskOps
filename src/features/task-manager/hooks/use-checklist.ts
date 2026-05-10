import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchChecklistItems,
  fetchChecklistSummaries,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
} from '../api';
import type {
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
    onSuccess: () => {
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
