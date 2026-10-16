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
 * Businesses Adtell.ai has helped. Each line is a goal and how the
 * automation works. No results and no figures. Adtell Integration is
 * not on this list.
 */
const implementations = [
  {
    name: "FiberOptics.com",
    goal: "offloading sales follow-up, marketing drafts, training-student scheduling, and order follow-up",
    how: "The automation drafts the next sales step, prepares marketing notes, schedules student follow-up, and writes order updates a person still reviews. We also create and manage the website.",
  },
  {
    name: "The Fiber School",
    goal: "offloading class scheduling and enrollment follow-up",
    how: "The automation prepares the class schedule, drafts enrollment follow-up, and drafts answers to student questions between sessions from material the school already uses. A person still confirms the schedule and the reply. We also create and manage the website.",
  },
  {
    name: "BCLE Furniture",
    goal: "offloading inventory updates, sales follow-up, and marketing",
    how: "The automation prepares inventory notes, drafts sales follow-up, and drafts marketing a person still reviews. We also create and manage the website.",
  },
  {
    name: "Doan Distillery",
    goal: "offloading event booking",
    how: "The automation drafts booking replies, prepares tasting-room and event times, and writes order follow-up and marketing notes a person still confirms. We also create and manage the website.",
  },
  {
    name: "LaBonge Estates Winery",
    goal: "offloading tasting follow-up and bottle orders",
    how: "The automation drafts tasting follow-up, prepares bottle-order notes, and drafts marketing a person still sends. We also create and manage the website.",
  },
  {
    name: "Trolley Barn Public Market",
    goal: "offloading vendor follow-up and event scheduling",
    how: "The automation drafts vendor replies, prepares event times, and drafts market announcements a person still reviews. We also create and manage the website.",
  },
  {
    name: "Ivers Property Management",
    goal: "offloading maintenance follow-up and tenant questions",
    how: "The automation drafts maintenance follow-up, drafts answers to tenant questions from material the company already uses, and prepares lease-renewal notes a person still sends. We also create and manage the website.",
  },
] as const;

export function implementationLine(item: (typeof implementations)[number]): string {
  return `We helped ${item.name} implement AI automation with the goal of ${item.goal}. ${item.how}`;
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
  implementations,
} as const;
