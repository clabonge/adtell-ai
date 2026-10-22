import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { cfoBrief } from "../content/cfo-brief";
import { services } from "../content/services";
import { cfoBriefPdf } from "../lib/cfo-brief-pdf";
import { pdfText } from "../lib/simple-pdf";

function briefCopy(): string {
  return [cfoBrief.title, cfoBrief.lede, ...cfoBrief.sections.flatMap((section) => [section.title, ...section.points])].join(
    " ",
  );
}

describe("cfo brief", () => {
  it("uses published prices and payment terms without a savings-share term, cap, or ownership claim", () => {
    const copy = briefCopy();
    assert.deepEqual(
      cfoBrief.prices.map((price) => price.price),
      services.map((service) => service.priceLabel),
    );
    assert.match(copy, /50% at kickoff and 50% when the roadmap is delivered/);
    assert.match(copy, /50% at signing, 25% when the workflow goes live, and 25% at the end of the 30-day tuning period/);
    assert.match(copy, /Invoices are due within 15 days/);
    assert.match(copy, /30 days' notice/);
    assert.match(copy, /acceptance criteria/);
    assert.match(copy, /you do not pay the final 25%/);
    assert.match(copy, /you keep everything built so far/);
    assert.match(copy, /You pay for software and AI tool subscriptions directly/);
    assert.match(copy, /We do not mark up tool costs/);
    assert.match(copy, /The audit writes the baseline down/);
    assert.equal(copy.includes("own the accounts"), false);
    assert.equal(copy.includes("in your own name"), false);
    assert.equal(copy.toLowerCase().includes("cap"), false);
    assert.equal(/term length/i.test(copy), false);
    assert.equal(/\d+\s*(month|months|year|years)/i.test(copy), false);
    assert.equal(copy.includes("\u2014"), false);

    const servicesPage = readFileSync("app/services/page.tsx", "utf8");
    assert.match(servicesPage, /cfoBrief\.path/);
    assert.match(servicesPage, /cfoBrief\.pdfPath/);
    const confirmation = readFileSync("lib/deliver-audit.ts", "utf8");
    assert.match(confirmation, /\/cfo-brief/);

    const pdf = pdfText(cfoBriefPdf());
    assert.match(pdf, /^%PDF-1\.4/);
    assert.match(pdf, /\$2,500/);
    assert.match(pdf, /From \$10,000/);
    assert.match(pdf, /50% at signing/);
    assert.match(pdf, /baseline/);
    assert.equal(pdf.includes("own the accounts"), false);
    assert.equal(pdf.toLowerCase().includes("cap of"), false);
  });
});
