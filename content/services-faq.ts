import type { Faq } from "@/content/faqs";
import { starterPaymentTerms } from "@/content/services";
import { site } from "@/content/site";

/**
 * Questions for /services. Do not state how long the 25% fee runs.
 */
export const servicesFaqs: Faq[] = [
  {
    question: "Who owns what we build?",
    answer:
      "You do. The client owns the accounts and anything we build. We remove our access when the engagement ends.",
  },
  {
    question: "Which tools do you work with?",
    answer:
      "We implement in the tools you already use when they fit the job. That includes Microsoft 365, Google Workspace, QuickBooks, and common CRMs. If a tool you already pay for is enough, we will say so.",
  },
  {
    question: "What does the retainer cover?",
    answer:
      "The retainer is the ongoing team after a workflow is live. It covers continued implementation, tuning, and oversight, and a set number of improvement cycles each month, agreed up front. It starts at $1,500 a month. The monthly scope is set from the systems already in play.",
  },
  {
    question: "Can we cancel?",
    answer:
      `Yes. Retainers are billed monthly, at the start of each month. You can cancel with 30 days' notice. There is no long-term lock-in. An AI roadmap is 50% at kickoff and 50% when the roadmap is delivered. A fixed-price implementation is 50% at signing, 25% when the workflow goes live, and 25% at the end of the 30-day tuning period. ${starterPaymentTerms} If it still does not meet the agreed criteria at the end of tuning, you do not pay the final 25%, and you keep everything built so far.`,
  },
  {
    question: "Is your data used to train AI?",
    answer:
      "No. We use business-tier tools and settings that keep client data out of model training, as detailed on the privacy page.",
    link: { href: "/privacy", label: "Privacy" },
  },
  {
    question: "Do you work on-site?",
    answer:
      "Yes. We work on-site across Bucks, Montgomery and the Lehigh Valley, or by video anywhere.",
  },
];

export function servicesFaqJsonText(item: Faq): string {
  if (!item.link) return item.answer;
  const page = new URL(item.link.href, site.url).toString();
  return `${item.answer} ${page}`;
}
