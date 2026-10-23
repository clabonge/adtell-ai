import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { counties, countyPath } from "../content/counties";
import { site } from "../content/site";
import { countyServiceJsonLd } from "../lib/structured-data";

describe("county pages", () => {
  it("gives each county its own on-site page, markup, and footer link", () => {
    assert.deepEqual(
      counties.map((county) => county.slug),
      ["bucks-county-pa", "montgomery-county-pa", "lehigh-valley-pa"],
    );
    const ledes = new Set(counties.map((county) => county.lede));
    const onSite = new Set(counties.map((county) => county.onSite));
    const work = new Set(counties.map((county) => county.work));
    assert.equal(ledes.size, 3);
    assert.equal(onSite.size, 3);
    assert.equal(work.size, 3);

    const page = readFileSync("app/ai-consulting/[slug]/page.tsx", "utf8");
    const footer = readFileSync("components/SiteFooter.tsx", "utf8");
    assert.match(page, /<WorkflowTry \/>/);
    assert.match(page, /auditCta/);
    assert.match(page, /countyServiceJsonLd/);
    assert.match(footer, /countyPath/);

    for (const county of counties) {
      const copy = [county.lede, county.onSite, county.work, county.description].join(" ");
      assert.match(copy, /on-site/i);
      assert.match(copy, /audit/i);
      assert.match(copy, /workshop/i);
      assert.equal(copy.includes("\u2014"), false);
      assert.equal(copy.toLowerCase().includes("family"), false);
      assert.equal(copy.includes("Adtell Integration"), false);
      assert.equal(copy.includes("%"), false);
      assert.equal(copy.includes("$"), false);
      assert.equal(/\b\d{1,5}\b/.test(copy), false);
      for (const name of ["Doan", "CapoVino", "FiberOptics", "BCLE", "Ivers", "Trolley", "Linden"]) {
        assert.equal(copy.includes(name), false, name);
      }
      const data = countyServiceJsonLd(county.areaServed);
      const json = JSON.stringify(data);
      assert.deepEqual(data["@type"], ["LocalBusiness", "ProfessionalService"]);
      assert.equal(data.areaServed.name, county.areaServed);
      assert.equal(json.includes("streetAddress"), false);
      assert.equal(json.includes("postalCode"), false);
      const entry = sitemap().find(
        (item) => item.url === new URL(countyPath(county), site.url).toString(),
      );
      assert.equal(entry?.lastModified, "2026-10-23");
    }
  });
});
