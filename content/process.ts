export type ProcessStep = {
  number: string;
  title: string;
  body: string;
};

export const processIntro = {
  kicker: "How it works",
  title: "Name the cost, then decide whether to build.",
  lede: "We do not start with a model or a software shortlist. We start with the work your people are still doing by hand, and we stop there if that work should stay with them.",
};

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Tell us where time goes",
    body: "Book a free AI audit. Say who you are, what the company does, and which tasks eat hours or create rework. We read that before the conversation so the session is about your work.",
  },
  {
    number: "02",
    title: "Separate cost from curiosity",
    body: "We walk the work you named. We mark what is repetitive enough to scope, what needs a written roadmap, and what should be left alone. You leave with a ranked list and a recommendation, including a recommendation to wait. When the work should proceed, that recommendation includes a fixed price, a fee of 25% of measured savings, or both.",
  },
  {
    number: "03",
    title: "Scope paid work only if it earns it",
    body: "An assessment is for a plan across functions. An implementation builds one defined workflow. Training is for the people who will use what gets built. A retainer continues the work after something is in production. Each has a published starting point. The quote follows the scope.",
  },
  {
    number: "04",
    title: "Leave the workflow runnable",
    body: "A build includes the rules for what the agent may do, documentation, and a handoff to your team. We do not call it finished if only we can operate it. A retainer is optional. It is for continued improvement, not for holding the keys.",
  },
];

export const processNeeds = [
  "Someone who knows the workflow and can say what a good result looks like",
  "Examples of the work, not a tour of every system on the first day",
  "A person who can decide what to do with the recommendation",
];

export const dataHandling = {
  heading: "Your data and your systems",
  paragraphs: [
    "You own the accounts and anything we build for you.",
    "We remove our access when the engagement ends.",
    "An NDA is available on request.",
    "We do not use client data to train AI models.",
  ],
};

export const processBoundaries = [
  "Invent a savings dollar figure to win the meeting",
  "Start by selling a platform",
  "Automate a process you have not described",
  "Publish your company as a client unless you ask us to",
];
