import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { parseCsv } from "@/lib/crm/csv";
import {
  IMPORT_COLUMNS,
  type ImportColumn,
  type Origin,
  type VerificationStatus,
} from "@/lib/crm/constants";
import type { CrmDb } from "@/lib/crm/db";
import { asRows } from "@/lib/crm/rate-limit";
import { activities, companies, contacts, importBatches, importRows, opportunities } from "@/lib/crm/schema";
import {
  blankToNull,
  domainFromWebsite,
  emailKey,
  importFingerprint,
  isIsoDate,
  nameKey,
  sha256,
} from "@/lib/crm/text";

const MAX_BYTES = 1_000_000;
const MAX_ROWS = 500;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ImportFields = Record<ImportColumn, string | null> & { origin: Origin };

export type PlannedRow = {
  rowNumber: number;
  fingerprint: string;
  status: "ready" | "error" | "created" | "skipped";
  message: string | null;
  suggestion: string | null;
  fields: ImportFields | null;
};

export async function previewImport(
  database: CrmDb,
  input: { filename: string; csv: string },
): Promise<{ ok: true; batchId: string; rows: PlannedRow[] } | { ok: false; error: string }> {
  if (Buffer.byteLength(input.csv) > MAX_BYTES) {
    return { ok: false, error: "The file is larger than 1 MB." };
  }
  let table: string[][];
  try {
    table = parseCsv(input.csv);
  } catch {
    return { ok: false, error: "The CSV could not be read." };
  }
  if (table.length === 0) return { ok: false, error: "The file is empty." };
  const headerError = headerProblem(table[0]);
  if (headerError) return { ok: false, error: headerError };
  const data = table.slice(1);
  if (data.length === 0) return { ok: false, error: "The file has no data rows." };
  if (data.length > MAX_ROWS) return { ok: false, error: "Use 500 data rows or fewer." };

  const contentHash = sha256(input.csv);
  const existing = await database.db
    .select()
    .from(importBatches)
    .where(eq(importBatches.contentHash, contentHash))
    .limit(1);
  if (existing[0]?.status === "confirmed") {
    return { ok: true, batchId: existing[0].id, rows: await loadStoredRows(database, existing[0].id) };
  }

  const planned = await Promise.all(data.map((cells, index) => planRow(database, index + 2, cells)));
  const batchId = existing[0]?.id ?? randomUUID();
  await database.db.transaction(async (tx) => {
    if (!existing[0]) {
      await tx.insert(importBatches).values({
        id: batchId,
        contentHash,
        filename: safeFilename(input.filename),
        status: "previewed",
        rowCount: planned.length,
        createdCount: 0,
        skippedCount: 0,
        errorCount: planned.filter((row) => row.status === "error").length,
        createdAt: new Date(),
        confirmedAt: null,
      });
    } else {
      await tx
        .update(importBatches)
        .set({
          filename: safeFilename(input.filename),
          rowCount: planned.length,
          errorCount: planned.filter((row) => row.status === "error").length,
          createdCount: 0,
          skippedCount: 0,
        })
        .where(eq(importBatches.id, batchId));
      await tx.delete(importRows).where(eq(importRows.batchId, batchId));
    }
    if (planned.length > 0) {
      await tx.insert(importRows).values(
        planned.map((row) => ({
          id: randomUUID(),
          batchId,
          rowNumber: row.rowNumber,
          fingerprint: row.fingerprint,
          status: row.status,
          message: row.message,
          suggestion: row.suggestion,
          raw: row.fields ?? {},
          companyId: null,
          contactId: null,
          opportunityId: null,
        })),
      );
    }
  });
  return { ok: true, batchId, rows: planned };
}

