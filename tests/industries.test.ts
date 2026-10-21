import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getIndustry,
  industries,
  industryLines,
  industryPath,
  whoWeHelp,
} from "../content/industries";
import { primaryNav } from "../content/nav";
import sitemap from "../app/sitemap";
import { site } from "../content/site";

const expected = [
  "hospitality-and-events",
  "property-management",
  "manufacturing-and-furniture",
  "training-schools",
  "public-markets-and-retail",
] as const;

describe("who we help", () => {
  it("publishes one page for each industry and lists them in the nav and sitemap", () => {
    assert.deepEqual(
      industries.map((industry) => industry.slug),
      [...expected],
    );
    assert.equal(
      primaryNav.some((item) => item.href === whoWeHelp.path && item.label === "Who we help"),
      true,
    );
    const urls = sitemap().map((entry) => entry.url);
    assert.equal(urls.includes(new URL(whoWeHelp.path, site.url).toString()), true);
    for (const industry of industries) {
      const url = new URL(industryPath(industry), site.url).toString();
      assert.equal(urls.includes(url), true, url);
      const entry = sitemap().find((item) => item.url === url);
      assert.equal(entry?.lastModified, whoWeHelp.updated);
    }
  });

  it("ties each helped business to one industry in the firm's voice", () => {
    const named = industries.flatMap((industry) => [...industry.businesses]);
    assert.deepEqual(
      [...named].sort(),
      site.implementations.map((item) => item.name).sort(),
    );
    assert.equal(new Set(named).size, named.length);
    for (const industry of industries) {
      assert.equal(getIndustry(industry.slug)?.name, industry.name);
      for (const line of industryLines(industry)) {
        assert.match(line, /^We helped /);
      }
      const copy = [industry.name, industry.description, industry.lede, ...industry.paragraphs].join(
        " ",
      );
      assert.equal(copy.includes("\u2014"), false);
      assert.equal(copy.includes("Adtell Integration"), false);
    }
    const hospitality = getIndustry("hospitality-and-events");
    assert.match(hospitality?.paragraphs.join(" ") ?? "", /CapoVino is a winery/);
    assert.deepEqual(hospitality?.businesses, ["Doan Distillery", "CapoVino"]);
  });
});
