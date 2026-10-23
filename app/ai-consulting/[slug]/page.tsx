import { notFound } from "next/navigation";
import { WorkflowTry } from "@/components/WorkflowTry";
import { AuditBand } from "@/components/AuditBand";
import { Container, JsonLd, PageHero } from "@/components/ui";
import { counties, countyPath, getCounty } from "@/content/counties";
import { auditCta, auditPath } from "@/content/nav";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, countyServiceJsonLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return counties.map((county) => ({ slug: county.slug }));
}

export async function generateMetadata(props: PageProps<"/ai-consulting/[slug]">) {
  const { slug } = await props.params;
  const county = getCounty(slug);
  if (!county) return { title: "AI consulting" };
  return pageMetadata({
    title: county.title,
    description: county.description,
    path: countyPath(county),
  });
}

export default async function CountyPage(props: PageProps<"/ai-consulting/[slug]">) {
  const { slug } = await props.params;
  const county = getCounty(slug);
  if (!county) notFound();

  const path = countyPath(county);

  return (
    <>
      <PageHero
        kicker="On-site"
        title={county.title}
        lede={county.lede}
        crumbs={[{ name: county.name, path }]}
        after={<WorkflowTry />}
        cta={{ href: auditPath, label: auditCta }}
      />
      <article>
        <Container className="max-w-3xl py-14 sm:py-20">
          <h2 className="font-serif text-3xl tracking-tight">{county.onSiteTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">{county.onSite}</p>
          <h2 className="mt-10 font-serif text-3xl tracking-tight">{county.workTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">{county.work}</p>
        </Container>
      </article>
      <AuditBand />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: county.name, path },
        ])}
      />
      <JsonLd data={countyServiceJsonLd(county.areaServed)} />
    </>
  );
}
