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
  title: "How you pay the department.",
  lede: "The free audit scopes the work. A roadmap writes the plan. An implementation ships one workflow, for a fixed price or 25% of the measured savings. A retainer is the ongoing team, from $1,500 a month. Training is for the people inside the company who will work with that team. A quote follows the work.",
};

/**
 * Commercial term for implementation. The 25% is our fee, not a claim
 * about how much a company has already saved.
 */
export const savingsShare = {
  kicker: "A second way to pay",
  title: "Pay 25% of the savings.",
  lede: "A fixed price is the right shape when you want a known invoice. A share is the right shape when you want us paid from the reduction. The free audit can come back with a price, a fee of 25% of the measured savings, or both. You keep the other 75%.",
  points: [
    {
      title: "Count the cost",
      body: "Hours, a bill, or rework that someone in the company can count. If it cannot be counted, we quote a price.",
    },
    {
      title: "Write the measurement down",
      body: "We agree what will be counted, and for how long, before the build starts. The 25% applies to that result.",
    },
    {
      title: "Choose",
      body: "Take the fixed price, the 25% share, or wait. The audit stays free either way.",
    },
  ],
};

export const services: Service[] = [
  {
    slug: "free-ai-savings-audit",
    name: "Free AI Savings Audit",
    brief: "A conversation on the work that costs you, then a one-page ranked list.",
    priceLabel: "Free",
    priceDetail: "No fee for the working session.",
    summary:
      "A conversation, on-site locally or by video. We reply within one business day. Afterward you get a written one-page ranked list of opportunities, and a recommendation on whether a roadmap, a build, training, a retainer, or waiting is the honest next step.",
    audience:
      "Owners and operators who want a grounded look before they buy software or hire a build.",
    includes: [
      "A conversation on the workflows you flag as slow or expensive, on-site locally or by video",
      "A reply within one business day",
      "A written one-page ranked list of opportunities afterward",
      "A fixed price, a 25% share of measured savings, or both, when the work should proceed",
      "A plain recommendation, including “do nothing yet” when that is the right answer",
    ],
    cta: "Book a free AI audit",
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
      "Quoted from a defined workflow, or 25% of the measured savings if you want the fee paid from the reduction. The audit or the roadmap is how that workflow gets named.",
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
    brief: "The AI implementation team, month to month, after a workflow is live.",
    priceLabel: "From $1,500/mo",
    priceDetail:
      "The starting point for the ongoing team. The monthly scope is set from the systems already in play.",
    summary:
      "The ongoing AI implementation team after a workflow is live. The monthly fee covers continued implementation, tuning, and oversight.",
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
