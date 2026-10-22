import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { industries } from "../content/industries";
import { furnitureShop, industryExamples } from "../content/industry-examples";

describe("industry examples", () => {
  it("gives every industry except hospitality its own labeled example", () => {
    const page = readFileSync("app/who-we-help/[slug]/page.tsx", "utf8");
    const copy = JSON.stringify({ industryExamples, furnitureShop });

    assert.equal(copy.includes("\u2014"), false);
    assert.equal(copy.includes("$"), false);
    assert.equal(/register|RFQ|testimonial/i.test(copy), false);

    for (const industry of industries) {
      if (industry.slug === "hospitality-and-events") {
        assert.equal(industryExamples[industry.slug], undefined);
      } else {
        const example = industryExamples[industry.slug];
        assert.ok(example, industry.slug);
        assert.match(example.note, /Example only/);
        assert.deepEqual(
          example.steps.map((step) => step.label),
          ["Request", "Draft", "Person approves", "Sent", "Follow-up"],
        );
      }
    }

    const furniture = industryExamples["manufacturing-and-furniture"];
    assert.match(furniture.steps.map((step) => step.text).join(" "), /custom quote request/);
    assert.match(furniture.steps[1].text, /reply or a quote/);
    assert.match(furniture.steps[2].text, /person approves/);
    assert.match(furniture.steps[3].text, /sent only after/);
    assert.match(furniture.steps[4].text, /Follow-up/);

    assert.equal(furnitureShop.heading, "See what we built for our own shop");
    assert.equal(furnitureShop.href, "https://bespokequote.furniture");
    assert.match(furnitureShop.lead, /BCLE Furniture's quoting site/);
    assert.match(furnitureShop.points.join(" "), /DWG, DXF, PDF/);
    assert.match(furnitureShop.points.join(" "), /materials and labor/);
    assert.match(furnitureShop.points.join(" "), /PO and deposit/);
    assert.match(furnitureShop.points.join(" "), /dashboard/);
    assert.match(furnitureShop.close, /same kind of system for your shop/);

    assert.match(page, /hospitality-and-events/);
    assert.match(page, /<SampleAuditPreview \/>/);
    assert.match(page, /<IndustryExample slug=\{industry\.slug\} \/>/);
    assert.match(page, /manufacturing-and-furniture/);
    assert.match(page, /<FurnitureShop \/>/);
    assert.match(page, /sampleAudit\.path/);
  });
});
