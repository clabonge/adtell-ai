import { getCrmDatabase } from "../lib/crm/db";
import { workerLoop } from "../lib/crm/worker";

async function main() {
  const controller = new AbortController();
  process.on("SIGTERM", () => controller.abort());
  process.on("SIGINT", () => controller.abort());
  const database = getCrmDatabase();
  console.error("crm worker started");
  try {
    await workerLoop(database, { signal: controller.signal });
  } finally {
    await database.close();
  }
  console.error("crm worker stopped");
}

main().catch((err: unknown) => {
  const code = err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "error";
  console.error(`crm worker failed: ${code}`);
  process.exit(1);
});
