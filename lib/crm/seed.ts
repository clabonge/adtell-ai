import { randomUUID } from "node:crypto";
import type { CrmDb } from "@/lib/crm/db";
import { activities, companies, contacts, opportunities } from "@/lib/crm/schema";

export function assertDemoSeedAllowed(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== "development" || env.CRM_SEED_DEMO !== "1") {
    throw new Error("Refusing to seed. Set NODE_ENV=development and CRM_SEED_DEMO=1.");
  }
  const host = databaseHost(env.DATABASE_URL?.trim() ?? "");
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error("Refusing to seed a database that is not on localhost.");
  }
}

export async function seedSyntheticDemo(database: CrmDb): Promise<void> {
  const now = new Date();
  const companyId = randomUUID();
  const contactId = randomUUID();
  const opportunityId = randomUUID();
  await database.db.transaction(async (tx) => {
    await tx.insert(companies).values({
      id: companyId,
      name: "SYNTHETIC Example Company",
      nameKey: "synthetic example company",
      website: "https://example.com",
      domain: "example.com",
      industry: "Synthetic",
      location: null,
      createdAt: now,
      updatedAt: now,
    });
    await tx.insert(contacts).values({
      id: contactId,
      companyId,
      name: "SYNTHETIC Example Person",
      role: null,
      email: "synthetic.example@example.com",
      emailKey: "synthetic.example@example.com",
      phone: null,
      origin: "research",
      verificationStatus: "unknown",
      sourceUrl: "https://example.com/synthetic",
      sourceReference: "synthetic development seed",
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
      origin: "research",
      stage: "researched",
      priority: "normal",
      estimatedValueCents: null,
      nextAction: null,
      nextActionOn: null,
      ownerNotes: "SYNTHETIC development data. Not a real prospect.",
      sourceUrl: "https://example.com/synthetic",
      sourceReference: "synthetic development seed",
      researchedOn: null,
      verificationStatus: "unknown",
      createdAt: now,
      updatedAt: now,
    });
    await tx.insert(activities).values({
      id: randomUUID(),
      opportunityId,
      companyId,
      contactId,
      kind: "import",
      body: "SYNTHETIC development data. Not a real prospect. No email was sent.",
      metadata: { synthetic: true },
      createdAt: now,
    });
  });
}

function databaseHost(url: string): string {
  try {
    return new URL(url.replace(/^postgres(ql)?:/, "http:")).hostname;
  } catch {
    return "";
  }
}
