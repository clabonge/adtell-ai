import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuditBand } from "@/components/AuditBand";
import { Container, JsonLd, PageHero } from "@/components/ui";
import {
  getIndustry,
  industries,
  industryBusinesses,
  industryLines,
  industryPath,
  whoWeHelp,
} from "@/content/industries";
import { auditCta, auditPath } from "@/content/nav";
import { sampleAudit } from "@/content/sample-audit";
import { industryWorkflows } from "@/content/workflows";
import { HandoffList, WorkflowDiagram } from "@/components/WorkflowDiagram";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata(props: PageProps<"/who-we-help/[slug]">) {
  const { slug } = await props.params;
  const industry = getIndustry(slug);
  if (!industry) return { title: whoWeHelp.title };
  return pageMetadata({
    title: industry.name,
    description: industry.description,
    path: industryPath(industry),
  });
}

export default function IndustryPage(props: PageProps<"/who-we-help/[slug]">) {
  return (
    <Suspense fallback={<IndustryFallback />}>
      <Industry params={props.params} />
    </Suspense>
  );
}

async function Industry({
  params,
}: {
  params: PageProps<"/who-we-help/[slug]">["params"];
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const path = industryPath(industry);
  const businesses = industryBusinesses(industry);
  const lines = industryLines(industry);

  return (
    <>
      <PageHero
        kicker={whoWeHelp.kicker}
        title={industry.name}
        lede={industry.lede}
        crumbs={[
          { name: whoWeHelp.title, path: whoWeHelp.path },
          { name: industry.name, path },
        ]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <article>
        <Container className="max-w-3xl py-14 sm:py-20">
          {industry.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-lg leading-relaxed text-quiet first:mt-0">
              {paragraph}
            </p>
          ))}
          <WorkflowDiagram heading="How the work moves" steps={industryWorkflows[industry.slug]} />
          <HandoffList />
          <h2 className="mt-12 font-serif text-3xl tracking-tight">Businesses we helped</h2>
          <ul className="mt-8 grid gap-10">
            {businesses.map((business, index) => (
              <li key={business.name}>
                <h3 className="font-serif text-2xl tracking-tight">{business.name}</h3>
                <p className="mt-2 text-base leading-relaxed text-quiet">{lines[index]}</p>
              </li>
            ))}
          </ul>
          <h2 className="mt-12 font-serif text-3xl tracking-tight">Related</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-quiet">
            {industry.slug === "hospitality-and-events" ? (
              <li>
                <Link
                  href="/case-studies/doan-distillery-event-booking"
                  className="font-semibold text-oxblood underline underline-offset-4"
                >
                  Event booking at Doan Distillery
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                href={sampleAudit.path}
                className="font-semibold text-oxblood underline underline-offset-4"
              >
                See an example of the one-page list
              </Link>
              . {sampleAudit.label}. It uses a fictional business.
            </li>
          </ul>
        </Container>
      </article>
      <AuditBand />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: whoWeHelp.title, path: whoWeHelp.path },
          { name: industry.name, path },
        ])}
      />
    </>
  );
}

function IndustryFallback() {
  return (
    <Container className="py-24">
      <p className="text-lg text-quiet">Loading this industry.</p>
    </Container>
  );
}
