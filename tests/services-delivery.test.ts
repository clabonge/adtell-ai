import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { services, servicesIntro } from "../content/services";

describe("service delivery", () => {
  it("keeps the published prices", () => {
    const prices = Object.fromEntries(services.map((service) => [service.slug, service.priceLabel]));
    assert.deepEqual(prices, {
      "free-ai-savings-audit": "Free",
      "starter-workflow": "$2,500–$7,500",
      "ai-assessment-roadmap": "$2,500–$7,500",
      implementation: "From $10,000",
      "monthly-retainer": "From $1,500/mo",
      "team-training": "Quoted",
    });
  });

  it("names roadmap and implementation deliverables without a new price", () => {
    const roadmap = services.find((service) => service.slug === "ai-assessment-roadmap");
    const implementation = services.find((service) => service.slug === "implementation");
    assert.deepEqual(roadmap?.delivery?.deliverables, [
      "A ranked workflow list",
      "A cost baseline",
      "A build plan",
    ]);
    assert.equal(roadmap?.delivery?.timeline, "2 to 4 weeks.");
    assert.deepEqual(implementation?.delivery?.deliverables, [
      "One live workflow",
      "A staff handoff",
      "30 days of tuning",
    ]);
    assert.equal(services.find((service) => service.slug === "free-ai-savings-audit")?.delivery, undefined);
    const starter = services.find((service) => service.slug === "starter-workflow");
    assert.equal(starter?.priceLabel, roadmap?.priceLabel);
    assert.equal(starter?.priceAside, "One workflow built");
    assert.equal(roadmap?.priceAside, "Written plan");
    assert.equal(roadmap?.priceLabel, "$2,500\u2013$7,500");
    const joined = [servicesIntro.lede, starter?.brief, starter?.summary, starter?.priceDetail, roadmap?.brief, roadmap?.summary, roadmap?.priceDetail].join(" ");
    assert.equal(joined.includes("From $5,000"), false);
    assert.equal(joined.toLowerCase().includes("no cap"), false);
    assert.match(starter?.summary ?? "", /build/);
    assert.match(roadmap?.summary ?? "", /plan/);
  });
});
