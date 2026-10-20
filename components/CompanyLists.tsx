import Link from "next/link";
import { highlightedImplementations, implementationLine, site } from "@/content/site";

function ImplementationItems({
  items,
}: {
  items: readonly (typeof site.implementations)[number][];
}) {
  return (
    <ul className="grid gap-10">
      {items.map((business) => (
        <li key={business.name}>
          <h3 className="font-serif text-2xl tracking-tight text-ivory">{business.name}</h3>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-quiet">
            {implementationLine(business)}
          </p>
        </li>
      ))}
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
