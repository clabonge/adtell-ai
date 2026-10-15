import { site } from "@/content/site";

export function CompanyLists() {
  return (
    <div>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-quiet">
            {site.holdingCompany} divisions
          </h3>
          <ul className="mt-4 space-y-2">
            {site.divisions.map((division) => (
              <li key={division} className="font-serif text-2xl tracking-tight text-ivory">
                {division}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-quiet">
            Operating companies
          </h3>
          <ul className="mt-4 space-y-2">
            {site.operatingCompanies.map((company) => (
              <li key={company} className="font-serif text-2xl tracking-tight text-ivory">
                {company}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-quiet">
        These are companies {site.founder.name} operates. They are not client logos,
        and this site does not present them as customers.
      </p>
    </div>
  );
}
