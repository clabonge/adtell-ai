import { AuditBand } from "@/components/AuditBand";
import { Container, PageHero } from "@/components/ui";
import {
  processBoundaries,
  processIntro,
  processNeeds,
  processSteps,
} from "@/content/process";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "How an Adtell.ai engagement runs: a free savings audit, a ranked recommendation, and a scoped build only when the workflow earns it.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        kicker={processIntro.kicker}
        title={processIntro.title}
        lede={processIntro.lede}
        crumbs={[{ name: "How it works", path: "/how-it-works" }]}
      />
      <section className="bg-paper">
        <Container className="py-14 sm:py-20">
          <ol className="grid gap-12">
            {processSteps.map((step) => (
              <li key={step.number} className="grid gap-3 border-t border-line pt-8 md:grid-cols-[6rem_1fr]">
                <p className="font-serif text-4xl text-copper-deep">{step.number}</p>
                <div>
                  <h2 className="font-serif text-3xl tracking-tight">{step.title}</h2>
                  <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <section className="bg-paper-deep">
        <Container className="grid gap-12 py-14 sm:py-20 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl tracking-tight">What we need from you</h2>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-relaxed text-ink-soft">
              {processNeeds.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-3xl tracking-tight">What we will not do</h2>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-relaxed text-ink-soft">
              {processBoundaries.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
      <AuditBand />
    </>
  );
}
