import type { Database } from '@/shared/types/database.types';
import type { InboxItem } from '../types/inbox.types';

export type DbInboxItemRow = Database['public']['Tables']['inbox_items']['Row'];

export function mapInboxItemRowToInboxItem(row: DbInboxItemRow): InboxItem {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    createdAt: row.created_at,
    convertedTaskId: row.converted_task_id,
    convertedAt: row.converted_at,
  };
}
