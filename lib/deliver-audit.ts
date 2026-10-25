import { companySizes } from "@/content/audit";
import { site } from "@/content/site";
import type { AuditSubmission } from "@/lib/audit";
import { auditFormUrl, bookingConfirmationLine } from "@/lib/booking";

const DEFAULT_FROM = "Adtell.ai <onboarding@resend.dev>";

export type DeliveryChannel = "email" | "webhook" | "confirmation";

const CONFIRMATION_FROM = "Adtell.ai <audit@adtell.ai>";

/** Prospect confirmation stays off unless this is exactly "true". */
export function confirmationEmailEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.AUDIT_CONFIRMATION_EMAIL?.trim().toLowerCase() === "true";
}

export type DeliveryResult = {
  ok: boolean;
  status: number;
  unconfigured?: boolean;
};

function sizeLabel(size: AuditSubmission["size"]): string {
  return companySizes.find((option) => option.value === size)?.label ?? size;
}

function auditText(submission: AuditSubmission): string {
  const lines = [
    "New AI savings audit request",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Company: ${submission.company}`,
  ];
  if (submission.industry) lines.push(`Industry: ${submission.industry}`);
  if (submission.size) lines.push(`Company size: ${sizeLabel(submission.size)}`);
  lines.push("", "The work that costs the most:", submission.drains);
  if (submission.weeklyTime) {
    lines.push("", "What eats the most time each week:", submission.weeklyTime);
  }
  if (submission.auditPreview) {
    lines.push("", "Example AI preview:", submission.auditPreview);
  }
  return lines.join("\n");
}

export function ownerAuditText(submission: AuditSubmission): string {
  return auditText(submission);
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

export function webhookUrl(raw: string | undefined = process.env.AUDIT_WEBHOOK_URL): string | null {
  const configured = raw?.trim();
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

export function configuredNotificationChannels(
  env: NodeJS.ProcessEnv = process.env,
): DeliveryChannel[] {
  const channels: DeliveryChannel[] = [];
  if (env.RESEND_API_KEY?.trim()) channels.push("email");
  if (env.RESEND_API_KEY?.trim() && confirmationEmailEnabled(env)) channels.push("confirmation");
  if (webhookUrl(env.AUDIT_WEBHOOK_URL)) channels.push("webhook");
  return channels;
}

async function postJson(
  url: string,
  init: { headers: Record<string, string>; body: string },
  fetchImpl: typeof fetch,
): Promise<{ ok: boolean; status: number }> {
  try {
    const response = await fetchImpl(url, {
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

export async function sendAuditEmail(
  submission: AuditSubmission,
  options?: { idempotencyKey?: string; fetchImpl?: typeof fetch },
): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, status: 0, unconfigured: true };
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (options?.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;
  const result = await postJson(
    "https://api.resend.com/emails",
    {
      headers,
      body: JSON.stringify({
        from: fromAddress(),
        to: [site.email],
        reply_to: submission.email,
        subject: subjectLine(submission.company),
        text: ownerAuditText(submission),
      }),
    },
    options?.fetchImpl ?? fetch,
  );
  if (!result.ok) console.error("audit delivery failed: resend", result.status);
  return result;
}

export function prospectConfirmationText(submission: AuditSubmission): string {
  const name = submission.name.replace(/[\r\n]+/g, " ").trim();
  const greeting = name ? `Hello ${name},` : "Hello,";
  const booking = bookingConfirmationLine();
  return [
    greeting,
    "",
    "Thank you. We received your request for a free AI savings audit.",
    "",
    "We reply within one business day.",
    "",
    "What happens next: a conversation, on-site locally or by video. Afterward you get a written one-page ranked list of opportunities. The recommendation can be a roadmap, a build, training, a retainer, or waiting.",
    ...(booking ? ["", booking] : []),
    "",
    `A one-page brief of published prices and payment terms: ${new URL("/cfo-brief", site.url).toString()}`,
    "",
    "Adtell.ai",
    site.email,
    `Request a free AI audit: ${auditFormUrl()}`,
  ].join("\n");
}

export async function sendAuditConfirmation(
  submission: AuditSubmission,
  options?: { idempotencyKey?: string; fetchImpl?: typeof fetch },
): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !confirmationEmailEnabled()) {
    return { ok: false, status: 0, unconfigured: true };
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (options?.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;
  const result = await postJson(
    "https://api.resend.com/emails",
    {
      headers,
      body: JSON.stringify({
        from: CONFIRMATION_FROM,
        to: [submission.email],
        reply_to: site.email,
        subject: "We received your AI savings audit request",
        text: prospectConfirmationText(submission),
      }),
    },
    options?.fetchImpl ?? fetch,
  );
  if (!result.ok) console.error("audit confirmation failed: resend", result.status);
  return result;
}

export async function sendAuditWebhook(
  submission: AuditSubmission,
  options?: { eventId?: string; fetchImpl?: typeof fetch },
): Promise<DeliveryResult> {
  const hook = webhookUrl();
  if (!hook) return { ok: false, status: 0, unconfigured: true };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options?.eventId) headers["X-Adtell-Event-Id"] = options.eventId;
  const result = await postJson(
    hook,
    {
      headers,
      body: JSON.stringify({
        source: "adtell.ai audit form",
        eventId: options?.eventId ?? null,
        name: submission.name,
        email: submission.email,
        company: submission.company,
        industry: submission.industry,
        size: submission.size,
        sizeLabel: sizeLabel(submission.size),
        drains: submission.drains,
      }),
    },
    options?.fetchImpl ?? fetch,
  );
  if (!result.ok) console.error("audit delivery failed: webhook", result.status);
  return result;
}
