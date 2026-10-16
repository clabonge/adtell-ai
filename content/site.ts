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
 * Companies Chris operates, with examples of work agents already do there.
 * Every company includes website creation and management.
 */
const businesses = [
  {
    name: "FiberOptics.com",
    group: "division",
    work: [
      "Sales automation",
      "Marketing",
      "Training student follow-up and scheduling",
      "Order follow-up",
      "Website creation and management",
    ],
  },
  {
    name: "The Fiber School",
    group: "division",
    work: [
      "Class scheduling",
      "Enrollment follow-up",
      "Student questions between sessions",
      "Website creation and management",
    ],
  },
  {
    name: "Adtell Integration",
    group: "division",
    work: ["Bid matching", "Bid submission", "Website creation and management"],
  },
  {
    name: "BCLE Furniture",
    group: "operating",
    work: [
      "Inventory automation",
      "Sales follow-up",
      "Marketing automation",
      "Website creation and management",
    ],
  },
  {
    name: "Doan Distillery",
    group: "operating",
    work: [
      "Order follow-up",
      "Tasting-room and event scheduling",
      "Marketing",
      "Website creation and management",
    ],
  },
  {
    name: "LaBonge Estates Winery",
    group: "operating",
    work: [
      "Tasting follow-up",
      "Bottle order follow-up",
      "Marketing",
      "Website creation and management",
    ],
  },
  {
    name: "Trolley Barn Public Market",
    group: "operating",
    work: [
      "Vendor follow-up",
      "Event scheduling",
      "Market announcements",
      "Website creation and management",
    ],
  },
  {
    name: "Ivers Property Management",
    group: "operating",
    work: [
      "Maintenance follow-up",
      "Tenant questions",
      "Lease renewal follow-up",
      "Website creation and management",
    ],
  },
] as const;

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
  businesses,
  divisions: businesses
    .filter((business) => business.group === "division")
    .map((business) => business.name),
  operatingCompanies: businesses
    .filter((business) => business.group === "operating")
    .map((business) => business.name),
} as const;
