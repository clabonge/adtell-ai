import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "@/lib/crm/schema";

export type CrmDb = {
  db: PostgresJsDatabase<typeof schema>;
  sql: postgres.Sql;
  close: () => Promise<void>;
};

export class CrmUnavailableError extends Error {
  constructor() {
    super("CRM database is unavailable");
    this.name = "CrmUnavailableError";
  }
}

let singleton: CrmDb | null = null;

export function openDatabase(
  url: string,
  options?: { max?: number; connectTimeout?: number },
): CrmDb {
  const client = postgres(url, {
    max: options?.max ?? 10,
    prepare: false,
    connect_timeout: options?.connectTimeout ?? 10,
    idle_timeout: 20,
    connection: { application_name: "adtell-crm" },
    onnotice: () => undefined,
  });
  const db = drizzle(client, { schema });
  return {
    db,
    sql: client,
    async close() {
      await client.end({ timeout: 5 });
    },
  };
}

export function getCrmDatabase(): CrmDb {
  if (singleton) return singleton;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new CrmUnavailableError();
  singleton = openDatabase(url);
  return singleton;
}

export async function resetCrmDatabaseForTests(): Promise<void> {
  const current = singleton;
  singleton = null;
  if (current) await current.close();
}

export function migrationsDirectory(): string {
  return join(process.cwd(), "db", "migrations");
}

export async function applyMigrations(database: CrmDb): Promise<string[]> {
  // The web build and the worker pre-deploy can migrate at the same time.
  // Hold one session lock so the second caller waits, then sees the version row.
  const reserved = await database.sql.reserve();
  try {
    await reserved`SELECT pg_advisory_lock(842019, 44)`;
    try {
      await database.sql`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version text PRIMARY KEY,
          applied_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      const files = readdirSync(migrationsDirectory())
        .filter((file) => file.endsWith(".sql"))
        .sort();
      const applied: string[] = [];
      for (const file of files) {
        const version = file.replace(/\.sql$/, "");
        const existing = await database.sql<{ version: string }[]>`
          SELECT version FROM schema_migrations WHERE version = ${version}
        `;
        if (existing.length > 0) continue;
        const body = readFileSync(join(migrationsDirectory(), file), "utf8");
        await database.sql.begin(async (tx) => {
          await tx.unsafe(body);
          await tx`INSERT INTO schema_migrations (version) VALUES (${version})`;
        });
        applied.push(version);
      }
      return applied;
    } finally {
      await reserved`SELECT pg_advisory_unlock(842019, 44)`;
    }
  } finally {
    reserved.release();
  }
}

export async function pingDatabase(database: CrmDb): Promise<void> {
  await database.db.execute(sql`select 1`);
}
