import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqs } from "../content/faqs";

describe("software product FAQ", () => {
  it("describes a consulting practice and BespokeQuote.furniture", () => {
    const entry = faqs.find((item) => item.question === "Do you sell a software product?");
    assert.ok(entry);
    assert.equal(entry.answer.startsWith("No"), false);
    assert.match(entry.answer, /Adtell\.ai is a consulting practice/);
    assert.match(entry.answer, /BespokeQuote\.furniture is a system we built for BCLE Furniture/);
    assert.match(entry.answer, /furniture makers can try/);
    assert.match(entry.answer, /similar systems for other businesses/);
    assert.equal(entry.answer.includes("platform to license"), false);
    assert.equal(entry.answer.includes("\u2014"), false);
    assert.equal(entry.link?.href, "https://bespokequote.furniture");
  });
});