export async function confirmImport(
  database: CrmDb,
  batchId: string,
): Promise<{ ok: true; created: number; skipped: number; errors: number } | { ok: false; error: string }> {
  return database.db.transaction(async (tx) => {
    const batches = await tx
      .select()
      .from(importBatches)
      .where(eq(importBatches.id, batchId))
      .limit(1);
    const batch = batches[0];
    if (!batch) return { ok: false, error: "That import was not found." };
    if (batch.status === "confirmed") {
      return {
        ok: true,
        created: batch.createdCount,
        skipped: batch.skippedCount,
        errors: batch.errorCount,
      };
    }
    const rows = await tx.select().from(importRows).where(eq(importRows.batchId, batchId));
    let created = 0;
    let skipped = 0;
    let errors = 0;
    for (const row of rows) {
      if (row.status === "error") {
        errors += 1;
        continue;
      }
      const fields = row.raw as ImportFields;
      if (!fields?.company || !fields.contact_name || (fields.origin !== "research" && fields.origin !== "owner")) {
        errors += 1;
        await tx
          .update(importRows)
          .set({ status: "error", message: "The row is missing a company or contact." })
          .where(eq(importRows.id, row.id));
        continue;
      }
      const already = await tx.execute<{ id: string }>(sql`
        SELECT id FROM import_rows
        WHERE fingerprint = ${row.fingerprint} AND status = 'created'
        LIMIT 1
      `);
      const prior = asRows<{ id: string }>(already);
      if (prior.length > 0) {
        skipped += 1;
        await tx
          .update(importRows)
          .set({ status: "skipped", message: "Already imported. No duplicate was saved." })
          .where(eq(importRows.id, row.id));
        continue;
      }
      const decision = await assess(tx, fields);
      if (decision.status === "error") {
        errors += 1;
        await tx
          .update(importRows)
          .set({ status: "error", message: decision.message, suggestion: decision.suggestion })
          .where(eq(importRows.id, row.id));
        continue;
      }
      const saved = await applyRow(tx, fields, decision, batch.id, row.rowNumber);
      created += 1;
      await tx
        .update(importRows)
        .set({
          status: "created",
          message: "Saved. No email was sent and marketing consent was not granted.",
          companyId: saved.companyId,
          contactId: saved.contactId,
          opportunityId: saved.opportunityId,
        })
        .where(eq(importRows.id, row.id));
    }
    await tx
      .update(importBatches)
      .set({
        status: "confirmed",
        createdCount: created,
        skippedCount: skipped,
        errorCount: errors,
        confirmedAt: new Date(),
      })
      .where(eq(importBatches.id, batchId));
    return { ok: true, created, skipped, errors };
  });
}

async function loadStoredRows(database: CrmDb, batchId: string): Promise<PlannedRow[]> {
  const rows = await database.db
    .select()
    .from(importRows)
    .where(eq(importRows.batchId, batchId));
  return rows
    .sort((a, b) => a.rowNumber - b.rowNumber)
    .map((row) => ({
      rowNumber: row.rowNumber,
      fingerprint: row.fingerprint,
      status: row.status as PlannedRow["status"],
      message: row.message,
      suggestion: row.suggestion,
      fields: (row.raw as ImportFields | null) ?? null,
    }));
}

function headerProblem(header: string[]): string | null {
  const names = header.map((cell) => cell.trim().toLowerCase());
  if (names.length !== IMPORT_COLUMNS.length || names.some((name, index) => name !== IMPORT_COLUMNS[index])) {
    return `Use the template columns: ${IMPORT_COLUMNS.join(", ")}.`;
  }
  return null;
}

async function planRow(database: CrmDb, rowNumber: number, cells: string[]): Promise<PlannedRow> {
  if (cells.length !== IMPORT_COLUMNS.length) {
    return {
      rowNumber,
      fingerprint: sha256(`bad-width:${rowNumber}:${cells.join("|")}`),
      status: "error",
      message: `Row ${rowNumber} has ${cells.length} columns.`,
      suggestion: null,
      fields: null,
    };
  }
  const parsed = parseFields(cells);
  if (!parsed.ok) {
    return {
      rowNumber,
      fingerprint: sha256(`invalid:${rowNumber}:${cells.join("|")}`),
      status: "error",
      message: parsed.error,
      suggestion: null,
      fields: null,
    };
  }
  const decision = await assess(database.db, parsed.fields);
  return {
    rowNumber,
    fingerprint: importFingerprint(parsed.fields),
    status: decision.status,
    message: decision.message,
    suggestion: decision.suggestion,
    fields: parsed.fields,
  };
}

