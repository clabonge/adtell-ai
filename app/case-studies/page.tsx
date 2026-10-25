import Link from "next/link";
import { AuditBand } from "@/components/AuditBand";
import { CompanyLists } from "@/components/CompanyLists";
import { Container, PageHero } from "@/components/ui";
import { caseStudiesOverview } from "@/content/case-studies-overview";
import { auditCta, auditPath } from "@/content/nav";
import { formatDate } from "@/lib/format";
import { getPosts, kindLabel } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Case studies",
  description:
    "What we implemented for each business, and why that task was the place to start.",
  path: "/case-studies",
});

export default function CaseStudiesPage() {
  const studies = getPosts("case-studies");

  return (
    <>
      <PageHero
        kicker="Case studies"
        title="What we implemented."
        lede="The businesses we have helped, and why each task was the place to start."
        crumbs={[{ name: "Case studies", path: "/case-studies" }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <section>
        <Container className="py-14 sm:py-20">
          <h2 className="font-serif text-3xl tracking-tight">The businesses</h2>
          <div className="mt-10">
            <CompanyLists />
          </div>
          <p className="mt-16 max-w-3xl text-lg leading-relaxed text-quiet">{caseStudiesOverview.intro}</p>
          {caseStudiesOverview.sections.map((section) => (
            <div key={section.heading} className="mt-12 max-w-3xl">
              <h2 className="font-serif text-3xl tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-lg leading-relaxed text-quiet">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
          <h2 className="mt-16 font-serif text-3xl tracking-tight">Written notes</h2>
          <ul className="mt-8 grid gap-6">
            {studies.map((study) => (
              <li key={study.slug}>
                <article className="border border-line p-6 sm:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-oxblood">
                    {kindLabel(study.kind)}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                    <Link href={`/case-studies/${study.slug}`} className="hover:text-oxblood">
                      {study.title}
                    </Link>
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">
                    {study.description}
                  </p>
                  <p className="mt-4 text-sm text-quiet">
                    <time dateTime={study.date}>{formatDate(study.date)}</time>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <AuditBand />
    </>
  );
}
