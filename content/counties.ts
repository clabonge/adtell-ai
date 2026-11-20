/**
 * Local landing pages. Each page has its own copy.
 * No client claims, no street address, and no invented statistics.
 */
export type CountyPage = {
  slug: string;
  name: string;
  areaServed: string;
  title: string;
  description: string;
  lede: string;
  onSiteTitle: string;
  onSite: string;
  workTitle: string;
  work: string;
};

export const counties: readonly CountyPage[] = [
  {
    slug: "bucks-county-pa",
    name: "Bucks County",
    areaServed: "Bucks County",
    title: "AI consulting in Bucks County",
    description:
      "On-site AI audits and workshops in Bucks County, where we are based. Start with a free AI audit at your building or by video.",
    lede: "We are based in Bucks County, so the free AI audit can be at your building. A workshop can be there too, for a team about to live with a new workflow or already using AI tools. Video is the other option when a drive wastes the hour.",
    onSiteTitle: "The audit comes to you",
    onSite:
      "In Bucks County the first session is at your office, your shop, or your plant. We do not publish a street address, and you do not come to an office of ours. We come to the room where the work happens, or we meet on video. A workshop can be on-site with the people who will use the system, including a team already using AI tools.",
    workTitle: "Bring the task a person still repeats",
    work: "Bring a reply, a schedule, a follow-up, or a note that gets retyped. We do not arrive with a software shortlist. If the honest recommendation is to wait, that is what you get. A workshop can also stand on its own for a team already using AI tools without a shared standard.",
  },
  {
    slug: "montgomery-county-pa",
    name: "Montgomery County",
    areaServed: "Montgomery County",
    title: "AI consulting in Montgomery County",
    description:
      "On-site AI audits and workshops in Montgomery County. We drive over from Bucks County. There is no office to visit.",
    lede: "Montgomery County is close enough that the free AI audit and a workshop can be at your office. We drive over from Bucks County. There is no Montgomery office and no street address to visit.",
    onSiteTitle: "We drive over for the session",
    onSite:
      "The free AI audit can sit in a conference room in Montgomery County, or on video if that is simpler. When the audit says a workshop is earned, that workshop can be in the same room with the people who do the work. We do not keep a desk in the county.",
    workTitle: "Start from the task that still leaves the system",
    work: "Many teams here already have the system of record. The audit does not replace it. It asks which weekly task still leaves that system and lands in a person's inbox. That task is the candidate. If it should stay with a person, we say so.",
  },
  {
    slug: "lehigh-valley-pa",
    name: "Lehigh Valley",
    areaServed: "Lehigh Valley, PA",
    title: "AI consulting in the Lehigh Valley",
    description:
      "On-site AI audits and workshops in the Lehigh Valley. We drive from Bucks County and meet at your building.",
    lede: "We are based in Bucks County, and we come to you. Allentown, Bethlehem, and Easton are a drive, and the free AI audit and a workshop can be at your building.",
    onSiteTitle: "The session is at your building",
    onSite:
      "For an audit we come to the floor, the office, or the front desk where the work happens. A workshop can be the same visit, on-site, for a team about to live with a new workflow or already using AI tools.",
    workTitle: "Name the update a person still rewrites",
    work: "A booking, an order, a vendor note, or a schedule is the kind of task the audit names and ranks. Waiting is an allowed answer. A workshop can also stand on its own, on-site, for a team already using AI tools without a shared standard.",
  },
];

export function countyPath(county: Pick<CountyPage, "slug">): string {
  return `/ai-consulting/${county.slug}`;
}

export function getCounty(slug: string): CountyPage | undefined {
  return counties.find((county) => county.slug === slug);
}
