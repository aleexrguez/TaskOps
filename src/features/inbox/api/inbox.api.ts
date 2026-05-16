import type { z } from 'zod';
import { supabase } from '@/shared/services/supabase';
import { requireAuthenticatedUser } from '@/shared/services/auth.guard';
import type { Database } from '@/shared/types/database.types';
import {
  createInboxItemInputSchema,
  updateInboxItemInputSchema,
} from '../types/inbox.types';
import type { InboxItem } from '../types/inbox.types';
import { mapInboxItemRowToInboxItem } from './inbox.dto';
import { createTask, deleteTask } from '@/features/task-manager/api';
import type { CreateTaskInput } from '@/features/task-manager/types/task.types';
import type { Task } from '@/features/task-manager/types/task.types';

type DbInboxItemUpdate = Database['public']['Tables']['inbox_items']['Update'];

export interface InboxListResponse {
  items: InboxItem[];
  total: number;
}

export async function fetchInboxItems(): Promise<InboxListResponse> {
  await requireAuthenticatedUser();

  const { data, error, count } = await supabase
    .from('inbox_items')
    .select('*', { count: 'exact' })
    .is('converted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return {
    items: (data ?? []).map(mapInboxItemRowToInboxItem),
    total: count ?? 0,
  };
}

export async function createInboxItem(
  input: z.input<typeof createInboxItemInputSchema>,
): Promise<InboxItem> {
  const userId = await requireAuthenticatedUser();

  const parsed = createInboxItemInputSchema.parse(input);

  const { data, error } = await supabase
    .from('inbox_items')
    .insert({
      user_id: userId,
      title: parsed.title,
      notes: parsed.notes,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapInboxItemRowToInboxItem(data);
}

export async function updateInboxItem(
  id: string,
  input: z.input<typeof updateInboxItemInputSchema>,
): Promise<InboxItem> {
  const userId = await requireAuthenticatedUser();

  const parsed = updateInboxItemInputSchema.parse(input);

  const updates: DbInboxItemUpdate = {};
  if (parsed.title !== undefined) updates.title = parsed.title;
  if (parsed.notes !== undefined) updates.notes = parsed.notes;

  const { data, error } = await supabase
    .from('inbox_items')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .is('converted_at', null)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapInboxItemRowToInboxItem(data);
}

export async function deleteInboxItem(id: string): Promise<void> {
  const userId = await requireAuthenticatedUser();

  const { error } = await supabase
    .from('inbox_items')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export class AlreadyConvertedError extends Error {
  constructor() {
    super('Item was already converted by another request');
    this.name = 'AlreadyConvertedError';
  }
}

export interface ConvertInboxItemResult {
  inboxItem: InboxItem;
  task: Task;
}

export async function convertInboxItemToTask(
  inboxItemId: string,
  taskInput: CreateTaskInput,
  checklistTitles?: string[],
): Promise<ConvertInboxItemResult> {
  const userId = await requireAuthenticatedUser();

  // Pre-check: verify item is not already converted
  const { data: existing, error: fetchError } = await supabase
    .from('inbox_items')
    .select('*')
    .eq('id', inboxItemId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (existing.converted_at !== null) throw new AlreadyConvertedError();

  // Create the task
  const task = await createTask(taskInput);

  // Batch insert checklist items with explicit sequential positions
  if (checklistTitles && checklistTitles.length > 0) {
    const rows = checklistTitles.map((title, i) => ({
      task_id: task.id,
      user_id: userId,
      title,
      position: i,
    }));

    const { error: checklistError } = await supabase
      .from('checklist_items')
      .insert(rows);

    if (checklistError) {
      await deleteTask(task.id);
      throw new Error(checklistError.message);
    }
  }

  // Conditionally mark inbox item as converted (WHERE converted_at IS NULL)
  const { data: updatedRows, error: updateError } = await supabase
    .from('inbox_items')
    .update({
      converted_task_id: task.id,
      converted_at: new Date().toISOString(),
    })
    .eq('id', inboxItemId)
    .eq('user_id', userId)
    .is('converted_at', null)
    .select();

  if (updateError) {
    await deleteTask(task.id);
    throw new Error(updateError.message);
  }

  // Race condition: 0 rows updated means another request converted it first
  if (!updatedRows || updatedRows.length === 0) {
    await deleteTask(task.id);
    throw new AlreadyConvertedError();
  }

  return {
    inboxItem: mapInboxItemRowToInboxItem(updatedRows[0]),
    task,
  };
}
