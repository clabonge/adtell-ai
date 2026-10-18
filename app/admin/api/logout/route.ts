import { crmAuthConfig, destroySession, readCookie, SESSION_COOKIE, sameOrigin, clearSessionCookie, csrfMatches, findSession } from "@/lib/crm/auth";
import { getCrmDatabase } from "@/lib/crm/db";
import { formValue, privateJson, privateRedirect } from "@/lib/crm/http";
import { logSafe } from "@/lib/crm/text";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ ok: false, error: "The request was rejected." }, 403);
  const config = crmAuthConfig();
  if (!config) return privateJson({ ok: false, error: "The private CRM is not configured." }, 503);
  const token = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  try {
    const database = getCrmDatabase();
    if (token) {
      const session = await findSession(database, token, config.sessionSecret);
      const form = await request.formData();
      if (!session || !csrfMatches(formValue(form, "csrf"), session.csrfToken)) {
        return privateJson({ ok: false, error: "The request was rejected." }, 403);
      }
      await destroySession(database, token, config.sessionSecret);
    }
  } catch (err) {
    logSafe("crm logout", err);
  }
  return privateRedirect(new URL("/admin/crm/login", request.url), [clearSessionCookie()]);
}
