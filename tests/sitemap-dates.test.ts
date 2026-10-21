import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { site } from "../content/site";

describe("sitemap dates", () => {
  it("uses the public-page revision date instead of 15 October 2026", () => {
    assert.equal(site.updated, "2026-10-20");
    const entries = sitemap();
    for (const entry of entries) {
      const modified = String(entry.lastModified);
      assert.equal(modified.includes("2026-10-15"), false, entry.url);
      assert.ok(modified >= "2026-10-20", `${entry.url} ${modified}`);
    }
    const home = entries.find((entry) => entry.url === "https://adtell.ai/");
    assert.equal(home?.lastModified, "2026-10-20");
  });
});
