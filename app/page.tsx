import Link from "next/link";
import { AuditBand } from "@/components/AuditBand";
import { CompanyLists } from "@/components/CompanyLists";
import { FaqList } from "@/components/FaqList";
import { ButtonLink, Container, JsonLd, Kicker } from "@/components/ui";
import { faqs } from "@/content/faqs";
import { costPatterns, homeServicesIntro } from "@/content/home";
import { auditPath } from "@/content/nav";
import { processSteps } from "@/content/process";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getPosts, kindLabel } from "@/lib/posts";
import { faqJsonLd } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: `${site.name} | AI consulting that cuts operating cost`,
  description: site.description,
  path: "/",
  absolute: true,
});

export default function HomePage() {
  const study = getPosts("case-studies")[0];
  const notes = getPosts("blog").slice(0, 2);

  return (
    <>
      <section className="border-b border-line">
        <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <Kicker>AI consulting for operating companies</Kicker>
            <h1 className="mt-5 max-w-3xl font-serif text-[2.7rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-quiet">
              {site.name} helps businesses find the repetitive work that still sits on
              payroll and implement AI that removes it. The first step is a free AI
              savings audit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={auditPath}>
                Book a free AI savings audit
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="ghost">
                See how it works
              </ButtonLink>
            </div>
          </div>
          <aside className="sheet bg-ivory p-6 text-ink">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-quiet-ink">
              Published starting points
            </p>
            <table className="mt-4 w-full table-fixed text-left">
              <caption className="sr-only">Service starting prices</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.slug} className="border-t border-line">
                    <th scope="row" className="py-3 pr-3 text-sm font-medium break-words">
                      <Link href={`/services#${service.slug}`} className="hover:text-oxblood-ink">
                        {service.name}
                      </Link>
                    </th>
                    <td className="py-3 text-right font-serif text-lg text-oxblood-ink">
                      {service.priceLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </aside>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-24">
          <Kicker>Where the money goes</Kicker>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl tracking-tight sm:text-5xl">
            The expensive work is usually ordinary.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">
            Most AI projects start with a tool. The ones that save money start with a
            cost: hours spent moving information, answering the same question, or
            rebuilding a report.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {costPatterns.map((pattern) => (
              <li key={pattern.title} className="border-t-2 border-oxblood pt-5">
                <h3 className="font-serif text-2xl tracking-tight">{pattern.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-quiet">{pattern.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="py-16 sm:py-24">
          <Kicker>The practice</Kicker>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
            We run our own businesses on AI.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-quiet">
            {site.founder.name} is {site.founder.role} of {site.holdingCompany}. The
            approach used inside the holding company is the same approach behind the
            operating companies he runs with AI agents.
          </p>
          <div className="mt-10">
            <CompanyLists />
          </div>
          <p className="mt-8">
            <Link
              href="/about"
              className="text-sm font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4"
            >
              Read the story
            </Link>
          </p>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="py-16 sm:py-24">
          <Kicker>{homeServicesIntro.kicker}</Kicker>
          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-xl font-serif text-4xl tracking-tight sm:text-5xl">
              {homeServicesIntro.title}
            </h2>
            <p className="max-w-md text-base leading-relaxed text-quiet">
              {homeServicesIntro.lede}
            </p>
          </div>
          <ol className="mt-10 border-t border-line">
            {services.map((service, index) => (
              <li key={service.slug} className="border-b border-line">
                <Link
                  href={`/services#${service.slug}`}
                  className="grid gap-2 py-5 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline sm:gap-6"
                >
                  <span className="font-serif text-xl text-oxblood">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-serif text-2xl tracking-tight text-ivory">
                      {service.name}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-quiet">
                      {service.brief}
                    </span>
                  </span>
                  <span className="font-serif text-xl text-ivory sm:text-right">
                    {service.priceLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="py-16 sm:py-24">
          <Kicker>How it works</Kicker>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl tracking-tight sm:text-5xl">
            From a named drain to a workflow you can run.
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-2">
            {processSteps.map((step) => (
              <li key={step.number}>
                <p className="font-serif text-3xl text-oxblood">{step.number}</p>
                <h3 className="mt-2 font-serif text-2xl tracking-tight">{step.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-quiet">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10">
            <Link
              href="/how-it-works"
              className="text-sm font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4"
            >
              The full sequence
            </Link>
          </p>
        </Container>
      </section>

      {study ? (
        <section className="border-t border-line">
          <Container className="py-16 sm:py-24">
            <Kicker>Case study</Kicker>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-quiet">
              {kindLabel(study.kind)} · not a client engagement
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
              <Link href={`/case-studies/${study.slug}`} className="hover:text-oxblood">
                {study.title}
              </Link>
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">
              {study.description}
            </p>
            <p className="mt-6 text-sm text-quiet">
              <time dateTime={study.date}>{formatDate(study.date)}</time>
            </p>
          </Container>
        </section>
      ) : null}

      {notes.length > 0 ? (
        <section className="border-t border-line">
          <Container className="py-16 sm:py-24">
            <div className="flex items-end justify-between gap-6">
              <div>
                <Kicker>Notes</Kicker>
                <h2 className="mt-4 font-serif text-4xl tracking-tight">From the blog</h2>
              </div>
              <Link
                href="/blog"
                className="hidden text-sm font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4 sm:inline"
              >
                All notes
              </Link>
            </div>
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {notes.map((post) => (
                <li key={post.slug} className="border border-line p-6">
                  <time dateTime={post.date} className="text-sm text-quiet">
                    {formatDate(post.date)}
                  </time>
                  <h3 className="mt-3 font-serif text-2xl tracking-tight">
                    <Link href={`/blog/${post.slug}`} className="hover:text-oxblood">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-quiet">
                    {post.description}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6 sm:hidden">
              <Link
                href="/blog"
                className="text-sm font-semibold text-oxblood underline underline-offset-4"
              >
                All notes
              </Link>
            </p>
          </Container>
        </section>
      ) : null}

      <section id="faq" className="scroll-mt-24 border-t border-line">
        <Container className="py-16 sm:py-24">
          <Kicker>Questions</Kicker>
          <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">
            Before you book.
          </h2>
          <div className="mt-8">
            <FaqList items={faqs} />
          </div>
          <JsonLd data={faqJsonLd(faqs)} />
        </Container>
      </section>

      <AuditBand />
    </>
  );
}
