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

    assert.equal(modified("/"), "2026-10-21");
    assert.equal(modified("/services"), "2026-10-22");
    assert.equal(modified("/cfo-brief"), "2026-10-22");
    assert.equal(modified("/contact"), "2026-10-22");
    assert.equal(modified(sampleAudit.path), sampleAudit.updated);
    assert.equal(modified(whoWeHelp.path), whoWeHelp.updated);
    for (const industry of industries) {
      assert.equal(modified(industryPath(industry)), whoWeHelp.updated);
    }

    const doan = getPost("case-studies", "doan-distillery-event-booking");
    assert.ok(doan);
    assert.equal(modified(`/case-studies/${doan.slug}`), doan.date);
    assert.equal(doan.date, "2026-10-21");

    for (const entry of entries) {
      const value = String(entry.lastModified);
      assert.equal(value.includes("2026-10-15"), false, entry.url);
      assert.ok(value >= "2026-10-20", `${entry.url} ${value}`);
    }
  });
});
