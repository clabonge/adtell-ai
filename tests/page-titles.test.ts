import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { industries, industryPath, whoWeHelp } from "../content/industries";
import { sampleAudit } from "../content/sample-audit";
import { sampleBaseline } from "../content/sample-baseline";
import { site } from "../content/site";
import { getPosts } from "../lib/posts";
import { documentTitle, pageMetadata } from "../lib/seo";

const pages: { topic: string; path: string }[] = [
  { topic: site.name, path: "/" },
  { topic: "Services and pricing", path: "/services" },
  { topic: "How it works", path: "/how-it-works" },
  { topic: "About", path: "/about" },
  { topic: "Case studies", path: "/case-studies" },
  { topic: "Blog", path: "/blog" },
  { topic: "Contact us", path: "/contact" },
  { topic: "Privacy", path: "/privacy" },
  { topic: "Security", path: "/security" },
  { topic: "Terms", path: "/terms" },
  { topic: sampleAudit.title, path: sampleAudit.path },
  { topic: sampleBaseline.title, path: sampleBaseline.path },
  { topic: "A one-page brief for the CFO", path: "/cfo-brief" },
  { topic: whoWeHelp.title, path: whoWeHelp.path },
  ...industries.map((industry) => ({ topic: industry.name, path: industryPath(industry) })),
  ...getPosts("blog").map((post) => ({ topic: post.title, path: `/blog/${post.slug}` })),
  ...getPosts("case-studies").map((post) => ({
    topic: post.title,
    path: `/case-studies/${post.slug}`,
  })),
  { topic: "AI consulting in Bucks County", path: "/ai-consulting/bucks-county-pa" },
  { topic: "AI consulting in Montgomery County", path: "/ai-consulting/montgomery-county-pa" },
  { topic: "AI consulting in the Lehigh Valley", path: "/ai-consulting/lehigh-valley-pa" },
];

describe("page titles", () => {
  it("uses Page topic | Adtell.ai and keeps the region on home and Who we help", () => {
    for (const page of pages) {
      const title = documentTitle(page.topic, page.path);
      const meta = pageMetadata({
        title: page.topic,
        description: "A page.",
        path: page.path,
      });
      const regional = page.path === "/" || page.path.startsWith("/who-we-help");
      assert.equal(title.includes("\u2014"), false, title);
      assert.deepEqual(meta.title, { absolute: title });
      assert.equal(meta.openGraph?.title, title);
      if (regional) {
        assert.equal(title.includes(site.serviceRegion), true, title);
      } else {
        assert.equal(title.includes(site.serviceRegion), false, title);
        assert.equal(title.endsWith(`| ${site.name}`), true, title);
        assert.ok(title.length <= 65, `${title} (${title.length})`);
      }
    }

    const home = documentTitle(site.name, "/");
    assert.equal(home, "Adtell.ai | Bucks, Montgomery and the Lehigh Valley");
    assert.ok(home.length <= 60);
    assert.equal(documentTitle("Services and pricing", "/services"), "Services and pricing | Adtell.ai");
    assert.equal(
      documentTitle(whoWeHelp.title, whoWeHelp.path),
      "Who we help | Bucks, Montgomery and the Lehigh Valley | Adtell.ai",
    );
  });
});
