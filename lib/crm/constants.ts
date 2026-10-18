export const ORIGINS = ["inbound", "owner", "research"] as const;
export type Origin = (typeof ORIGINS)[number];

export const STAGES = [
  "researched",
  "contacted",
  "qualified",
  "audit_booked",
  "proposal_sent",
  "won",
  "lost",
  "nurture",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  researched: "Researched",
  contacted: "Contacted",
  qualified: "Qualified",
  audit_booked: "Audit booked",
  proposal_sent: "Proposal sent",
  won: "Won",
  lost: "Lost",
  nurture: "Nurture",
};

export const PRIORITIES = ["low", "normal", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const VERIFICATION = ["unknown", "unverified", "verified"] as const;
export type VerificationStatus = (typeof VERIFICATION)[number];

export const OPEN_STAGES: Stage[] = [
  "researched",
  "contacted",
  "qualified",
  "audit_booked",
  "proposal_sent",
  "nurture",
];

export const OWNER_TIME_ZONE = "America/New_York";

export const IMPORT_COLUMNS = [
  "company",
  "website",
  "industry",
  "location",
  "contact_name",
  "contact_title",
  "email",
  "source_url",
  "research_date",
  "fit_notes",
  "verification_status",
  "origin",
  "next_action",
] as const;

export type ImportColumn = (typeof IMPORT_COLUMNS)[number];

export const MAX_NOTIFICATION_ATTEMPTS = 5;
export const LEASE_SECONDS = 60;
export const SESSION_SECONDS = 60 * 60 * 12;
