import Link from "next/link";
import { AuditBand } from "@/components/AuditBand";
import { Container, PageHero } from "@/components/ui";
import { auditCta, auditPath } from "@/content/nav";
import { sampleBaseline } from "@/content/sample-baseline";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: sampleBaseline.title,
  description: sampleBaseline.description,
  path: sampleBaseline.path,
});

export default function SampleSavingsBaselinePage() {
  return (
    <>
      <PageHero
        kicker={sampleBaseline.kicker}
        title={sampleBaseline.heading}
        lede={sampleBaseline.lede}
        crumbs={[{ name: "Example baseline", path: sampleBaseline.path }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <article>
        <Container className="max-w-3xl py-14 sm:py-20">
          <p className="border border-oxblood px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-oxblood">
            {sampleBaseline.label}. {sampleBaseline.business} is a made-up business.
          </p>
          <p className="mt-6">
            <Link
              href={sampleBaseline.pdfPath}
              className="text-sm font-semibold text-oxblood underline underline-offset-4"
            >
              Download the PDF
            </Link>
          </p>
          <p className="mt-8 text-lg leading-relaxed text-quiet">
            Example task: {sampleBaseline.task}.
          </p>
          {sampleBaseline.sections.map((section) => (
            <section key={section.title} className="mt-12">
              <h2 className="font-serif text-3xl tracking-tight">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-lg leading-relaxed text-quiet">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <h2 className="mt-12 font-serif text-3xl tracking-tight">Example calculation</h2>
          <ul className="mt-6 grid gap-6">
            {sampleBaseline.rows.map((row) => (
              <li key={row.label} className="border-t border-line pt-4">
                <p className="text-base font-medium text-ivory">{row.label}</p>
                <p className="mt-1 font-serif text-3xl tracking-tight">{row.amount}</p>
                <p className="mt-1 text-sm leading-relaxed text-quiet">{row.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-base leading-relaxed text-quiet">{sampleBaseline.close}</p>
        </Container>
      </article>
      <AuditBand />
    </>
  );
}
