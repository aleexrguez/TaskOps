import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInboxItems,
  createInboxItem,
  updateInboxItem,
  deleteInboxItem,
  convertInboxItemToTask,
} from '../api';
import type { z } from 'zod';
import type {
  createInboxItemInputSchema,
  updateInboxItemInputSchema,
} from '../types/inbox.types';
import type { CreateTaskInput } from '@/features/task-manager/types/task.types';
import { taskKeys } from '@/features/task-manager/hooks/task.keys';
import { checklistKeys } from '@/features/task-manager/hooks/checklist.keys';
import { useAuth } from '@/features/auth/hooks';
import { inboxKeys } from './inbox.keys';

export function useInboxItems() {
  const { user } = useAuth();
  return useQuery({
    queryKey: inboxKeys.lists(),
    queryFn: fetchInboxItems,
    enabled: !!user,
  });
}

export function useCreateInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: z.input<typeof createInboxItemInputSchema>) =>
      createInboxItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.lists() });
    },
  });
}

export function useUpdateInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: z.input<typeof updateInboxItemInputSchema>;
    }) => updateInboxItem(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.lists() });
    },
  });
}

export function useDeleteInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInboxItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.lists() });
    },
  });
}

export function useConvertInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inboxItemId,
      taskInput,
      checklistTitles,
    }: {
      inboxItemId: string;
      taskInput: CreateTaskInput;
      checklistTitles?: string[];
    }) => convertInboxItemToTask(inboxItemId, taskInput, checklistTitles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: checklistKeys.summaries() });
    },
  });
}
