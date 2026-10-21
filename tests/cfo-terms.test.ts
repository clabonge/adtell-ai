import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { cfoTerms, services } from "../content/services";

describe("cfo terms", () => {
  it("marks unconfirmed terms as placeholders and does not set a savings-share term or cap", () => {
    const copy = [cfoTerms.title, cfoTerms.lede, cfoTerms.placeholderLabel, ...cfoTerms.items.flatMap((item) => [item.title, item.body])].join(
      " ",
    );
    assert.equal(cfoTerms.items.length, 3);
    assert.match(copy, /Payment schedule on fixed-price work/);
    assert.match(copy, /Who pays for tool subscriptions/);
    assert.match(copy, /30 days of tuning/);
    assert.match(copy, /Placeholder/);
    assert.match(copy, /Chris must confirm/);
    assert.equal(/\d+\s*(month|months|year|years)/i.test(copy), false);
    assert.equal(copy.toLowerCase().includes("cap of"), false);
    assert.equal(copy.includes("$"), false);
    assert.equal(copy.includes("\u2014"), false);
    const page = readFileSync("app/services/page.tsx", "utf8");
    assert.match(page, /cfoTerms\.id/);
    assert.deepEqual(
      services.map((service) => service.priceLabel),
      ["Free", "Quoted", "$2,500–$7,500", "From $10,000", "From $1,500/mo", "Quoted"],
    );
  });
});
