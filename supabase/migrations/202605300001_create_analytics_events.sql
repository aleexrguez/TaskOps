-- Analytics events: write-only from clients, read via service_role/dashboard
CREATE TABLE analytics_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL CHECK (event_name IN (
    'landing_viewed','demo_started','auth_modal_opened',
    'feedback_submitted','task_created','task_completed',
    'board_viewed','recurrence_viewed','inbox_task_created'
  )),
  user_id    UUID DEFAULT auth.uid(),
  session_id TEXT NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_event_name ON analytics_events (event_name, created_at DESC);
CREATE INDEX idx_analytics_session   ON analytics_events (session_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anon: can only insert events with NULL user_id
CREATE POLICY analytics_anon_insert ON analytics_events
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- Authenticated: can only insert events with their own user_id
CREATE POLICY analytics_auth_insert ON analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No SELECT/UPDATE/DELETE from client — read via service_role/dashboard only
REVOKE ALL ON TABLE public.analytics_events FROM anon, authenticated;
GRANT INSERT ON public.analytics_events TO anon, authenticated;
