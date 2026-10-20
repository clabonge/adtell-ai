import { AuditBand } from "@/components/AuditBand";
import { Container, PageHero } from "@/components/ui";
import { legalReview, legalUpdated } from "@/content/legal";
import { auditCta, auditPath } from "@/content/nav";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms",
  description:
    "Basic terms for using the Adtell.ai website. A paid engagement is governed by a separate written agreement.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        kicker="Terms"
        title="Using this website."
        lede="These terms cover the public site only. Work we do for a company is governed by a separate written agreement."
        crumbs={[{ name: "Terms", path: "/terms" }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <section>
        <Container className="max-w-3xl py-14 sm:py-20">
          <p className="text-sm text-quiet">{legalReview}</p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">The site</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            {site.name} publishes this site to describe the firm and to take audit requests. You
            may read the pages and send a request. Please do not send secrets, customer lists, or
            passwords through the form.
          </p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">No engagement yet</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            Sending the form, or reading a page, does not create a contract. A paid engagement
            starts only when both sides sign a separate written agreement. That agreement, not
            these terms, governs the work, the price, and the systems involved.
          </p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">The words on the site</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            The writing and the design of this site belong to {site.name}. You may link to a page.
            You may not copy the site and present it as your own.
          </p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">Questions</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            Email{" "}
            <a
              className="font-semibold text-oxblood underline underline-offset-4"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
            .
          </p>
          <p className="mt-10 text-sm text-quiet">Last updated {legalUpdated}.</p>
        </Container>
      </section>
      <AuditBand />
    </>
  );
}
