-- Add position column for board view ordering
ALTER TABLE tasks
  ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

-- Initialize positions based on current order (by priority, due_date, created_at)
-- This ensures existing tasks get meaningful positions
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, status
           ORDER BY
             CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END,
             due_date ASC NULLS LAST,
             created_at DESC
         ) - 1 AS pos
  FROM tasks
)
UPDATE tasks SET position = ranked.pos FROM ranked WHERE tasks.id = ranked.id;
