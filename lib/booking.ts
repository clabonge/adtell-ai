import { auditPath } from "@/content/nav";
import { site } from "@/content/site";

/**
 * Public scheduling link. Leave NEXT_PUBLIC_BOOKING_URL unset to hide it.
 * The value is inlined at build time. Do not commit a URL.
 */
export const bookingLinkLabel = "Prefer to pick a time?";

export function auditFormUrl(): string {
  return new URL(auditPath, site.url).toString();
}

/** Print, PDF, and signature line. No phone number. */
export function publicContactLine(): string {
  const booking = bookingUrl();
  const audit = `Request a free AI audit: ${auditFormUrl()}`;
  if (!booking) return `${site.name}. ${site.email}. ${audit}.`;
  return `${site.name}. ${site.email}. ${audit}. ${bookingLinkLabel} ${booking}`;
}

export function bookingUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** One line for the confirmation email. Null when the link is hidden. */
export function bookingConfirmationLine(): string | null {
  const url = bookingUrl();
  if (!url) return null;
  return `${bookingLinkLabel} ${url}`;
}
