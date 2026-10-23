/**
 * Public scheduling link. Leave NEXT_PUBLIC_BOOKING_URL unset to hide it.
 * The value is inlined at build time.
 */
export const bookingLinkLabel = "Prefer to pick a time?";

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
