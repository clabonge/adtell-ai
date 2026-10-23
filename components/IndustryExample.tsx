import { ButtonLink, Container } from "@/components/ui";
import { industryExamples } from "@/content/industry-examples";
import { auditPath } from "@/content/nav";

export function IndustryExample({ slug }: { slug: string }) {
  const example = industryExamples[slug];
  if (!example) return null;

  return (
    <section className="border-b border-line">
      <Container className="py-12 sm:py-16">
        <article className="border border-line p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood">Example only</p>
          <h2 className="mt-4 font-serif text-2xl tracking-tight">{example.heading}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-5">
            {example.steps.map((step) => (
              <li key={step.label} className="border-t-2 border-oxblood pt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-oxblood">{step.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-quiet">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm leading-relaxed text-quiet">{example.note}</p>
          <div className="mt-6">
            <ButtonLink href={auditPath}>Get your own list</ButtonLink>
          </div>
        </article>
      </Container>
    </section>
  );
}
