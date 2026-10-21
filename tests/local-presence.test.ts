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
      ["Bucks County", "Montgomery County", "Lehigh Valley"],
    );
    assert.equal(json.includes("streetAddress"), false);
    assert.equal(json.includes("postalCode"), false);
  });

  it("adds the region to titles and descriptions", () => {
    const meta = pageMetadata({
      title: "Services and pricing",
      description: "Published starting points for the department.",
      path: "/services",
    });
    assert.equal(meta.title, "Services and pricing | Bucks, Montgomery and the Lehigh Valley");
    assert.match(String(meta.description), /Based in Bucks County/);
    assert.equal(
      meta.openGraph?.title,
      "Services and pricing | Bucks, Montgomery and the Lehigh Valley",
    );
    const home = pageMetadata({
      title: "Adtell.ai | Your outsourced AI department",
      description: site.description,
      path: "/",
      absolute: true,
    });
    assert.deepEqual(home.title, {
      absolute:
        "Adtell.ai | Your outsourced AI department | Bucks, Montgomery and the Lehigh Valley",
    });
    assert.equal(String(home.description).split("Based in Bucks County").length, 2);
  });
});
