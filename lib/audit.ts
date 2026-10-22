import { companySizes, type CompanySize } from "@/content/audit";
import { sanitizeStoredPreview } from "@/lib/audit-preview";

export type AuditField = "name" | "email" | "company" | "industry" | "size" | "drains" | "weeklyTime";

export type AuditErrors = Partial<Record<AuditField | "form", string>>;

export type AuditSubmission = {
  name: string;
  email: string;
  company: string;
  industry: string;
  size: CompanySize | "";
  drains: string;
  weeklyTime?: string;
  auditPreview?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateAudit(input: {
  name: unknown;
  email: unknown;
  company: unknown;
  industry: unknown;
  size: unknown;
  drains: unknown;
  weeklyTime?: unknown;
  auditPreview?: unknown;
}): { ok: true; value: AuditSubmission } | { ok: false; errors: AuditErrors } {
  const name = clean(input.name);
  const email = clean(input.email);
  const company = clean(input.company);
  const industry = clean(input.industry);
  const size = clean(input.size);
  const drains = clean(input.drains);
  const weeklyTime = clean(input.weeklyTime);
  const auditPreview = sanitizeStoredPreview(input.auditPreview);
  const errors: AuditErrors = {};

  if (!name) errors.name = "Enter your name.";
  else if (name.length > 120) errors.name = "Use 120 characters or fewer.";

  if (!email || email.length > 200 || !EMAIL.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!company) errors.company = "Enter the company name.";
  else if (company.length > 200) errors.company = "Use 200 characters or fewer.";

  if (industry.length > 120) errors.industry = "Use 120 characters or fewer.";

  if (size && !companySizes.some((option) => option.value === size)) {
    errors.size = "Select a company size.";
  }

  if (drains.length < 10) {
    errors.drains = "Describe that work in a sentence or two.";
  } else if (drains.length > 4000) {
    errors.drains = "Use 4,000 characters or fewer.";
  }

  if (weeklyTime.length > 500) errors.weeklyTime = "Use 500 characters or fewer.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      email,
      company,
      industry,
      size: size as CompanySize,
      drains,
      weeklyTime,
      auditPreview,
    },
  };
}
