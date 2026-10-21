import Link from "next/link";
import { AuditBand } from "@/components/AuditBand";
import { Container, PageHero } from "@/components/ui";
import { getIndustry, industryPath } from "@/content/industries";
import { auditCta, auditPath } from "@/content/nav";
import { sampleAudit } from "@/content/sample-audit";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: sampleAudit.title,
  description: sampleAudit.description,
  path: sampleAudit.path,
});

export default function SampleAuditPage() {
  const hospitality = getIndustry("hospitality-and-events");
  return (
    <>
      <PageHero
        kicker={sampleAudit.kicker}
        title={sampleAudit.heading}
        lede={sampleAudit.lede}
        crumbs={[{ name: "Example audit list", path: sampleAudit.path }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <article>
        <Container className="max-w-3xl py-14 sm:py-20">
          <p className="border border-oxblood px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-oxblood">
            {sampleAudit.label}. {sampleAudit.business} is fictional.
          </p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">
            Ranked list for {sampleAudit.business}
          </h2>
          <ol className="mt-8 grid gap-8">
            {sampleAudit.items.map((item) => (
              <li key={item.rank} className="border-t border-line pt-6">
                <h3 className="font-serif text-2xl tracking-tight">
                  {item.rank}. {item.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-quiet">{item.observation}</p>
                <p className="mt-3 text-base leading-relaxed text-ivory">
                  <span className="font-semibold">Recommendation. </span>
                  {item.recommendation}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-base leading-relaxed text-quiet">{sampleAudit.close}</p>
          <h2 className="mt-12 font-serif text-3xl tracking-tight">Related</h2>
          <p className="mt-4 text-base leading-relaxed text-quiet">
            This example is not a client engagement. For the hospitality and events work, read{" "}
            <Link
              href="/case-studies/doan-distillery-event-booking"
              className="font-semibold text-oxblood underline underline-offset-4"
            >
              event booking at Doan Distillery
            </Link>
            {hospitality ? (
              <>
                {" "}
                and the{" "}
                <Link
                  href={industryPath(hospitality)}
                  className="font-semibold text-oxblood underline underline-offset-4"
                >
                  {hospitality.name}
                </Link>{" "}
                page
              </>
            ) : null}
            .
          </p>
        </Container>
      </article>
      <AuditBand />
    </>
  );
}