function parseFields(cells: string[]): { ok: true; fields: ImportFields } | { ok: false; error: string } {
  const record = Object.fromEntries(
    IMPORT_COLUMNS.map((column, index) => [column, blankToNull(cells[index] ?? "")]),
  ) as Record<ImportColumn, string | null>;
  if (!record.company || record.company.length > 200) return { ok: false, error: "Company is required (200 characters or fewer)." };
  if (!record.contact_name || record.contact_name.length > 120) {
    return { ok: false, error: "Contact name is required (120 characters or fewer)." };
  }
  if (record.website && !isHttpUrl(record.website)) return { ok: false, error: "Website must be an http or https URL." };
  if (record.source_url && !isHttpUrl(record.source_url)) return { ok: false, error: "Source URL must be an http or https URL." };
  if (record.email && (record.email.length > 200 || !EMAIL.test(record.email))) {
    return { ok: false, error: "Email must be a valid address or blank." };
  }
  if (record.research_date && !isIsoDate(record.research_date)) {
    return { ok: false, error: "Research date must be YYYY-MM-DD or blank." };
  }
  if ((record.industry?.length ?? 0) > 200 || (record.location?.length ?? 0) > 200) {
    return { ok: false, error: "Industry and location must be 200 characters or fewer." };
  }
  if ((record.contact_title?.length ?? 0) > 120) return { ok: false, error: "Title must be 120 characters or fewer." };
  if ((record.fit_notes?.length ?? 0) > 4000) return { ok: false, error: "Fit notes must be 4,000 characters or fewer." };
  if ((record.next_action?.length ?? 0) > 500) return { ok: false, error: "Next action must be 500 characters or fewer." };
  const verification = (record.verification_status ?? "unknown") as VerificationStatus;
  if (!["unknown", "unverified", "verified"].includes(verification)) {
    return { ok: false, error: "Verification status must be unknown, unverified, verified, or blank." };
  }
  const origin = (record.origin ?? "research") as Origin;
  if (origin !== "research" && origin !== "owner") {
    return { ok: false, error: "Origin must be research, owner, or blank. Inbound inquiries use the audit form." };
  }
  return {
    ok: true,
    fields: { ...record, verification_status: verification, origin },
  };
}

type Decision =
  | {
      status: "ready";
      message: string | null;
      suggestion: string | null;
      companyId: string | null;
      contactId: string | null;
      fillCompany: boolean;
    }
  | { status: "error"; message: string; suggestion: string | null };

type QueryDb = CrmDb["db"] | Parameters<Parameters<CrmDb["db"]["transaction"]>[0]>[0];

