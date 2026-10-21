import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { sampleAudit } from "../content/sample-audit";
import { site } from "../content/site";

describe("sample audit", () => {
  it("is labeled an example for a fictional business and stays out of the client list", () => {
    const copy = [
      sampleAudit.label,
      sampleAudit.title,
      sampleAudit.description,
      sampleAudit.lede,
      sampleAudit.close,
      ...sampleAudit.items.flatMap((item) => [item.title, item.observation, item.recommendation]),
    ].join(" ");
    assert.equal(sampleAudit.label, "Example only");
    assert.match(copy, /fictional|Example only/);
    assert.match(copy, /Wait/);
    assert.equal(copy.includes("\u2014"), false);
    assert.equal(copy.includes("$"), false);
    assert.equal(copy.toLowerCase().includes("testimonial"), false);
    for (const business of site.implementations) {
      assert.equal(copy.includes(business.name), false, business.name);
    }
    const names: readonly string[] = site.implementations.map((item) => item.name);
    assert.equal(names.includes(sampleAudit.business), false);
  });

  it("is linked from the contact and services pages and listed in the sitemap", () => {
    const contact = readFileSync("app/contact/page.tsx", "utf8");
    const services = readFileSync("app/services/page.tsx", "utf8");
    assert.match(contact, /sampleAudit\.path/);
    assert.match(services, /sampleAudit\.path/);
    const entry = sitemap().find(
      (item) => item.url === new URL(sampleAudit.path, site.url).toString(),
    );
    assert.ok(entry);
    assert.equal(entry?.lastModified, sampleAudit.updated);
  });
});
