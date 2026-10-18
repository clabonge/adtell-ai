import { cookies } from "next/headers";
import { connection } from "next/server";
import { crmAuthConfig, findSession, SESSION_COOKIE, type SessionRecord } from "@/lib/crm/auth";
import { CrmUnavailableError, getCrmDatabase, type CrmDb } from "@/lib/crm/db";
import { logSafe } from "@/lib/crm/text";

export type PageAccess =
  | { kind: "ok"; db: CrmDb; session: SessionRecord }
  | { kind: "login" }
  | { kind: "unconfigured" }
  | { kind: "unavailable" };

export async function requireOwnerPage(): Promise<PageAccess> {
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const config = crmAuthConfig();
  if (!config) return { kind: "unconfigured" };
  if (!token) return { kind: "login" };
  try {
    const db = getCrmDatabase();
    const session = await findSession(db, token, config.sessionSecret);
    if (!session) return { kind: "login" };
    return { kind: "ok", db, session };
  } catch (err) {
    if (!(err instanceof CrmUnavailableError)) logSafe("crm page", err);
    return { kind: "unavailable" };
  }
}
