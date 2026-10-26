import Link from "next/link";
import { AuditBand } from "@/components/AuditBand";
import { AuditOffer, AuditRequest } from "@/components/AuditConversion";
import { FaqList } from "@/components/FaqList";
import { SavingsCalculator } from "@/components/SavingsCalculator";
import { SavingsShare } from "@/components/SavingsShare";
import { Container, JsonLd, Kicker, PageHero } from "@/components/ui";
import { auditRequests } from "@/content/audit";
import { sampleAudit } from "@/content/sample-audit";
import { servicesFaqs, servicesFaqJsonText } from "@/content/services-faq";
import { cfoBrief } from "@/content/cfo-brief";
import { cfoTerms, services, servicesIntro, starterImplementationSplit } from "@/content/services";
import { auditCta, auditPath } from "@/content/nav";
import { pageMetadata } from "@/lib/seo";
import { faqJsonLd, servicesOfferJsonLd } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: "Services and pricing",
  description:
    "Free AI savings audit, a starter workflow on tools the client already uses at $2,500–$7,500, a written roadmap at the same range, an implementation that connects several systems from $10,000 or 25% of measured savings, retainers from $1,500 a month, and quoted team workshops.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker={servicesIntro.kicker}
        title={servicesIntro.title}
        lede={servicesIntro.lede}
        after={
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">{starterImplementationSplit}</p>
        }
        crumbs={[{ name: "Services", path: "/services" }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <AuditOffer />
      <SavingsShare bordered={false} />
      <SavingsCalculator />
      <section className="border-t border-line">
        <Container className="py-12 sm:py-16">
          <AuditRequest label={auditRequests.calculator} note={auditRequests.calculatorNote} />
        </Container>
      </section>
      <section>
        <Container className="py-4 sm:py-8">
          {services.map((service) => (
            <article
              key={service.slug}
              id={service.slug}
              className="scroll-mt-28 grid gap-8 border-b border-line py-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16"
            >
              <div>
                <h2 className="font-serif text-4xl tracking-tight">{service.name}</h2>
                <p className="mt-4 text-lg leading-relaxed text-quiet">{service.summary}</p>
                <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-oxblood">
                  Who it is for
                </h3>
                <p className="mt-2 text-base leading-relaxed text-quiet">{service.audience}</p>
                <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-oxblood">
                  What it includes
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-quiet">
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {service.delivery ? (
                  <>
                    <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-oxblood">
                      Deliverables
                    </h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-quiet">
                      {service.delivery.deliverables.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-oxblood">
                      Typical timeline
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-quiet">
                      {service.delivery.timeline}
                    </p>
                  </>
                ) : null}
                {service.slug === "free-ai-savings-audit" ? (
                  <p className="mt-6 text-base leading-relaxed text-quiet">
                    <Link
                      href={sampleAudit.path}
                      className="font-semibold text-oxblood underline underline-offset-4"
                    >
                      See an example of the one-page list
                    </Link>
                    . {sampleAudit.label}. It uses a fictional business.
                  </p>
                ) : null}
              </div>
              <div className="h-fit border border-line p-5 lg:sticky lg:top-28">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood">
                  Starting point
                </p>
                <p className="mt-2 font-serif text-4xl tracking-tight text-ivory">
                  {service.priceLabel}
                </p>
                {service.priceAside ? (
                  <p className="mt-2 text-sm font-semibold text-ivory">{service.priceAside}</p>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed text-quiet">{service.priceDetail}</p>
                <Link
                  href={auditPath}
                  className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4"
                >
                  {service.cta}
                </Link>
              </div>
            </article>
          ))}
        </Container>
      </section>
      <section id={cfoTerms.id} className="scroll-mt-24 border-t border-line">
        <Container className="py-16 sm:py-24">
          <Kicker>{cfoTerms.kicker}</Kicker>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
            {cfoTerms.title}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">{cfoTerms.lede}</p>
          <p className="mt-4 text-base leading-relaxed text-quiet">
            <Link href={cfoBrief.path} className="font-semibold text-oxblood underline underline-offset-4">
              Read the one-page CFO brief
            </Link>{" "}
            or{" "}
            <Link href={cfoBrief.pdfPath} className="font-semibold text-oxblood underline underline-offset-4">
              download the PDF
            </Link>
            .{" "}
            <Link href="/security" className="font-semibold text-oxblood underline underline-offset-4">
              How we handle access and client data
            </Link>
            .
          </p>
          <div className="mt-10 grid gap-6">
            {cfoTerms.items.map((item) => (
              <article key={item.title} className="border border-line p-6">
                <h3 className="font-serif text-2xl tracking-tight">{item.title}</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-quiet">
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section id="services-faq" className="scroll-mt-24 border-t border-line">
        <Container className="py-16 sm:py-24">
          <Kicker>Questions</Kicker>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
            Before you choose an engagement.
          </h2>
          <div className="mt-8">
            <FaqList items={servicesFaqs} />
          </div>
        </Container>
      </section>
      <JsonLd data={servicesOfferJsonLd()} />
      <JsonLd data={faqJsonLd(servicesFaqs, servicesFaqJsonText)} />
      <AuditBand
        title="Not sure which engagement you need?"
        lede="Bring the work that costs you. Leave with a recommendation, a fixed price, a 25% share of measured savings, or a reason to wait."
      />
    </>
  );
}
