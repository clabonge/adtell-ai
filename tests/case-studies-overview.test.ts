import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { caseStudiesOverview } from "../content/case-studies-overview";
import { getPost } from "../lib/posts";

describe("retired running-our-companies case study", () => {
  it("folds the overview into case studies and redirects the old slug", () => {
    assert.equal(existsSync("content/case-studies/running-our-companies-on-ai-agents.md"), false);
    assert.equal(getPost("case-studies", "running-our-companies-on-ai-agents"), undefined);

    const config = readFileSync("next.config.ts", "utf8");
    assert.match(
      config,
      /source:\s*"\/case-studies\/running-our-companies-on-ai-agents",\s*destination:\s*"\/case-studies",\s*statusCode:\s*301/,
    );

    const page = readFileSync("app/case-studies/page.tsx", "utf8");
    assert.match(page, /caseStudiesOverview/);
    const copy = [
      caseStudiesOverview.intro,
      ...caseStudiesOverview.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
    ].join(" ");
    assert.match(copy, /What we implemented, and why/);
    assert.match(copy, /How a workflow gets chosen/);
    assert.match(copy, /named task, not from a model/);
    assert.equal(copy.includes("our companies"), false);
    assert.equal(copy.includes("our own"), false);
    assert.equal(copy.includes("\u2014"), false);
    assert.equal(copy.includes("/case-studies"), false);
  });
});
