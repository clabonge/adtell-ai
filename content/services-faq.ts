import type { Faq } from "@/content/faqs";
import { site } from "@/content/site";

/**
 * Questions for /services. Do not put a duration or a cap here.
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
      "Yes. The retainer has no long-term lock-in. How you cancel is set in your written agreement.",
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
