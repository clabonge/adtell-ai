import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { site } from "../content/site";
import { fiberSchoolWorkflow } from "../content/workflows";
import { getPost, getPosts } from "../lib/posts";
import { documentTitle } from "../lib/seo";

const slug = "the-fiber-school-student-communications";

describe("The Fiber School case study", () => {
  it("uses only the published training facts and links the public homepage", () => {
    const post = getPost("case-studies", slug);
    assert.ok(post);
    assert.equal(post.kind, "implementation");
    assert.equal(post.date, "2026-10-25");
    assert.equal(documentTitle(post.title, `/case-studies/${slug}`).length <= 65, true);
    assert.match(post.body, /## Before/);
    assert.match(post.body, /## The workflow/);
    assert.match(post.body, /## A person stays in charge/);
    assert.match(post.body, /training division of Adtell Inc/);
    assert.match(
      post.body,
      /student communications about expiring certifications, upselling additional classes, outreach, and social media/,
    );
    assert.match(post.body, /Outlook, Teams, SharePoint, and QuickBooks/);
    assert.equal(/shopify/i.test(post.body), false);
    assert.match(post.body, /https:\/\/thefiberschool\.com/);
    assert.match(post.body, /A person reviews and approves/);
    assert.match(
      post.body,
      /2\.5 times previous efficiency across the combined work of FiberOptics\.com and The Fiber School/,
    );
    assert.match(post.body, /direct cost savings/);
    assert.match(post.body, /\[book a free AI audit\]\(\/contact\)/);
    assert.equal(post.body.includes("\u2014"), false);
    assert.equal(post.body.includes("$"), false);
    assert.equal(post.body.includes("%"), false);
    assert.equal(post.body.includes("\""), false);
    assert.equal(/hubspot/i.test(post.body), false);
    assert.equal(/\bour own\b|\bmy shop\b|\bfamily\b/i.test(post.body), false);
    assert.deepEqual(post.body.match(/\d+(?:\.\d+)?/g), ["2.5"]);

    const business = site.implementations.find((item) => item.name === "The Fiber School");
    assert.ok(business);
    assert.equal("study" in business ? business.study : "", `/case-studies/${slug}`);
    assert.equal(/hubspot|shopify/i.test(`${business.goal} ${business.how}`), false);

    assert.deepEqual(
      fiberSchoolWorkflow.map((step) => step.label),
      ["Before", "AI draft", "Person approves", "Sent"],
    );
    assert.equal(/shopify|hubspot/i.test(fiberSchoolWorkflow.map((step) => step.text).join(" ")), false);
    assert.equal(existsSync("public/images/thefiberschool/thefiberschool-home.webp"), true);
    assert.equal(existsSync("public/images/thefiberschool/thefiberschool-home.jpg"), true);
    const page = readFileSync("app/case-studies/[slug]/page.tsx", "utf8");
    assert.match(page, /the-fiber-school-student-communications/);
    assert.match(page, /HomepageShot/);

    const entry = sitemap().find(
      (item) => item.url === new URL(`/case-studies/${slug}`, site.url).toString(),
    );
    assert.equal(String(entry?.lastModified), "2026-10-25");
    assert.equal(getPosts("case-studies")[0]?.slug, "bcle-furniture-bespokequote");
  });
});