CREATE TABLE inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
    CONSTRAINT chk_inbox_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
  notes TEXT
    CONSTRAINT chk_inbox_notes_length CHECK (notes IS NULL OR char_length(notes) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  CONSTRAINT chk_conversion_consistency CHECK (
    (converted_at IS NULL AND converted_task_id IS NULL)
    OR (converted_at IS NOT NULL)
  )
);

CREATE INDEX idx_inbox_items_user_created ON inbox_items (user_id, created_at DESC);
CREATE INDEX idx_inbox_items_unconverted ON inbox_items (user_id) WHERE converted_at IS NULL;

ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY inbox_items_select ON inbox_items
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY inbox_items_insert ON inbox_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY inbox_items_update ON inbox_items
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      converted_task_id IS NULL
      OR converted_task_id IN (SELECT id FROM tasks WHERE user_id = auth.uid())
    )
  );

CREATE POLICY inbox_items_delete ON inbox_items
  FOR DELETE USING (user_id = auth.uid());
