import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { cfoTerms, services } from "../content/services";

describe("cfo terms", () => {
  it("states the payment, tool, and underperformance terms without a term length or cap", () => {
    const copy = [cfoTerms.title, cfoTerms.lede, ...cfoTerms.items.flatMap((item) => [item.title, ...item.points])].join(
      " ",
    );
    assert.equal(cfoTerms.items.length, 3);
    assert.match(copy, /50% at kickoff and 50% when the roadmap is delivered/);
    assert.match(copy, /50% at signing, 25% when the workflow goes live, and 25% at the end of the 30-day tuning period/);
    assert.match(copy, /Invoices are due within 15 days/);
    assert.match(copy, /billed at the start of each month/);
    assert.match(copy, /30 days' notice/);
    assert.match(copy, /no long-term lock-in/);
    assert.match(copy, /in your own name/);
    assert.match(copy, /expected monthly tool costs/);
    assert.match(copy, /We do not mark up tool costs/);
    assert.match(copy, /acceptance criteria/);
    assert.match(copy, /no extra charge/);
    assert.match(copy, /you do not pay the final 25%/);
    assert.match(copy, /you keep everything built so far/);
    assert.match(copy, /final terms are set in each client's written agreement/);
    assert.equal(/\d+\s*(month|months|year|years)/i.test(copy), false);
    assert.equal(copy.toLowerCase().includes("cap of"), false);
    assert.equal(copy.includes("$"), false);
    assert.equal(copy.includes("\u2014"), false);
    assert.equal(copy.includes("Placeholder"), false);
    const page = readFileSync("app/services/page.tsx", "utf8");
    assert.match(page, /cfoTerms\.id/);
    assert.equal(page.includes("placeholderLabel"), false);
    assert.deepEqual(
      services.map((service) => service.priceLabel),
      ["Free", "Quoted", "$2,500–$7,500", "From $10,000", "From $1,500/mo", "Quoted"],
    );
  });
});
