ALTER TABLE notification_jobs DROP CONSTRAINT IF EXISTS notification_jobs_channel_check;

ALTER TABLE notification_jobs
  ADD CONSTRAINT notification_jobs_channel_check
  CHECK (channel IN ('email', 'webhook', 'confirmation'));
