import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { companySizes, type CompanySize } from "@/content/audit";
import type { AuditSubmission } from "@/lib/audit";
import {
  sendAuditEmail,
  sendAuditWebhook,
  type DeliveryChannel,
} from "@/lib/deliver-audit";
import type { CrmDb } from "@/lib/crm/db";
import { LEASE_SECONDS, MAX_NOTIFICATION_ATTEMPTS } from "@/lib/crm/constants";
import { activities, notificationJobs } from "@/lib/crm/schema";
import { asRows } from "@/lib/crm/rate-limit";
import { logSafe } from "@/lib/crm/text";

export type ClaimedJob = {
  id: string;
  inquiryId: string;
  channel: DeliveryChannel;
  idempotencyKey: string;
  attempts: number;
  maxAttempts: number;
  leaseToken: string;
  payload: AuditSubmission & { inquiryId: string };
};

export function backoffMs(attempts: number): number {
  const step = Math.min(Math.max(attempts, 1), 8);
  return Math.min(30_000 * 2 ** (step - 1), 60 * 60 * 1000);
}

export async function claimJobs(
  database: CrmDb,
  options?: { limit?: number; channels?: DeliveryChannel[]; leaseSeconds?: number },
): Promise<ClaimedJob[]> {
  const channels = options?.channels ?? [];
  if (channels.length === 0) return [];
  const limit = Math.min(Math.max(options?.limit ?? 5, 1), 20);
  const leaseSeconds = options?.leaseSeconds ?? LEASE_SECONDS;
  return database.db.transaction(async (tx) => {
    await tx
      .update(notificationJobs)
      .set({
        status: "failed",
        leaseToken: null,
        leasedUntil: null,
        lastError: "The last attempt did not finish before the lease expired.",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notificationJobs.status, "leased"),
          sql`${notificationJobs.leasedUntil} < now()`,
          sql`${notificationJobs.attempts} >= ${notificationJobs.maxAttempts}`,
        ),
      );

    const channelList = sql.join(
      channels.map((channel) => sql`${channel}`),
      sql`, `,
    );
    const picked = await tx.execute<{ id: string }>(sql`
      SELECT id
      FROM notification_jobs
      WHERE (
        (status = 'pending' AND next_attempt_at <= now() AND attempts < max_attempts)
        OR (status = 'leased' AND leased_until < now() AND attempts < max_attempts)
      )
      AND channel IN (${channelList})
      ORDER BY next_attempt_at, created_at
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    `);
    const claimed: ClaimedJob[] = [];
    for (const row of asRows<{ id: string }>(picked)) {
      const token = randomUUID();
      const until = new Date(Date.now() + leaseSeconds * 1000);
      const updated = await tx
        .update(notificationJobs)
        .set({
          status: "leased",
          leaseToken: token,
          leasedUntil: until,
          attempts: sql`${notificationJobs.attempts} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(notificationJobs.id, row.id))
        .returning();
      const job = updated[0];
      if (!job) continue;
      const payload = parsePayload(job.payload, job.inquiryId);
      if (!payload || (job.channel !== "email" && job.channel !== "webhook")) {
        await tx
          .update(notificationJobs)
          .set({
            status: "failed",
            leaseToken: null,
            leasedUntil: null,
            lastError: "The notification payload is invalid.",
            updatedAt: new Date(),
          })
          .where(eq(notificationJobs.id, job.id));
        continue;
      }
      claimed.push({
        id: job.id,
        inquiryId: job.inquiryId,
        channel: job.channel,
        idempotencyKey: job.idempotencyKey,
        attempts: job.attempts,
        maxAttempts: job.maxAttempts,
        leaseToken: token,
        payload,
      });
    }
    return claimed;
  });
}

export async function completeJob(database: CrmDb, job: ClaimedJob): Promise<boolean> {
  const updated = await database.db
    .update(notificationJobs)
    .set({
      status: "succeeded",
      leaseToken: null,
      leasedUntil: null,
      lastError: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notificationJobs.id, job.id),
        eq(notificationJobs.leaseToken, job.leaseToken),
        eq(notificationJobs.status, "leased"),
        sql`${notificationJobs.leasedUntil} > now()`,
      ),
    )
    .returning({ id: notificationJobs.id });
  return updated.length === 1;
}

export async function failJob(database: CrmDb, job: ClaimedJob, message: string): Promise<boolean> {
  const exhausted = job.attempts >= job.maxAttempts;
  const updated = await database.db
    .update(notificationJobs)
    .set({
      status: exhausted ? "failed" : "pending",
      nextAttemptAt: new Date(Date.now() + (exhausted ? 0 : backoffMs(job.attempts))),
      leaseToken: null,
      leasedUntil: null,
      lastError: message.replace(/[\r\n]+/g, " ").slice(0, 200),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notificationJobs.id, job.id),
        eq(notificationJobs.leaseToken, job.leaseToken),
        eq(notificationJobs.status, "leased"),
      ),
    )
    .returning({ id: notificationJobs.id });
  return updated.length === 1;
}

export async function releaseUnconfigured(database: CrmDb, job: ClaimedJob): Promise<void> {
  await database.db
    .update(notificationJobs)
    .set({
      status: "pending",
      attempts: sql`GREATEST(${notificationJobs.attempts} - 1, 0)`,
      nextAttemptAt: new Date(Date.now() + 15 * 60 * 1000),
      leaseToken: null,
      leasedUntil: null,
      lastError: "Channel is not configured.",
      updatedAt: new Date(),
    })
    .where(
      and(eq(notificationJobs.id, job.id), eq(notificationJobs.leaseToken, job.leaseToken)),
    );
}

export async function processJob(
  database: CrmDb,
  job: ClaimedJob,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  try {
    const result =
      job.channel === "email"
        ? await sendAuditEmail(job.payload, {
            idempotencyKey: job.idempotencyKey,
            fetchImpl,
          })
        : await sendAuditWebhook(job.payload, { eventId: job.idempotencyKey, fetchImpl });
    if (result.unconfigured) {
      await releaseUnconfigured(database, job);
      return;
    }
    if (result.ok) {
      const saved = await completeJob(database, job);
      if (!saved) console.error(`notification lease lost channel=${job.channel}`);
      return;
    }
    await failJob(database, job, `provider status ${result.status}`);
  } catch (err) {
    logSafe("notification send", err);
    await failJob(database, job, "provider request failed");
  }
}

export async function runDueJobs(
  database: CrmDb,
  options?: {
    fetchImpl?: typeof fetch;
    channels?: DeliveryChannel[];
    limit?: number;
    leaseSeconds?: number;
  },
): Promise<number> {
  const jobs = await claimJobs(database, {
    channels: options?.channels ?? [],
    limit: options?.limit,
    leaseSeconds: options?.leaseSeconds,
  });
  for (const job of jobs) {
    await processJob(database, job, options?.fetchImpl);
  }
  return jobs.length;
}

export async function retryFailedJob(
  database: CrmDb,
  jobId: string,
): Promise<{ ok: true; opportunityId: string | null } | { ok: false }> {
  return database.db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(notificationJobs)
      .where(and(eq(notificationJobs.id, jobId), eq(notificationJobs.status, "failed")))
      .limit(1);
    const job = rows[0];
    if (!job) return { ok: false };
    await tx
      .update(notificationJobs)
      .set({
        status: "pending",
        attempts: 0,
        maxAttempts: MAX_NOTIFICATION_ATTEMPTS,
        nextAttemptAt: new Date(),
        leaseToken: null,
        leasedUntil: null,
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(notificationJobs.id, job.id));
    const inquiry = await tx.execute<{ opportunity_id: string }>(sql`
      SELECT opportunity_id FROM inquiries WHERE id = ${job.inquiryId}
    `);
    const opportunityId = asRows<{ opportunity_id: string }>(inquiry)[0]?.opportunity_id ?? null;
    await tx.insert(activities).values({
      id: randomUUID(),
      opportunityId,
      companyId: null,
      contactId: null,
      kind: "notification",
      body: `Queued another ${job.channel} attempt. Delivery is at-least-once and may repeat.`,
      metadata: { channel: job.channel, jobId: job.id },
      createdAt: new Date(),
    });
    return { ok: true, opportunityId };
  });
}

export function parsePayload(value: unknown, inquiryId: string): ClaimedJob["payload"] | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const size = typeof record.size === "string" ? record.size : "";
  if (!companySizes.some((option) => option.value === size)) return null;
  const name = textField(record.name);
  const email = textField(record.email);
  const company = textField(record.company);
  const industry = textField(record.industry);
  const drains = textField(record.drains);
  if (!name || !email || !company || !industry || !drains) return null;
  return {
    inquiryId,
    name,
    email,
    company,
    industry,
    size: size as CompanySize,
    drains,
  };
}

function textField(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export async function expireLease(database: CrmDb, jobId: string): Promise<void> {
  await database.sql`
    UPDATE notification_jobs
    SET leased_until = now() - interval '1 minute'
    WHERE id = ${jobId}
  `;
}
