import { auditPath } from "@/content/nav";
import { ButtonLink, Container, Kicker } from "@/components/ui";

export function AuditBand({
  title = "Bring the work that is costing you.",
  lede = "Tell us the company and the drains. The recommendation may be a plan, a build, training, a retainer, or waiting.",
}: {
  title?: string;
  lede?: string;
}) {
  return (
    <section className="bg-forest-deep text-paper">
      <Container className="py-16 sm:py-20">
        <Kicker tone="dark">Free AI savings audit</Kicker>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-mist">{lede}</p>
        <div className="mt-8">
          <ButtonLink href={auditPath} variant="inverse">
            Book a free AI savings audit
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
