import { randomUUID } from "node:crypto";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import {
  OPEN_STAGES,
  OWNER_TIME_ZONE,
  PRIORITIES,
  STAGES,
  type Origin,
  type Priority,
  type Stage,
} from "@/lib/crm/constants";
import type { CrmDb } from "@/lib/crm/db";
import { activities, companies, contacts, inquiries, opportunities } from "@/lib/crm/schema";
import {
  blankToNull,
  centsFromDollars,
  domainFromWebsite,
  emailKey,
  escapeLike,
  isIsoDate,
  isUuid,
  nameKey,
} from "@/lib/crm/text";
import { asRows } from "@/lib/crm/rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ListFilters = {
  company?: string;
  origin?: string;
  stage?: string;
  followUp?: string;
};

export async function listOpportunities(database: CrmDb, filters: ListFilters) {
  const company = (filters.company ?? "").trim().slice(0, 200);
  const origin = filters.origin && ["inbound", "owner", "research"].includes(filters.origin) ? filters.origin : "";
  const stage = filters.stage && (STAGES as readonly string[]).includes(filters.stage) ? filters.stage : "";
  const followUp = filters.followUp && isIsoDate(filters.followUp) ? filters.followUp : "";
  const conditions = [];
  if (company) conditions.push(ilike(companies.name, `%${escapeLike(company)}%`));
  if (origin) conditions.push(eq(opportunities.origin, origin));
  if (stage) conditions.push(eq(opportunities.stage, stage));
  if (followUp) conditions.push(sql`${opportunities.nextActionOn} <= ${followUp}`);
  const rows = await database.db
    .select({
      id: opportunities.id,
      stage: opportunities.stage,
      origin: opportunities.origin,
      priority: opportunities.priority,
      estimatedValueCents: opportunities.estimatedValueCents,
      nextAction: opportunities.nextAction,
      nextActionOn: opportunities.nextActionOn,
      companyName: companies.name,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(opportunities.updatedAt))
    .limit(200);
  return rows;
}

export async function listOverdue(database: CrmDb) {
  return database.db
    .select({
      id: opportunities.id,
      nextAction: opportunities.nextAction,
      nextActionOn: opportunities.nextActionOn,
      companyName: companies.name,
      stage: opportunities.stage,
    })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .where(
      and(
        sql`${opportunities.nextActionOn} < (now() AT TIME ZONE ${OWNER_TIME_ZONE})::date`,
        inArray(opportunities.stage, OPEN_STAGES),
      ),
    )
    .orderBy(opportunities.nextActionOn)
    .limit(50);
}

export async function report(database: CrmDb) {
  const byOrigin = await database.db.execute<{ origin: string; count: number }>(sql`
    SELECT origin, count(*)::int AS count FROM opportunities GROUP BY origin
  `);
  const byStage = await database.db.execute<{ stage: string; count: number }>(sql`
    SELECT stage, count(*)::int AS count FROM opportunities GROUP BY stage
  `);
  const reached = await database.db.execute<{ stage: string; count: number }>(sql`
    SELECT metadata->>'to' AS stage, count(DISTINCT opportunity_id)::int AS count
    FROM activities
    WHERE kind = 'stage_change' AND metadata->>'to' IN ('audit_booked', 'proposal_sent', 'won')
    GROUP BY metadata->>'to'
  `);
  const value = await database.db.execute<{
    open_cents: number | null;
    won_cents: number | null;
    missing_estimates: number;
  }>(sql`
    SELECT
      COALESCE(sum(estimated_value_cents) FILTER (WHERE stage NOT IN ('won', 'lost')), 0)::int AS open_cents,
      COALESCE(sum(estimated_value_cents) FILTER (WHERE stage = 'won'), 0)::int AS won_cents,
      count(*) FILTER (WHERE estimated_value_cents IS NULL AND stage NOT IN ('lost'))::int AS missing_estimates
    FROM opportunities
  `);
  const valueRow = asRows<{
    open_cents: number | null;
    won_cents: number | null;
    missing_estimates: number;
  }>(value)[0];
  return {
    byOrigin: asRows<{ origin: string; count: number }>(byOrigin),
    byStage: asRows<{ stage: string; count: number }>(byStage),
    reached: asRows<{ stage: string; count: number }>(reached),
    openCents: Number(valueRow?.open_cents ?? 0),
    wonCents: Number(valueRow?.won_cents ?? 0),
    missingEstimates: Number(valueRow?.missing_estimates ?? 0),
  };
}

export async function getOpportunity(database: CrmDb, id: string) {
  if (!isUuid(id)) return null;
  const rows = await database.db
    .select({
      opportunity: opportunities,
      company: companies,
      contact: contacts,
    })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .where(eq(opportunities.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const history = await database.db
    .select()
    .from(inquiries)
    .where(eq(inquiries.companyId, row.company.id))
    .orderBy(desc(inquiries.submittedAt));
  const timeline = await database.db
    .select()
    .from(activities)
    .where(eq(activities.opportunityId, id))
    .orderBy(desc(activities.createdAt));
  const jobs = row.opportunity.id
    ? await database.db.execute<{
        id: string;
        channel: string;
        status: string;
        attempts: number;
        last_error: string | null;
      }>(sql`
        SELECT notification_jobs.id, channel, status, attempts, last_error
        FROM notification_jobs
        INNER JOIN inquiries ON inquiries.id = notification_jobs.inquiry_id
        WHERE inquiries.opportunity_id = ${id}
        ORDER BY notification_jobs.created_at
      `)
    : [];
  return {
    ...row,
    inquiries: history,
    activities: timeline,
    jobs: asRows<{
      id: string;
      channel: string;
      status: string;
      attempts: number;
      last_error: string | null;
    }>(jobs),
  };
}

export async function listFailedJobs(database: CrmDb) {
  return database.db.execute<{
    id: string;
    channel: string;
    attempts: number;
    last_error: string | null;
    company_name: string;
    opportunity_id: string;
  }>(sql`
    SELECT notification_jobs.id, notification_jobs.channel, notification_jobs.attempts,
           notification_jobs.last_error, companies.name AS company_name, opportunities.id AS opportunity_id
    FROM notification_jobs
    INNER JOIN inquiries ON inquiries.id = notification_jobs.inquiry_id
    INNER JOIN opportunities ON opportunities.id = inquiries.opportunity_id
    INNER JOIN companies ON companies.id = opportunities.company_id
    WHERE notification_jobs.status = 'failed'
    ORDER BY notification_jobs.updated_at DESC
    LIMIT 100
  `).then((result) => asRows<{
    id: string;
    channel: string;
    attempts: number;
    last_error: string | null;
    company_name: string;
    opportunity_id: string;
  }>(result));
}

export async function updateOpportunity(
  database: CrmDb,
  id: string,
  input: {
    stage: string;
    priority: string;
    estimated: string;
    nextAction: string;
    nextActionOn: string;
    ownerNotes: string;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(id)) return { ok: false, error: "That opportunity was not found." };
  if (!(STAGES as readonly string[]).includes(input.stage)) return { ok: false, error: "Choose a stage." };
  if (!(PRIORITIES as readonly string[]).includes(input.priority)) return { ok: false, error: "Choose a priority." };
  const money = centsFromDollars(input.estimated);
  if (!money.ok) return { ok: false, error: "Enter the estimate in dollars, or leave it blank." };
  const nextAction = blankToNull(input.nextAction);
  if (nextAction && nextAction.length > 500) return { ok: false, error: "Next action must be 500 characters or fewer." };
  const nextActionOn = blankToNull(input.nextActionOn);
  if (nextActionOn && !isIsoDate(nextActionOn)) return { ok: false, error: "Use a follow-up date as YYYY-MM-DD." };
  const ownerNotes = blankToNull(input.ownerNotes);
  if (ownerNotes && ownerNotes.length > 4000) return { ok: false, error: "Notes must be 4,000 characters or fewer." };
  const current = await database.db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
  const opportunity = current[0];
  if (!opportunity) return { ok: false, error: "That opportunity was not found." };
  const now = new Date();
  await database.db.transaction(async (tx) => {
    await tx
      .update(opportunities)
      .set({
        stage: input.stage,
        priority: input.priority,
        estimatedValueCents: money.cents,
        nextAction,
        nextActionOn,
        ownerNotes,
        updatedAt: now,
      })
      .where(eq(opportunities.id, id));
    if (opportunity.stage !== input.stage) {
      await tx.insert(activities).values({
        id: randomUUID(),
        opportunityId: id,
        companyId: opportunity.companyId,
        contactId: opportunity.contactId,
        kind: "stage_change",
        body: `Stage changed from ${opportunity.stage} to ${input.stage}.`,
        metadata: { from: opportunity.stage, to: input.stage },
        createdAt: now,
      });
    }
    if (opportunity.nextAction !== nextAction || opportunity.nextActionOn !== nextActionOn) {
      await tx.insert(activities).values({
        id: randomUUID(),
        opportunityId: id,
        companyId: opportunity.companyId,
        contactId: opportunity.contactId,
        kind: "follow_up",
        body: nextAction ? `Next action: ${nextAction}` : "Cleared the next action.",
        metadata: { nextActionOn },
        createdAt: now,
      });
    }
    if ((opportunity.ownerNotes ?? "") !== (ownerNotes ?? "")) {
      await tx.insert(activities).values({
        id: randomUUID(),
        opportunityId: id,
        companyId: opportunity.companyId,
        contactId: opportunity.contactId,
        kind: "note",
        body: ownerNotes ? `Owner notes: ${ownerNotes}` : "Cleared owner notes.",
        metadata: {},
        createdAt: now,
      });
    }
  });
  return { ok: true };
}

export async function addNote(database: CrmDb, id: string, body: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const note = body.trim();
  if (!note || note.length > 4000) return { ok: false, error: "Enter a note of 4,000 characters or fewer." };
  if (!isUuid(id)) return { ok: false, error: "That opportunity was not found." };
  const current = await database.db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
  const opportunity = current[0];
  if (!opportunity) return { ok: false, error: "That opportunity was not found." };
  await database.db.insert(activities).values({
    id: randomUUID(),
    opportunityId: id,
    companyId: opportunity.companyId,
    contactId: opportunity.contactId,
    kind: "note",
    body: note,
    metadata: {},
    createdAt: new Date(),
  });
  return { ok: true };
}

export async function setConsent(
  database: CrmDb,
  contactId: string,
  input: { consent: boolean; evidence: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(contactId)) return { ok: false, error: "That contact was not found." };
  const evidence = input.evidence.trim();
  if (input.consent && evidence.length < 8) {
    return { ok: false, error: "Record how consent was given. An inquiry or a public email is not consent." };
  }
  if (evidence.length > 2000) return { ok: false, error: "Consent evidence must be 2,000 characters or fewer." };
  const current = await database.db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1);
  const contact = current[0];
  if (!contact) return { ok: false, error: "That contact was not found." };
  await database.db.transaction(async (tx) => {
    await tx
      .update(contacts)
      .set({
        marketingConsent: input.consent,
        consentEvidence: evidence || null,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId));
    await tx.insert(activities).values({
      id: randomUUID(),
      opportunityId: null,
      companyId: contact.companyId,
      contactId: contact.id,
      kind: "note",
      body: input.consent
        ? `Marketing consent recorded. Evidence: ${evidence}`
        : "Marketing consent is not granted.",
      metadata: { marketingConsent: input.consent },
      createdAt: new Date(),
    });
  });
  return { ok: true };
}

export async function createOwnerRecord(
  database: CrmDb,
  input: {
    company: string;
    website: string;
    industry: string;
    location: string;
    contactName: string;
    role: string;
    email: string;
    phone: string;
    stage: string;
    nextAction: string;
    nextActionOn: string;
    notes: string;
  },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const companyName = input.company.trim();
  const contactName = input.contactName.trim();
  if (!companyName || companyName.length > 200) return { ok: false, error: "Enter a company name." };
  if (!contactName || contactName.length > 120) return { ok: false, error: "Enter a contact name." };
  const email = blankToNull(input.email);
  if (email && (email.length > 200 || !EMAIL.test(email))) return { ok: false, error: "Enter a valid email or leave it blank." };
  const website = blankToNull(input.website);
  if (website && !/^https?:\/\//i.test(website)) return { ok: false, error: "Website must start with http:// or https://." };
  const stage = (STAGES as readonly string[]).includes(input.stage) ? (input.stage as Stage) : "researched";
  const nextActionOn = blankToNull(input.nextActionOn);
  if (nextActionOn && !isIsoDate(nextActionOn)) return { ok: false, error: "Use a follow-up date as YYYY-MM-DD." };
  const notes = blankToNull(input.notes);
  if (notes && notes.length > 4000) return { ok: false, error: "Notes must be 4,000 characters or fewer." };
  const key = emailKey(email);
  if (key) {
    const existing = await database.db.select().from(contacts).where(eq(contacts.emailKey, key)).limit(1);
    if (existing[0]) {
      return { ok: false, error: "That email is already on a contact. Open that record instead of creating another." };
    }
  }
  const now = new Date();
  const companyId = randomUUID();
  const contactId = randomUUID();
  const opportunityId = randomUUID();
  await database.db.transaction(async (tx) => {
    await tx.insert(companies).values({
      id: companyId,
      name: companyName,
      nameKey: nameKey(companyName),
      website,
      domain: domainFromWebsite(website),
      industry: blankToNull(input.industry),
      location: blankToNull(input.location),
      createdAt: now,
      updatedAt: now,
    });
    await tx.insert(contacts).values({
      id: contactId,
      companyId,
      name: contactName,
      role: blankToNull(input.role),
      email: key,
      emailKey: key,
      phone: blankToNull(input.phone),
      origin: "owner" satisfies Origin,
      verificationStatus: email ? "unverified" : "unknown",
      sourceUrl: null,
      sourceReference: "owner entry",
      researchedOn: null,
      marketingConsent: false,
      consentEvidence: null,
      createdAt: now,
      updatedAt: now,
    });
    await tx.insert(opportunities).values({
      id: opportunityId,
      companyId,
      contactId,
      origin: "owner",
      stage,
      priority: "normal" satisfies Priority,
      estimatedValueCents: null,
      nextAction: blankToNull(input.nextAction),
      nextActionOn,
      ownerNotes: notes,
      sourceUrl: null,
      sourceReference: "owner entry",
      researchedOn: null,
      verificationStatus: email ? "unverified" : "unknown",
      createdAt: now,
      updatedAt: now,
    });
    await tx.insert(activities).values({
      id: randomUUID(),
      opportunityId,
      companyId,
      contactId,
      kind: "note",
      body: "Owner added this contact. Marketing consent was not granted.",
      metadata: { to: stage },
      createdAt: now,
    });
    await tx.insert(activities).values({
      id: randomUUID(),
      opportunityId,
      companyId,
      contactId,
      kind: "stage_change",
      body: `Opened at ${stage}.`,
      metadata: { from: null, to: stage },
      createdAt: now,
    });
  });
  return { ok: true, id: opportunityId };
}

export async function exportRows(database: CrmDb) {
  return database.db
    .select({
      company: companies.name,
      website: companies.website,
      industry: companies.industry,
      location: companies.location,
      contactName: contacts.name,
      contactTitle: contacts.role,
      email: contacts.email,
      origin: opportunities.origin,
      stage: opportunities.stage,
      priority: opportunities.priority,
      estimatedValueCents: opportunities.estimatedValueCents,
      nextAction: opportunities.nextAction,
      nextActionOn: opportunities.nextActionOn,
      verificationStatus: contacts.verificationStatus,
      marketingConsent: contacts.marketingConsent,
      sourceUrl: opportunities.sourceUrl,
      researchedOn: opportunities.researchedOn,
    })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .orderBy(companies.name);
}
