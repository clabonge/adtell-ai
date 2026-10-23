import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("case study page html", () => {
  it("renders the case study in the page instead of a loading fallback", () => {
    const page = readFileSync("app/case-studies/[slug]/page.tsx", "utf8");
    assert.match(page, /export default async function CaseStudyPage/);
    assert.match(page, /await props\.params/);
    assert.equal(page.includes("Loading the case study"), false);
    assert.equal(page.includes("<Suspense"), false);
    assert.match(page, /post\.description/);
    assert.match(page, /MarkdownBody/);
  });
});
