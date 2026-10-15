import Link from "next/link";
import { auditPath, primaryNav } from "@/content/nav";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-forest-line bg-forest-deep text-paper">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl tracking-tight">
            Adtell<span className="text-copper-bright">.ai</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">
            {site.name} is led by {site.founder.name}, {site.founder.role} of{" "}
            {site.founder.organization}. We help businesses implement AI that cuts
            operating cost.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper-bright">
            On this site
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-paper hover:text-copper-bright">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={auditPath} className="text-paper hover:text-copper-bright">
                Book an audit
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper-bright">
            Contact
          </p>
          {/* TODO: hello@adtell.ai is a placeholder. See content/site.ts. */}
          <p className="mt-4 text-sm leading-relaxed text-mist">
            <a
              className="font-semibold text-paper underline decoration-copper-bright/60 underline-offset-4"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-mist">
            {site.holdingCompany} divisions: {site.divisions.join(", ")}.
          </p>
        </div>
      </div>
      <div className="border-t border-forest-line">
        <p className="mx-auto w-full max-w-6xl px-5 py-4 text-xs text-mist sm:px-8">
          © {site.updated.slice(0, 4)} {site.name}
        </p>
      </div>
    </footer>
  );
}
