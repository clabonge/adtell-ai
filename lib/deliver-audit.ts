import { companySizes } from "@/content/audit";
import { site } from "@/content/site";
import type { AuditSubmission } from "@/lib/audit";

const DEFAULT_FROM = "Adtell.ai <onboarding@resend.dev>";

function sizeLabel(size: AuditSubmission["size"]): string {
  return companySizes.find((option) => option.value === size)?.label ?? size;
}

function auditText(submission: AuditSubmission): string {
  return [
    "New AI savings audit request",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Company: ${submission.company}`,
    `Industry: ${submission.industry}`,
    `Company size: ${sizeLabel(submission.size)}`,
    "",
    "Biggest time or cost drains:",
    submission.drains,
  ].join("\n");
}

function subjectLine(company: string): string {
  const clean = company.replace(/[\r\n]+/g, " ").slice(0, 80);
  return `AI savings audit: ${clean}`;
}

function fromAddress(): string {
  const configured = process.env.RESEND_FROM?.trim();
  if (configured && !/[\r\n]/.test(configured)) return configured;
  return DEFAULT_FROM;
}

function webhookUrl(): string | null {
  const configured = process.env.AUDIT_WEBHOOK_URL?.trim();
  if (!configured) return null;
  try {
    const url = new URL(configured);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol === "https:") return url.toString();
    if (url.protocol === "http:" && local) return url.toString();
  } catch {
    // Invalid URL. Treat it as unset.
  }
  console.error("audit delivery skipped: AUDIT_WEBHOOK_URL must be https");
  return null;
}

async function postJson(
  url: string,
  init: { headers: Record<string, string>; body: string },
): Promise<{ ok: boolean; status: number }> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: init.headers,
      body: init.body,
      signal: AbortSignal.timeout(10_000),
    });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function sendResend(apiKey: string, submission: AuditSubmission): Promise<boolean> {
  const result = await postJson("https://api.resend.com/emails", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [site.email],
      reply_to: submission.email,
      subject: subjectLine(submission.company),
      text: auditText(submission),
    }),
  });
  if (!result.ok) {
    console.error("audit delivery failed: resend", result.status);
  }
  return result.ok;
}

async function sendWebhook(url: string, submission: AuditSubmission): Promise<boolean> {
  const result = await postJson(url, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "adtell.ai audit form",
      name: submission.name,
      email: submission.email,
      company: submission.company,
      industry: submission.industry,
      size: submission.size,
      sizeLabel: sizeLabel(submission.size),
      drains: submission.drains,
    }),
  });
  if (!result.ok) {
    console.error("audit delivery failed: webhook", result.status);
  }
  return result.ok;
}

/**
 * Email the submission to the firm inbox. Resend is used when
 * RESEND_API_KEY is set. AUDIT_WEBHOOK_URL is the fallback when Resend is
 * unset or the Resend request fails. Returns false when nothing is delivered.
 * Does not log the submission.
 */
export async function deliverAudit(submission: AuditSubmission): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey) {
    const sent = await sendResend(apiKey, submission);
    if (sent) return true;
  }

  const hook = webhookUrl();
  if (hook) return sendWebhook(hook, submission);

  if (!apiKey) {
    console.error("audit delivery skipped: RESEND_API_KEY and AUDIT_WEBHOOK_URL are unset");
  }
  return false;
}
