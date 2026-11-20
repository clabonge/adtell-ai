import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { bcleTurnaround, furnitureOffer } from "../content/furniture-offer";
import { getIndustry } from "../content/industries";
import { furnitureShop } from "../content/industry-examples";
import { quotedInWriting, services } from "../content/services";
import { industryWorkflows } from "../content/workflows";
import { getPost } from "../lib/posts";

const drawingList = "Clients upload drawings: DWG, DXF, PDF, and sketches.";

describe("furniture offer", () => {
  it("reuses the published turnaround, prices, and one drawing list", () => {
    const study = getPost("case-studies", "bcle-furniture-bespokequote");
    assert.ok(study);
    assert.equal(study.body.includes(bcleTurnaround), true);
    assert.equal(furnitureOffer.anywhere, "We build systems like this for shops anywhere, working by video.");
    assert.equal(furnitureOffer.note, quotedInWriting);
    assert.deepEqual(
      furnitureOffer.offers.map((offer) => [offer.slug, offer.name, offer.priceLabel]),
      [
        ["starter-workflow", "Starter workflow", services.find((service) => service.slug === "starter-workflow")?.priceLabel],
        ["implementation", "Implementation projects", services.find((service) => service.slug === "implementation")?.priceLabel],
      ],
    );
    assert.equal(furnitureOffer.offers[0]?.priceLabel, "$2,500–$7,500");
    assert.equal(furnitureOffer.offers[1]?.priceLabel, "From $10,000");

    const furniture = getIndustry("manufacturing-and-furniture");
    const workflow = industryWorkflows["manufacturing-and-furniture"];
    const sent = workflow.find((step) => step.label === "Sent");
    assert.match(sent?.text ?? "", /quote is sent/);
    assert.equal(/dashboard/i.test(sent?.text ?? ""), false);

    const pageCopy = [
      furniture?.description,
      furniture?.lede,
      ...(furniture?.paragraphs ?? []),
      ...furnitureShop.points,
      furnitureShop.close,
      ...workflow.map((step) => step.text),
      bcleTurnaround,
    ].join("\n");
    assert.equal(pageCopy.split(drawingList).length - 1, 1);
    assert.equal(pageCopy.includes("\u2014"), false);
    assert.equal(/hubspot|our own shop|our own company|acquired THA/i.test(pageCopy), false);
    assert.equal(pageCopy.includes("Adtell Integration"), false);

    const delivery = readFileSync("components/BcleSections.tsx", "utf8");
    const demo = readFileSync("app/demo/bespokequote/page.tsx", "utf8");
    assert.match(delivery, /bcleTurnaround/);
    assert.match(delivery, /<FurnitureOffer \/>/);
    assert.match(demo, /<FurnitureOffer \/>/);
  });
});
