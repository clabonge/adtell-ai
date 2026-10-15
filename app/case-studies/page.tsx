import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getPosts, kindLabel } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Case studies",
  description:
    "Notes on running operating companies with AI agents. Qualitative only. No client logos and no invented results.",
  path: "/case-studies",
});

export default function CaseStudiesPage() {
  const studies = getPosts("case-studies");

  return (
    <>
      <PageHero
        kicker="Case studies"
        title="Practice, written down."
        lede="These notes describe work inside companies we operate. They are not client logos, and they do not invent performance figures."
        crumbs={[{ name: "Case studies", path: "/case-studies" }]}
      />
      <section>
        <Container className="py-14 sm:py-20">
          <ul className="grid gap-6">
            {studies.map((study) => (
              <li key={study.slug}>
                <article className="border border-line p-6 sm:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-oxblood">
                    {kindLabel(study.kind)}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                    <Link href={`/case-studies/${study.slug}`} className="hover:text-oxblood">
                      {study.title}
                    </Link>
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">
                    {study.description}
                  </p>
                  <p className="mt-4 text-sm text-quiet">
                    <time dateTime={study.date}>{formatDate(study.date)}</time>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
