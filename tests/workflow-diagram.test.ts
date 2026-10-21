import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { industries } from "../content/industries";
import { doanWorkflow, handoff, industryWorkflows, workflowLabels } from "../content/workflows";

function assertPlain(copy: string) {
  assert.equal(copy.includes("\u2014"), false);
  assert.equal(copy.includes("$"), false);
  assert.equal(/\d/.test(copy), false);
  assert.equal(copy.includes("\""), false);
  assert.equal(copy.toLowerCase().includes("testimonial"), false);
  assert.equal(copy.toLowerCase().includes("family"), false);
}

describe("workflow diagrams", () => {
  it("shows the same four steps and the handoff list, without new claims", () => {
    const joined = [
      ...handoff.items,
      ...doanWorkflow.map((step) => `${step.label} ${step.text}`),
      ...Object.values(industryWorkflows).flatMap((steps) => steps.map((step) => `${step.label} ${step.text}`)),
    ].join(" ");
    assertPlain(joined);
    assert.deepEqual(doanWorkflow.map((step) => step.label), [...workflowLabels]);
    for (const industry of industries) {
      const steps = industryWorkflows[industry.slug];
      assert.ok(steps, industry.slug);
      assert.deepEqual(steps.map((step) => step.label), [...workflowLabels]);
    }
    assert.match(joined, /Written rules/);
    assert.match(joined, /runbook/);
    assert.match(joined, /approval step/);
    assert.match(readFileSync("app/who-we-help/[slug]/page.tsx", "utf8"), /WorkflowDiagram/);
    assert.match(readFileSync("app/who-we-help/[slug]/page.tsx", "utf8"), /HandoffList/);
    const study = readFileSync("app/case-studies/[slug]/page.tsx", "utf8");
    assert.match(study, /doan-distillery-event-booking/);
    assert.match(study, /WorkflowDiagram/);
    assert.match(study, /HandoffList/);
  });
});
