import { applyMigrations, getCrmDatabase } from "../lib/crm/db";

/**
 * Migrate the database in DATABASE_URL.
 * This does not run on web server boot. Run it only when you intend to migrate.
 */
async function main() {
  const database = getCrmDatabase();
  try {
    const applied = await applyMigrations(database);
    if (applied.length === 0) console.log("No pending migrations.");
    else console.log(`Applied ${applied.join(", ")}`);
  } finally {
    await database.close();
  }
}

main().catch((err: unknown) => {
  const code = err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "error";
  console.error(`migration failed: ${code}`);
  process.exit(1);
});
