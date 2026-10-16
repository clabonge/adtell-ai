import { implementationLine, site } from "@/content/site";

export function CompanyLists() {
  return (
    <ul className="grid gap-10">
      {site.implementations.map((business) => (
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
