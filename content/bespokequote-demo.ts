import { bcleCaseStudy } from "@/content/bcle";
import { furnitureShop } from "@/content/industry-examples";
import { getIndustry, industryPath } from "@/content/industries";

/**
 * Screen recording of BespokeQuote.furniture. The names in the footage are
 * sample data. Do not add a price, a testimonial, or a street address.
 */
const furniture = getIndustry("manufacturing-and-furniture");

export const bespokeQuoteDemo = {
  path: "/demo/bespokequote",
  updated: "2026-10-27",
  title: "BespokeQuote demo",
  description:
    "Screen recording of BespokeQuote.furniture, the quoting system Adtell.ai delivered for BCLE Furniture. Drawings come in, a person reviews the quote, and the job stays in one place until installation.",
  kicker: "Screen recording",
  heading: "See what a quoting system built for a custom shop looks like.",
  lede: "BespokeQuote.furniture is the quoting system Adtell.ai delivered for BCLE Furniture. Quotes that used to take up to three days now go out within 24 hours.",
  video: "/videos/bespokequote-demo.mp4",
  poster: "/videos/bespokequote-demo-poster.jpg",
  width: 1920,
  height: 1080,
  uploadDate: "2026-10-26",
  duration: 72,
  videoName: "BespokeQuote.furniture screen recording",
  videoDescription:
    "Silent screen recording of BespokeQuote.furniture, the quoting system Adtell.ai delivered for BCLE Furniture. A sample project moves from uploaded plans, elevations, and specs through a reviewed quote, a purchase order, a 50% deposit, and installation.",
  silentNote: "This recording has no sound.",
  seeingHeading: "What you're seeing",
  seeing: [
    "Customers upload plans, elevations, and specs. The recording shows a drawing set attached to a new quote.",
    "The quote is priced from real materials and shop labor, and a person reviews it before it goes out. The recording shows material lines, a labor line, and a quote still under review.",
    "The customer approves with a purchase order, and a 50% deposit releases the job to production. The recording shows the purchase order and the deposit before the job moves into production.",
    "Status, files, and messages stay in one place until installation. The recording ends on the job record and an installation photo.",
  ],
  sampleNote: "The names and projects in this footage are sample data.",
  shopHeading: "What this means for your shop",
  shopBody:
    "Adtell.ai can build a version of this around your shop's own materials, labor rates, and approval steps, starting with a free 30-minute audit.",
  liveHref: furnitureShop.href,
  liveLabel: furnitureShop.host,
  caseStudyPath: bcleCaseStudy.path,
  caseStudyLabel: "BespokeQuote.furniture at BCLE Furniture",
  furniturePath: furniture
    ? industryPath(furniture)
    : "/who-we-help/manufacturing-and-furniture",
  furnitureLabel: furniture?.name ?? "Manufacturing and furniture",
} as const;
