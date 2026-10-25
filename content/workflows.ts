/**
 * Accessible workflow steps drawn from the published industry and
 * Doan Distillery copy. Do not add results, prices, or quotes.
 */
export const workflowLabels = ["Before", "AI draft", "Person approves", "Sent"] as const;

export type WorkflowStep = { label: (typeof workflowLabels)[number]; text: string };

export const handoff = {
  title: "What you get at handoff",
  items: [
    "Written rules for what the automation may prepare and what a person must approve.",
    "A runbook the team can follow.",
    "A named owner for the approval step.",
  ],
} as const;

export const industryWorkflows: Record<string, readonly WorkflowStep[]> = {
  "hospitality-and-events": [
    {
      label: "Before",
      text: "A booking request, a tasting follow-up, an order note, or a marketing draft still lands on someone's desk.",
    },
    {
      label: "AI draft",
      text: "We draft that work from material the business already uses.",
    },
    {
      label: "Person approves",
      text: "A person still confirms what goes out.",
    },
    {
      label: "Sent",
      text: "It goes out only after that person confirms it.",
    },
  ],
  "property-management": [
    {
      label: "Before",
      text: "Maintenance follow-up, answers to tenant questions, and lease-renewal notes are still sent by hand.",
    },
    {
      label: "AI draft",
      text: "The automation prepares the next draft from replies and lease notes the company already uses.",
    },
    {
      label: "Person approves",
      text: "A person still sends it.",
    },
    {
      label: "Sent",
      text: "The person at the company is the one who sends it.",
    },
  ],
  "manufacturing-and-furniture": [
    {
      label: "Before",
      text: "A quote still has to be priced from drawings, materials, and labor.",
    },
    {
      label: "AI draft",
      text: "Clients upload drawings: DWG, DXF, PDF, and sketches. The quote is priced from real materials and labor.",
    },
    {
      label: "Person approves",
      text: "A person reviews the quote. The job is approved with a PO and deposit.",
    },
    {
      label: "Sent",
      text: "Status and messages live in a dashboard.",
    },
  ],
  "training-schools": [
    {
      label: "Before",
      text: "Website content, social media, customer outreach, product recommendations, and student communications were prepared by a person.",
    },
    {
      label: "AI draft",
      text: "FiberOptics.com workflows use Outlook, Shopify, Teams, SharePoint, and QuickBooks. The Fiber School workflows use Outlook, Teams, SharePoint, and QuickBooks.",
    },
    {
      label: "Person approves",
      text: "A person reviews and approves what goes out.",
    },
    {
      label: "Sent",
      text: "Nothing goes out until that person approves it.",
    },
  ],
  "public-markets-and-retail": [
    {
      label: "Before",
      text: "Vendor replies, event times, and market announcements are still prepared by a person.",
    },
    {
      label: "AI draft",
      text: "The automation drafts the vendor reply, the event time, or the announcement.",
    },
    {
      label: "Person approves",
      text: "A person still reviews what goes out.",
    },
    {
      label: "Sent",
      text: "It goes out after that person reviews it.",
    },
  ],
};

export const fiberOpticsWorkflow: readonly WorkflowStep[] = [
  {
    label: "Before",
    text: "Website content, social media, customer outreach, and product recommendations were updated by a person.",
  },
  {
    label: "AI draft",
    text: "The workflows use Outlook, Shopify, Teams, SharePoint, and QuickBooks. Shopify is the store.",
  },
  {
    label: "Person approves",
    text: "A person reviews and approves what goes out.",
  },
  {
    label: "Sent",
    text: "Nothing goes out until that person approves it. The automation does not send it on its own.",
  },
];

export const doanWorkflow: readonly WorkflowStep[] = [
  {
    label: "Before",
    text: "A person wrote the reply, prepared tasting-room and event times, and wrote the order follow-up and the marketing notes.",
  },
  {
    label: "AI draft",
    text: "The automation drafts booking replies, prepares tasting-room and event times, and writes order follow-up and marketing notes.",
  },
  {
    label: "Person approves",
    text: "A person still confirms the booking reply, the times, the order follow-up, and the marketing notes.",
  },
  {
    label: "Sent",
    text: "Nothing goes out until that person confirms it. The automation does not send it on its own.",
  },
];
