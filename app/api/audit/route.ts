import { NextResponse } from "next/server";
import { deliverAudit } from "@/lib/deliver-audit";
import { validateAudit } from "@/lib/audit";

/**
 * Intake for the free AI savings audit.
 *
 * A valid submission is emailed to the inbox in content/site.ts when
 * RESEND_API_KEY is set. AUDIT_WEBHOOK_URL is the fallback. If neither
 * delivers, the route still accepts the form and returns delivered: false
 * so the page can show a note the visitor can send. Do not log the body.
 * Do not commit keys. See README "Audit form delivery".
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { ok: false, errors: { form: "Send the form as JSON." } },
      { status: 415 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { form: "The form could not be read. Try again." } },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { ok: false, errors: { form: "The form could not be read. Try again." } },
      { status: 400 },
    );
  }

  const body = payload as Record<string, unknown>;
  const honeypot = typeof body.company_website === "string" ? body.company_website.trim() : "";
  if (honeypot) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const result = validateAudit({
    name: body.name,
    email: body.email,
    company: body.company,
    industry: body.industry,
    size: body.size,
    drains: body.drains,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
  }

  let delivered = false;
  try {
    delivered = await deliverAudit(result.value);
  } catch {
    console.error("audit delivery failed: unexpected error");
    delivered = false;
  }

  return NextResponse.json({ ok: true, delivered });
}
