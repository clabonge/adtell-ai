import Link from "next/link";
import { counties, countyPath } from "@/content/counties";
import { auditCta, auditPath, primaryNav } from "@/content/nav";
import { footerIntro, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-void text-ivory print:hidden">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl tracking-tight">
            <span className="sr-only">{site.name}</span>
            <span aria-hidden="true">
              Adtell<span className="text-oxblood">.ai</span>
            </span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-quiet">{footerIntro}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-quiet">{site.localPresence}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {counties.map((county) => (
              <li key={county.slug}>
                <Link href={countyPath(county)} className="text-ivory hover:text-oxblood">
                  {county.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood">
            On this site
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ivory hover:text-oxblood">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={auditPath} className="text-ivory hover:text-oxblood">
                {auditCta}
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood">
            Contact
          </p>
          <p className="mt-4 text-sm leading-relaxed text-quiet">
            <a
              className="font-semibold text-ivory underline decoration-oxblood/60 underline-offset-4"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-quiet">
            <a
              className="font-semibold text-ivory underline decoration-oxblood/60 underline-offset-4"
              href={`tel:${site.phoneTel}`}
            >
              {site.phone}
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto flex w-full max-w-6xl flex-wrap gap-x-4 gap-y-2 px-5 py-4 text-xs text-quiet sm:px-8">
          <span>© {site.updated.slice(0, 4)} {site.name}</span>
          <Link href="/privacy" className="underline underline-offset-4 hover:text-ivory">
            Privacy
          </Link>
          <Link href="/security" className="underline underline-offset-4 hover:text-ivory">
            Security
          </Link>
          <Link href="/terms" className="underline underline-offset-4 hover:text-ivory">
            Terms
          </Link>
        </p>
      </div>
    </footer>
  );
}
