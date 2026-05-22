ALTER TABLE recurrence_templates
ADD COLUMN lead_time_days INTEGER NOT NULL DEFAULT 0;

ALTER TABLE recurrence_templates
ADD CONSTRAINT chk_lead_time_days_range
  CHECK (lead_time_days >= 0 AND lead_time_days <= 14);

ALTER TABLE recurrence_templates
ADD CONSTRAINT chk_daily_no_lead_time
  CHECK (frequency != 'daily' OR lead_time_days = 0);

ALTER TABLE recurrence_templates
ADD CONSTRAINT chk_weekly_lead_time_cap
  CHECK (frequency != 'weekly' OR lead_time_days <= 7);