async function assess(db: QueryDb, fields: ImportFields): Promise<Decision> {
  const key = emailKey(fields.email);
  const companyMatches = await db
    .select()
    .from(companies)
    .where(eq(companies.nameKey, nameKey(fields.company ?? "")));
  const domain = domainFromWebsite(fields.website);
  const domainMatches = domain
    ? await db.select().from(companies).where(eq(companies.domain, domain))
    : [];

  if (key) {
    const found = await db.select().from(contacts).where(eq(contacts.emailKey, key)).limit(1);
    const contact = found[0];
    if (contact) {
      const company = await db.select().from(companies).where(eq(companies.id, contact.companyId)).limit(1);
      const current = company[0];
      if (!current || nameKey(current.name) !== nameKey(fields.company ?? "")) {
        return {
          status: "error",
          message: "This email is already on a different company. It was not merged.",
          suggestion: current ? `Existing company: ${current.name}` : null,
        };
      }
      const conflict = verifiedConflict(contact, current, fields);
      if (conflict) {
        return {
          status: "error",
          message: "This matches a verified contact. Verified details were not changed.",
          suggestion: `Existing contact: ${contact.name}`,
        };
      }
      const openConflict = await notesConflict(db, contact.id, fields.fit_notes);
      if (openConflict) return openConflict;
      return {
        status: "ready",
        message: "Matches an existing contact. Only blank fields are filled.",
        suggestion: `Existing contact: ${contact.name}`,
        companyId: current.id,
        contactId: contact.id,
        fillCompany: true,
      };
    }
  }

  if (companyMatches.length > 1) {
    return {
      status: "error",
      message: "More than one company matches this name. The row was not merged.",
      suggestion: "Add a website or email that identifies one company.",
    };
  }
  if (domain && domainMatches.length > 1) {
    return {
      status: "error",
      message: "More than one company matches this website. The row was not merged.",
      suggestion: null,
    };
  }
  if (companyMatches.length === 1 && domainMatches.length === 1 && companyMatches[0].id !== domainMatches[0].id) {
    return {
      status: "error",
      message: "The company name and website point at different records. The row was not merged.",
      suggestion: `Name matches ${companyMatches[0].name}. Website matches ${domainMatches[0].name}.`,
    };
  }
  if (companyMatches.length === 1) {
    const company = companyMatches[0];
    if (domain && company.domain && company.domain !== domain) {
      return {
        status: "error",
        message: "This company already has a different website. It was not overwritten.",
        suggestion: company.website,
      };
    }
    if (!key) {
      const named = await db
        .select()
        .from(contacts)
        .where(and(eq(contacts.companyId, company.id), eq(contacts.name, fields.contact_name ?? "")));
      if (named.length > 0) {
        return {
          status: "error",
          message: "A contact with this name already exists and the row has no email. It was not merged.",
          suggestion: null,
        };
      }
    }
    return {
      status: "ready",
      message: "Matches an existing company. A contact is added only when it is not ambiguous.",
      suggestion: `Existing company: ${company.name}`,
      companyId: company.id,
      contactId: null,
      fillCompany: true,
    };
  }
  if (domainMatches.length === 1 && companyMatches.length === 0) {
    return {
      status: "error",
      message: "The website matches a company with a different name. The row was not merged.",
      suggestion: `Website matches ${domainMatches[0].name}.`,
    };
  }
  return {
    status: "ready",
    message: null,
    suggestion: null,
    companyId: null,
    contactId: null,
    fillCompany: false,
  };
}

function verifiedConflict(
  contact: typeof contacts.$inferSelect,
  company: typeof companies.$inferSelect,
  fields: ImportFields,
): boolean {
  if (contact.verificationStatus !== "verified" && company) {
    if (contact.name && fields.contact_name && nameKey(contact.name) !== nameKey(fields.contact_name)) return true;
    if (contact.role && fields.contact_title && contact.role !== fields.contact_title) return true;
    return false;
  }
  if (contact.verificationStatus !== "verified") return false;
  if (fields.contact_name && nameKey(contact.name) !== nameKey(fields.contact_name)) return true;
  if (fields.contact_title && contact.role && contact.role !== fields.contact_title) return true;
  if (fields.industry && company.industry && company.industry !== fields.industry) return true;
  if (fields.location && company.location && company.location !== fields.location) return true;
  if (fields.website && company.website && company.website !== fields.website) return true;
  return false;
}

async function notesConflict(db: QueryDb, contactId: string, fitNotes: string | null): Promise<Decision | null> {
  if (!fitNotes) return null;
  const open = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.contactId, contactId));
  const current = open.find((item) => item.stage !== "won" && item.stage !== "lost" && item.ownerNotes);
  if (current && current.ownerNotes && current.ownerNotes !== fitNotes) {
    return {
      status: "error",
      message: "An open opportunity already has notes. They were not overwritten.",
      suggestion: null,
    };
  }
  return null;
}

