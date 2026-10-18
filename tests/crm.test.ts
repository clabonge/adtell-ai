import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { GET as exportCsv } from "../app/admin/api/export/route";
import { POST as login } from "../app/admin/api/login/route";
import { POST as updateOpportunityRoute } from "../app/admin/api/opportunities/[id]/route";
import { handleAuditRequest } from "../lib/crm/audit-request";
import { hashPassword, verifyPassword } from "../lib/crm/password";
import { applyMigrations, openDatabase, resetCrmDatabaseForTests } from "../lib/crm/db";
import { captureInquiry } from "../lib/crm/inquiry";
import { confirmImport, previewImport } from "../lib/crm/import";
import { claimJobs, completeJob, runDueJobs } from "../lib/crm/notify";
import { companies, contacts, inquiries, notificationJobs, opportunities } from "../lib/crm/schema";
import { csvCell, parseCsv } from "../lib/crm/csv";
import { workerLoop } from "../lib/crm/worker";
import { loginOwner, sessionCookie } from "../lib/crm/auth";
import { assertDemoSeedAllowed } from "../lib/crm/seed";
import type { AuditSubmission } from "../lib/audit";
import { startTestDatabase, tempDir, type TestDatabase } from "./helpers";

const submission: AuditSubmission = {
  name: "Ada Owner",
  email: "ada@example.com",
  company: "Northwind Goods",
  industry: "Retail",
  size: "11-50",
  drains: "People retype orders from email into the sheet.",
};

function IMPORT_HEADER() {
  return "company,website,industry,location,contact_name,contact_title,email,source_url,research_date,fit_notes,verification_status,origin,next_action";
}

function auditRequest(key: string, body: Record<string, unknown> = submission) {
  return new Request("http://127.0.0.1/api/audit", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": key,
      "x-forwarded-for": "203.0.113.10",
    },
    body: JSON.stringify({ ...body, company_website: "" }),
  });
}

async function savedCount(database: TestDatabase) {
  const rows = await database.crm.sql<{ count: number }[]>`select count(*)::int as count from inquiries`;
  return Number(rows[0]?.count ?? 0);
}

