-- seed-demo-data.sql
-- Idempotent seed script for the demo user account.
-- Only affects the specified demo user — never touches other users' data.
--
-- Usage:
--   1. Create demo user in Supabase Auth dashboard (demo@taskops.app)
--   2. Replace '<DEMO_USER_ID>' below with the actual UUID
--   3. Run against Supabase SQL editor or CLI
--   4. Safe to re-run for periodic data resets

-- ============================================================
-- CONFIG: Replace this with the actual demo user UUID
-- ============================================================
DO $$
DECLARE
  demo_uid UUID := '<DEMO_USER_ID>';
  task_1 UUID := gen_random_uuid();
  task_2 UUID := gen_random_uuid();
  task_3 UUID := gen_random_uuid();
  task_4 UUID := gen_random_uuid();
  task_5 UUID := gen_random_uuid();
  task_6 UUID := gen_random_uuid();
  task_7 UUID := gen_random_uuid();
  task_8 UUID := gen_random_uuid();
  recurrence_1 UUID := gen_random_uuid();
  recurrence_2 UUID := gen_random_uuid();
BEGIN

-- ============================================================
-- 1. CLEAN existing demo data (reverse FK order)
-- ============================================================
DELETE FROM checklist_items WHERE user_id = demo_uid;
DELETE FROM task_activity_events WHERE user_id = demo_uid;
DELETE FROM inbox_items WHERE user_id = demo_uid;
DELETE FROM tasks WHERE user_id = demo_uid;
DELETE FROM recurrence_templates WHERE user_id = demo_uid;

-- ============================================================
-- 2. UPDATE profile
-- ============================================================
UPDATE profiles
SET display_name = 'Demo User', updated_at = now()
WHERE id = demo_uid;

-- ============================================================
-- 3. INSERT recurrence templates
-- ============================================================
INSERT INTO recurrence_templates (id, user_id, title, description, frequency, repeat_interval, priority, start_date, weekly_days, monthly_day, lead_time_days, is_active)
VALUES
  (recurrence_1, demo_uid, 'Daily standup', 'Quick sync with the team', 'daily', 1, 'medium', CURRENT_DATE - INTERVAL '30 days', NULL, NULL, 0, true),
  (recurrence_2, demo_uid, 'Weekly review', 'Review progress and plan next week', 'weekly', 1, 'high', CURRENT_DATE - INTERVAL '60 days', ARRAY[1, 5], NULL, 2, true);

-- ============================================================
-- 4. INSERT tasks
-- ============================================================
INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, position, is_archived, completed_at, recurrence_template_id, recurrence_date_key)
VALUES
  -- Todo tasks
  (task_1, demo_uid, 'Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'todo', 'high', CURRENT_DATE + 1, 0, false, NULL, NULL, NULL),
  (task_2, demo_uid, 'Write API documentation', 'Document all REST endpoints with examples', 'todo', 'medium', CURRENT_DATE + 7, 1, false, NULL, NULL, NULL),
  (task_3, demo_uid, 'Review pull requests', NULL, 'todo', 'low', NULL, 2, false, NULL, NULL, NULL),

  -- In-progress tasks
  (task_4, demo_uid, 'Implement user dashboard', 'Build the main dashboard with charts and metrics', 'in-progress', 'high', CURRENT_DATE + 3, 3, false, NULL, NULL, NULL),
  (task_5, demo_uid, 'Migrate database schema', 'Update tables for v2 data model', 'in-progress', 'high', CURRENT_DATE - 1, 4, false, NULL, NULL, NULL),
  (task_6, demo_uid, 'Design onboarding flow', 'Create wireframes for new user experience', 'in-progress', 'medium', CURRENT_DATE + 5, 5, false, NULL, NULL, NULL),

  -- Done tasks
  (task_7, demo_uid, 'Configure project linting', 'Set up ESLint and Prettier with team rules', 'done', 'medium', CURRENT_DATE - 3, 6, false, now() - INTERVAL '2 days', NULL, NULL),
  (task_8, demo_uid, 'Create component library', 'Build reusable UI components with Storybook', 'done', 'high', CURRENT_DATE - 5, 7, false, now() - INTERVAL '4 days', NULL, NULL);

-- ============================================================
-- 5. INSERT checklist items
-- ============================================================
-- Checklist for "Set up CI/CD pipeline"
INSERT INTO checklist_items (user_id, task_id, title, is_completed, position)
VALUES
  (demo_uid, task_1, 'Choose CI provider', true, 0),
  (demo_uid, task_1, 'Write test workflow', false, 1),
  (demo_uid, task_1, 'Configure deployment step', false, 2),
  (demo_uid, task_1, 'Add status badges to README', false, 3);

-- Checklist for "Implement user dashboard"
INSERT INTO checklist_items (user_id, task_id, title, is_completed, position)
VALUES
  (demo_uid, task_4, 'Design dashboard layout', true, 0),
  (demo_uid, task_4, 'Implement chart components', true, 1),
  (demo_uid, task_4, 'Connect to API endpoints', false, 2);

-- ============================================================
-- 6. INSERT inbox items (unconverted)
-- ============================================================
INSERT INTO inbox_items (user_id, title, notes)
VALUES
  (demo_uid, 'Research new testing framework', 'Look into Playwright vs Cypress for E2E tests'),
  (demo_uid, 'Book team retrospective', NULL),
  (demo_uid, 'Update project README', 'Add setup instructions and architecture diagram');

-- ============================================================
-- 7. INSERT activity events
-- ============================================================
INSERT INTO task_activity_events (user_id, task_id, event_type, from_value, to_value, metadata)
VALUES
  (demo_uid, task_7, 'task_created', NULL, NULL, '{}'),
  (demo_uid, task_7, 'task_status_changed', 'todo', 'in-progress', '{}'),
  (demo_uid, task_7, 'task_status_changed', 'in-progress', 'done', '{}'),
  (demo_uid, task_7, 'task_completed', NULL, NULL, '{}'),
  (demo_uid, task_8, 'task_created', NULL, NULL, '{}'),
  (demo_uid, task_8, 'task_status_changed', 'todo', 'done', '{}'),
  (demo_uid, task_8, 'task_completed', NULL, NULL, '{}'),
  (demo_uid, task_4, 'task_created', NULL, NULL, '{}'),
  (demo_uid, task_4, 'task_status_changed', 'todo', 'in-progress', '{}');

END $$;
