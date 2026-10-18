import { configuredNotificationChannels } from "@/lib/deliver-audit";
import type { CrmDb } from "@/lib/crm/db";
import { runDueJobs } from "@/lib/crm/notify";

export async function workerTick(
  database: CrmDb,
  options?: { fetchImpl?: typeof fetch; poll?: false },
): Promise<number> {
  return runDueJobs(database, {
    fetchImpl: options?.fetchImpl,
    channels: configuredNotificationChannels(),
  });
}

export async function workerLoop(
  database: CrmDb,
  options?: { fetchImpl?: typeof fetch; pollMs?: number; signal?: AbortSignal },
): Promise<void> {
  const pollMs = options?.pollMs ?? 2000;
  while (!options?.signal?.aborted) {
    const count = await workerTick(database, { fetchImpl: options?.fetchImpl });
    if (options?.signal?.aborted) return;
    if (count === 0) await sleep(pollMs, options?.signal);
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}
