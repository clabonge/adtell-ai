import { NextResponse } from "next/server";
import { validateAudit } from "@/lib/audit";
import { captureInquiry, readAttribution, readIdempotencyKey } from "@/lib/crm/inquiry";
import { clientAddress } from "@/lib/crm/rate-limit";
import { CrmUnavailableError, getCrmDatabase } from "@/lib/crm/db";
import { logSafe } from "@/lib/crm/text";

const MAX_BODY = 100_000;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function handleAuditRequest(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return json({ ok: false, errors: { form: "Send the form as JSON." } }, 415);
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY) {
    return json({ ok: false, errors: { form: "The form is too large." } }, 413);
  }

  let text = "";
  try {
    text = await request.text();
  } catch {
    return json({ ok: false, errors: { form: "The form could not be read. Try again." } }, 400);
  }
  if (text.length > MAX_BODY) {
    return json({ ok: false, errors: { form: "The form is too large." } }, 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return json({ ok: false, errors: { form: "The form could not be read. Try again." } }, 400);
  }
  if (!payload || typeof payload !== "object") {
    return json({ ok: false, errors: { form: "The form could not be read. Try again." } }, 400);
  }

  const body = payload as Record<string, unknown>;
  const honeypot = typeof body.company_website === "string" ? body.company_website.trim() : "";
  if (honeypot) return json({ ok: true, received: false });

  const result = validateAudit({
    name: body.name,
    email: body.email,
    company: body.company,
    industry: body.industry,
    size: body.size,
    drains: body.drains,
    weeklyTime: body.weekly_time,
    auditPreview: body.audit_preview,
  });
  if (!result.ok) return json({ ok: false, errors: result.errors }, 400);

  const idempotencyKey = readIdempotencyKey(request, body);
  if (!idempotencyKey) {
    return json(
      { ok: false, errors: { form: "The form is missing a submission key. Try again." } },
      400,
    );
  }

  try {
    const saved = await captureInquiry(getCrmDatabase(), {
      submission: result.value,
      idempotencyKey,
      attribution: readAttribution(body),
      address: clientAddress(request),
    });
    if (!saved.ok) {
      return json({ ok: false, retry: saved.retry, errors: { form: saved.error } }, saved.status);
    }
    return json({ ok: true, received: true });
  } catch (err) {
    if (!(err instanceof CrmUnavailableError)) logSafe("audit save failed", err);
    return json(
      {
        ok: false,
        retry: true,
        errors: { form: "We could not save your request. Please try again." },
      },
      503,
    );
  }
}
