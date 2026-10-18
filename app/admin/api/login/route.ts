import { loginOwner, crmAuthConfig, sameOrigin, sessionCookie } from "@/lib/crm/auth";
import { CrmUnavailableError, getCrmDatabase } from "@/lib/crm/db";
import { formValue, privateJson, privateRedirect } from "@/lib/crm/http";
import { clientAddress, enforceRateLimit, loginRateWindows } from "@/lib/crm/rate-limit";
import { logSafe } from "@/lib/crm/text";

export async function POST(request: Request) {
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  if (!sameOrigin(request)) {
    return wantsJson
      ? privateJson({ ok: false, error: "The request was rejected." }, 403)
      : privateRedirect(new URL("/admin/crm/login?error=rejected", request.url));
  }
  const config = crmAuthConfig();
  if (!config) {
    return wantsJson
      ? privateJson({ ok: false, error: "The private CRM is not configured." }, 503)
      : privateRedirect(new URL("/admin/crm/login?error=unconfigured", request.url));
  }
  let database;
  try {
    database = getCrmDatabase();
  } catch (err) {
    if (!(err instanceof CrmUnavailableError)) logSafe("crm login", err);
    return privateJson({ ok: false, error: "The CRM database is unavailable." }, 503);
  }
  try {
    const limited = await enforceRateLimit(database, {
      route: "crm-login",
      address: clientAddress(request),
      windows: loginRateWindows(),
    });
    if (!limited.allowed) {
      return wantsJson
        ? privateJson({ ok: false, error: "Too many sign-in attempts. Wait and try again." }, 429)
        : privateRedirect(new URL("/admin/crm/login?error=limited", request.url));
    }
    const form = await request.formData();
    const session = await loginOwner(database, config, formValue(form, "email"), formValue(form, "password"));
    if (!session) {
      return wantsJson
        ? privateJson({ ok: false, error: "The email or password is wrong." }, 401)
        : privateRedirect(new URL("/admin/crm/login?error=credentials", request.url));
    }
    const cookie = sessionCookie(session.token);
    return wantsJson
      ? privateJson({ ok: true }, 200, [cookie])
      : privateRedirect(new URL("/admin/crm", request.url), [cookie]);
  } catch (err) {
    logSafe("crm login", err);
    return privateJson({ ok: false, error: "The CRM database is unavailable." }, 503);
  }
}