async function applyRow(
  tx: Parameters<Parameters<CrmDb["db"]["transaction"]>[0]>[0],
  fields: ImportFields,
  decision: Extract<Decision, { status: "ready" }>,
  batchId: string,
  rowNumber: number,
): Promise<{ companyId: string; contactId: string; opportunityId: string }> {
  const now = new Date();
  let companyId = decision.companyId;
  if (!companyId) {
    companyId = randomUUID();
    await tx.insert(companies).values({
      id: companyId,
      name: fields.company ?? "",
      nameKey: nameKey(fields.company ?? ""),
      website: fields.website,
      domain: domainFromWebsite(fields.website),
      industry: fields.industry,
      location: fields.location,
      createdAt: now,
      updatedAt: now,
    });
  } else if (decision.fillCompany) {
    const current = await tx.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    const company = current[0];
    if (company) {
      await tx
        .update(companies)
        .set({
          website: company.website ?? fields.website,
          domain: company.domain ?? domainFromWebsite(fields.website),
          industry: company.industry ?? fields.industry,
          location: company.location ?? fields.location,
          updatedAt: now,
        })
        .where(eq(companies.id, companyId));
    }
  }

  let contactId = decision.contactId;
  if (!contactId && fields.email) {
    const key = emailKey(fields.email);
    const found = key
      ? await tx.select().from(contacts).where(and(eq(contacts.emailKey, key), eq(contacts.companyId, companyId))).limit(1)
      : [];
    contactId = found[0]?.id ?? null;
  }
  if (!contactId) {
    contactId = randomUUID();
    await tx.insert(contacts).values({
      id: contactId,
      companyId,
      name: fields.contact_name ?? "",
      role: fields.contact_title,
      email: emailKey(fields.email),
      emailKey: emailKey(fields.email),
      phone: null,
      origin: fields.origin,
      verificationStatus: fields.verification_status || "unknown",
      sourceUrl: fields.source_url,
      sourceReference: `import ${batchId} row ${rowNumber}`,
      researchedOn: fields.research_date,
      marketingConsent: false,
      consentEvidence: null,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    const current = await tx.select().from(contacts).where(eq(contacts.id, contactId)).limit(1);
    const contact = current[0];
    if (contact && contact.verificationStatus !== "verified") {
      await tx
        .update(contacts)
        .set({
          role: contact.role ?? fields.contact_title,
          sourceUrl: contact.sourceUrl ?? fields.source_url,
          researchedOn: contact.researchedOn ?? fields.research_date,
          verificationStatus: nextVerification(contact.verificationStatus, fields.verification_status),
          updatedAt: now,
        })
        .where(eq(contacts.id, contactId));
    }
  }

  const existingOpps = await tx.select().from(opportunities).where(eq(opportunities.contactId, contactId));
  const open = existingOpps.find((item) => item.stage !== "won" && item.stage !== "lost");
  let opportunityId = open?.id ?? null;
  if (!opportunityId) {
    opportunityId = randomUUID();
    await tx.insert(opportunities).values({
      id: opportunityId,
      companyId,
      contactId,
      origin: fields.origin,
      stage: "researched",
      priority: "normal",
      estimatedValueCents: null,
      nextAction: fields.next_action,
      nextActionOn: null,
      ownerNotes: fields.fit_notes,
      sourceUrl: fields.source_url,
      sourceReference: `import ${batchId} row ${rowNumber}`,
      researchedOn: fields.research_date,
      verificationStatus: fields.verification_status || "unknown",
      createdAt: now,
      updatedAt: now,
    });
  } else if (open && !open.ownerNotes && fields.fit_notes) {
    await tx
      .update(opportunities)
      .set({
        ownerNotes: fields.fit_notes,
        nextAction: open.nextAction ?? fields.next_action,
        updatedAt: now,
      })
      .where(eq(opportunities.id, opportunityId));
  }
  await tx.insert(activities).values({
    id: randomUUID(),
    opportunityId,
    companyId,
    contactId,
    kind: "import",
    body: "Imported from a research file. No email was sent. Marketing consent was not granted.",
    metadata: { batchId, rowNumber },
    createdAt: now,
  });
  return { companyId, contactId, opportunityId };
}

function nextVerification(current: string, incoming: string | null): string {
  if (current === "verified") return current;
  if (incoming === "verified") return incoming;
  if (current === "unknown" && incoming) return incoming;
  return current;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function safeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "import.csv";
  return base.replace(/[^\w.\- ]+/g, "").slice(0, 200) || "import.csv";
}

export function templateCsv(): string {
  return `${IMPORT_COLUMNS.join(",")}\n`;
}
