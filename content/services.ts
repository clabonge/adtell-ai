/**
 * Service copy and published prices. This is the source of truth.
 * If a price changes, update it here. Search content/blog and
 * content/case-studies for the old figure if a post mentions it.
 */
export type Service = {
  slug: string;
  name: string;
  brief: string;
  priceLabel: string;
  priceDetail: string;
  summary: string;
  audience: string;
  includes: string[];
  cta: string;
};

export const servicesIntro = {
  kicker: "Services",
  title: "Engagements with a published starting point.",
  lede: "The free audit is the front door. Paid work is scoped to a workflow, a plan, a team, or ongoing implementation. Ranges are wide because companies are not identical. A quote follows the work, not a slide.",
};

export const services: Service[] = [
  {
    slug: "free-ai-savings-audit",
    name: "Free AI Savings Audit",
    brief: "A working session on the drains, and a recommendation that can be to wait.",
    priceLabel: "Free",
    priceDetail: "No fee for the working session.",
    summary:
      "A working session on where time and money leak. You leave with a short list of the workflows worth doing first, and a recommendation on whether a roadmap, a build, training, a retainer, or waiting is the honest next step.",
    audience:
      "Owners and operators who want a grounded look before they buy software or hire a build.",
    includes: [
      "A review of the workflows you flag as slow or expensive",
      "A ranked list of savings opportunities",
      "A plain recommendation, including “do nothing yet” when that is the right answer",
    ],
    cta: "Book the free audit",
  },
  {
    slug: "ai-assessment-roadmap",
    name: "AI Assessment & Roadmap",
    brief: "A written plan for what to build, what to skip, and in what order.",
    priceLabel: "$2,500–$7,500",
    priceDetail:
      "The range depends on how many functions are in scope and how scattered the current process is.",
    summary:
      "A written plan for where AI belongs in the business, what to build first, what to leave alone, and what the first implementation will take.",
    audience:
      "Leadership teams that need a sequence before anyone writes an integration or signs a software contract.",
    includes: [
      "Conversations with the people who do the work, and a map of the workflows they describe",
      "Opportunities described in operational terms: hours, handoffs, and where errors show up",
      "A sequenced roadmap, a tool direction, and an implementation estimate",
      "A decision memo the people who spend the money can act on",
    ],
    cta: "Discuss a roadmap",
  },
  {
    slug: "implementation",
    name: "Implementation projects",
    brief: "One defined workflow, shipped with rules and a handoff your team can run.",
    priceLabel: "From $10,000",
    priceDetail:
      "Quoted from a defined workflow. The audit or the roadmap is how that workflow gets named.",
    summary:
      "We design and ship one workflow: the agent, the connections it needs, and the operating rules around it. The project is tied to a specific cost, not to a vague transformation.",
    audience:
      "Companies that already know which process should stop being done by hand, and want it running with a handoff their team can own.",
    includes: [
      "A defined workflow and success criteria before the build starts",
      "A working implementation in the tools you already use, where that is the right fit",
      "Written rules for what the agent may prepare and what a person must approve",
      "Documentation and a short training session so the team can run it",
    ],
    cta: "Discuss an implementation",
  },
  {
    slug: "monthly-retainer",
    name: "Monthly AI Retainer",
    brief: "Continued implementation after a workflow is already live.",
    priceLabel: "From $1,500/mo",
    priceDetail:
      "The starting point. The monthly scope is set from the systems already in play.",
    summary:
      "Ongoing implementation, tuning, and oversight after a workflow is in production. For teams that want an operator on the hook for the next improvement, not a binder that ends at launch.",
    audience:
      "Companies with an agent or workflow already live, who want it watched and extended as the work changes.",
    includes: [
      "A set number of improvement cycles each month, agreed up front",
      "Attention on the workflows we share with you",
      "Room to pick up a new savings target when one becomes obvious",
    ],
    cta: "Discuss a retainer",
  },
  {
    slug: "team-training",
    name: "Team AI training workshops",
    brief: "Practical training for the people who will use the system.",
    priceLabel: "Quoted",
    priceDetail:
      "Priced for the group and the work. There is no published flat rate.",
    summary:
      "Practical workshops for the people who will use the systems. How to work with an agent, where it fails, and how a person stays in charge of the outcome.",
    audience:
      "Teams that are about to live with a new workflow, or that are already using AI tools without a shared standard.",
    includes: [
      "Sessions built around your actual workflows, not a generic tour of features",
      "Exercises on the tools the team will use",
      "A short playbook managers can reuse after we leave",
    ],
    cta: "Discuss a workshop",
  },
];
