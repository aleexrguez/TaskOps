CREATE TABLE task_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL CONSTRAINT chk_event_type CHECK (
    event_type IN (
      'task_created', 'task_status_changed', 'task_priority_changed',
      'task_due_date_changed', 'task_completed', 'task_archived',
      'task_unarchived', 'checklist_item_created', 'checklist_item_completed',
      'checklist_item_deleted', 'recurrence_generated_task'
    )
  ),
  from_value TEXT,
  to_value TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_events_task_created
  ON task_activity_events (task_id, created_at DESC);

CREATE INDEX idx_activity_events_user
  ON task_activity_events (user_id);

ALTER TABLE task_activity_events ENABLE ROW LEVEL SECURITY;

-- RLS: SELECT — user owns the event AND parent task
CREATE POLICY activity_events_select ON task_activity_events
  FOR SELECT USING (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_activity_events.task_id AND tasks.user_id = auth.uid())
  );

-- RLS: INSERT — user owns the event AND parent task
CREATE POLICY activity_events_insert ON task_activity_events
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_activity_events.task_id AND tasks.user_id = auth.uid())
  );

-- No UPDATE/DELETE policies: events are immutable append-only
