import Link from "next/link";
import { ButtonLink, Container } from "@/components/ui";
import { auditOffer } from "@/content/audit";
import { auditPath } from "@/content/nav";
import { sampleAudit } from "@/content/sample-audit";

export function AuditOffer() {
  return (
    <section className="border-b border-line">
      <Container className="py-12 sm:py-16">
        <h2 className="max-w-3xl font-serif text-3xl tracking-tight sm:text-4xl">{auditOffer.title}</h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {auditOffer.points.map((point) => (
            <li key={point} className="border-t-2 border-oxblood pt-4 text-base leading-relaxed text-quiet">
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ButtonLink href={auditPath}>{auditOffer.cta}</ButtonLink>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-quiet">{auditOffer.reply}</p>
      </Container>
    </section>
  );
}

export function SampleAuditPreview() {
  const item = sampleAudit.items[0];

  return (
    <section className="border-b border-line">
      <Container className="py-12 sm:py-16">
        <article className="border border-line p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood">
            Example only, fictional business
          </p>
          <p className="mt-4 text-sm text-quiet">{sampleAudit.business}</p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight">
            {item.rank}: {item.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-quiet">{item.observation}</p>
          <p className="mt-3 text-base leading-relaxed text-quiet">{item.recommendation}</p>
          <p className="mt-6 flex flex-col gap-3 text-sm font-semibold sm:flex-row sm:gap-6">
            <Link href={sampleAudit.path} className="text-oxblood underline underline-offset-4">
              See the full example list
            </Link>
            <Link href={auditPath} className="text-oxblood underline underline-offset-4">
              Get your own list
            </Link>
          </p>
        </article>
      </Container>
    </section>
  );
}

export function AuditRequest({
  label,
  note,
}: {
  label: string;
  note?: string;
}) {
  return (
    <div className="mt-8">
      <ButtonLink href={auditPath}>{label}</ButtonLink>
      {note ? <p className="mt-4 max-w-xl text-sm leading-relaxed text-quiet">{note}</p> : null}
    </div>
  );
}
