import { createHash } from "node:crypto";
import type { AuditSubmission } from "@/lib/audit";
import type { ImportColumn } from "@/lib/crm/constants";

export function blankToNull(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function nameKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function emailKey(email: string | null | undefined): string | null {
  const value = blankToNull(email);
  return value ? value.toLowerCase() : null;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function inquiryContentHash(value: AuditSubmission): string {
  return sha256(
    JSON.stringify({
      name: value.name,
      email: value.email.toLowerCase(),
      company: value.company,
      industry: value.industry,
      size: value.size,
      drains: value.drains,
      weeklyTime: value.weeklyTime ?? "",
      auditPreview: value.auditPreview ?? "",
    }),
  );
}

export function domainFromWebsite(website: string | null): string | null {
  if (!website) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    const url = new URL(withProtocol);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!host || !host.includes(".") || host.length > 253) return null;
    return host;
  } catch {
    return null;
  }
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function clip(value: string | null, max: number): string | null {
  if (!value) return null;
  return value.length > max ? value.slice(0, max) : value;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function importFingerprint(row: Record<ImportColumn, string | null> & { origin: string }): string {
  return sha256(
    JSON.stringify({
      company: nameKey(row.company ?? ""),
      website: row.website ?? "",
      email: row.email?.toLowerCase() ?? "",
      sourceUrl: row.source_url ?? "",
      researchDate: row.research_date ?? "",
      fitNotes: row.fit_notes ?? "",
      origin: row.origin,
      nextAction: row.next_action ?? "",
      contactName: nameKey(row.contact_name ?? ""),
    }),
  );
}

export function logSafe(scope: string, err: unknown): void {
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "error";
  console.error(`${scope}: ${code}`);
}

export function migrationFailureLine(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err && (err as { code: unknown }).code
      ? String((err as { code: unknown }).code)
      : err && typeof err === "object" && "errno" in err && typeof (err as { errno: unknown }).errno === "string"
        ? (err as { errno: string }).errno
        : "error";
  const raw = err instanceof Error ? err.message : "";
  const detail = raw
    .replace(/postgres(?:ql)?:\/\/[^@\s/]+@/gi, "postgresql://")
    .replace(/[^\s]+:[^\s@]+@/g, "[redacted]@")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
  const extra = detail && detail !== code ? `: ${detail}` : "";
  return `migration failed: ${code}${extra}. This release will not go live.`;
}

export function postgresErrorCode(err: unknown): string {
  if (!err || typeof err !== "object" || !("code" in err)) return "";
  return String((err as { code: unknown }).code);
}

export function isUniqueViolation(err: unknown): boolean {
  return postgresErrorCode(err) === "23505";
}

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export function centsFromDollars(input: string): { ok: true; cents: number | null } | { ok: false } {
  const value = input.trim();
  if (!value) return { ok: true, cents: null };
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(value)) return { ok: false };
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 2_000_000_000) return { ok: false };
  return { ok: true, cents };
}

export function dollarsFromCents(cents: number | null): string {
  if (cents === null) return "";
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `${whole}.${fraction}`;
}
