import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CompanyLists } from "@/components/CompanyLists";
import { MarkdownBody } from "@/components/MarkdownBody";
import { Container, JsonLd, PageHero } from "@/components/ui";
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

export default function CaseStudyPage(props: PageProps<"/case-studies/[slug]">) {
  return (
    <Suspense fallback={<ArticleFallback />}>
      <CaseStudy params={props.params} />
    </Suspense>
  );
}

async function CaseStudy({
  params,
}: {
  params: PageProps<"/case-studies/[slug]">["params"];
}) {
  const { slug } = await params;
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
      />
      <article>
        <Container className="max-w-3xl py-12 sm:py-16">
          <p className="text-sm text-quiet">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>
          {post.kind === "implementation" ? (
            <div className="mt-10">
              <h2 className="font-serif text-3xl tracking-tight text-ivory">
                The implementations
              </h2>
              <div className="mt-8">
                <CompanyLists />
              </div>
            </div>
          ) : null}
          <div className="mt-10">
            <MarkdownBody source={post.body} />
          </div>
        </Container>
      </article>
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

function ArticleFallback() {
  return (
    <Container className="py-24">
      <p className="text-lg text-quiet">Loading the case study.</p>
    </Container>
  );
}
