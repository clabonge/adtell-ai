import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { savingsShare, services } from "../content/services";
import { formatDollars, formatPayback, illustrateTask } from "../lib/illustration";

describe("task illustration", () => {
  it("uses the published 25% share and the $10,000 implementation start", () => {
    const implementation = services.find((service) => service.slug === "implementation");
    assert.equal(implementation?.priceLabel, "From $10,000");
    assert.match(savingsShare.title, /25%/);
  });

  it("turns weekly hours and a loaded rate into annual cost, fee, and payback", () => {
    const result = illustrateTask(10, 50);
    assert.ok(result);
    assert.equal(result.annualCost, 26_000);
    assert.equal(result.fee, 6_500);
    assert.equal(formatDollars(result.annualCost), "$26,000");
    assert.equal(formatDollars(result.fee), "$6,500");
    assert.equal(formatPayback(result.paybackMonths), "4.6 months");
  });

  it("rejects zero and blank numbers", () => {
    assert.equal(illustrateTask(0, 50), null);
    assert.equal(illustrateTask(10, 0), null);
    assert.equal(illustrateTask(Number.NaN, 50), null);
  });

  it("labels a payback under one month without a zero", () => {
    const result = illustrateTask(40, 200);
    assert.ok(result);
    assert.equal(formatPayback(result.paybackMonths), "Under 1 month");
  });
});
