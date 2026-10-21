import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { site } from "../content/site";
import { pageMetadata } from "../lib/seo";
import { organizationJsonLd } from "../lib/structured-data";

describe("local presence", () => {
  it("names Bucks County and the three served regions without a street address", () => {
    assert.equal(
      site.localPresence,
      "Based in Bucks County, serving Bucks, Montgomery and the Lehigh Valley, on-site or by video.",
    );
    const data = organizationJsonLd();
    const json = JSON.stringify(data);
    assert.deepEqual(data["@type"], ["LocalBusiness", "ProfessionalService"]);
    assert.equal(data.telephone, "215-499-8959");
    assert.equal(data.email, "clabonge@adtell.ai");
    assert.equal(data.url, "https://adtell.ai");
    assert.deepEqual(
      data.areaServed.map((area: { name: string }) => area.name),
      ["Bucks County", "Montgomery County", "Lehigh Valley, PA"],
    );
    assert.equal(json.includes("streetAddress"), false);
    assert.equal(json.includes("postalCode"), false);
  });

  it("keeps the region in descriptions and on the homepage title", () => {
    const meta = pageMetadata({
      title: "Services and pricing",
      description: "Published starting points for the department.",
      path: "/services",
    });
    assert.deepEqual(meta.title, { absolute: "Services and pricing | Adtell.ai" });
    assert.equal(JSON.stringify(meta.title).includes(site.serviceRegion), false);
    assert.match(String(meta.description), /Based in Bucks County/);
    assert.equal(meta.openGraph?.title, "Services and pricing | Adtell.ai");
    const home = pageMetadata({
      title: site.name,
      description: site.description,
      path: "/",
    });
    assert.deepEqual(home.title, {
      absolute: "Adtell.ai | Bucks, Montgomery and the Lehigh Valley",
    });
    assert.equal(String(home.description).split("Based in Bucks County").length, 2);
  });
});
