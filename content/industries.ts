import { implementationLine, site } from "@/content/site";

/**
 * Industry pages under Who we help. Each business is an implementation
 * we helped, named once, using the published goal and method.
 */
export const whoWeHelp = {
  path: "/who-we-help",
  title: "Who we help",
  description:
    "Hospitality and events, property management, furniture, training schools, and public markets. The businesses we have helped, and the work we implemented.",
  kicker: "Who we help",
  heading: "The work we have already implemented.",
  lede: "We implement AI for operators who still do repetitive work by hand. Each page names the businesses we helped and the task we took on.",
  updated: "2026-10-22",
} as const;

export const industries = [
  {
    slug: "hospitality-and-events",
    name: "Hospitality and events",
    description:
      "Event booking, tasting follow-up, and the notes a person still confirms. We helped Doan Distillery and CapoVino, a winery.",
    lede: "Booking replies, tasting-room times, and the follow-up after an event still land on someone's desk. We draft that work. A person still confirms what goes out.",
    paragraphs: [
      "The work is usually ordinary: a booking request, a tasting follow-up, an order note, or a marketing draft. We start with material the business already uses.",
      "CapoVino is a winery. Tasting follow-up and bottle orders are the work we implemented there.",
    ],
    businesses: ["Doan Distillery", "CapoVino"],
  },
  {
    slug: "property-management",
    name: "Property management",
    description:
      "Maintenance follow-up, tenant questions, and lease-renewal notes. We helped Ivers Property Management.",
    lede: "Maintenance follow-up, answers to tenant questions, and lease-renewal notes are the work a property manager still sends by hand. We draft that work from material the company already uses. A person still sends it.",
    paragraphs: [
      "The source material is already in the business: old replies, lease notes, and the way the team already answers a question. The automation prepares the next draft. It does not replace the person who sends it.",
    ],
    businesses: ["Ivers Property Management"],
  },
  {
    slug: "manufacturing-and-furniture",
    name: "Manufacturing and furniture",
    description:
      "BespokeQuote.furniture for quoting and inventory at BCLE Furniture. Clients upload drawings, a person reviews the quote, and the job is tracked in a dashboard.",
    lede: "Adtell.ai delivered BespokeQuote.furniture to BCLE Furniture to automate quoting and inventory management. A person reviews the quote.",
    paragraphs: [
      "Clients upload drawings: DWG, DXF, PDF, and sketches. A person reviews a quote priced from real materials and labor. The job is approved with a PO and deposit. Status and messages live in a dashboard.",
    ],
    businesses: ["BCLE Furniture"],
  },
  {
    slug: "training-schools",
    name: "Training schools",
    description:
      "Class schedules, enrollment follow-up, and student questions between sessions. We helped The Fiber School and FiberOptics.com.",
    lede: "Class schedules, enrollment follow-up, and answers to student questions between sessions are the work we have implemented for a training school. A person still confirms the schedule and the reply.",
    paragraphs: [
      "FiberOptics.com includes training-student scheduling among the tasks we helped move off someone's plate, along with sales follow-up, marketing drafts, and order follow-up. A person still reviews what the automation prepares.",
    ],
    businesses: ["The Fiber School", "FiberOptics.com"],
  },
  {
    slug: "public-markets-and-retail",
    name: "Public markets and retail",
    description:
      "Vendor replies, event times, and market announcements a person still reviews. We helped Trolley Barn Public Market.",
    lede: "Vendor replies, event times, and market announcements are the work we have implemented for a public market. A person still reviews what goes out.",
    paragraphs: [
      "A retail counter has the same kind of follow-up: a vendor message, an event time, or an announcement a person still checks before it is sent. The business we have helped in this group is Trolley Barn Public Market.",
    ],
    businesses: ["Trolley Barn Public Market"],
  },
] as const;

export type Industry = (typeof industries)[number];

export function getIndustry(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}

export function industryPath(industry: Industry): string {
  return `${whoWeHelp.path}/${industry.slug}`;
}

export function industryBusinesses(industry: Industry) {
  return industry.businesses.map((name) => {
    const found = site.implementations.find((item) => item.name === name);
    if (!found) throw new Error(`Missing implementation for ${industry.slug}: ${name}`);
    return found;
  });
}

export function industryLines(industry: Industry): string[] {
  return industryBusinesses(industry).map((business) => implementationLine(business));
}

export function industryAsk(industry: Industry): string {
  const name = `${industry.name.charAt(0).toLowerCase()}${industry.name.slice(1)}`;
  return `Ask what we'd do for your ${name} business`;
}
