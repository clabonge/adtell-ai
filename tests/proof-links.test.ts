import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("proof links", () => {
  it("connects the Doan case study, hospitality, and the sample audit", () => {
    const study = readFileSync("app/case-studies/[slug]/page.tsx", "utf8");
    const industry = readFileSync("app/who-we-help/[slug]/page.tsx", "utf8");
    const sample = readFileSync("app/sample-audit/page.tsx", "utf8");
    assert.match(study, /doan-distillery-event-booking/);
    assert.match(study, /industryPath\(hospitality\)/);
    assert.match(study, /sampleAudit\.path/);
    assert.match(industry, /hospitality-and-events/);
    assert.match(industry, /\/case-studies\/doan-distillery-event-booking/);
    assert.match(industry, /sampleAudit\.path/);
    assert.match(sample, /\/case-studies\/doan-distillery-event-booking/);
    assert.match(sample, /industryPath\(hospitality\)/);
    assert.match(sample, /This example is not a client engagement/);
    const joined = `${study}\n${industry}\n${sample}`;
    assert.equal(joined.includes("\u2014"), false);
  });
});
