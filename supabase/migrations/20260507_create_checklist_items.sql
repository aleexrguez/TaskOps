CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL CONSTRAINT chk_checklist_title_length CHECK (char_length(title) BETWEEN 1 AND 500),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklist_items_task_position ON checklist_items (task_id, position);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS: SELECT — user owns the checklist item AND parent task
CREATE POLICY checklist_items_select ON checklist_items
  FOR SELECT USING (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM tasks WHERE tasks.id = checklist_items.task_id AND tasks.user_id = auth.uid())
  );

-- RLS: INSERT — user owns the item AND parent task
CREATE POLICY checklist_items_insert ON checklist_items
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM tasks WHERE tasks.id = checklist_items.task_id AND tasks.user_id = auth.uid())
  );

-- RLS: UPDATE — user owns the item AND parent task
CREATE POLICY checklist_items_update ON checklist_items
  FOR UPDATE USING (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM tasks WHERE tasks.id = checklist_items.task_id AND tasks.user_id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM tasks WHERE tasks.id = checklist_items.task_id AND tasks.user_id = auth.uid())
  );

-- RLS: DELETE — user owns the item AND parent task
CREATE POLICY checklist_items_delete ON checklist_items
  FOR DELETE USING (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM tasks WHERE tasks.id = checklist_items.task_id AND tasks.user_id = auth.uid())
  );
