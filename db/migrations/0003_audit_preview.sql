-- Optional time note and the example AI preview saved with an audit request.

ALTER TABLE inquiries ADD COLUMN weekly_time text;
ALTER TABLE inquiries ADD COLUMN audit_preview text;
