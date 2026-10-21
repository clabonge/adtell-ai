import { AuditBand } from "@/components/AuditBand";
import { Container, PageHero } from "@/components/ui";
import { legalReview, legalUpdated } from "@/content/legal";
import { auditCta, auditPath } from "@/content/nav";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "What the Adtell.ai audit form collects, where that request is stored, and how to ask for it to be deleted.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        kicker="Privacy"
        title="What we keep from the audit form."
        lede="This page describes the public audit form. It does not describe a paid engagement. That work is covered by a separate written agreement."
        crumbs={[{ name: "Privacy", path: "/privacy" }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <section>
        <Container className="max-w-3xl py-14 sm:py-20">
          <p className="text-sm text-quiet">{legalReview}</p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">What the form collects</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            The form asks for your name, email, company, and a description of the work. Industry
            and company size are optional. If your browser sends them, we also store the page address, the referring
            page, and the campaign parameters on the link you used.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            A hidden field is there to catch automated submissions. If that field is filled in, we
            do not save the request. We do not keep your raw IP address. A short-lived hash of it
            is used only to limit how often the form can be sent.
          </p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">Where it goes</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            A saved request is stored in our CRM database on Render. When email delivery is turned
            on, we also email the request to {site.email} through Resend. If we have configured a
            webhook, a copy can be sent there as well. That address is ours. It is not taken from
            the form.
          </p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">How we use it</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            We use the request to reply to you. We do not sell it. Sending the form is not
            permission for a marketing list. We do not use form submissions to train AI models.
          </p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">Client data and model training</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            On a paid engagement we use business-tier tools and settings that keep client data out
            of model training. We do not use client data to train AI models.
          </p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">Deletion</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">
            To ask us to delete a request, email{" "}
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
