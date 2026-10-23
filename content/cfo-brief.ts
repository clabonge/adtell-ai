import { cfoTerms, services } from "@/content/services";

/**
 * One-page brief for the person who signs. Prices and payment terms are
 * the published ones. Do not state how long the 25% fee runs, and do not
 * add a claim about who owns accounts or data.
 */
const toolPoints = cfoTerms.items.find((item) => item.title === "Tool subscriptions")?.points ?? [];

export const cfoBrief = {
  path: "/cfo-brief",
  pdfPath: "/cfo-brief.pdf",
  updated: "2026-10-23",
  title: "A one-page brief for the CFO",
  description:
    "Published prices, the payment schedule, acceptance criteria, tool subscriptions you pay directly, and how savings are measured.",
  lede: "Published prices on this page are unchanged. The final terms are set in each client's written agreement.",
  prices: services.map((service) => ({
    name: service.name,
    price: service.priceLabel,
  })),
  sections: [
    {
      title: "Payment schedule",
      points: [...(cfoTerms.items.find((item) => item.title === "Payment schedule")?.points ?? [])],
    },
    {
      title: "If a workflow underperforms",
      points: [...(cfoTerms.items.find((item) => item.title === "If a workflow underperforms")?.points ?? [])],
    },
    {
      title: "Tool subscriptions",
      points: toolPoints
        .map((point) =>
          point.startsWith("You pay for software")
            ? "You pay for software and AI tool subscriptions directly."
            : point,
        )
        .filter((point) => !point.includes("own the accounts") && !point.includes("in your own name")),
    },
    {
      title: "First-year cost illustration",
      points: [
        "Illustration only, not a client result.",
        "The build line uses the published implementation price, from $10,000.",
        "An optional retainer uses the published retainer price, from $1,500 a month.",
        "The tool subscription is a line you enter. Leave it blank, or enter a hypothetical monthly amount.",
        "The first-year total adds the build, twelve months of the retainer when you include it, and twelve months of that tool line.",
        "Payback is that total divided by a monthly saving you enter.",
      ],
    },
    {
      title: "How savings are measured",
      points: [
        "The audit writes the baseline down.",
        "Before any work starts, we agree a measured baseline with you in writing.",
        "Savings are measured against that baseline and reviewed together.",
      ],
    },
  ],
} as const;
