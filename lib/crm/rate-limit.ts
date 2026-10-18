import { sql } from "drizzle-orm";
import type { CrmDb } from "@/lib/crm/db";
import { sha256 } from "@/lib/crm/text";

export type RateWindow = { name: string; seconds: number; max: number };

const DEFAULT_AUDIT: RateWindow[] = [
  { name: "minute", seconds: 60, max: 3 },
  { name: "hour", seconds: 3600, max: 10 },
];

const LOGIN: RateWindow[] = [
  { name: "minute", seconds: 60, max: 5 },
  { name: "hour", seconds: 3600, max: 20 },
];

function positiveInt(value: string | undefined, fallback: number, cap: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > cap) return fallback;
  return parsed;
}

export function auditRateWindows(env: NodeJS.ProcessEnv = process.env): RateWindow[] {
  return [
    {
      name: "minute",
      seconds: 60,
      max: positiveInt(env.CRM_RATE_PER_MINUTE, DEFAULT_AUDIT[0].max, 1000),
    },
    {
      name: "hour",
      seconds: 3600,
      max: positiveInt(env.CRM_RATE_PER_HOUR, DEFAULT_AUDIT[1].max, 1000),
    },
  ];
}

export function loginRateWindows(): RateWindow[] {
  return LOGIN;
}

export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first.slice(0, 200);
  return "unknown";
}

function bucketKey(route: string, windowName: string, address: string): string {
  const salt = process.env.CRM_SESSION_SECRET?.trim() || "adtell-rate";
  return sha256(`${route}|${windowName}|${address}|${salt}`);
}

export async function enforceRateLimit(
  database: CrmDb,
  input: { route: string; address: string; windows: RateWindow[] },
): Promise<{ allowed: true } | { allowed: false }> {
  for (const window of input.windows) {
    const key = bucketKey(input.route, window.name, input.address);
    const rows = await database.db.execute<{ hits: number }>(sql`
      INSERT INTO rate_buckets (bucket_key, hits, window_start, expires_at)
      VALUES (${key}, 1, now(), now() + make_interval(secs => ${window.seconds}))
      ON CONFLICT (bucket_key) DO UPDATE SET
        hits = CASE
          WHEN rate_buckets.expires_at <= now() THEN 1
          ELSE rate_buckets.hits + 1
        END,
        window_start = CASE
          WHEN rate_buckets.expires_at <= now() THEN now()
          ELSE rate_buckets.window_start
        END,
        expires_at = CASE
          WHEN rate_buckets.expires_at <= now() THEN now() + make_interval(secs => ${window.seconds})
          ELSE rate_buckets.expires_at
        END
      RETURNING hits
    `);
    const hits = Number(asRows<{ hits: number }>(rows)[0]?.hits ?? 0);
    if (hits > window.max) return { allowed: false };
  }
  return { allowed: true };
}

export function asRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object" && "rows" in result && Array.isArray(result.rows)) {
    return result.rows as T[];
  }
  return [];
}
