import { applyMigrations, getCrmDatabase, resetCrmDatabaseForTests } from "../lib/crm/db";
import { migrationFailureLine } from "../lib/crm/text";

/**
 * Migrate the database in DATABASE_URL.
 * This does not run on web server boot. Render runs it from the web build
 * when DATABASE_URL is set, and from the worker pre-deploy command.
 */

const RETRYABLE = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ECONNRESET",
  "CONNECT_TIMEOUT",
  "57P01",
  "57P03",
  "08000",
  "08001",
  "08003",
  "08004",
  "08006",
  "53300",
]);

function errorCode(err: unknown): string {
  if (!err || typeof err !== "object") return "";
  if ("code" in err && err.code) return String(err.code);
  if ("errno" in err && typeof err.errno === "string" && err.errno) return err.errno;
  return "";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const attempts = 6;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const database = getCrmDatabase();
      try {
        const applied = await applyMigrations(database);
        if (applied.length === 0) console.log("No pending migrations.");
        else console.log(`Applied ${applied.join(", ")}`);
        return;
      } finally {
        await resetCrmDatabaseForTests();
      }
    } catch (err) {
      const code = errorCode(err) || "error";
      if (attempt === attempts || !RETRYABLE.has(code)) {
        console.error(migrationFailureLine(err));
        process.exit(1);
      }
      console.error(`migration waiting: ${code}`);
      await sleep(Math.min(15000, 2000 * attempt));
    }
  }
}

main().catch((err: unknown) => {
  console.error(migrationFailureLine(err));
  process.exit(1);
});
