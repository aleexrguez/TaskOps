import { supabase } from '../../../shared/services/supabase';
import { requireAuthenticatedUser } from '../../../shared/services/auth.guard';
import type { Database } from '../../../shared/types/database.types';
import type {
  ChecklistItem,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
  ReorderChecklistItem,
} from '../types/checklist.types';

// ---------------------------------------------------------------------------
// DB Row ↔ Domain mappers (database.types.ts stays confined to this file)
// ---------------------------------------------------------------------------

type DbChecklistItemRow =
  Database['public']['Tables']['checklist_items']['Row'];
type DbChecklistItemInsert =
  Database['public']['Tables']['checklist_items']['Insert'];

function fromDbRow(row: DbChecklistItemRow): ChecklistItem {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    isCompleted: row.is_completed,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbInsert(
  taskId: string,
  input: CreateChecklistItemInput,
  userId: string,
): DbChecklistItemInsert {
  return {
    task_id: taskId,
    user_id: userId,
    title: input.title,
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchChecklistItems(
  taskId: string,
): Promise<ChecklistItem[]> {
  await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('task_id', taskId)
    .order('position');

  if (error) throw new Error(error.message);

  return (data ?? []).map(fromDbRow);
}

export async function createChecklistItem(
  taskId: string,
  input: CreateChecklistItemInput,
): Promise<ChecklistItem> {
  const userId = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from('checklist_items')
    .insert(toDbInsert(taskId, input, userId))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromDbRow(data);
}

export async function updateChecklistItem(
  id: string,
  input: UpdateChecklistItemInput,
): Promise<ChecklistItem> {
  await requireAuthenticatedUser();

  const updates: Database['public']['Tables']['checklist_items']['Update'] = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updates.title = input.title;
  if (input.isCompleted !== undefined) updates.is_completed = input.isCompleted;

  const { data, error } = await supabase
    .from('checklist_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromDbRow(data);
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const userId = await requireAuthenticatedUser();

  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function reorderChecklistItems(
  taskId: string,
  items: ReorderChecklistItem[],
): Promise<void> {
  if (items.length === 0) return;
  await requireAuthenticatedUser();

  const now = new Date().toISOString();

  const promises = items.map((item) =>
    supabase
      .from('checklist_items')
      .update({ position: item.position, updated_at: now })
      .eq('id', item.id)
      .eq('task_id', taskId),
  );

  const results = await Promise.all(promises);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}
