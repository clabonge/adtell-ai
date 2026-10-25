import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { aboutIntro, founderSection } from "../content/about";
import { footerIntro, site } from "../content/site";
import { countyServiceJsonLd, organizationJsonLd } from "../lib/structured-data";

describe("founder credit", () => {
  it("ends Adtell Inc. once in the footer, structured data, and about copy", () => {
    assert.equal(
      footerIntro,
      "Adtell.ai is the outsourced AI department, led by Chris LaBonge, Founder & President of Adtell Inc. We implement AI that cuts operating cost.",
    );
    assert.equal(footerIntro.includes(".."), false);
    assert.match(readFileSync("components/SiteFooter.tsx", "utf8"), /\{footerIntro\}/);

    const org = organizationJsonLd();
    const county = countyServiceJsonLd("Bucks County");
    for (const data of [org, county]) {
      assert.equal(data.founder.jobTitle, "Founder & President, Adtell Inc.");
      assert.equal(data.parentOrganization.name, "Adtell Inc.");
      assert.equal(JSON.stringify(data).includes(".."), false);
    }
    assert.equal(site.founder.organization, "Adtell Inc.");
    assert.equal(site.holdingCompany, "Adtell Inc.");

    const about = [aboutIntro.lede, ...founderSection.paragraphs].join(" ");
    assert.equal(about.includes(".."), false);
    assert.equal(about.includes("Adtell Inc.."), false);
  });
});
