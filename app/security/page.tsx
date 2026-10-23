import { AuditBand } from "@/components/AuditBand";
import { Container, PageHero } from "@/components/ui";
import { securityPage } from "@/content/security";
import { auditCta, auditPath } from "@/content/nav";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: securityPage.title,
  description: securityPage.description,
  path: securityPage.path,
});

export default function SecurityPage() {
  return (
    <>
      <PageHero
        kicker="Security"
        title="How we handle access and client data."
        lede={securityPage.lede}
        crumbs={[{ name: "Security", path: securityPage.path }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <article>
        <Container className="max-w-3xl py-14 sm:py-20">
          {securityPage.sections.map((section) => (
            <section key={section.title} className="mt-10 first:mt-0">
              <h2 className="font-serif text-3xl tracking-tight">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-lg leading-relaxed text-quiet">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <p className="mt-10 text-sm text-quiet">
            Questions go to{" "}
            <a
              className="font-semibold text-oxblood underline underline-offset-4"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
            .
          </p>
        </Container>
      </article>
      <AuditBand />
    </>
  );
}
