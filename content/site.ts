/**
 * Public origin for canonical URLs, Open Graph, the sitemap, robots.txt,
 * and structured data. One value: NEXT_PUBLIC_SITE_URL, defaulting to the
 * production domain. A trailing slash is ignored.
 */
const DEFAULT_SITE_URL = "https://adtell.ai";

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const value = configured || DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return new URL(withProtocol).origin;
}

/**
 * Public identity for the firm. Layout code reads this file; it does not
 * hard-code company names or the contact address.
 *
 * TODO: hello@adtell.ai is a placeholder inbox. Confirm the production
 * address before launch and update `email`. Wiring the audit form to that
 * inbox is a separate TODO in app/api/audit/route.ts.
 */
export const site = {
  name: "Adtell.ai",
  url: resolveSiteUrl(),
  email: "hello@adtell.ai",
  updated: "2026-10-15",
  tagline: "Cut the cost of work that should not still be done by hand.",
  description:
    "Adtell.ai helps businesses implement AI that removes operating cost. Start with a free AI savings audit.",
  founder: {
    name: "Chris LaBonge",
    role: "Founder & President",
    organization: "Adtell Inc.",
  },
  holdingCompany: "Adtell Inc.",
  divisions: ["FiberOptics.com", "The Fiber School", "Adtell Integration"],
  operatingCompanies: [
    "BCLE Furniture",
    "Doan Distillery",
    "LaBonge Estates Winery",
    "Trolley Barn Public Market",
    "Ivers Property Management",
  ],
} as const;
