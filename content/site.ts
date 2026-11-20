import { bcleCaseStudy } from "@/content/bcle";

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
 * Businesses Adtell.ai has helped. `summary` is the public sentence.
 * `detail` adds only facts already published, such as which division
 * the business is. Adtell Integration is not on this list.
 *
 * `runningSince` and `tools` stay empty until a real month and tool
 * list are supplied. The site hides that line while both are empty.
 */
const implementations = [
  {
    name: "FiberOptics.com",
    summary:
      "We built FiberOptics.com an automation that updates website content, social media, customer outreach, and product recommendations for a person to approve.",
    detail:
      "FiberOptics.com is the product and shop division of Adtell Inc. The workflows use Outlook, Shopify, Teams, SharePoint, and QuickBooks.",
    runningSince: "",
    tools: [] as readonly string[],
    study: "/case-studies/fiberoptics-com-website-and-outreach",
  },
  {
    name: "The Fiber School",
    summary:
      "We built The Fiber School an automation that prepares student communications about expiring certifications, upselling additional classes, outreach, and social media for a person to approve.",
    detail:
      "The Fiber School is the training division of Adtell Inc. The public site is thefiberschool.com. The workflows use Outlook, Teams, SharePoint, and QuickBooks.",
    runningSince: "",
    tools: [] as readonly string[],
    study: "/case-studies/the-fiber-school-student-communications",
  },
  {
    name: "BCLE Furniture",
    summary:
      "We built BCLE Furniture BespokeQuote.furniture, which prices a quote from real materials and labor after clients upload drawings. A person reviews the quote, and the job is tracked in a dashboard.",
    detail: "",
    runningSince: "",
    tools: [] as readonly string[],
    study: bcleCaseStudy.path,
  },
  {
    name: "Doan Distillery",
    summary:
      "We built Doan Distillery an automation that drafts booking replies, prepares tasting-room and event times, and writes order follow-up and marketing notes for a person to confirm.",
    detail: "",
    runningSince: "",
    tools: [] as readonly string[],
    study: "/case-studies/doan-distillery-event-booking",
  },
  {
    name: "CapoVino",
    summary:
      "We built CapoVino an automation that drafts tasting follow-up, prepares bottle-order notes, and drafts marketing for a person to send.",
    detail: "",
    runningSince: "",
    tools: [] as readonly string[],
  },
  {
    name: "Trolley Barn Public Market",
    summary:
      "We built Trolley Barn Public Market an automation that drafts vendor replies, prepares event times, and drafts market announcements for a person to review.",
    detail: "",
    runningSince: "",
    tools: [] as readonly string[],
  },
  {
    name: "Ivers Property Management",
    summary:
      "We built Ivers Property Management an automation that drafts maintenance follow-up, drafts answers to tenant questions from material the company already uses, and prepares lease-renewal notes for a person to send.",
    detail: "",
    runningSince: "",
    tools: [] as readonly string[],
  },
] as const;

export const highlightNames = [
  "Doan Distillery",
  "CapoVino",
  "BCLE Furniture",
  "FiberOptics.com",
  "The Fiber School",
] as const;

export function highlightedImplementations() {
  return highlightNames.map((name) => {
    const found = implementations.find((item) => item.name === name);
    if (!found) throw new Error(`Missing implementation highlight: ${name}`);
    return found;
  });
}

export function implementationLine(item: (typeof implementations)[number]): string {
  const detail = item.detail.trim();
  return detail ? `${item.summary} ${detail}` : item.summary;
}

export function implementationByStudy(path: string) {
  return implementations.find((item) => "study" in item && item.study === path);
}

/** A line for the start month and tools. Hidden until both or either is filled. */
export function businessFacts(item: {
  runningSince?: string;
  tools?: readonly string[];
}): string | undefined {
  const since = item.runningSince?.trim() ?? "";
  const tools = (item.tools ?? []).map((tool) => tool.trim()).filter((tool) => tool.length > 0);
  const parts: string[] = [];
  if (since) parts.push(`Running since ${since}.`);
  if (tools.length > 0) parts.push(`Tools: ${tools.join(", ")}.`);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

/**
 * Public identity for the firm. Layout code reads this file; it does not
 * hard-code company names or the contact address.
 * Public contact is the email below, the audit form, and the optional booking
 * link. There is no public phone number.
 * Audit delivery is configured with env vars. See README "Audit form delivery".
 */
export const site = {
  name: "Adtell.ai",
  url: resolveSiteUrl(),
  email: "clabonge@adtell.ai",
  /**
   * Shared revision for public pages that have not moved since.
   * Sitemap lastmod uses this unless a page has its own later date.
   */
  updated: "2026-10-21",
  /** Pages revised after `updated`. */
  pageUpdated: {
    "/": "2026-10-27",
    "/how-it-works": "2026-10-25",
    "/about": "2026-10-26",
    "/case-studies": "2026-10-26",
    "/who-we-help/manufacturing-and-furniture": "2026-10-25",
    "/case-studies/bcle-furniture-bespokequote": "2026-10-25",
    "/services": "2026-10-26",
    "/contact": "2026-10-27",
    "/cfo-brief": "2026-10-26",
    "/case-studies/doan-distillery-event-booking": "2026-10-23",
  },
  tagline: "Cut the cost of work that should not still be done by hand.",
  serviceRegion: "Bucks, Montgomery and the Lehigh Valley",
  localPresence:
    "Based in Bucks County, serving Bucks, Montgomery and the Lehigh Valley, on-site or by video.",
  description:
    "Adtell.ai is the outsourced AI department. Hire the implementation team that removes operating cost. Start with a free AI savings audit. Based in Bucks County, serving Bucks, Montgomery and the Lehigh Valley, on-site or by video.",
  founder: {
    name: "Chris LaBonge",
    role: "Founder & President",
    organization: "Adtell Inc.",
  },
  holdingCompany: "Adtell Inc.",
  implementations,
} as const;

/**
 * Footer credit on every page. "Adtell Inc." already ends with the
 * abbreviation period, so the sentence does not add a second one.
 */
function sentence(value: string): string {
  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export const footerIntro = `${sentence(
  `${site.name} is the outsourced AI department, led by ${site.founder.name}, ${site.founder.role} of ${site.founder.organization}`,
)} We implement AI that cuts operating cost.`;
