-- v1.6: Custom recurrence intervals
-- Adds repeat_interval (every N days/weeks/months) and start_date (anchor for interval math)

-- Step 1: repeat_interval (safe — has default, all existing rows get 1)
ALTER TABLE recurrence_templates
ADD COLUMN repeat_interval INTEGER NOT NULL DEFAULT 1
  CHECK (repeat_interval >= 1 AND repeat_interval <= 365);

-- Step 2: start_date as nullable first (cannot backfill in same ALTER)
ALTER TABLE recurrence_templates
ADD COLUMN start_date DATE;

-- Step 3: backfill existing templates using created_at as migration fallback
UPDATE recurrence_templates
SET start_date = COALESCE(created_at::date, CURRENT_DATE)
WHERE start_date IS NULL;

-- Step 4: enforce NOT NULL after backfill
ALTER TABLE recurrence_templates
ALTER COLUMN start_date SET NOT NULL;

-- Step 5: default for new templates
ALTER TABLE recurrence_templates
ALTER COLUMN start_date SET DEFAULT CURRENT_DATE;
