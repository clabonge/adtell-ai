import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CompanyLists, ImplementationHighlights } from "../components/CompanyLists";
import { highlightNames, site } from "../content/site";

const linked = [
  ["Doan Distillery", "/case-studies/doan-distillery-event-booking"],
  ["FiberOptics.com", "/case-studies/fiberoptics-com-website-and-outreach"],
  ["The Fiber School", "/case-studies/the-fiber-school-student-communications"],
  ["BCLE Furniture", "/case-studies/bcle-furniture-bespokequote"],
] as const;

const unlinked = ["CapoVino", "Trolley Barn Public Market", "Ivers Property Management"] as const;

function studyPath(name: string): string | undefined {
  const business = site.implementations.find((item) => item.name === name);
  assert.ok(business, name);
  return "study" in business ? business.study : undefined;
}

describe("case study links on business cards", () => {
  it("links only the businesses that have a full case study", () => {
    for (const [name, path] of linked) assert.equal(studyPath(name), path);
    for (const name of unlinked) assert.equal(studyPath(name), undefined);

    assert.deepEqual(
      [...highlightNames],
      ["Doan Distillery", "CapoVino", "BCLE Furniture", "FiberOptics.com", "The Fiber School"],
    );

    const index = renderToStaticMarkup(createElement(CompanyLists));
    const highlights = renderToStaticMarkup(createElement(ImplementationHighlights));
    assert.equal(index.match(/Read the case study/g)?.length, linked.length);
    assert.equal(highlights.match(/Read the case study/g)?.length, linked.length);
    for (const [, path] of linked) {
      assert.equal(index.includes(`href="${path}"`), true);
      assert.equal(highlights.includes(`href="${path}"`), true);
    }
    for (const name of unlinked) {
      assert.equal(highlights.includes(name), name === "CapoVino");
      assert.equal(index.includes(name), true);
    }
    assert.equal(highlights.includes("FiberOptics.com"), true);
    assert.equal(highlights.includes("The Fiber School"), true);

    const home = readFileSync("app/page.tsx", "utf8");
    const about = readFileSync("app/about/page.tsx", "utf8");
    const studies = readFileSync("app/case-studies/page.tsx", "utf8");
    assert.match(home, /ImplementationHighlights/);
    assert.match(about, /ImplementationHighlights/);
    assert.match(studies, /CompanyLists/);
    assert.match(home, /Five businesses we have helped/);
    assert.match(about, /Five of the businesses we have helped/);
    assert.equal(home.includes("Three businesses"), false);
    assert.equal(about.includes("Three of the businesses"), false);
  });
});
