import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { services } from "../content/services";
import { organizationJsonLd, servicesOfferJsonLd } from "../lib/structured-data";

describe("service structured data", () => {
  it("lists a ProfessionalService and only the published prices", () => {
    const data = servicesOfferJsonLd();
    const json = JSON.stringify(data);
    assert.equal(data["@type"], "ProfessionalService");
    assert.equal(data.telephone, "215-499-8959");
    assert.equal(data.email, "clabonge@adtell.ai");
    assert.deepEqual(
      data.areaServed.map((area) => area.name),
      ["Bucks County", "Montgomery County", "Lehigh Valley, PA"],
    );
    assert.equal(json.includes("streetAddress"), false);
    assert.equal(json.includes("postalCode"), false);
    assert.equal(data.hasOfferCatalog["@type"], "OfferCatalog");
    const offers = JSON.parse(json).hasOfferCatalog.itemListElement as {
      name: string;
      price?: string;
      description?: string;
      priceSpecification?: { minPrice?: string; maxPrice?: string; unitText?: string };
    }[];
    assert.deepEqual(
      offers.map((offer) => offer.name),
      services.map((service) => service.name),
    );
    assert.equal(offers[0]?.price, "0");
    assert.equal(offers[1]?.priceSpecification?.minPrice, "5000");
    assert.equal(offers[1]?.priceSpecification?.maxPrice, undefined);
    assert.equal(offers[2]?.priceSpecification?.minPrice, "2500");
    assert.equal(offers[2]?.priceSpecification?.maxPrice, "7500");
    assert.equal(offers[3]?.priceSpecification?.minPrice, "10000");
    assert.equal(offers[4]?.priceSpecification?.minPrice, "1500");
    assert.equal(offers[4]?.priceSpecification?.unitText, "MONTH");
    assert.equal(offers[5]?.description, "Quoted");
    assert.equal(json.includes("4000"), false);
    assert.equal(json.includes("3000"), false);
    assert.equal(readFileSync("app/services/page.tsx", "utf8").includes("servicesOfferJsonLd"), true);

    const org = JSON.stringify(organizationJsonLd());
    assert.equal(org.includes("Lehigh Valley, PA"), true);
    assert.equal(org.includes("streetAddress"), false);
  });
});
