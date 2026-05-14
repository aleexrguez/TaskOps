import { supabase } from '../../../shared/services/supabase';
import { requireAuthenticatedUser } from '../../../shared/services/auth.guard';
import type { Database } from '../../../shared/types/database.types';
import type {
  ActivityEvent,
  CreateActivityEventInput,
} from '../types/activity.types';

// ---------------------------------------------------------------------------
// DB Row → Domain mapper (database.types.ts stays confined to this file)
// ---------------------------------------------------------------------------

type DbActivityEventRow =
  Database['public']['Tables']['task_activity_events']['Row'];

function fromDbRow(row: DbActivityEventRow): ActivityEvent {
  return {
    id: row.id,
    taskId: row.task_id,
    eventType: row.event_type as ActivityEvent['eventType'],
    fromValue: row.from_value,
    toValue: row.to_value,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchActivityEvents(
  taskId: string,
  limit = 20,
): Promise<ActivityEvent[]> {
  await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from('task_activity_events')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(fromDbRow);
}

export async function createActivityEvent(
  input: CreateActivityEventInput,
): Promise<void> {
  const userId = await requireAuthenticatedUser();

  const { error } = await supabase.from('task_activity_events').insert({
    task_id: input.taskId,
    user_id: userId,
    event_type: input.eventType,
    from_value: input.fromValue ?? null,
    to_value: input.toValue ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) throw new Error(error.message);
}

export async function createActivityEvents(
  inputs: CreateActivityEventInput[],
): Promise<void> {
  if (inputs.length === 0) return;
  const userId = await requireAuthenticatedUser();

  const rows = inputs.map((input) => ({
    task_id: input.taskId,
    user_id: userId,
    event_type: input.eventType,
    from_value: input.fromValue ?? null,
    to_value: input.toValue ?? null,
    metadata: input.metadata ?? {},
  }));

  const { error } = await supabase.from('task_activity_events').insert(rows);
  if (error) throw new Error(error.message);
}
