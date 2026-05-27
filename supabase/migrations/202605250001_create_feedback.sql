-- Feedback table: write-only from clients, read via service_role/dashboard
CREATE TABLE feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message    TEXT NOT NULL
    CONSTRAINT chk_feedback_message_length CHECK (char_length(btrim(message)) BETWEEN 1 AND 1000),
  category   TEXT NOT NULL
    CONSTRAINT chk_feedback_category CHECK (category IN ('bug', 'feature_request', 'ux_improvement', 'other')),
  email      TEXT
    CONSTRAINT chk_feedback_email CHECK (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  user_id    UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_created  ON feedback (created_at DESC);
CREATE INDEX idx_feedback_category ON feedback (category);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Explicit INSERT-only policy for anon and authenticated
CREATE POLICY feedback_insert ON feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Explicit permissions: REVOKE all, then GRANT INSERT only
REVOKE ALL ON TABLE public.feedback FROM anon, authenticated;
GRANT INSERT ON public.feedback TO anon, authenticated;
