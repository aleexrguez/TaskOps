CREATE TABLE recurrence_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT CHECK (char_length(description) <= 2000),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  weekly_days INTEGER[],
  monthly_day INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_weekly_requires_days CHECK (
    (frequency != 'weekly') OR (weekly_days IS NOT NULL AND array_length(weekly_days, 1) > 0)
  ),
  CONSTRAINT chk_monthly_requires_day CHECK (
    (frequency != 'monthly') OR (monthly_day BETWEEN 1 AND 31)
  ),
  CONSTRAINT chk_daily_no_extras CHECK (
    (frequency != 'daily') OR (weekly_days IS NULL AND monthly_day IS NULL)
  ),
  CONSTRAINT chk_weekly_no_monthly CHECK (
    (frequency != 'weekly') OR (monthly_day IS NULL)
  ),
  CONSTRAINT chk_monthly_no_weekly CHECK (
    (frequency != 'monthly') OR (weekly_days IS NULL)
  )
);

ALTER TABLE recurrence_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recurrence templates"
  ON recurrence_templates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
