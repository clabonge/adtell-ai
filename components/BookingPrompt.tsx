import { site } from "@/content/site";
import { bookingLinkLabel, bookingUrl } from "@/lib/booking";

export function BookingPrompt({
  tone = "sheet",
  className = "",
}: {
  tone?: "sheet" | "void";
  className?: string;
}) {
  const url = bookingUrl();
  if (!url) return null;
  const linkClass =
    tone === "void"
      ? "font-semibold text-oxblood underline underline-offset-4"
      : "font-semibold text-oxblood-ink underline underline-offset-4";
  const textClass =
    tone === "void"
      ? "text-base leading-relaxed text-quiet"
      : "text-base leading-relaxed text-quiet-ink";

  return (
    <p className={`${textClass} ${className}`.trim()}>
      Want to pick a time now?{" "}
      <a className={linkClass} href={url}>
        Book a free 30-minute audit call
      </a>{" "}
      or call{" "}
      <a className={linkClass} href={`tel:${site.phoneTel}`}>
        {site.phone}
      </a>
      .
    </p>
  );
}

/** Compact link beside the audit form. Renders nothing when the URL is unset. */
export function PickTimeLink({ className = "" }: { className?: string }) {
  const url = bookingUrl();
  if (!url) return null;
  return (
    <a
      className={`text-sm font-semibold text-oxblood-ink underline underline-offset-4 ${className}`.trim()}
      href={url}
    >
      {bookingLinkLabel}
    </a>
  );
}
