import { auditNext, writtenListStep } from "@/content/audit";
import { bookingLinkLabel, bookingUrl } from "@/lib/booking";

/** Timeline beside the audit form. The booking link appears only when the URL is set. */
export function WhatHappensNext() {
  const url = bookingUrl();
  const steps = [auditNext.reply, auditNext.conversation, writtenListStep()];

  return (
    <section aria-labelledby="what-happens-next">
      <h2 id="what-happens-next" className="font-serif text-3xl tracking-tight">
        {auditNext.title}
      </h2>
      <ol className="mt-6 grid gap-5">
        {steps.map((step, index) => (
          <li key={step} className="border-t-2 border-oxblood pt-3">
            <p className="text-sm font-semibold text-oxblood">{index + 1}</p>
            <p className="mt-1 text-base leading-relaxed text-quiet">
              {step}
              {index === 1 && url ? (
                <>
                  {" "}
                  <a
                    className="font-semibold text-oxblood underline underline-offset-4"
                    href={url}
                  >
                    {bookingLinkLabel}
                  </a>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
