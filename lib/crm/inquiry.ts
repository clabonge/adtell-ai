import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { AuditSubmission } from "@/lib/audit";
import { configuredNotificationChannels, type DeliveryChannel } from "@/lib/deliver-audit";
import type { CrmDb } from "@/lib/crm/db";
import { activities, companies, contacts, inquiries, notificationJobs, opportunities } from "@/lib/crm/schema";
import {
  blankToNull,
  clip,
  emailKey,
  inquiryContentHash,
  isUniqueViolation,
  logSafe,
  nameKey,
} from "@/lib/crm/text";
import { auditRateWindows, enforceRateLimit, type RateWindow } from "@/lib/crm/rate-limit";

const KEY_PATTERN = /^[A-Za-z0-9._:-]{8,200}$/;

export type InquiryAttribution = {
  pageUrl: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
};

export type CaptureSuccess = {
  ok: true;
  received: true;
  inquiryId: string;
  duplicate: boolean;
};

export type CaptureFailure = {
  ok: false;
  status: 400 | 409 | 429 | 503;
  retry: boolean;
  error: string;
};

export type CaptureResult = CaptureSuccess | CaptureFailure;

class IdempotencyConflict extends Error {
  constructor() {
    super("idempotency conflict");
    this.name = "IdempotencyConflict";
  }
}

export function readIdempotencyKey(request: Request, body: Record<string, unknown>): string | null {
  const header = request.headers.get("idempotency-key");
  const raw = header ?? (typeof body.idempotency_key === "string" ? body.idempotency_key : "");
  const key = raw.trim();
  if (!KEY_PATTERN.test(key)) return null;
  return key;
}

export function readAttribution(body: Record<string, unknown>): InquiryAttribution {
  return {
    pageUrl: clip(asText(body.page_url), 2000),
    referrer: clip(asText(body.referrer), 2000),
    utmSource: clip(asText(body.utm_source), 200),
    utmMedium: clip(asText(body.utm_medium), 200),
    utmCampaign: clip(asText(body.utm_campaign), 200),
    utmTerm: clip(asText(body.utm_term), 200),
    utmContent: clip(asText(body.utm_content), 200),
  };
}

function asText(value: unknown): string | null {
  return typeof value === "string" ? blankToNull(value) : null;
}

export function notificationPayload(inquiryId: string, submission: AuditSubmission) {
  return {
    inquiryId,
    name: submission.name,
    email: submission.email,
    company: submission.company,
    industry: submission.industry,
    size: submission.size,
    drains: submission.drains,
    weeklyTime: submission.weeklyTime ?? "",
    auditPreview: submission.auditPreview ?? "",
  };
}

export async function captureInquiry(
  database: CrmDb,
  input: {
    submission: AuditSubmission;
    idempotencyKey: string;
    attribution: InquiryAttribution;
    address: string;
    channels?: DeliveryChannel[];
    windows?: RateWindow[];
  },
): Promise<CaptureResult> {
  if (!KEY_PATTERN.test(input.idempotencyKey)) {
    return {
      ok: false,
      status: 400,
      retry: false,
      error: "The form is missing a submission key. Try again.",
    };
  }
  const contentHash = inquiryContentHash(input.submission);
  try {
    const existing = await findByKey(database, input.idempotencyKey);
    if (existing) return replay(existing, contentHash);

    const limited = await enforceRateLimit(database, {
      route: "audit",
      address: input.address,
      windows: input.windows ?? auditRateWindows(),
    });
    if (!limited.allowed) {
      return {
        ok: false,
        status: 429,
        retry: true,
        error: "Too many requests. Please wait and try again.",
      };
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const saved = await insertInquiry(database, input, contentHash);
        return { ok: true, received: true, inquiryId: saved.inquiryId, duplicate: saved.duplicate };
      } catch (err) {
        if (err instanceof IdempotencyConflict) {
          return {
            ok: false,
            status: 409,
            retry: false,
            error: "This submission key was already used for a different request. Start another request.",
          };
        }
        if (isUniqueViolation(err) && attempt === 0) continue;
        throw err;
      }
    }
    return retryable();
  } catch (err) {
    if (err instanceof IdempotencyConflict) {
      return {
        ok: false,
        status: 409,
        retry: false,
        error: "This submission key was already used for a different request. Start another request.",
      };
    }
    logSafe("audit save failed", err);
    return retryable();
  }
}

function retryable(): CaptureFailure {
  return {
    ok: false,
    status: 503,
    retry: true,
    error: "We could not save your request. Please try again.",
  };
}

function replay(
  existing: { id: string; contentHash: string },
  contentHash: string,
): CaptureResult {
  if (existing.contentHash !== contentHash) {
    return {
      ok: false,
      status: 409,
      retry: false,
      error: "This submission key was already used for a different request. Start another request.",
    };
  }
  return { ok: true, received: true, inquiryId: existing.id, duplicate: true };
}

async function findByKey(database: CrmDb, key: string) {
  const rows = await database.db
    .select({ id: inquiries.id, contentHash: inquiries.contentHash })
    .from(inquiries)
    .where(eq(inquiries.idempotencyKey, key))
    .limit(1);
  return rows[0] ?? null;
}

