import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("industry page html", () => {
  it("renders the industry in the page instead of a loading fallback", () => {
    const page = readFileSync("app/who-we-help/[slug]/page.tsx", "utf8");
    assert.match(page, /export default async function IndustryPage/);
    assert.match(page, /await props\.params/);
    assert.equal(page.includes("Loading this industry"), false);
    assert.equal(page.includes("<Suspense"), false);
    assert.match(page, /industry\.lede/);
    assert.match(page, /Businesses we helped/);
  });
});
