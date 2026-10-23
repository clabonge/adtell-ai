import { Suspense } from "react";
import { BookingPrompt } from "@/components/BookingPrompt";
import { ContactForm } from "@/components/ContactForm";
import { Container, PageHero } from "@/components/ui";
import { auditOffer } from "@/content/audit";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact us",
  description:
    "Request your free AI audit. Tell Adtell.ai your name, email, company, and the work that costs the most.",
  path: "/contact",
});

function clipParam(value: string | string[] | undefined, max: number): string {
  const text = Array.isArray(value) ? value[0] : value;
  if (typeof text !== "string") return "";
  return text.replace(/\s+/g, " ").trim().slice(0, max);
}

export default function ContactPage(props: {
  searchParams: Promise<{ industry?: string | string[]; weekly_time?: string | string[] }>;
}) {
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Contact us"
        lede="Request your free AI audit."
        crumbs={[{ name: "Contact us", path: "/contact" }]}
        cta={{ href: "#audit-request", label: auditOffer.cta }}
      />
      <section id="audit-request" className="scroll-mt-24">
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)]">
          <Suspense fallback={<ContactForm />}>
            <PrefilledContactForm searchParams={props.searchParams} />
          </Suspense>
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

async function PrefilledContactForm({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string | string[]; weekly_time?: string | string[] }>;
}) {
  const query = await searchParams;
  const industry = clipParam(query.industry, 120);
  const weeklyTime = clipParam(query.weekly_time, 500);
  return <ContactForm initialIndustry={industry} initialWeeklyTime={weeklyTime} />;
}
