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
  delivery?: {
    deliverables: string[];
    timeline: string;
  };
  cta: string;
};

export const servicesIntro = {
  kicker: "Services",
  title: "How you pay the department.",
  lede: "The free audit scopes the work. A starter automates one workflow, with the scope and price quoted in writing after the audit and no long-term commitment. A roadmap writes the plan. An implementation ships one workflow, for a fixed price or 25% of the measured savings. A retainer is the ongoing team, from $1,500 a month. Training is for the people inside the company who will work with that team. A quote follows the work.",
};

/**
 * Commercial term for implementation. The 25% is our fee, not a claim
 * about how much a company has already saved.
 */
export const savingsShare = {
  kicker: "A second way to pay",
  title: "Pay 25% of the savings.",
  lede: "A fixed price is the right shape when you want a known invoice. A share is the right shape when you want us paid from the reduction. Before any work starts, we agree a measured baseline with you in writing. Savings are measured against that baseline and reviewed together. Billing is monthly on the measured savings. The term length and any cap are set in that written agreement. The free audit can come back with a price, a fee of 25% of the measured savings, or both. You keep the other 75%.",
  points: [
    {
      title: "Agree the baseline",
      body: "We agree a measured baseline with you in writing before work starts. If the cost cannot be counted, we quote a price instead.",
    },
    {
      title: "Measure it together",
      body: "Savings are measured against that baseline and reviewed with you. Billing is monthly on the measured savings.",
    },
    {
      title: "The agreement sets the rest",
      body: "Term length and any cap are set in the written agreement. You can still take a fixed price, the 25% share, or wait. The audit stays free either way.",
    },
  ],
  illustration: {
    label: "Illustration only",
    body: "If a change saves $4,000 a month, the client keeps $3,000 and pays $1,000. This example shows the 25% fee. It is not a client result and not a promise of savings.",
  },
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
    slug: "starter-workflow",
    name: "Starter workflow",
    brief: "One workflow automated. Scope and price are quoted in writing after the audit.",
    priceLabel: "Quoted",
    priceDetail:
      "Scope and price are quoted in writing after the free audit. No long-term commitment.",
    summary:
      "A fixed-scope project between the free audit and a full implementation. We automate one workflow. The scope and the price are quoted in writing after the audit. There is no retainer and no long-term commitment.",
    audience:
      "Owners who want one defined workflow running before they consider a larger implementation.",
    includes: [
      "One workflow, named in the audit",
      "Scope and price in writing before any build",
      "No long-term commitment",
    ],
    delivery: {
      deliverables: [
        "One workflow automated",
        "Scope and price quoted in writing after the audit",
      ],
      timeline: "Set in the written quote after the audit. No long-term commitment.",
    },
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
    delivery: {
      deliverables: ["A ranked workflow list", "A cost baseline", "A build plan"],
      timeline: "2 to 4 weeks.",
    },
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
    delivery: {
      deliverables: ["One live workflow", "A staff handoff", "30 days of tuning"],
      timeline: "30 days of tuning after the workflow is live.",
    },
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
    delivery: {
      deliverables: [
        "Continued implementation, tuning, and oversight",
        "A set number of improvement cycles each month, agreed up front",
      ],
      timeline: "Month to month, after a workflow is live.",
    },
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
    delivery: {
      deliverables: [
        "Sessions built around your workflows",
        "A short playbook managers can reuse",
      ],
      timeline: "Set in the quote for the group.",
    },
    cta: "Discuss a workshop",
  },
];

/**
 * Costs, terms, and risk. Published prices stay on the service cards.
 * Do not add a savings-share term length or cap here.
 */
export const cfoTerms = {
  id: "costs-terms-risk",
  kicker: "Costs, terms, and risk",
  title: "What a CFO should see before a yes.",
  lede: "Published prices on this page are unchanged. The final terms are set in each client's written agreement. Any savings-share term length or cap is set in that agreement and is not stated here.",
  items: [
    {
      title: "Payment schedule",
      points: [
        "An AI roadmap is 50% at kickoff and 50% when the roadmap is delivered.",
        "A fixed-price implementation is 50% at signing, 25% when the workflow goes live, and 25% at the end of the 30-day tuning period.",
        "Invoices are due within 15 days.",
        "Monthly retainers are billed at the start of each month. You can cancel with 30 days' notice. There is no long-term lock-in.",
      ],
    },
    {
      title: "Tool subscriptions",
      points: [
        "You pay for software and AI tool subscriptions directly, in your own name, so you own the accounts and the data.",
        "Every quote lists the expected monthly tool costs, so the total cost is clear before you sign.",
        "We do not mark up tool costs.",
      ],
    },
    {
      title: "Data, access and ownership",
      points: [
        "The tools run in your own accounts. You pay for those subscriptions.",
        "You own what we build.",
        "Our access ends when the engagement ends.",
        "We do not sell data.",
      ],
    },
    {
      title: "If a workflow underperforms",
      points: [
        "Before the build, we agree in writing what the workflow must do. Those are the acceptance criteria.",
        "During the 30-day tuning period, we fix anything that falls short at no extra charge.",
        "If it still does not meet the agreed criteria at the end of tuning, you do not pay the final 25%, and you keep everything built so far.",
      ],
    },
  ],
} as const;
