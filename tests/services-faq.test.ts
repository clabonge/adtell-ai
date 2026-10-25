import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { servicesFaqs, servicesFaqJsonText } from "../content/services-faq";
import { cfoTerms } from "../content/services";
import { faqJsonLd } from "../lib/structured-data";

describe("services FAQ", () => {
  it("covers ownership, tools, retainer, cancellation, training, and on-site work", () => {
    const questions = servicesFaqs.map((item) => item.question);
    assert.deepEqual(questions, [
      "Who owns what we build?",
      "Which tools do you work with?",
      "What does the retainer cover?",
      "Can we cancel?",
      "Is your data used to train AI?",
      "Do you work on-site?",
    ]);
    const joined = servicesFaqs.map((item) => item.answer).join(" ");
    assert.match(joined, /client owns the accounts/);
    assert.match(joined, /Microsoft 365/);
    assert.match(joined, /Google Workspace/);
    assert.match(joined, /QuickBooks/);
    assert.match(joined, /common CRMs/);
    assert.match(joined, /\$1,500 a month/);
    assert.match(joined, /no long-term lock-in/);
    assert.match(joined, /Retainers are billed monthly/);
    assert.match(joined, /cancel with 30 days' notice/);
    assert.doesNotMatch(joined, /How you cancel is set in your written agreement/);
    assert.match(joined, /Bucks, Montgomery and the Lehigh Valley/);
    assert.equal(servicesFaqs[4]?.link?.href, "/privacy");
  });

  it("does not state a term length or cap", () => {
    const joined = servicesFaqs.map((item) => `${item.question} ${item.answer}`).join(" ");
    assert.doesNotMatch(joined, /\b\d+\s*(month|months|year|years)\b/i);
    assert.doesNotMatch(joined, /cap of/i);
    const json = JSON.stringify(faqJsonLd(servicesFaqs, servicesFaqJsonText));
    assert.match(json, /FAQPage/);
    assert.match(json, /https:\/\/adtell\.ai\/privacy/);
  });

  it("matches the published retainer, roadmap, and fixed-price terms", () => {
    const cancel = servicesFaqs.find((item) => item.question === "Can we cancel?");
    assert.ok(cancel);
    const schedule = cfoTerms.items.find((item) => item.title === "Payment schedule")?.points ?? [];
    const under =
      cfoTerms.items.find((item) => item.title === "If a workflow underperforms")?.points ?? [];
    const published = [...schedule, ...under].join(" ");
    for (const phrase of [
      "50% at kickoff and 50% when the roadmap is delivered",
      "50% at signing, 25% when the workflow goes live, and 25% at the end of the 30-day tuning period",
      "at the start of each month",
      "30 days' notice",
      "no long-term lock-in",
      "you do not pay the final 25%",
      "you keep everything built so far",
    ]) {
      assert.match(published, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.match(cancel.answer, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    assert.match(cancel.answer, /Retainers are billed monthly/);
    assert.doesNotMatch(cancel.answer, /written agreement/);
    assert.doesNotMatch(cancel.answer, /cap of/i);
  });
});
