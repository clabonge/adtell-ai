import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  crmAuthConfig,
  csrfMatches,
  findSession,
  readCookie,
  sameOrigin,
  SESSION_COOKIE,
  type SessionRecord,
} from "@/lib/crm/auth";
import { CrmUnavailableError, getCrmDatabase, type CrmDb } from "@/lib/crm/db";
import { logSafe } from "@/lib/crm/text";

export function privateJson(body: unknown, status = 200, cookies: string[] = []): NextResponse {
  const response = NextResponse.json(body, { status });
  applyPrivateHeaders(response);
  for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
  return response;
}

export function privateRedirect(url: URL, cookies: string[] = []): NextResponse {
  const response = NextResponse.redirect(url, 303);
  applyPrivateHeaders(response);
  for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
  return response;
}

function applyPrivateHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
}

export type Authorized =
  | { ok: true; db: CrmDb; session: SessionRecord; token: string }
  | { ok: false; response: NextResponse };

export async function authorizeMutation(request: Request, csrf: string | null): Promise<Authorized> {
  const access = await authorizeRequest(request);
  if (!access.ok) return access;
  if (!sameOrigin(request) || !csrfMatches(csrf, access.session.csrfToken)) {
    return { ok: false, response: privateJson({ ok: false, error: "The request was rejected." }, 403) };
  }
  return access;
}

export async function authorizeRequest(request: Request): Promise<Authorized> {
  const config = crmAuthConfig();
  if (!config) {
    return {
      ok: false,
      response: privateJson({ ok: false, error: "The private CRM is not configured." }, 503),
    };
  }
  const token = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  if (!token) return { ok: false, response: privateJson({ ok: false, error: "Sign in required." }, 401) };
  try {
    const db = getCrmDatabase();
    const session = await findSession(db, token, config.sessionSecret);
    if (!session) {
      return {
        ok: false,
        response: privateJson({ ok: false, error: "Sign in required." }, 401, [clearSessionCookie()]),
      };
    }
    return { ok: true, db, session, token };
  } catch (err) {
    if (!(err instanceof CrmUnavailableError)) logSafe("crm auth", err);
    return {
      ok: false,
      response: privateJson({ ok: false, error: "The CRM database is unavailable." }, 503),
    };
  }
}

export function formValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}
