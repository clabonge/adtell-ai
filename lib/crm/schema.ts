import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  nameKey: text("name_key").notNull(),
  website: text("website"),
  domain: text("domain"),
  industry: text("industry"),
  location: text("location"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  emailKey: text("email_key"),
  phone: text("phone"),
  origin: text("origin").notNull(),
  verificationStatus: text("verification_status").notNull(),
  sourceUrl: text("source_url"),
  sourceReference: text("source_reference"),
  researchedOn: date("researched_on", { mode: "string" }),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  consentEvidence: text("consent_evidence"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  contactId: uuid("contact_id"),
  origin: text("origin").notNull(),
  stage: text("stage").notNull(),
  priority: text("priority").notNull(),
  estimatedValueCents: integer("estimated_value_cents"),
  nextAction: text("next_action"),
  nextActionOn: date("next_action_on", { mode: "string" }),
  ownerNotes: text("owner_notes"),
  sourceUrl: text("source_url"),
  sourceReference: text("source_reference"),
  researchedOn: date("researched_on", { mode: "string" }),
  verificationStatus: text("verification_status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey(),
  opportunityId: uuid("opportunity_id").notNull(),
  contactId: uuid("contact_id").notNull(),
  companyId: uuid("company_id").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  contentHash: text("content_hash").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  companyName: text("company_name").notNull(),
  industry: text("industry").notNull(),
  companySize: text("company_size").notNull(),
  drains: text("drains").notNull(),
  weeklyTime: text("weekly_time"),
  auditPreview: text("audit_preview"),
  pageUrl: text("page_url"),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey(),
  opportunityId: uuid("opportunity_id"),
  companyId: uuid("company_id"),
  contactId: uuid("contact_id"),
  kind: text("kind").notNull(),
  body: text("body").notNull(),
  metadata: jsonb("metadata").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const notificationJobs = pgTable("notification_jobs", {
  id: uuid("id").primaryKey(),
  inquiryId: uuid("inquiry_id").notNull(),
  channel: text("channel").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  status: text("status").notNull(),
  attempts: integer("attempts").notNull(),
  maxAttempts: integer("max_attempts").notNull(),
  leaseToken: text("lease_token"),
  leasedUntil: timestamp("leased_until", { withTimezone: true, mode: "date" }),
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true, mode: "date" }).notNull(),
  lastError: text("last_error"),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const importBatches = pgTable("import_batches", {
  id: uuid("id").primaryKey(),
  contentHash: text("content_hash").notNull().unique(),
  filename: text("filename"),
  status: text("status").notNull(),
  rowCount: integer("row_count").notNull(),
  createdCount: integer("created_count").notNull(),
  skippedCount: integer("skipped_count").notNull(),
  errorCount: integer("error_count").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: "date" }),
});

export const importRows = pgTable("import_rows", {
  id: uuid("id").primaryKey(),
  batchId: uuid("batch_id").notNull(),
  rowNumber: integer("row_number").notNull(),
  fingerprint: text("fingerprint").notNull(),
  status: text("status").notNull(),
  message: text("message"),
  suggestion: text("suggestion"),
  raw: jsonb("raw").notNull(),
  companyId: uuid("company_id"),
  contactId: uuid("contact_id"),
  opportunityId: uuid("opportunity_id"),
});

export const rateBuckets = pgTable("rate_buckets", {
  bucketKey: text("bucket_key").primaryKey(),
  hits: integer("hits").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true, mode: "date" }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  csrfToken: text("csrf_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});
