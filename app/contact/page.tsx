import { ContactForm } from "@/components/ContactForm";
import { Container, PageHero } from "@/components/ui";
import { auditExpect } from "@/content/audit";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book a free AI savings audit",
  description:
    "Tell Adtell.ai your company, industry, size, and the work that costs the most time. The free AI savings audit starts there.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Book a free AI savings audit."
        lede="Share the company and the work that costs you the most. We email the request to the team. If email is not connected, the form gives you a note to send."
        crumbs={[{ name: "Book an audit", path: "/contact" }]}
      />
      <section>
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 className="font-serif text-3xl tracking-tight">What to expect</h2>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-relaxed text-quiet">
              {auditExpect.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h2 className="mt-10 font-serif text-3xl tracking-tight">Write directly</h2>
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
              . Include your name, company, industry, size, and the biggest time or cost
              drains. Leave out secrets, customer lists, and passwords.
            </p>
          </div>
          <ContactForm />
        </Container>
      </section>
    </>
  );
}
