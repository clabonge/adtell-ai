import Link from "next/link";
import { highlightedImplementations, implementationLine, site } from "@/content/site";

function caseStudyPath(business: (typeof site.implementations)[number]): string | undefined {
  return "study" in business ? business.study : undefined;
}

function ImplementationItems({
  items,
}: {
  items: readonly (typeof site.implementations)[number][];
}) {
  return (
    <ul className="grid gap-10">
      {items.map((business) => {
        const study = caseStudyPath(business);
        return (
          <li key={business.name}>
            <h3 className="font-serif text-2xl tracking-tight text-ivory">{business.name}</h3>
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-quiet">
              {implementationLine(business)}
            </p>
            {study ? (
              <p className="mt-3">
                <Link
                  href={study}
                  className="text-sm font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4"
                >
                  Read the case study
                </Link>
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function CompanyLists() {
  return <ImplementationItems items={site.implementations} />;
}

export function ImplementationHighlights() {
  return (
    <>
      <ImplementationItems items={highlightedImplementations()} />
      <p className="mt-8">
        <Link
          href="/case-studies"
          className="text-sm font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4"
        >
          All the businesses we have helped
        </Link>
      </p>
    </>
  );
}
