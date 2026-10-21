import { BookingPrompt } from "@/components/BookingPrompt";
import { SampleAuditPreview } from "@/components/AuditConversion";
import { ContactForm } from "@/components/ContactForm";
import { Container, PageHero } from "@/components/ui";
import { auditOffer } from "@/content/audit";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book a free AI audit",
  description:
    "Get a free one-page list of the work AI can take off your team. Tell Adtell.ai your name, email, company, and the work that costs the most.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Get a free one-page list of the work AI can take off your team."
        lede="Tell us your name, email, company, and the work that costs the most."
        crumbs={[{ name: "Book an audit", path: "/contact" }]}
        cta={{ href: "#audit-request", label: auditOffer.cta }}
      />
      <SampleAuditPreview />
      <section id="audit-request" className="scroll-mt-24">
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)]">
          <ContactForm />
          <div>
            <h2 className="font-serif text-3xl tracking-tight">Write directly</h2>
            <p className="mt-4 text-base leading-relaxed text-quiet">
              Email{" "}
              <a
                className="font-semibold text-oxblood underline underline-offset-4"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>{" "}
              or call{" "}
              <a
                className="font-semibold text-oxblood underline underline-offset-4"
                href={`tel:${site.phoneTel}`}
              >
                {site.phone}
              </a>
              . Include your name, company, and the work that costs the most. Leave out
              secrets, customer lists, and passwords.
            </p>
            <BookingPrompt tone="void" className="mt-8" />
          </div>
        </Container>
      </section>
    </>
  );
}
