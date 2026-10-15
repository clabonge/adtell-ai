import { site } from "@/content/site";

function BusinessGroup({
  heading,
  group,
}: {
  heading: string;
  group: "division" | "operating";
}) {
  const businesses = site.businesses.filter((business) => business.group === group);

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-quiet">
        {heading}
      </h3>
      <ul className="mt-4 space-y-6">
        {businesses.map((business) => (
          <li key={business.name}>
            <p className="font-serif text-2xl tracking-tight text-ivory">{business.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-quiet">
              {business.work.join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompanyLists() {
  return (
    <div>
      <div className="grid gap-10 md:grid-cols-2">
        <BusinessGroup heading={`${site.holdingCompany} divisions`} group="division" />
        <BusinessGroup heading="Operating companies" group="operating" />
      </div>
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-quiet">
        These are companies {site.founder.name} operates. They are not client logos,
        and this site does not present them as customers. The lines under each name
        are examples of work agents already do there, including the website.
      </p>
    </div>
  );
}