async function insertInquiry(
  database: CrmDb,
  input: {
    submission: AuditSubmission;
    idempotencyKey: string;
    attribution: InquiryAttribution;
    channels?: DeliveryChannel[];
  },
  contentHash: string,
): Promise<{ inquiryId: string; duplicate: boolean }> {
  const channels = input.channels ?? configuredNotificationChannels();
  return database.db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: inquiries.id, contentHash: inquiries.contentHash })
      .from(inquiries)
      .where(eq(inquiries.idempotencyKey, input.idempotencyKey))
      .limit(1);
    if (existing[0]) {
      if (existing[0].contentHash !== contentHash) throw new IdempotencyConflict();
      return { inquiryId: existing[0].id, duplicate: true };
    }

    const submission = input.submission;
    const company = await attachCompany(tx, submission.company, submission.industry);
    const contact = await attachContact(tx, {
      companyId: company.id,
      name: submission.name,
      email: submission.email,
    });
    const now = new Date();
    const opportunityId = randomUUID();
    await tx.insert(opportunities).values({
      id: opportunityId,
      companyId: company.id,
      contactId: contact.id,
      origin: "inbound",
      stage: "contacted",
      priority: "normal",
      estimatedValueCents: null,
      nextAction: "Review the audit request",
      nextActionOn: ownerDate(now),
      ownerNotes: null,
      sourceUrl: input.attribution.pageUrl,
      sourceReference: "audit form",
      researchedOn: null,
      verificationStatus: "unverified",
      createdAt: now,
      updatedAt: now,
    });
    const inquiryId = randomUUID();
    await tx.insert(inquiries).values({
      id: inquiryId,
      opportunityId,
      contactId: contact.id,
      companyId: company.id,
      idempotencyKey: input.idempotencyKey,
      contentHash,
      submittedAt: now,
      name: submission.name,
      email: submission.email,
      companyName: submission.company,
      industry: submission.industry,
      companySize: submission.size,
      drains: submission.drains,
      weeklyTime: blankToNull(submission.weeklyTime),
      auditPreview: blankToNull(submission.auditPreview),
      pageUrl: input.attribution.pageUrl,
      referrer: input.attribution.referrer,
      utmSource: input.attribution.utmSource,
      utmMedium: input.attribution.utmMedium,
      utmCampaign: input.attribution.utmCampaign,
      utmTerm: input.attribution.utmTerm,
      utmContent: input.attribution.utmContent,
    });
    await tx.insert(activities).values({
      id: randomUUID(),
      opportunityId,
      companyId: company.id,
      contactId: contact.id,
      kind: "inquiry",
      body: "Inbound audit request saved. The audit is not booked. This request is not marketing consent.",
      metadata: { stage: "contacted" },
      createdAt: now,
    });
    if (channels.length > 0) {
      await tx.insert(notificationJobs).values(
        channels.map((channel) => ({
          id: randomUUID(),
          inquiryId,
          channel,
          idempotencyKey: `${channel}:${inquiryId}`,
          status: "pending",
          attempts: 0,
          maxAttempts: 5,
          leaseToken: null,
          leasedUntil: null,
          nextAttemptAt: now,
          lastError: null,
          payload: notificationPayload(inquiryId, submission),
          createdAt: now,
          updatedAt: now,
        })),
      );
    }
    return { inquiryId, duplicate: false };
  });
}

async function attachCompany(
  tx: CrmTx,
  companyName: string,
  industry: string,
): Promise<{ id: string }> {
  const key = nameKey(companyName);
  const matches = await tx
    .select({ id: companies.id, industry: companies.industry })
    .from(companies)
    .where(eq(companies.nameKey, key));
  if (matches.length > 1) {
    return insertCompany(tx, companyName, industry);
  }
  if (matches.length === 1) {
    const current = matches[0];
    if (!current.industry && industry) {
      await tx
        .update(companies)
        .set({ industry, updatedAt: new Date() })
        .where(eq(companies.id, current.id));
    }
    return { id: current.id };
  }
  return insertCompany(tx, companyName, industry);
}

async function insertCompany(tx: CrmTx, companyName: string, industry: string) {
  const id = randomUUID();
  const now = new Date();
  await tx.insert(companies).values({
    id,
    name: companyName,
    nameKey: nameKey(companyName),
    website: null,
    domain: null,
    industry: industry || null,
    location: null,
    createdAt: now,
    updatedAt: now,
  });
  return { id };
}

async function attachContact(
  tx: CrmTx,
  input: { companyId: string; name: string; email: string },
): Promise<{ id: string }> {
  const key = emailKey(input.email);
  if (!key) throw new Error("email required");
  const matches = await tx
    .select({
      id: contacts.id,
      name: contacts.name,
      verificationStatus: contacts.verificationStatus,
    })
    .from(contacts)
    .where(eq(contacts.emailKey, key))
    .limit(1);
  if (matches[0]) return { id: matches[0].id };
  const id = randomUUID();
  const now = new Date();
  await tx.insert(contacts).values({
    id,
    companyId: input.companyId,
    name: input.name,
    role: null,
    email: key,
    emailKey: key,
    phone: null,
    origin: "inbound",
    verificationStatus: "unverified",
    sourceUrl: null,
    sourceReference: "audit form",
    researchedOn: null,
    marketingConsent: false,
    consentEvidence: null,
    createdAt: now,
    updatedAt: now,
  });
  return { id };
}

function ownerDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

type CrmTx = Parameters<Parameters<CrmDb["db"]["transaction"]>[0]>[0];
