import { supabase } from '@/shared/services/supabase';
import { requireAuthenticatedUser } from '@/shared/services/auth.guard';
import type { Database } from '@/shared/types/database.types';
import type {
  RecurrenceTemplate,
  CreateRecurrenceInput,
  UpdateRecurrenceInput,
} from '../types/recurrence.types';
import type { RecurrenceListResponse } from './recurrence.dto';
import type { PendingGeneration } from '../utils/recurrence.utils';

// ---------------------------------------------------------------------------
// DB Row ↔ Domain mappers (database.types.ts stays confined to this file)
// ---------------------------------------------------------------------------

type DbRecurrenceRow =
  Database['public']['Tables']['recurrence_templates']['Row'];
type DbRecurrenceInsert =
  Database['public']['Tables']['recurrence_templates']['Insert'];

function fromDbRow(row: DbRecurrenceRow): RecurrenceTemplate {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    priority: row.priority as RecurrenceTemplate['priority'],
    frequency: row.frequency as RecurrenceTemplate['frequency'],
    weeklyDays: row.weekly_days ?? undefined,
    monthlyDay: row.monthly_day ?? undefined,
    leadTimeDays: row.lead_time_days,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbInsert(
  input: CreateRecurrenceInput,
  userId: string,
): DbRecurrenceInsert {
  return {
    user_id: userId,
    title: input.title,
    description: input.description ?? null,
    priority: input.priority ?? 'medium',
    frequency: input.frequency,
    weekly_days: 'weeklyDays' in input ? (input.weeklyDays ?? null) : null,
    monthly_day: 'monthlyDay' in input ? (input.monthlyDay ?? null) : null,
    lead_time_days: 'leadTimeDays' in input ? (input.leadTimeDays ?? 0) : 0,
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchRecurrences(): Promise<RecurrenceListResponse> {
  await requireAuthenticatedUser();

  const { data, error, count } = await supabase
    .from('recurrence_templates')
    .select('*', { count: 'exact' });

  if (error) throw new Error(error.message);

  const recurrences = (data ?? []).map(fromDbRow);
  return { recurrences, total: count ?? recurrences.length };
}

export async function fetchRecurrenceById(
  id: string,
): Promise<RecurrenceTemplate> {
  await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from('recurrence_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Recurrence template not found: ${id}`);
  return fromDbRow(data);
}

export async function createRecurrence(
  input: CreateRecurrenceInput,
): Promise<RecurrenceTemplate> {
  const userId = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from('recurrence_templates')
    .insert(toDbInsert(input, userId))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromDbRow(data);
}

export async function updateRecurrence(
  id: string,
  input: UpdateRecurrenceInput,
): Promise<RecurrenceTemplate> {
  await requireAuthenticatedUser();

  const updates: Database['public']['Tables']['recurrence_templates']['Update'] =
    {};

  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined)
    updates.description = input.description ?? null;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.isActive !== undefined) updates.is_active = input.isActive;
  if (input.leadTimeDays !== undefined)
    updates.lead_time_days = input.leadTimeDays;

  const { data, error } = await supabase
    .from('recurrence_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Propagate relevant fields to active generated tasks
  await propagateTemplateChanges(id, input);

  return fromDbRow(data);
}

// ---------------------------------------------------------------------------
// Propagation — update active generated tasks when template fields change
// ---------------------------------------------------------------------------

async function propagateTemplateChanges(
  templateId: string,
  input: UpdateRecurrenceInput,
): Promise<void> {
  const taskUpdates: Database['public']['Tables']['tasks']['Update'] = {};

  if (input.title !== undefined) taskUpdates.title = input.title;
  if (input.description !== undefined)
    taskUpdates.description = input.description ?? null;
  if (input.priority !== undefined) taskUpdates.priority = input.priority;

  if (Object.keys(taskUpdates).length === 0) return;

  const { error } = await supabase
    .from('tasks')
    .update(taskUpdates)
    .eq('recurrence_template_id', templateId)
    .neq('status', 'done')
    .eq('is_archived', false);

  if (error) throw new Error(error.message);
}

export async function deleteRecurrence(id: string): Promise<void> {
  await requireAuthenticatedUser();

  const { error } = await supabase
    .from('recurrence_templates')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Batch generation — thin, no logic, just inserts into tasks table
// ---------------------------------------------------------------------------

export async function generateTasks(
  pending: PendingGeneration[],
): Promise<void> {
  if (pending.length === 0) return;

  const userId = await requireAuthenticatedUser();

  const rows = pending.map((p) => ({
    user_id: userId,
    title: p.title,
    description: p.description ?? null,
    priority: p.priority,
    status: 'todo',
    recurrence_template_id: p.templateId,
    recurrence_date_key: p.dateKey,
    due_date: p.dateKey,
  }));

  // ON CONFLICT DO NOTHING — handled by the unique index on
  // (user_id, recurrence_template_id, recurrence_date_key)
  const { error } = await supabase.from('tasks').upsert(rows, {
    onConflict: 'user_id,recurrence_template_id,recurrence_date_key',
    ignoreDuplicates: true,
  });

  if (error) throw new Error(error.message);
}
