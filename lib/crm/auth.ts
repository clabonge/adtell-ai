import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { CrmDb } from "@/lib/crm/db";
import { sessions } from "@/lib/crm/schema";
import { verifyPassword } from "@/lib/crm/password";
import { SESSION_SECONDS } from "@/lib/crm/constants";

export const SESSION_COOKIE = "adtell_crm_session";

export type AuthConfig = {
  email: string;
  passwordHash: string;
  sessionSecret: string;
};

export type SessionRecord = {
  id: string;
  csrfToken: string;
  expiresAt: Date;
};

export function crmAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig | null {
  const email = env.CRM_OWNER_EMAIL?.trim().toLowerCase() ?? "";
  const passwordHash = env.CRM_OWNER_PASSWORD_HASH?.trim() ?? "";
  const sessionSecret = env.CRM_SESSION_SECRET?.trim() ?? "";
  if (!email || !email.includes("@") || !passwordHash.startsWith("scrypt:") || sessionSecret.length < 32) {
    return null;
  }
  return { email, passwordHash, sessionSecret };
}

export function hashSessionToken(token: string, secret: string): string {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) return rest.join("=") || null;
  }
  return null;
}

export function sessionCookie(token: string, maxAge = SESSION_SECONDS): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/admin; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/admin; Max-Age=0${secure}`;
}

export async function loginOwner(
  database: CrmDb,
  config: AuthConfig,
  email: string,
  password: string,
): Promise<{ token: string; csrfToken: string } | null> {
  const normalized = email.trim().toLowerCase();
  const emailMatch = safeEqual(normalized, config.email);
  const passwordMatch = await verifyPassword(password, config.passwordHash);
  if (!emailMatch || !passwordMatch) return null;
  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(32).toString("base64url");
  const now = new Date();
  await database.db.insert(sessions).values({
    id: randomUUID(),
    tokenHash: hashSessionToken(token, config.sessionSecret),
    csrfToken,
    expiresAt: new Date(now.getTime() + SESSION_SECONDS * 1000),
    createdAt: now,
  });
  return { token, csrfToken };
}

export async function findSession(
  database: CrmDb,
  token: string,
  secret: string,
): Promise<SessionRecord | null> {
  if (!token || token.length > 200) return null;
  const rows = await database.db
    .select({
      id: sessions.id,
      csrfToken: sessions.csrfToken,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(and(eq(sessions.tokenHash, hashSessionToken(token, secret)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function destroySession(database: CrmDb, token: string, secret: string): Promise<void> {
  if (!token) return;
  await database.db.delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(token, secret)));
}

export function csrfMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = request.headers.get("host");
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  return originHost === host || (Boolean(forwarded) && originHost === forwarded);
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
