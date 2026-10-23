import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { securityPage } from "../content/security";
import { site } from "../content/site";

describe("security page", () => {
  it("states access, providers, retention, and no training without a certification claim", () => {
    const copy = securityPage.sections
      .flatMap((section) => [section.title, ...section.paragraphs])
      .join(" ");
    const joined = `${securityPage.lede} ${copy}`;
    assert.match(joined, /least access/);
    assert.match(joined, /Accounts stay yours/);
    assert.match(joined, /OpenAI/);
    assert.match(joined, /named in the written agreement/);
    assert.match(joined, /delete that material or return it/);
    assert.match(joined, /remove our access when the engagement ends/);
    assert.match(joined, /NDA is available on request/);
    assert.match(joined, /do not use client data to train AI models/);
    assert.equal(joined.includes("\u2014"), false);
    for (const banned of ["SOC", "HIPAA", "ISO", "certified", "compliant", "compliance"]) {
      assert.equal(joined.toLowerCase().includes(banned.toLowerCase()), false, banned);
    }
    assert.equal(joined.toLowerCase().includes("family"), false);
    assert.equal(joined.includes("Adtell Integration"), false);

    const footer = readFileSync("components/SiteFooter.tsx", "utf8");
    const services = readFileSync("app/services/page.tsx", "utf8");
    const brief = readFileSync("app/cfo-brief/page.tsx", "utf8");
    assert.match(footer, /href="\/security"/);
    assert.match(services, /href="\/security"/);
    assert.match(brief, /href="\/security"/);

    const entry = sitemap().find(
      (item) => item.url === new URL(securityPage.path, site.url).toString(),
    );
    assert.equal(entry?.lastModified, securityPage.updated);
  });
});
