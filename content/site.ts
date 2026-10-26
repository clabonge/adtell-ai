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
 * Businesses Adtell.ai has helped. Each line is a goal and how the
 * automation works. Adtell Integration is not on this list.
 */
const implementations = [
  {
    name: "FiberOptics.com",
    goal: "updating website content, social media, customer outreach, and product recommendations",
    how: "FiberOptics.com is the product and shop division of Adtell Inc. The workflows use Outlook, Shopify, Teams, SharePoint, and QuickBooks. A person reviews and approves what goes out.",
    study: "/case-studies/fiberoptics-com-website-and-outreach",
  },
  {
    name: "The Fiber School",
    goal: "student communications about expiring certifications, upselling additional classes, outreach, and social media",
    how: "The Fiber School is the training division of Adtell Inc. The public site is thefiberschool.com. The workflows use Outlook, Teams, SharePoint, and QuickBooks. A person reviews and approves what goes out.",
    study: "/case-studies/the-fiber-school-student-communications",
  },
  {
    name: "BCLE Furniture",
    goal: "automating quoting and inventory management",
    how: "Adtell.ai delivered BespokeQuote.furniture. Clients upload drawings, a person reviews a quote priced from real materials and labor, and the job is tracked in a dashboard.",
    study: bcleCaseStudy.path,
  },
  {
    name: "Doan Distillery",
    goal: "offloading event booking",
    how: "The automation drafts booking replies, prepares tasting-room and event times, and writes order follow-up and marketing notes a person still confirms.",
  },
  {
    name: "CapoVino",
    goal: "offloading tasting follow-up and bottle orders",
    how: "The automation drafts tasting follow-up, prepares bottle-order notes, and drafts marketing a person still sends.",
  },
  {
    name: "Trolley Barn Public Market",
    goal: "offloading vendor follow-up and event scheduling",
    how: "The automation drafts vendor replies, prepares event times, and drafts market announcements a person still reviews.",
  },
  {
    name: "Ivers Property Management",
    goal: "offloading maintenance follow-up and tenant questions",
    how: "The automation drafts maintenance follow-up, drafts answers to tenant questions from material the company already uses, and prepares lease-renewal notes a person still sends.",
  },
] as const;

export const highlightNames = ["Doan Distillery", "CapoVino", "BCLE Furniture"] as const;

export function highlightedImplementations() {
  return highlightNames.map((name) => {
    const found = implementations.find((item) => item.name === name);
    if (!found) throw new Error(`Missing implementation highlight: ${name}`);
    return found;
  });
}

export function implementationLine(item: (typeof implementations)[number]): string {
  return `We helped ${item.name} implement AI automation with the goal of ${item.goal}. ${item.how}`;
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
    "/": "2026-10-25",
    "/how-it-works": "2026-10-25",
    "/about": "2026-10-25",
    "/case-studies": "2026-10-25",
    "/who-we-help/manufacturing-and-furniture": "2026-10-25",
    "/case-studies/bcle-furniture-bespokequote": "2026-10-25",
    "/services": "2026-10-22",
    "/contact": "2026-10-26",
    "/cfo-brief": "2026-10-22",
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
