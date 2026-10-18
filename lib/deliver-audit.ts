import { companySizes } from "@/content/audit";
import { site } from "@/content/site";
import type { AuditSubmission } from "@/lib/audit";

const DEFAULT_FROM = "Adtell.ai <onboarding@resend.dev>";

export type DeliveryChannel = "email" | "webhook";

export type DeliveryResult = {
  ok: boolean;
  status: number;
  unconfigured?: boolean;
};

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
        text: auditText(submission),
      }),
    },
    options?.fetchImpl ?? fetch,
  );
  if (!result.ok) console.error("audit delivery failed: resend", result.status);
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
