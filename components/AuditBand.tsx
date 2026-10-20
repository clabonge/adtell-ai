import { auditCta, auditPath } from "@/content/nav";
import { ButtonLink, Container, Kicker } from "@/components/ui";

export function AuditBand({
  title = "Bring the work that is costing you.",
  lede = "Tell us the company and the work that costs you. The recommendation may be a plan, a build, training, a retainer, or waiting.",
  href = auditPath,
}: {
  title?: string;
  lede?: string;
  href?: string;
}) {
  return (
    <section className="sheet bg-ivory text-ink">
      <Container className="py-16 sm:py-20">
        <Kicker tone="sheet">Free AI savings audit</Kicker>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-quiet-ink">{lede}</p>
        <div className="mt-8">
          <ButtonLink href={href} variant="sheet">
            {auditCta}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
