ALTER TABLE tasks
  ADD COLUMN recurrence_template_id UUID REFERENCES recurrence_templates(id) ON DELETE SET NULL,
  ADD COLUMN recurrence_date_key DATE;

CREATE UNIQUE INDEX idx_tasks_recurrence_dedup
  ON tasks (user_id, recurrence_template_id, recurrence_date_key)
  WHERE recurrence_template_id IS NOT NULL;
