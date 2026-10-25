import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { faqs } from "../content/faqs";
import { savingsShare } from "../content/services";

describe("homepage savings share", () => {
  it("keeps one explanation section plus the FAQ", () => {
    const page = readFileSync("app/page.tsx", "utf8");
    const home = readFileSync("content/home.ts", "utf8");
    const steps = readFileSync("content/process.ts", "utf8");
    const how = readFileSync("app/how-it-works/page.tsx", "utf8");
    assert.equal(page.includes("25%"), false);
    assert.equal(home.includes("25%"), false);
    assert.equal(steps.includes("25%"), false);
    assert.match(page, /<SavingsShare \/>/);
    assert.match(page, /<FaqList items=\{faqs\} \/>/);
    assert.match(page, /\/services#savings-share/);
    assert.match(savingsShare.lede, /25% of the measured savings/);
    assert.match(savingsShare.lede, /measured baseline with you in writing/);
    const shareFaq = faqs.find((item) => item.question === "Can we pay a share of the savings?");
    assert.match(shareFaq?.answer ?? "", /25% of the measured savings/);
    assert.match(shareFaq?.answer ?? "", /keep the other 75%/);
    assert.match(how, /25% of measured savings/);
    assert.equal(/term length|any cap|capped at|savings-share term/i.test(`${page}\n${home}\n${how}`), false);
  });
});
