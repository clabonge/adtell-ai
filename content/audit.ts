export const companySizes = [
  { value: "1-10", label: "1–10 people" },
  { value: "11-50", label: "11–50 people" },
  { value: "51-200", label: "51–200 people" },
  { value: "201-1000", label: "201–1,000 people" },
  { value: "1000-plus", label: "More than 1,000 people" },
] as const;

export type CompanySize = (typeof companySizes)[number]["value"];

export const auditOffer = {
  title: "What the free audit gives you",
  points: [
    "A conversation, on-site locally or by video.",
    "A written one-page ranked list of what to automate first, and what to leave alone.",
    "Free, and the recommendation can be to wait.",
  ],
  cta: "Request my free audit",
  reply: "We reply within one business day.",
} as const;

export const auditRequests = {
  costs: "Find which of these costs you most",
  handoff: "Request my free audit",
  calculator: "Get these numbers checked for free",
  calculatorNote: "The audit writes the baseline down. Free, no obligation.",
} as const;

export const auditExpect = [
  "The free audit is a conversation, on-site locally or by video.",
  "We reply within one business day.",
  "Afterward you get a written one-page ranked list of opportunities.",
  "We read what you send before the conversation.",
  "The recommendation can be to wait.",
  "When the work should proceed, you get a fixed price, a 25% share of measured savings, or both.",
];
