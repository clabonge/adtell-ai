import { applyMigrations, getCrmDatabase } from "../lib/crm/db";
import { assertDemoSeedAllowed, seedSyntheticDemo } from "../lib/crm/seed";

async function main() {
  assertDemoSeedAllowed();
  const database = getCrmDatabase();
  try {
    await applyMigrations(database);
    await seedSyntheticDemo(database);
  } finally {
    await database.close();
  }
  console.error("Seeded labeled synthetic data on localhost. Not a real prospect.");
}

main().catch((err: unknown) => {
  if (err instanceof Error && err.message.startsWith("Refusing")) console.error(err.message);
  else console.error("seed failed");
  process.exit(1);
});
