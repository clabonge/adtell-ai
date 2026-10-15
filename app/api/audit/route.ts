import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { validateAudit } from "@/lib/audit";

/**
 * Placeholder intake for the free AI savings audit.
 *
 * TODO: Wire delivery so a valid submission reaches the inbox in
 * `site.email` (hello@adtell.ai). That address is itself a placeholder
 * until the mailbox is confirmed — see content/site.ts.
 *
 * A practical wiring is a transactional email provider (for example Resend
 * or Postmark) using an API key in an environment variable. Do not commit
 * the key. Do not log the request body. Until delivery exists, this route
 * only validates input and returns delivered: false. The contact page tells
 * the visitor to email the same details directly.
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

  // TODO: email result.value to site.email. Nothing is stored or forwarded today.
  void site.email;
  void result.value;

  return NextResponse.json({ ok: true, delivered: false });
}
