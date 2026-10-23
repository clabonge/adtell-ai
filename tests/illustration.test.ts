import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { savingsShare, services } from "../content/services";
import {
  formatDollars,
  formatPayback,
  illustrateFirstYear,
  illustrationOnlyLabel,
  RETAINER_MONTHLY,
  illustrateTask,
} from "../lib/illustration";

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

  it("adds the published build, an optional retainer, and a tool line the reader enters", () => {
    const retainer = services.find((service) => service.slug === "monthly-retainer");
    assert.equal(retainer?.priceLabel, "From $1,500/mo");
    assert.equal(RETAINER_MONTHLY, 1_500);
    assert.equal(illustrationOnlyLabel, "Illustration only, not a client result.");

    const buildOnly = illustrateFirstYear(false, 0, 0);
    assert.ok(buildOnly);
    assert.equal(buildOnly.firstYearTotal, 10_000);
    assert.equal(buildOnly.paybackMonths, null);

    const filled = illustrateFirstYear(true, 100, 2_000);
    assert.ok(filled);
    assert.equal(filled.retainerYear, 18_000);
    assert.equal(filled.toolsYear, 1_200);
    assert.equal(filled.firstYearTotal, 29_200);
    assert.equal(formatPayback(filled.paybackMonths ?? 0), "14.6 months");
    assert.equal(illustrateFirstYear(false, -1, 0), null);
  });

  it("labels a payback under one month without a zero", () => {
    const result = illustrateTask(40, 200);
    assert.ok(result);
    assert.equal(formatPayback(result.paybackMonths), "Under 1 month");
  });
});
