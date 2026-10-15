import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MarkdownBody } from "@/components/MarkdownBody";
import { Container, JsonLd, PageHero } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getPost, getPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return getPosts("blog").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost("blog", slug);
  if (!post) return { title: "Note" };
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    ogType: "article",
    publishedTime: `${post.date}T00:00:00.000Z`,
  });
}

export default function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<ArticleFallback />}>
      <BlogPost params={props.params} />
    </Suspense>
  );
}

async function BlogPost({ params }: { params: PageProps<"/blog/[slug]">["params"] }) {
  const { slug } = await params;
  const post = getPost("blog", slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path },
  ];

  return (
    <>
      <PageHero
        kicker="Note"
        title={post.title}
        lede={post.description}
        crumbs={[{ name: "Blog", path: "/blog" }]}
      />
      <article className="bg-paper">
        <Container className="max-w-3xl py-12 sm:py-16">
          <p className="text-sm text-muted">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true"> · </span>
            Adtell.ai
          </p>
          <div className="mt-2">
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
      <p className="text-lg text-ink-soft">Loading the note.</p>
    </Container>
  );
}
