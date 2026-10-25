import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { industries, industryPath, whoWeHelp } from "../content/industries";
import { sampleAudit } from "../content/sample-audit";
import { site } from "../content/site";
import { getPost } from "../lib/posts";

describe("sitemap dates", () => {
  it("uses each page's own revision instead of 15 October 2026", () => {
    assert.equal(site.updated, "2026-10-21");
    const entries = sitemap();
    const modified = (path: string) => {
      const url = new URL(path || "/", site.url).toString();
      const entry = entries.find((item) => item.url === url);
      assert.ok(entry, path);
      return String(entry.lastModified);
    };

    assert.equal(modified("/"), "2026-10-25");
    assert.equal(modified("/about"), "2026-10-25");
    assert.equal(modified("/services"), "2026-10-23");
    assert.equal(modified("/cfo-brief"), "2026-10-23");
    assert.equal(modified("/contact"), site.pageUpdated["/contact"]);
    assert.equal(modified(sampleAudit.path), sampleAudit.updated);
    assert.equal(modified(whoWeHelp.path), whoWeHelp.updated);
    for (const industry of industries) {
      const path = industryPath(industry);
      const key = path as keyof typeof site.pageUpdated;
      const expected = key in site.pageUpdated ? site.pageUpdated[key] : whoWeHelp.updated;
      assert.equal(modified(path), expected);
    }

    const doan = getPost("case-studies", "doan-distillery-event-booking");
    assert.ok(doan);
    assert.equal(doan.date, "2026-10-21");
    assert.equal(modified(`/case-studies/${doan.slug}`), "2026-10-23");
    assert.equal(
      modified("/case-studies/running-our-companies-on-ai-agents"),
      "2026-10-23",
    );

    for (const entry of entries) {
      const value = String(entry.lastModified);
      assert.equal(value.includes("2026-10-15"), false, entry.url);
      assert.ok(value >= "2026-10-20", `${entry.url} ${value}`);
    }
  });
});
