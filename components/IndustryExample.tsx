import { ButtonLink, Container } from "@/components/ui";
import { furnitureShop, industryExamples } from "@/content/industry-examples";
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

export function FurnitureShop() {
  return (
    <section className="border-b border-line">
      <Container className="max-w-3xl py-12 sm:py-16">
        <h2 className="font-serif text-3xl tracking-tight">{furnitureShop.heading}</h2>
        <p className="mt-4 text-lg leading-relaxed text-quiet">
          <a
            href={furnitureShop.href}
            className="font-semibold text-oxblood underline underline-offset-4"
          >
            {furnitureShop.host}
          </a>{" "}
          is BCLE Furniture&apos;s quoting site.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-base leading-relaxed text-quiet">
          {furnitureShop.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="mt-6 text-lg leading-relaxed text-quiet">{furnitureShop.close}</p>
        <div className="mt-8">
          <ButtonLink href={auditPath}>Request my free audit</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
