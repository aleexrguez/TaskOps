-- seed-demo-recurrences.sql
-- Idempotent seed for recurrence demo data (templates + generated tasks + activity).
-- Only affects 6 specific records identified by deterministic UUIDs.
-- Does NOT delete or modify any other demo data (tasks, checklists, inbox, etc.).
-- Does NOT change schema — no `supabase db push` needed.
--
-- Usage:
--   1. Replace '<DEMO_USER_ID>' with the actual demo user UUID
--   2. Run against Supabase SQL editor or CLI
--   3. Safe to re-run — uses DELETE by UUID + INSERT (no duplicates)
--
-- Run AFTER seed-demo-data.sql if starting from scratch.

DO $$
DECLARE
  demo_uid UUID := '<DEMO_USER_ID>';

  -- Deterministic UUIDs — recurrence templates
  tpl_daily   UUID := 'dd000000-0000-4000-a000-000000000001';
  tpl_weekly  UUID := 'dd000000-0000-4000-a000-000000000002';
  tpl_monthly UUID := 'dd000000-0000-4000-a000-000000000003';

  -- Deterministic UUIDs — recurrence-generated tasks
  task_daily   UUID := 'dd000000-0000-4000-b000-000000000001';
  task_weekly  UUID := 'dd000000-0000-4000-b000-000000000002';
  task_monthly UUID := 'dd000000-0000-4000-b000-000000000003';

  -- Computed dates
  today            DATE := CURRENT_DATE;
  -- Next Friday (ISO day 5): 0 if today is Friday, else days until next Friday
  next_friday      DATE := CURRENT_DATE + ((5 - EXTRACT(ISODOW FROM CURRENT_DATE)::int + 7) % 7);
  -- First day of previous month
  prev_month_first DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date;

BEGIN

-- ============================================================
-- 1. CLEAN only seed recurrence records (reverse FK order)
-- ============================================================
DELETE FROM task_activity_events
  WHERE task_id IN (task_daily, task_weekly, task_monthly);

DELETE FROM tasks
  WHERE id IN (task_daily, task_weekly, task_monthly);

DELETE FROM recurrence_templates
  WHERE id IN (tpl_daily, tpl_weekly, tpl_monthly);

-- ============================================================
-- 2. INSERT recurrence templates
-- ============================================================
INSERT INTO recurrence_templates
  (id, user_id, title, description, frequency, repeat_interval, priority,
   start_date, weekly_days, monthly_day, lead_time_days, is_active)
VALUES
  -- Daily standup: generates every day, no lead time
  (tpl_daily,   demo_uid, 'Daily standup',
   'Quick sync with the team',
   'daily', 1, 'medium',
   CURRENT_DATE - INTERVAL '30 days', NULL, NULL, 0, true),

  -- Weekly review: every Friday, 2 days lead time
  (tpl_weekly,  demo_uid, 'Weekly review',
   'Review progress and plan next week',
   'weekly', 1, 'high',
   CURRENT_DATE - INTERVAL '60 days', ARRAY[5], NULL, 2, true),

  -- Monthly review: 1st of each month, 3 days lead time
  (tpl_monthly, demo_uid, 'Monthly review',
   'End-of-month retrospective and planning',
   'monthly', 1, 'low',
   CURRENT_DATE - INTERVAL '90 days', NULL, 1, 3, true);

-- ============================================================
-- 3. INSERT recurrence-generated tasks
-- ============================================================
INSERT INTO tasks
  (id, user_id, title, description, status, priority,
   due_date, position, is_archived, completed_at,
   recurrence_template_id, recurrence_date_key)
VALUES
  -- Active daily: today's standup (todo, due today)
  (task_daily, demo_uid, 'Daily standup',
   'Quick sync with the team',
   'todo', 'medium',
   today, 100, false, NULL,
   tpl_daily, today),

  -- Upcoming weekly: next Friday via lead time (todo)
  (task_weekly, demo_uid, 'Weekly review',
   'Review progress and plan next week',
   'todo', 'high',
   next_friday, 101, false, NULL,
   tpl_weekly, next_friday),

  -- Completed monthly: previous month's review (done, shows history)
  (task_monthly, demo_uid, 'Monthly review',
   'End-of-month retrospective and planning',
   'done', 'low',
   prev_month_first, 102, false, now() - INTERVAL '25 days',
   tpl_monthly, prev_month_first);

-- ============================================================
-- 4. INSERT activity events for recurrence tasks
-- ============================================================
INSERT INTO task_activity_events
  (user_id, task_id, event_type, from_value, to_value, metadata)
VALUES
  (demo_uid, task_daily,   'recurrence_generated_task', NULL, NULL, '{}'),
  (demo_uid, task_weekly,  'recurrence_generated_task', NULL, NULL, '{}'),
  (demo_uid, task_monthly, 'recurrence_generated_task', NULL, NULL, '{}'),
  (demo_uid, task_monthly, 'task_status_changed', 'todo', 'done', '{}'),
  (demo_uid, task_monthly, 'task_completed', NULL, NULL, '{}');

END $$;
