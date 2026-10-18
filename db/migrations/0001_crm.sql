-- Adtell.ai CRM. Applied only by `npm run db:migrate`, never on web server boot.

CREATE TABLE companies (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  name_key text NOT NULL,
  website text,
  domain text,
  industry text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX companies_name_key_idx ON companies (name_key);
CREATE INDEX companies_domain_idx ON companies (domain) WHERE domain IS NOT NULL;

CREATE TABLE contacts (
  id uuid PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES companies (id),
  name text NOT NULL,
  role text,
  email text,
  email_key text,
  phone text,
  origin text NOT NULL CHECK (origin IN ('inbound', 'owner', 'research')),
  verification_status text NOT NULL DEFAULT 'unknown' CHECK (verification_status IN ('unknown', 'unverified', 'verified')),
  source_url text,
  source_reference text,
  researched_on date,
  marketing_consent boolean NOT NULL DEFAULT false,
  consent_evidence text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX contacts_email_key_unique ON contacts (email_key) WHERE email_key IS NOT NULL;
CREATE INDEX contacts_company_idx ON contacts (company_id);

CREATE TABLE opportunities (
  id uuid PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES companies (id),
  contact_id uuid REFERENCES contacts (id),
  origin text NOT NULL CHECK (origin IN ('inbound', 'owner', 'research')),
  stage text NOT NULL CHECK (stage IN (
    'researched', 'contacted', 'qualified', 'audit_booked', 'proposal_sent', 'won', 'lost', 'nurture'
  )),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  estimated_value_cents integer,
  next_action text,
  next_action_on date,
  owner_notes text,
  source_url text,
  source_reference text,
  researched_on date,
  verification_status text NOT NULL DEFAULT 'unknown' CHECK (verification_status IN ('unknown', 'unverified', 'verified')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT opportunities_value_nonnegative CHECK (estimated_value_cents IS NULL OR estimated_value_cents >= 0)
);

CREATE INDEX opportunities_company_idx ON opportunities (company_id);
CREATE INDEX opportunities_stage_idx ON opportunities (stage);
CREATE INDEX opportunities_origin_idx ON opportunities (origin);
CREATE INDEX opportunities_next_action_idx ON opportunities (next_action_on);

CREATE TABLE inquiries (
  id uuid PRIMARY KEY,
  opportunity_id uuid NOT NULL REFERENCES opportunities (id),
  contact_id uuid NOT NULL REFERENCES contacts (id),
  company_id uuid NOT NULL REFERENCES companies (id),
  idempotency_key text NOT NULL UNIQUE,
  content_hash text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  company_name text NOT NULL,
  industry text NOT NULL,
  company_size text NOT NULL,
  drains text NOT NULL,
  page_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text
);

CREATE INDEX inquiries_company_idx ON inquiries (company_id);
CREATE INDEX inquiries_contact_idx ON inquiries (contact_id);
CREATE INDEX inquiries_opportunity_idx ON inquiries (opportunity_id);

CREATE TABLE activities (
  id uuid PRIMARY KEY,
  opportunity_id uuid REFERENCES opportunities (id),
  company_id uuid REFERENCES companies (id),
  contact_id uuid REFERENCES contacts (id),
  kind text NOT NULL CHECK (kind IN ('note', 'follow_up', 'stage_change', 'import', 'inquiry', 'notification')),
  body text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX activities_opportunity_idx ON activities (opportunity_id, created_at);

CREATE TABLE notification_jobs (
  id uuid PRIMARY KEY,
  inquiry_id uuid NOT NULL REFERENCES inquiries (id),
  channel text NOT NULL CHECK (channel IN ('email', 'webhook')),
  idempotency_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'leased', 'succeeded', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  lease_token text,
  leased_until timestamptz,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inquiry_id, channel),
  CONSTRAINT notification_jobs_attempts_check CHECK (attempts >= 0 AND max_attempts > 0)
);

CREATE INDEX notification_jobs_claim_idx ON notification_jobs (status, next_attempt_at);

CREATE TABLE import_batches (
  id uuid PRIMARY KEY,
  content_hash text NOT NULL UNIQUE,
  filename text,
  status text NOT NULL CHECK (status IN ('previewed', 'confirmed')),
  row_count integer NOT NULL,
  created_count integer NOT NULL DEFAULT 0,
  skipped_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);

CREATE TABLE import_rows (
  id uuid PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES import_batches (id),
  row_number integer NOT NULL,
  fingerprint text NOT NULL,
  status text NOT NULL CHECK (status IN ('ready', 'error', 'created', 'skipped')),
  message text,
  suggestion text,
  raw jsonb NOT NULL,
  company_id uuid,
  contact_id uuid,
  opportunity_id uuid,
  UNIQUE (batch_id, row_number)
);

CREATE UNIQUE INDEX import_rows_fingerprint_created ON import_rows (fingerprint) WHERE status = 'created';

CREATE TABLE rate_buckets (
  bucket_key text PRIMARY KEY,
  hits integer NOT NULL,
  window_start timestamptz NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE INDEX rate_buckets_expires_idx ON rate_buckets (expires_at);

CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  csrf_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_expires_idx ON sessions (expires_at);
