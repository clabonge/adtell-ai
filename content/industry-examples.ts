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
    heading: "A maintenance reply, drafted and then sent by a person.",
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
        text: "A person still sends it.",
      },
      {
        label: "Sent",
        text: "It goes out when that person sends it.",
      },
      {
        label: "Follow-up",
        text: "The next note is prepared the same way, for a person to send.",
      },
    ],
  },
  "manufacturing-and-furniture": {
    heading: "A custom quote, drafted and then approved.",
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
        text: "A person approves it.",
      },
      {
        label: "Sent",
        text: "It is sent only after that person approves.",
      },
      {
        label: "Follow-up",
        text: "Follow-up is prepared for a person to review.",
      },
    ],
  },
  "training-schools": {
    heading: "A class schedule or a student reply, confirmed by a person.",
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
        text: "A person still confirms the schedule and the reply.",
      },
      {
        label: "Sent",
        text: "It goes out after that confirmation.",
      },
      {
        label: "Follow-up",
        text: "Follow-up is prepared for a person to review.",
      },
    ],
  },
  "public-markets-and-retail": {
    heading: "A vendor reply or a market announcement, reviewed by a person.",
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
        text: "A person still reviews what goes out.",
      },
      {
        label: "Sent",
        text: "It is sent after that review.",
      },
      {
        label: "Follow-up",
        text: "Follow-up is prepared for a person to review.",
      },
    ],
  },
};

export const furnitureShop = {
  heading: "See what we built for our own shop",
  href: "https://bespokequote.furniture",
  host: "bespokequote.furniture",
  lead: "bespokequote.furniture is BCLE Furniture's quoting site.",
  points: [
    "Clients upload drawings: DWG, DXF, PDF, and sketches.",
    "A person reviews a quote priced from real materials and labor.",
    "The job is approved with a PO and deposit.",
    "Status and messages live in a dashboard.",
  ],
  close: "We can build the same kind of system for your shop.",
} as const;
