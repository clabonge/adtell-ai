import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { auditCta, auditPath } from "../content/nav";
import { pageMetadata } from "../lib/seo";
import { shareImageAlt } from "../lib/share-image";

const publicPaths = [
  "/",
  "/services",
  "/how-it-works",
  "/about",
  "/case-studies",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
];

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return path;
  });
}

describe("technical seo", () => {
  it("sets a canonical URL and Open Graph and Twitter images", () => {
    const meta = pageMetadata({
      title: "Services and pricing",
      description: "Published starting points for the department.",
      path: "/services",
    });
    assert.equal(meta.alternates?.canonical, "https://adtell.ai/services");
    const images = meta.openGraph && "images" in meta.openGraph ? meta.openGraph.images : [];
    const image = Array.isArray(images) ? images[0] : images;
    assert.equal(typeof image === "object" && image && "url" in image ? image.url : "", "https://adtell.ai/opengraph-image");
    assert.equal(typeof image === "object" && image && "alt" in image ? image.alt : "", shareImageAlt);
    const twitterImages = meta.twitter && "images" in meta.twitter ? meta.twitter.images : [];
    const twitterImage = Array.isArray(twitterImages) ? twitterImages[0] : twitterImages;
    assert.equal(
      typeof twitterImage === "object" && twitterImage && "url" in twitterImage ? twitterImage.url : "",
      "https://adtell.ai/twitter-image",
    );
    assert.equal(meta.twitter && "card" in meta.twitter ? meta.twitter.card : "", "summary_large_image");
  });

  it("lists public pages in the sitemap and keeps private routes out of robots", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const path of publicPaths) {
      assert.equal(urls.includes(new URL(path, "https://adtell.ai").toString()), true, path);
    }
    assert.equal(urls.some((url) => url.includes("/admin") || url.includes("/api/")), false);
    const rules = robots();
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    assert.deepEqual(rule?.disallow, ["/api/", "/admin"]);
    assert.equal(rules.sitemap, "https://adtell.ai/sitemap.xml");
  });

  it("sends audit calls to action to the audit form", () => {
    const sources = [
      ...walk("app").filter((path) => path.endsWith(".tsx")),
      ...walk("components").filter((path) => path.endsWith(".tsx")),
      ...walk("content").filter((path) => path.endsWith(".md")),
    ];
    for (const path of sources) {
      const source = readFileSync(path, "utf8");
      if (!source.includes(auditCta) && !source.toLowerCase().includes("book a free ai audit")) continue;
      const markdownLinks = [...source.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
      for (const match of markdownLinks) {
        if (!/audit/i.test(match[1])) continue;
        assert.equal(match[2], auditPath, `${path} links "${match[1]}" to ${match[2]}`);
      }
    }
    const services = readFileSync("app/services/page.tsx", "utf8");
    assert.match(services, /href=\{auditPath\}/);
    const contact = readFileSync("app/contact/page.tsx", "utf8");
    assert.match(contact, /href: "#audit-request"/);
    assert.match(contact, /href="#audit-request"/);
  });
});
