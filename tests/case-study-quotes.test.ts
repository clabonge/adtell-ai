import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { caseStudyQuotes } from "../content/case-study-quotes";

describe("case study quotes", () => {
  it("renders a quote only when the content object exists", () => {
    assert.deepEqual(caseStudyQuotes, {});
    const component = readFileSync("components/ClientQuote.tsx", "utf8");
    const page = readFileSync("app/case-studies/[slug]/page.tsx", "utf8");
    const readme = readFileSync("README.md", "utf8");
    assert.match(component, /if \(!quote\) return null/);
    assert.match(page, /<ClientQuote slug=\{post\.slug\} \/>/);
    assert.match(readme, /case-study-quotes\.ts/);
    assert.match(readme, /Do not invent a quote/);
    const joined = `${component}\n${JSON.stringify(caseStudyQuotes)}`;
    assert.equal(joined.includes("\u2014"), false);
  });
});
