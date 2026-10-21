import Link from "next/link";
import { AuditBand } from "@/components/AuditBand";
import { Container, PageHero } from "@/components/ui";
import { industries, industryPath, whoWeHelp } from "@/content/industries";
import { auditCta, auditPath } from "@/content/nav";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: whoWeHelp.title,
  description: whoWeHelp.description,
  path: whoWeHelp.path,
});

export default function WhoWeHelpPage() {
  return (
    <>
      <PageHero
        kicker={whoWeHelp.kicker}
        title={whoWeHelp.heading}
        lede={whoWeHelp.lede}
        crumbs={[{ name: whoWeHelp.title, path: whoWeHelp.path }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <section>
        <Container className="py-14 sm:py-20">
          <h2 className="font-serif text-3xl tracking-tight">Industries</h2>
          <ul className="mt-8 grid gap-6">
            {industries.map((industry) => (
              <li key={industry.slug}>
                <article className="border border-line p-6 sm:p-8">
                  <h3 className="font-serif text-3xl tracking-tight">
                    <Link href={industryPath(industry)} className="hover:text-oxblood">
                      {industry.name}
                    </Link>
                  </h3>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">
                    {industry.description}
                  </p>
                  <p className="mt-4 text-sm text-quiet">
                    {industry.businesses.join(", ")}
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
