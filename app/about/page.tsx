import { AuditBand } from "@/components/AuditBand";
import { CompanyLists } from "@/components/CompanyLists";
import { Container, PageHero } from "@/components/ui";
import { aboutIntro, aboutStory, principles } from "@/content/about";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `About ${site.founder.name}`,
  description:
    "Chris LaBonge, Founder & President of Adtell Inc., runs operating companies on AI agents. Adtell.ai is that practice, offered to other businesses.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker={aboutIntro.kicker}
        title={aboutIntro.title}
        lede={aboutIntro.lede}
        crumbs={[{ name: "About", path: "/about" }]}
      />
      <section>
        <Container className="grid gap-12 py-14 sm:py-20">
          {aboutStory.map((section) => (
            <article key={section.heading} className="max-w-3xl">
              <h2 className="font-serif text-3xl tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-lg leading-relaxed text-quiet">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </Container>
      </section>
      <section className="border-t border-line">
        <Container className="py-14 sm:py-20">
          <h2 className="font-serif text-3xl tracking-tight">The companies</h2>
          <div className="mt-8">
            <CompanyLists />
          </div>
        </Container>
      </section>
      <section className="border-t border-line">
        <Container className="py-14 sm:py-20">
          <h2 className="font-serif text-3xl tracking-tight">How the work is judged</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {principles.map((principle) => (
              <li key={principle.title} className="border-t-2 border-oxblood pt-4">
                <h3 className="font-serif text-2xl tracking-tight">{principle.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-quiet">{principle.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <AuditBand
        title="If the fit is an operator, start with the audit."
        lede="Bring a workflow you can describe. We will tell you whether it belongs with an agent."
      />
    </>
  );
}
