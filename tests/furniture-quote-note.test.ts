import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { bcleCaseStudy } from "../content/bcle";
import { site } from "../content/site";
import { documentTitle } from "../lib/seo";
import { getPosts } from "../lib/posts";

const slug = "what-goes-into-a-custom-furniture-quote";

describe("custom furniture quote note", () => {
  it("publishes the 25 October 2026 note on the blog index and in the sitemap", () => {
    const posts = getPosts("blog");
    const post = posts[0];
    assert.equal(post?.slug, slug);
    assert.equal(post?.date, "2026-10-25");
    assert.equal(posts[1]?.slug, "start-with-a-savings-audit");
    assert.equal(posts[1]?.date, "2026-10-08");
    assert.equal(post.title, "What goes into a custom furniture quote");
    assert.equal(documentTitle(post.title, `/blog/${slug}`).length <= 65, true);

    const index = readFileSync("app/blog/page.tsx", "utf8");
    const sitemapSource = readFileSync("app/sitemap.ts", "utf8");
    assert.match(index, /getPosts\("blog"\)/);
    assert.match(sitemapSource, /getPosts\("blog"\)/);

    const path = `/blog/${slug}`;
    const entry = sitemap().find((item) => item.url === new URL(path, site.url).toString());
    assert.ok(entry);
    assert.equal(String(entry.lastModified), "2026-10-25");

    const copy = `${post.title} ${post.description} ${post.body}`;
    assert.match(post.body, /\/case-studies\/bcle-furniture-bespokequote/);
    assert.equal(bcleCaseStudy.path, "/case-studies/bcle-furniture-bespokequote");
    assert.match(post.body, /https:\/\/bespokequote\.furniture/);
    assert.match(post.body, /\[free AI savings audit\]\(\/contact\)/);
    assert.match(post.body, /\[Book a free AI audit\]\(\/contact\)/);
    assert.match(post.body, /BCLE Furniture/);
    assert.match(post.body, /Clients upload drawings: DWG, DXF, PDF, and sketches/);
    assert.match(post.body, /priced from real materials and labor/);
    assert.match(post.body, /PO and deposit/);
    assert.match(post.body, /Status and messages live in a dashboard/);
    assert.equal(copy.includes("\u2014"), false);
    assert.equal(copy.includes("$"), false);
    assert.equal(copy.includes("%"), false);
    assert.equal(/\d/.test(post.body), false);
    assert.equal(/\bour own\b|\bmy shop\b|\bfamily\b|\bacquired\b|\bTHA\b|\btestimonial\b/i.test(copy), false);
    assert.equal(copy.includes("Adtell Integration"), false);
  });
});
