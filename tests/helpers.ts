import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { applyMigrations, openDatabase, type CrmDb } from "../lib/crm/db";

export type TestDatabase = {
  crm: CrmDb;
  url: string;
  dir: string | null;
  stop: () => Promise<void>;
};

export async function startTestDatabase(dir?: string): Promise<TestDatabase> {
  const pglite = dir ? new PGlite(dir) : new PGlite();
  const server = new PGLiteSocketServer({
    db: pglite,
    port: 0,
    host: "127.0.0.1",
    maxConnections: 8,
  });
  await server.start();
  const url = `postgres://postgres:postgres@${server.getServerConn()}/postgres`;
  const crm = openDatabase(url, {
    max: 4,
    connectTimeout: 10,
  });
  await applyMigrations(crm);
  return {
    crm,
    url,
    dir: dir ?? null,
    async stop() {
      await crm.close();
      await server.stop();
      await pglite.close();
    },
  };
}

export function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "adtell-crm-"));
}
