import Link from "next/link";
import { notFound } from "next/navigation";
import { AuditBand } from "@/components/AuditBand";
import { ClientQuote } from "@/components/ClientQuote";
import { BcleCaseStudyShots } from "@/components/BcleSections";
import { HandoffList, WorkflowDiagram } from "@/components/WorkflowDiagram";
import { bcleCaseStudy } from "@/content/bcle";
import { MarkdownBody } from "@/components/MarkdownBody";
import { Container, JsonLd, PageHero } from "@/components/ui";
import { getIndustry, industryPath } from "@/content/industries";
import { auditCta, auditPath } from "@/content/nav";
import { sampleAudit } from "@/content/sample-audit";
import { doanWorkflow } from "@/content/workflows";
import { formatDate } from "@/lib/format";
import { getPost, getPosts, kindLabel } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return getPosts("case-studies").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/case-studies/[slug]">) {
  const { slug } = await props.params;
  const post = getPost("case-studies", slug);
  if (!post) return { title: "Case study" };
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/case-studies/${post.slug}`,
    ogType: "article",
    publishedTime: `${post.date}T00:00:00.000Z`,
  });
}

export default async function CaseStudyPage(props: PageProps<"/case-studies/[slug]">) {
  const { slug } = await props.params;
  const post = getPost("case-studies", slug);
  if (!post) notFound();

  const path = `/case-studies/${post.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Case studies", path: "/case-studies" },
    { name: post.title, path },
  ];

  return (
    <>
      <PageHero
        kicker={kindLabel(post.kind) ?? "Case study"}
        title={post.title}
        lede={post.description}
        crumbs={[{ name: "Case studies", path: "/case-studies" }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <article>
        <Container className="max-w-3xl py-12 sm:py-16">
          <p className="text-sm text-quiet">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>
          <ClientQuote slug={post.slug} />
          <div className="mt-10">
            <MarkdownBody source={post.body} />
          </div>
          {post.slug === bcleCaseStudy.slug ? <BcleCaseStudyShots /> : null}
          {post.slug === "doan-distillery-event-booking" ? (
            <>
              <WorkflowDiagram heading="How event booking moves" steps={doanWorkflow} />
              <HandoffList />
              <RelatedProof />
            </>
          ) : null}
        </Container>
      </article>
      <AuditBand />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.description,
          date: post.date,
          path,
        })}
      />
    </>
  );
}

function RelatedProof() {
  const hospitality = getIndustry("hospitality-and-events");
  if (!hospitality) return null;
  return (
    <div className="mt-12 border-t border-line pt-8">
      <h2 className="font-serif text-3xl tracking-tight">Related</h2>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-quiet">
        <li>
          <Link
            href={industryPath(hospitality)}
            className="font-semibold text-oxblood underline underline-offset-4"
          >
            {hospitality.name}
          </Link>
        </li>
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
    </div>
  );
}
