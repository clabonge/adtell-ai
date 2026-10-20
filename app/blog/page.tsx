import Link from "next/link";
import { AuditBand } from "@/components/AuditBand";
import { Container, PageHero } from "@/components/ui";
import { auditCta, auditPath } from "@/content/nav";
import { formatDate } from "@/lib/format";
import { getPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "Notes from Adtell.ai on where AI cuts operating cost, and why a savings audit comes before a software shortlist.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getPosts("blog");

  return (
    <>
      <PageHero
        kicker="Blog"
        title="Notes on cutting cost."
        lede="Short writing on where AI belongs in an operation, and where it does not. No performance claims dressed up as advice."
        crumbs={[{ name: "Blog", path: "/blog" }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <section>
        <Container className="py-14 sm:py-20">
          <ul className="grid gap-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <article className="border-b border-line pb-8">
                  <time dateTime={post.date} className="text-sm text-quiet">
                    {formatDate(post.date)}
                  </time>
                  <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                    <Link href={`/blog/${post.slug}`} className="hover:text-oxblood">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-2xl text-lg leading-relaxed text-quiet">
                    {post.description}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <AuditBand />
    </>
  );
}
