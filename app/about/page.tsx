import { AuditBand } from "@/components/AuditBand";
import { BclePhoto } from "@/components/BclePhoto";
import { BcleAboutPractice } from "@/components/BcleSections";
import { ImplementationHighlights } from "@/components/CompanyLists";
import { Container, PageHero } from "@/components/ui";
import { aboutIntro, aboutStory, founderSection, principles } from "@/content/about";
import { bcleAbout } from "@/content/bcle";
import { auditCta, auditPath } from "@/content/nav";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Adtell.ai is the outsourced AI department, led by Chris LaBonge, Founder and President. Companies pay us as their AI implementation team.",
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
        cta={{ href: auditPath, label: auditCta }}
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
        <Container className="grid items-center gap-10 py-14 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:py-20">
          <figure>
            <BclePhoto
              name={bcleAbout.photo.name}
              alt={bcleAbout.photo.alt}
              sizes="(min-width: 640px) 42vw, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-sm leading-relaxed text-quiet">{bcleAbout.photo.caption}</figcaption>
          </figure>
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl tracking-tight">{founderSection.heading}</h2>
            {founderSection.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-lg leading-relaxed text-quiet">
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>
      <BcleAboutPractice />
      <section className="border-t border-line">
        <Container className="py-14 sm:py-20">
          <h2 className="font-serif text-3xl tracking-tight">Businesses we have helped</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">
            Five of the businesses we have helped. The full list is on the case studies page.
          </p>
          <div className="mt-8">
            <ImplementationHighlights />
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
        title="If you can name the workflow, start with the audit."
        lede="Bring a workflow you can describe. We will tell you whether it belongs with an agent."
      />
    </>
  );
}
