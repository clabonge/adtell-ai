import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { bcleCaseStudy, bcleCaseStudyShots } from "../content/bcle";
import { getIndustry } from "../content/industries";
import { site } from "../content/site";
import { getPost, getPosts } from "../lib/posts";

describe("BCLE Furniture case study", () => {
  it("uses published BespokeQuote facts, software screenshots, and links from the BCLE cards", () => {
    const post = getPost("case-studies", bcleCaseStudy.slug);
    assert.ok(post);
    assert.equal(post.kind, "implementation");
    assert.equal(post.title, "BespokeQuote.furniture at BCLE Furniture");
    assert.match(post.body, /https:\/\/bespokequote\.furniture/);
    assert.match(post.body, /Clients upload drawings: DWG, DXF, PDF, and sketches/);
    assert.match(post.body, /priced from real materials and labor/);
    assert.match(post.body, /PO and deposit/);
    assert.match(post.body, /tracked in the dashboard/);
    assert.match(post.body, /same kind of system for your shop/);
    assert.match(post.body, /## What changed/);
    assert.match(post.body, /up to three days for review and quoting/);
    assert.match(post.body, /maximum turnaround is 24 hours/);
    assert.equal(post.body.includes("\u2014"), false);
    assert.equal(post.body.includes("$"), false);
    assert.equal(post.body.includes("%"), false);
    assert.deepEqual(post.body.match(/\d+/g), ["24"]);
    assert.equal(/our own|my shop|CNC|family/i.test(post.body), false);

    assert.deepEqual(
      bcleCaseStudyShots.map((shot) => shot.name),
      ["bespokequote-how-it-works", "bespokequote-dashboard", "bespokequote-home"],
    );
    for (const shot of bcleCaseStudyShots) {
      assert.equal(shot.name.startsWith("bespokequote-"), true, shot.name);
      assert.equal(/cnc|shop-floor|burkle|thermwood/i.test(shot.name), false);
    }

    const bcle = site.implementations.find((item) => item.name === "BCLE Furniture");
    assert.ok(bcle);
    assert.equal("study" in bcle ? bcle.study : "", bcleCaseStudy.path);
    assert.match(bcle.how, /BespokeQuote\.furniture/);
    assert.match(bcle.how, /tracked in a dashboard/);
    assert.equal(/inventory notes, sales follow-up, and marketing/i.test(bcle.how), false);

    const lists = readFileSync("components/CompanyLists.tsx", "utf8");
    const home = readFileSync("app/page.tsx", "utf8");
    const about = readFileSync("app/about/page.tsx", "utf8");
    const index = readFileSync("app/case-studies/page.tsx", "utf8");
    const studyPage = readFileSync("app/case-studies/[slug]/page.tsx", "utf8");
    assert.match(lists, /Read the case study/);
    assert.match(home, /ImplementationHighlights/);
    assert.match(about, /ImplementationHighlights/);
    assert.match(index, /CompanyLists/);
    assert.match(studyPage, /BcleCaseStudyShots/);

    const furniture = getIndustry("manufacturing-and-furniture");
    assert.match(furniture?.description ?? "", /BespokeQuote\.furniture/);
    assert.match(furniture?.lede ?? "", /BCLE Furniture/);
    assert.equal(
      /inventory notes, sales follow-up, and marketing/i.test(
        [furniture?.description, furniture?.lede, ...(furniture?.paragraphs ?? [])].join(" "),
      ),
      false,
    );

    assert.equal(getPosts("case-studies")[0]?.slug, bcleCaseStudy.slug);
    const urls = sitemap().map((entry) => entry.url);
    assert.equal(urls.includes(new URL(bcleCaseStudy.path, site.url).toString()), true);
  });
});
