import Link from "next/link";
import { FirstYearCost } from "@/components/FirstYearCost";
import { PrintBrief } from "@/components/PrintBrief";
import { Container, PageHero } from "@/components/ui";
import { cfoBrief } from "@/content/cfo-brief";
import { sampleBaseline } from "@/content/sample-baseline";
import { auditPath } from "@/content/nav";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: cfoBrief.title,
  description: cfoBrief.description,
  path: cfoBrief.path,
});

export default function CfoBriefPage() {
  return (
    <>
      <div className="print:hidden">
        <PageHero
          kicker="For the person who signs"
          title={cfoBrief.title}
          lede={cfoBrief.lede}
          crumbs={[{ name: "Services", path: "/services" }, { name: "CFO brief", path: cfoBrief.path }]}
          cta={{ href: auditPath, label: "Book a free AI audit" }}
        />
      </div>
      <article>
        <Container className="max-w-3xl py-12 sm:py-16 print:py-0">
          <div className="flex flex-wrap items-center gap-4 print:hidden">
            <PrintBrief />
            <Link
              href={cfoBrief.pdfPath}
              className="text-sm font-semibold text-oxblood underline underline-offset-4"
            >
              Download the PDF
            </Link>
          </div>
          <p className="mt-8 hidden text-sm text-quiet print:block">
            {site.name}. {site.email}. {site.phone}.
          </p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">Published prices</h2>
          <ul className="mt-4 grid gap-3">
            {cfoBrief.prices.map((price) => (
              <li key={price.name} className="flex items-baseline justify-between gap-6 border-b border-line pb-3">
                <span className="text-base text-ivory">{price.name}</span>
                <span className="font-serif text-2xl tracking-tight">{price.price}</span>
              </li>
            ))}
          </ul>
          {cfoBrief.sections.map((section) => (
            <section key={section.title} className="mt-10">
              <h2 className="font-serif text-3xl tracking-tight">{section.title}</h2>
              {section.title === "First-year cost illustration" ? (
                <div className="print:hidden">
                  <FirstYearCost />
                </div>
              ) : null}
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-quiet">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {section.title === "How savings are measured" ? (
                <p className="mt-4 text-base leading-relaxed text-quiet">
                  <Link
                    href={sampleBaseline.path}
                    className="font-semibold text-oxblood underline underline-offset-4"
                  >
                    {sampleBaseline.linkLabel}
                  </Link>{" "}
                  or{" "}
                  <Link
                    href={sampleBaseline.pdfPath}
                    className="font-semibold text-oxblood underline underline-offset-4"
                  >
                    download the PDF
                  </Link>
                  . {sampleBaseline.label}. {sampleBaseline.business} is a made-up business.
                </p>
              ) : null}
            </section>
          ))}
          <p className="mt-10 text-base leading-relaxed text-quiet">
            <Link href="/security" className="font-semibold text-oxblood underline underline-offset-4">
              How we handle access and client data
            </Link>
            .
          </p>
          <p className="mt-4 text-base leading-relaxed text-quiet">
            The final terms are set in each client&apos;s written agreement.
          </p>
        </Container>
      </article>
    </>
  );
}
