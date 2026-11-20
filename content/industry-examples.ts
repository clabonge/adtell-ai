import { deliveredLead } from "@/content/bcle";

/**
 * Labeled examples for industry pages. These are the shape of the work,
 * not client results. Do not add prices, savings figures, quotes, or testimonials.
 * Hospitality keeps the Linden Events sample audit instead of an entry here.
 */
export type IndustryExample = {
  heading: string;
  note: string;
  steps: readonly { label: string; text: string }[];
};

export const industryExamples: Record<string, IndustryExample> = {
  "property-management": {
    heading: "A maintenance reply, drafted from notes the company already keeps.",
    note: "Example only. This is not a client, not a quote, and not a result.",
    steps: [
      {
        label: "Request",
        text: "A maintenance question or a lease-renewal note still needs a reply.",
      },
      {
        label: "Draft",
        text: "The reply is drafted from material the company already uses.",
      },
      {
        label: "Person approves",
        text: "The draft of the reply or the lease note.",
      },
      {
        label: "Sent",
        text: "The reply goes out.",
      },
      {
        label: "Follow-up",
        text: "The next note is prepared the same way.",
      },
    ],
  },
  "manufacturing-and-furniture": {
    heading: "A custom quote, from the request through follow-up.",
    note: "Example only. This is not a client, not a quote, and not a result.",
    steps: [
      {
        label: "Request",
        text: "A custom quote request comes in.",
      },
      {
        label: "Draft",
        text: "A reply or a quote is drafted.",
      },
      {
        label: "Person approves",
        text: "The priced quote.",
      },
      {
        label: "Sent",
        text: "The quote goes out.",
      },
      {
        label: "Follow-up",
        text: "Follow-up is prepared the same way.",
      },
    ],
  },
  "training-schools": {
    heading: "A class schedule or a student reply.",
    note: "Example only. This is not a client, not a quote, and not a result.",
    steps: [
      {
        label: "Request",
        text: "A class schedule, an enrollment follow-up, or a student question between sessions still needs a reply.",
      },
      {
        label: "Draft",
        text: "The schedule or the reply is drafted from material the school already uses.",
      },
      {
        label: "Person approves",
        text: "The schedule or the reply.",
      },
      {
        label: "Sent",
        text: "The schedule or the reply goes out.",
      },
      {
        label: "Follow-up",
        text: "Follow-up is prepared the same way.",
      },
    ],
  },
  "public-markets-and-retail": {
    heading: "A vendor reply or a market announcement.",
    note: "Example only. This is not a client, not a quote, and not a result.",
    steps: [
      {
        label: "Request",
        text: "A vendor message, an event time, or a market announcement still needs to go out.",
      },
      {
        label: "Draft",
        text: "The reply or the announcement is drafted.",
      },
      {
        label: "Person approves",
        text: "The vendor reply or the announcement.",
      },
      {
        label: "Sent",
        text: "The reply or the announcement goes out.",
      },
      {
        label: "Follow-up",
        text: "Follow-up is prepared the same way.",
      },
    ],
  },
};

export const furnitureShop = {
  heading: "What we delivered for BCLE Furniture: BespokeQuote.furniture",
  href: "https://bespokequote.furniture",
  host: "bespokequote.furniture",
  lead: deliveredLead,
  points: [
    "Clients upload drawings: DWG, DXF, PDF, and sketches.",
    "The quote is priced from real materials and labor.",
    "The job is approved with a PO and deposit.",
    "Status and messages live in a dashboard.",
  ],
  close: "We can build the same kind of system for your shop.",
} as const;
