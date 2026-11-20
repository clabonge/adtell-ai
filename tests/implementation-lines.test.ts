import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { industries, industryLines } from "../content/industries";
import { industryExamples } from "../content/industry-examples";
import { businessFacts, implementationLine, site } from "../content/site";
import { industryWorkflows } from "../content/workflows";
import { getPosts } from "../lib/posts";

describe("implementation lines", () => {
  it("uses a complete present-tense sentence and hides empty start months and tools", () => {
    for (const business of site.implementations) {
      const line = implementationLine(business);
      assert.match(line, /^We built /);
      assert.equal(line.includes("with the goal of"), false);
      assert.equal(business.runningSince, "");
      assert.deepEqual([...business.tools], []);
      assert.equal(businessFacts(business), undefined);
    }

    const school = site.implementations.find((item) => item.name === "The Fiber School");
    assert.match(
      school?.summary ?? "",
      /^We built The Fiber School an automation that prepares student communications about expiring certifications/,
    );

    assert.equal(
      businessFacts({ runningSince: "March 2026", tools: ["Outlook"] }),
      "Running since March 2026. Tools: Outlook.",
    );
    assert.equal(businessFacts({ runningSince: "March 2026", tools: [] }), "Running since March 2026.");
    assert.equal(businessFacts({ runningSince: "", tools: ["Outlook"] }), "Tools: Outlook.");

    for (const post of getPosts("case-studies")) {
      assert.equal(post.body.includes("with the goal of"), false, post.slug);
    }

    for (const industry of industries) {
      const example = industryExamples[industry.slug];
      const copy = [
        industry.description,
        industry.lede,
        ...industry.paragraphs,
        ...industryLines(industry),
        ...industryWorkflows[industry.slug].map((step) => step.text),
        ...(example ? example.steps.map((step) => step.text) : []),
      ].join(" ");
      assert.equal(copy.includes("a person still"), false, industry.slug);
      assert.equal(copy.includes("\u2014"), false, industry.slug);
    }
  });
});
