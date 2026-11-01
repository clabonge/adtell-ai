import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { cfoBrief } from "../content/cfo-brief";
import { faqs } from "../content/faqs";
import { servicesFaqs } from "../content/services-faq";
import { faqJsonLd } from "../lib/structured-data";
import {
  cfoTerms,
  savingsShare,
  services,
  servicesIntro,
  starterImplementationSplit,
  starterPaymentTerms,
} from "../content/services";

describe("starter and implementation split", () => {
  it("keeps published prices and explains the two builds in one sentence", () => {
    const starter = services.find((service) => service.slug === "starter-workflow");
    const roadmap = services.find((service) => service.slug === "ai-assessment-roadmap");
    const implementation = services.find((service) => service.slug === "implementation");
    assert.equal(starter?.priceLabel, "$2,500\u2013$7,500");
    assert.equal(roadmap?.priceLabel, "$2,500\u2013$7,500");
    assert.equal(roadmap?.priceAside, "Written plan");
    assert.equal(implementation?.priceLabel, "From $10,000");
    assert.equal(
      starterImplementationSplit,
      "A Starter is one workflow built on tools the client already uses; an Implementation project connects several systems.",
    );
    assert.equal(servicesIntro.lede.includes(starterImplementationSplit), false);
    assert.match(starter?.brief ?? "", /tools the client already uses/);
    assert.match(starter?.summary ?? "", /tools the client already uses/);
    assert.match(implementation?.brief ?? "", /several systems/);
    assert.match(implementation?.summary ?? "", /connects several systems/);
    assert.equal(starterImplementationSplit.includes("\u2014"), false);

    const home = readFileSync("app/page.tsx", "utf8");
    const servicesPage = readFileSync("app/services/page.tsx", "utf8");
    assert.match(home, /starterImplementationSplit/);
    assert.match(servicesPage, /starterImplementationSplit/);
    assert.equal(savingsShare.lede.includes("25%"), true);
    assert.equal(/\b(month|months|year|years)\b/i.test(savingsShare.lede), false);
  });

  it("states the starter payment schedule without a new price, term length, or cap", () => {
    assert.match(starterPaymentTerms, /50% at signing, 25% at go-live, and 25% after 30 days of tuning, net 15/);
    const schedule = cfoTerms.items.find((item) => item.title === "Payment schedule")?.points.join(" ") ?? "";
    assert.match(schedule, /50% at signing, 25% when the workflow goes live/);
    assert.match(schedule, /Invoices are due within 15 days/);
    assert.match(schedule, new RegExp(starterPaymentTerms.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    const starter = services.find((service) => service.slug === "starter-workflow");
    assert.match(starter?.priceDetail ?? "", /net 15/);
    const cancel = servicesFaqs.find((item) => item.question === "Can we cancel?")?.answer ?? "";
    assert.match(cancel, /net 15/);
    assert.equal(starterPaymentTerms.includes("$"), false);
    assert.equal(starterPaymentTerms.includes("\u2014"), false);
    assert.equal(/cap of/i.test(starterPaymentTerms), false);

    const brief = cfoBrief.sections.flatMap((section) => section.points).join(" ");
    assert.match(brief, /\$2,500\u2013\$7,500/);
    assert.match(brief, /from \$10,000/);
    assert.equal(brief.toLowerCase().includes("cap"), false);
    assert.equal(brief.includes("\u2014"), false);
  });

  it("names the starter workflow beside implementation pricing in the homepage FAQ and JSON-LD", () => {
    const cost = faqs.find((item) => item.question === "How much does implementation cost?");
    assert.ok(cost);
    assert.match(cost.answer, /starter workflow is one workflow on tools you already use, at \$2,500\u2013\$7,500/);
    assert.match(cost.answer, /Implementation projects start at \$10,000/);
    assert.match(cost.answer, /assessment and roadmap.*\$2,500\u2013\$7,500/);
    assert.equal(cost.answer.includes("\u2014"), false);
    const json = JSON.stringify(faqJsonLd(faqs));
    assert.match(json, /FAQPage/);
    assert.match(json, /How much does implementation cost\?/);
    assert.match(json, /one workflow on tools you already use/);
    assert.match(json, /\$2,500\\u2013\$7,500|\$2,500\u2013\$7,500/);
    assert.match(json, /Implementation projects start at \$10,000/);
  });
});
