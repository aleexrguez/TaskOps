import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchChecklistItems,
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

export function useCreateChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChecklistItemInput) =>
      createChecklistItem(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) });
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
    },
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChecklistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) });
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
