export const companySizes = [
  { value: "1-10", label: "1–10 people" },
  { value: "11-50", label: "11–50 people" },
  { value: "51-200", label: "51–200 people" },
  { value: "201-1000", label: "201–1,000 people" },
  { value: "1000-plus", label: "More than 1,000 people" },
] as const;

export type CompanySize = (typeof companySizes)[number]["value"];

export const auditExpect = [
  "We read what you send before any conversation.",
  "The session stays on the drains you named.",
  "You get a ranked recommendation, which can be to wait.",
];