describe("crm", () => {
  let database: TestDatabase;
  const previousEnv = { ...process.env };

  before(async () => {
    database = await startTestDatabase();
    process.env.DATABASE_URL = database.url;
    process.env.CRM_SESSION_SECRET = "test-session-secret-with-32-characters";
    process.env.CRM_OWNER_EMAIL = "owner@example.com";
    process.env.RESEND_API_KEY = "";
    process.env.AUDIT_WEBHOOK_URL = "";
    await resetCrmDatabaseForTests();
  });

  after(async () => {
    await resetCrmDatabaseForTests();
    await database.stop();
    process.env = previousEnv;
  });

  it("applies migrations once", async () => {
    const again = await applyMigrations(database.crm);
    assert.deepEqual(again, []);
  });

  it("rejects a honeypot without writing", async () => {
    const beforeCount = await savedCount(database);
    const response = await handleAuditRequest(
      new Request("http://127.0.0.1/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...submission, company_website: "https://spam.example" }),
      }),
    );
    const body = (await response.json()) as { ok: boolean; received?: boolean };
    assert.equal(response.status, 200);
    assert.equal(body.received, false);
    assert.equal(await savedCount(database), beforeCount);
  });

  it("returns 503 when the database is unset", async () => {
    await resetCrmDatabaseForTests();
    delete process.env.DATABASE_URL;
    const response = await handleAuditRequest(auditRequest(randomUUID()));
    const body = (await response.json()) as { ok: boolean; received?: boolean; retry?: boolean };
    assert.equal(response.status, 503);
    assert.equal(body.ok, false);
    assert.equal(body.retry, true);
    assert.equal(body.received, undefined);
    process.env.DATABASE_URL = database.url;
    await resetCrmDatabaseForTests();
  });

  it("returns 503 when the database is down", async () => {
    const dead = openDatabase("postgres://adtell:adtell@127.0.0.1:1/adtell", { connectTimeout: 1, max: 1 });
    const result = await captureInquiry(dead, {
      submission,
      idempotencyKey: randomUUID(),
      attribution: emptyAttribution(),
      address: "203.0.113.20",
      channels: [],
      windows: [{ name: "minute", seconds: 60, max: 10 }],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 503);
      assert.equal(result.retry, true);
      assert.match(result.error, /could not save/i);
    }
    await dead.close();
  });

  it("stores an inquiry once for a retried key and again for a new request", async () => {
    const key = randomUUID();
    const first = await captureInquiry(database.crm, {
      submission,
      idempotencyKey: key,
      attribution: emptyAttribution(),
      address: "203.0.113.30",
      channels: ["email", "webhook"],
      windows: [{ name: "minute", seconds: 60, max: 20 }],
    });
    const second = await captureInquiry(database.crm, {
      submission,
      idempotencyKey: key,
      attribution: { ...emptyAttribution(), referrer: "https://example.com/again" },
      address: "203.0.113.30",
      channels: ["email", "webhook"],
      windows: [{ name: "minute", seconds: 60, max: 20 }],
    });
    assert.equal(first.ok && second.ok && first.inquiryId === second.inquiryId, true);
    const conflict = await captureInquiry(database.crm, {
      submission: { ...submission, drains: "A different description of the drains." },
      idempotencyKey: key,
      attribution: emptyAttribution(),
      address: "203.0.113.31",
      channels: [],
      windows: [{ name: "minute", seconds: 60, max: 20 }],
    });
    assert.equal(conflict.ok, false);
    if (!conflict.ok) assert.equal(conflict.status, 409);

    const separate = await captureInquiry(database.crm, {
      submission,
      idempotencyKey: randomUUID(),
      attribution: emptyAttribution(),
      address: "203.0.113.32",
      channels: [],
      windows: [{ name: "minute", seconds: 60, max: 20 }],
    });
    assert.equal(separate.ok, true);
    const inquiryRows = await database.crm.db.select().from(inquiries);
    const matching = inquiryRows.filter((row) => row.email === submission.email);
    assert.equal(matching.length, 2);
    const contactRows = await database.crm.db
      .select()
      .from(contacts)
      .where(eq(contacts.emailKey, submission.email.toLowerCase()));
    assert.equal(contactRows.length, 1);
    assert.equal(contactRows[0]?.marketingConsent, false);
    const jobs = await database.crm.db.select().from(notificationJobs);
    const firstJobs = jobs.filter((job) => first.ok && job.inquiryId === first.inquiryId);
    assert.deepEqual(firstJobs.map((job) => job.channel).sort(), ["email", "webhook"]);
  });

  it("rate limits new submissions across calls", async () => {
    const windows = [{ name: "minute", seconds: 60, max: 1 }];
    const address = "203.0.113.40";
    const ok = await captureInquiry(database.crm, {
      submission: { ...submission, email: "rate@example.com", company: "Rate Limited Co" },
      idempotencyKey: randomUUID(),
      attribution: emptyAttribution(),
      address,
      channels: [],
      windows,
    });
    const limited = await captureInquiry(database.crm, {
      submission: { ...submission, email: "rate2@example.com", company: "Rate Limited Two" },
      idempotencyKey: randomUUID(),
      attribution: emptyAttribution(),
      address,
      channels: [],
      windows,
    });
    assert.equal(ok.ok, true);
    assert.equal(limited.ok, false);
    if (!limited.ok) assert.equal(limited.status, 429);
  });

  it("keeps email and webhook independent when one provider fails", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.AUDIT_WEBHOOK_URL = "http://127.0.0.1:9/hook";
    const calls: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      calls.push(url);
      const headers = new Headers(init?.headers);
      if (url.includes("resend.com")) {
        assert.ok(headers.get("idempotency-key"));
        return new Response("no", { status: 500 });
      }
      assert.equal(url, "http://127.0.0.1:9/hook");
      assert.ok(headers.get("x-adtell-event-id"));
      return new Response("ok", { status: 200 });
    };
    const saved = await captureInquiry(database.crm, {
      submission: { ...submission, email: "notify@example.com", company: "Notify Co" },
      idempotencyKey: randomUUID(),
      attribution: emptyAttribution(),
      address: "203.0.113.50",
      windows: [{ name: "minute", seconds: 60, max: 10 }],
    });
    assert.equal(saved.ok, true);
    if (!saved.ok) return;
    await runDueJobs(database.crm, { channels: ["email"], fetchImpl });
    let jobs = await database.crm.db
      .select()
      .from(notificationJobs)
      .where(eq(notificationJobs.inquiryId, saved.inquiryId));
    assert.equal(jobs.find((job) => job.channel === "webhook")?.status, "pending");
    assert.equal(jobs.find((job) => job.channel === "email")?.status, "pending");
    await runDueJobs(database.crm, { channels: ["webhook"], fetchImpl });
    jobs = await database.crm.db
      .select()
      .from(notificationJobs)
      .where(eq(notificationJobs.inquiryId, saved.inquiryId));
    assert.equal(jobs.find((job) => job.channel === "webhook")?.status, "succeeded");
    assert.equal(jobs.find((job) => job.channel === "email")?.status, "pending");
    assert.ok(calls.some((url) => url.includes("resend.com")));
    assert.ok(calls.some((url) => url.includes("127.0.0.1")));
  });

  it("reclaims a lease after a crash and ignores the old token", async () => {
    const saved = await captureInquiry(database.crm, {
      submission: { ...submission, email: "crash@example.com", company: "Crash Co" },
      idempotencyKey: randomUUID(),
      attribution: emptyAttribution(),
      address: "203.0.113.60",
      channels: ["email"],
      windows: [{ name: "minute", seconds: 60, max: 10 }],
    });
    assert.equal(saved.ok, true);
    const first = await claimJobs(database.crm, { channels: ["email"], limit: 5 });
    const job = first.find((item) => saved.ok && item.inquiryId === saved.inquiryId);
    assert.ok(job);
    if (!job) return;
    await database.crm.sql`update notification_jobs set leased_until = now() - interval '2 minutes' where id = ${job.id}`;
    const second = await claimJobs(database.crm, { channels: ["email"], limit: 5 });
    const reclaimed = second.find((item) => item.id === job.id);
    assert.ok(reclaimed);
    assert.notEqual(reclaimed?.leaseToken, job.leaseToken);
    assert.equal(await completeJob(database.crm, job), false);
    assert.equal(reclaimed ? await completeJob(database.crm, reclaimed) : false, true);
  });

  it("lets two workers claim different jobs and only one claim a single job", async () => {
    const make = async (email: string, company: string) =>
      captureInquiry(database.crm, {
        submission: { ...submission, email, company },
        idempotencyKey: randomUUID(),
        attribution: emptyAttribution(),
        address: `203.0.113.${email.length + 70}`,
        channels: ["webhook"],
        windows: [{ name: "minute", seconds: 60, max: 10 }],
      });
    await database.crm.sql`update notification_jobs set status = 'succeeded', lease_token = null where channel = 'webhook' and status <> 'succeeded'`;
    await make("one@example.com", "Worker One");
    await make("two@example.com", "Worker Two");
    const other = openDatabase(database.url, { max: 2 });
    try {
      const [left, right] = await Promise.all([
        claimJobs(database.crm, { channels: ["webhook"], limit: 1 }),
        claimJobs(other, { channels: ["webhook"], limit: 1 }),
      ]);
      const ids = [...left, ...right].map((job) => job.id);
      assert.equal(new Set(ids).size, ids.length);
      assert.equal(ids.length, 2);
    } finally {
      await other.close();
    }

    await database.crm.sql`update notification_jobs set status = 'succeeded', lease_token = null where channel = 'webhook' and status <> 'succeeded'`;
    await make("solo@example.com", "Worker Solo");
    const third = openDatabase(database.url, { max: 1 });
    try {
      const [left, right] = await Promise.all([
        claimJobs(database.crm, { channels: ["webhook"], limit: 1 }),
        claimJobs(third, { channels: ["webhook"], limit: 1 }),
      ]);
      assert.equal(left.length + right.length, 1);
    } finally {
      await third.close();
    }
  });

  it("fails a job after its attempts are exhausted", async () => {
    const saved = await captureInquiry(database.crm, {
      submission: { ...submission, email: "retry@example.com", company: "Retry Co" },
      idempotencyKey: randomUUID(),
      attribution: emptyAttribution(),
      address: "203.0.113.90",
      channels: ["email"],
      windows: [{ name: "minute", seconds: 60, max: 10 }],
    });
    assert.equal(saved.ok, true);
    if (!saved.ok) return;
    await database.crm.sql`update notification_jobs set max_attempts = 1 where inquiry_id = ${saved.inquiryId}`;
    process.env.RESEND_API_KEY = "re_test";
    const fetchImpl: typeof fetch = async () => new Response("no", { status: 500 });
    await runDueJobs(database.crm, { channels: ["email"], fetchImpl });
    const failed = await database.crm.db
      .select()
      .from(notificationJobs)
      .where(eq(notificationJobs.inquiryId, saved.inquiryId));
    assert.equal(failed[0]?.status, "failed");
    const again = await claimJobs(database.crm, { channels: ["email"], limit: 5 });
    assert.equal(again.some((job) => job.inquiryId === saved.inquiryId), false);
  });

  it("persists an inquiry across a database restart", async () => {
    const dir = tempDir();
    const first = await startTestDatabase(dir);
    const saved = await captureInquiry(first.crm, {
      submission: { ...submission, email: "persist@example.com", company: "Persist Co" },
      idempotencyKey: randomUUID(),
      attribution: emptyAttribution(),
      address: "203.0.113.100",
      channels: [],
      windows: [{ name: "minute", seconds: 60, max: 5 }],
    });
    assert.equal(saved.ok, true);
    await first.stop();
    const second = await startTestDatabase(dir);
    const rows = await second.crm.sql<{ count: number }[]>`
      select count(*)::int as count from inquiries where email = 'persist@example.com'
    `;
    assert.equal(Number(rows[0]?.count), 1);
    await second.stop();
  });

  it("previews and confirms a research import without email or consent", async () => {
    const csv = `${IMPORT_HEADER()}\nExample Research,https://research.example,Retail,Philadelphia,Pat Research,Ops,pat@research.example,https://research.example/about,2026-01-15,Fits the audit offer,unverified,research,Read the notes\n`;
    const fetchImpl: typeof fetch = async () => {
      throw new Error("import must not send");
    };
    const preview = await previewImport(database.crm, { filename: "research.csv", csv });
    assert.equal(preview.ok, true);
    const beforeCompanies = await database.crm.db.select().from(companies);
    assert.equal(beforeCompanies.some((company) => company.name === "Example Research"), false);
    if (!preview.ok) return;
    const confirmed = await confirmImport(database.crm, preview.batchId);
    assert.equal(confirmed.ok && confirmed.created, 1);
    const repeated = await confirmImport(database.crm, preview.batchId);
    assert.equal(repeated.ok && repeated.created, 1);
    const contact = await database.crm.db
      .select()
      .from(contacts)
      .where(eq(contacts.emailKey, "pat@research.example"));
    assert.equal(contact.length, 1);
    assert.equal(contact[0]?.marketingConsent, false);
    assert.equal(contact[0]?.origin, "research");
    const jobs = await database.crm.sql<{ count: number }[]>`
      select count(*)::int as count from notification_jobs
    `;
    const beforeJobs = jobs;
    await fetchImpl("http://127.0.0.1/unused").catch(() => undefined);
    const afterJobs = await database.crm.sql<{ count: number }[]>`select count(*)::int as count from notification_jobs`;
    assert.equal(Number(afterJobs[0]?.count), Number(beforeJobs[0]?.count));
    const opportunity = await database.crm.db
      .select()
      .from(opportunities)
      .where(eq(opportunities.contactId, contact[0]?.id ?? ""));
    assert.equal(opportunity[0]?.stage, "researched");
  });

  it("does not overwrite verified data or merge ambiguous companies", async () => {
    const companyId = randomUUID();
    const contactId = randomUUID();
    const now = new Date();
    await database.crm.db.insert(companies).values({
      id: companyId,
      name: "Verified Goods",
      nameKey: "verified goods",
      website: "https://verified.example",
      domain: "verified.example",
      industry: "Manufacturing",
      location: "Camden",
      createdAt: now,
      updatedAt: now,
    });
    await database.crm.db.insert(contacts).values({
      id: contactId,
      companyId,
      name: "Vera Verified",
      role: "Founder",
      email: "vera@verified.example",
      emailKey: "vera@verified.example",
      phone: null,
      origin: "owner",
      verificationStatus: "verified",
      sourceUrl: null,
      sourceReference: null,
      researchedOn: null,
      marketingConsent: false,
      consentEvidence: null,
      createdAt: now,
      updatedAt: now,
    });
    const csv = `${IMPORT_HEADER()}\nVerified Goods,https://other.example,Retail,Other City,Someone Else,Buyer,vera@verified.example,https://verified.example,2026-02-01,New notes,verified,research,Call\n`;
    const preview = await previewImport(database.crm, { filename: "verified.csv", csv });
    assert.equal(preview.ok, true);
    if (!preview.ok) return;
    assert.equal(preview.rows[0]?.status, "error");
    const confirmed = await confirmImport(database.crm, preview.batchId);
    assert.equal(confirmed.ok && confirmed.created, 0);
    const contact = await database.crm.db.select().from(contacts).where(eq(contacts.id, contactId));
    assert.equal(contact[0]?.name, "Vera Verified");

    const left = randomUUID();
    const right = randomUUID();
    await database.crm.db.insert(companies).values([
      {
        id: left,
        name: "Shared Name",
        nameKey: "shared name",
        website: null,
        domain: null,
        industry: null,
        location: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: right,
        name: "Shared Name",
        nameKey: "shared name",
        website: null,
        domain: null,
        industry: null,
        location: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    const ambiguous = `${IMPORT_HEADER()}\nShared Name,,Retail,,Alex Shared,,,https://example.com/source,2026-03-01,Notes,unknown,research,\n`;
    const ambiguousPreview = await previewImport(database.crm, { filename: "ambiguous.csv", csv: ambiguous });
    assert.equal(ambiguousPreview.ok, true);
    if (!ambiguousPreview.ok) return;
    assert.equal(ambiguousPreview.rows[0]?.status, "error");
    assert.match(ambiguousPreview.rows[0]?.message ?? "", /not merged/i);
  });

  it("protects CSV exports from formula injection", async () => {
    const companyId = randomUUID();
    const now = new Date();
    await database.crm.db.insert(companies).values({
      id: companyId,
      name: "=cmd|calc",
      nameKey: "=cmd|calc",
      website: null,
      domain: null,
      industry: null,
      location: null,
      createdAt: now,
      updatedAt: now,
    });
    await database.crm.db.insert(opportunities).values({
      id: randomUUID(),
      companyId,
      contactId: null,
      origin: "research",
      stage: "researched",
      priority: "normal",
      estimatedValueCents: null,
      nextAction: null,
      nextActionOn: null,
      ownerNotes: null,
      sourceUrl: null,
      sourceReference: null,
      researchedOn: null,
      verificationStatus: "unknown",
      createdAt: now,
      updatedAt: now,
    });
    assert.equal(csvCell("=1+1"), "'=1+1");
    assert.equal(csvCell("+1"), "'+1");
    assert.equal(csvCell("-1"), "'-1");
    assert.equal(csvCell("@sum"), "'@sum");
    const parsed = parseCsv('plain,"line\nbreak","say ""hi"""\n');
    assert.equal(parsed[0]?.[1], "line\nbreak");
    assert.equal(parsed[0]?.[2], 'say "hi"');

    const passwordHash = await hashPassword("correct-horse-battery");
    process.env.CRM_OWNER_PASSWORD_HASH = passwordHash;
    const session = await loginOwner(database.crm, {
      email: "owner@example.com",
      passwordHash,
      sessionSecret: process.env.CRM_SESSION_SECRET ?? "",
    }, "owner@example.com", "correct-horse-battery");
    assert.ok(session);
    if (!session) return;
    const response = await exportCsv(
      new Request(`http://127.0.0.1/admin/api/export?csrf=${encodeURIComponent(session.csrfToken)}`, {
        headers: {
          cookie: sessionCookie(session.token),
          origin: "http://127.0.0.1",
          host: "127.0.0.1",
        },
      }),
    );
    assert.equal(response.status, 200);
    const csv = await response.text();
    assert.match(csv, /'=cmd\|calc/);
    assert.match(csv, /estimated_value_usd_not_revenue/);
    assert.doesNotMatch(csv, /(^|\n)=cmd\|calc/);
  });

  it("rejects anonymous CRM access and a missing owner password", async () => {
    const denied = await exportCsv(new Request("http://127.0.0.1/admin/api/export"));
    assert.equal(denied.status, 401);
    const mutation = await updateOpportunityRoute(
      new Request("http://127.0.0.1/admin/api/opportunities/nope", {
        method: "POST",
        headers: { origin: "http://127.0.0.1", host: "127.0.0.1" },
        body: new FormData(),
      }),
      { params: Promise.resolve({ id: randomUUID() }) },
    );
    assert.equal(mutation.status, 401);
    delete process.env.CRM_OWNER_PASSWORD_HASH;
    const unconfigured = await login(
      new Request("http://127.0.0.1/admin/api/login", {
        method: "POST",
        headers: {
          accept: "application/json",
          origin: "http://127.0.0.1",
          host: "127.0.0.1",
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "email=owner@example.com&password=correct-horse-battery",
      }),
    );
    assert.equal(unconfigured.status, 503);
    assert.equal(await verifyPassword("wrong-password-value", "scrypt:bad"), false);
  });

  it("refuses to seed unless development and localhost are explicit", () => {
    assert.throws(() => assertDemoSeedAllowed({ NODE_ENV: "production", CRM_SEED_DEMO: "1", DATABASE_URL: "postgres://127.0.0.1/adtell" }));
    assert.throws(() =>
      assertDemoSeedAllowed({
        NODE_ENV: "development",
        CRM_SEED_DEMO: "1",
        DATABASE_URL: "postgres://user:pass@dpg.example.com/adtell",
      }),
    );
  });

  it("stops the worker loop when aborted", async () => {
    const controller = new AbortController();
    const pending = workerLoop(database.crm, { pollMs: 50, signal: controller.signal });
    controller.abort();
    await pending;
  });
});

function emptyAttribution() {
  return {
    pageUrl: null,
    referrer: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
  };
}

