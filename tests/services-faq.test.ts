import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { servicesFaqs, servicesFaqJsonText } from "../content/services-faq";
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
    assert.match(joined, /set in your written agreement/);
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
});
