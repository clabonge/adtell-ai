import { site } from "@/content/site";

export function CompanyLists({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const body = tone === "dark" ? "text-mist" : "text-ink-soft";
  const name = tone === "dark" ? "text-paper" : "text-ink";

  return (
    <div>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h3 className={`text-sm font-semibold uppercase tracking-[0.16em] ${body}`}>
            {site.holdingCompany} divisions
          </h3>
          <ul className="mt-4 space-y-2">
            {site.divisions.map((division) => (
              <li key={division} className={`font-serif text-2xl tracking-tight ${name}`}>
                {division}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={`text-sm font-semibold uppercase tracking-[0.16em] ${body}`}>
            Operating companies
          </h3>
          <ul className="mt-4 space-y-2">
            {site.operatingCompanies.map((company) => (
              <li key={company} className={`font-serif text-2xl tracking-tight ${name}`}>
                {company}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className={`mt-8 max-w-2xl text-sm leading-relaxed ${body}`}>
        These are companies {site.founder.name} operates. They are not client logos,
        and this site does not present them as customers.
      </p>
    </div>
  );
}
