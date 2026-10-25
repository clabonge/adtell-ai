import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { faqs } from "../content/faqs";
import { sampleBaseline } from "../content/sample-baseline";
import { site } from "../content/site";
import { pdfText } from "../lib/simple-pdf";
import { sampleBaselinePdf } from "../lib/sample-baseline-pdf";

function worksheetCopy(): string {
  return [
    sampleBaseline.label,
    sampleBaseline.title,
    sampleBaseline.description,
    sampleBaseline.lede,
    sampleBaseline.business,
    sampleBaseline.task,
    sampleBaseline.close,
    ...sampleBaseline.sections.flatMap((section) => [section.title, ...section.paragraphs]),
    ...sampleBaseline.rows.flatMap((row) => [row.label, row.amount, row.note]),
  ].join(" ");
}

describe("sample savings baseline", () => {
  it("labels a made-up business and shows the 25% monthly calculation", () => {
    const copy = worksheetCopy();
    assert.equal(sampleBaseline.label, "Example only");
    assert.equal(sampleBaseline.business, "Fieldstone Casework");
    assert.match(copy, /made-up business/);
    assert.match(copy, /Not a client result/);
    assert.match(copy, /25% of the measured savings/);
    assert.match(copy, /other 75%/);
    assert.match(copy, /\$16,000/);
    assert.match(copy, /\$12,000/);
    assert.match(copy, /\$4,000/);
    assert.match(copy, /\$1,000/);
    assert.match(copy, /\$3,000/);
    assert.match(copy, /in writing/);
    assert.match(copy, /approves the spend/);
    assert.equal(copy.includes("\u2014"), false);
    assert.equal(/term length|any cap|capped at|savings-share term/i.test(copy), false);
    assert.equal(/\d+\s+\w+\s+(street|avenue|road|blvd)/i.test(copy), false);
    for (const business of site.implementations) {
      assert.equal(copy.includes(business.name), false, business.name);
    }

    const share = readFileSync("components/SavingsShare.tsx", "utf8");
    const calculator = readFileSync("components/SavingsCalculator.tsx", "utf8");
    const brief = readFileSync("app/cfo-brief/page.tsx", "utf8");
    const savingsFaq = faqs.find((item) => item.question === "Can we pay a share of the savings?");
    assert.match(share, /sampleBaseline\.path/);
    assert.match(calculator, /sampleBaseline\.path/);
    assert.match(brief, /sampleBaseline\.path/);
    assert.equal(savingsFaq?.link?.href, sampleBaseline.path);

    const urls = sitemap().map((entry) => entry.url);
    assert.equal(urls.includes(new URL(sampleBaseline.path, site.url).toString()), true);
    const entry = sitemap().find((item) => item.url === new URL(sampleBaseline.path, site.url).toString());
    assert.equal(String(entry?.lastModified), sampleBaseline.updated);

    const pdf = pdfText(sampleBaselinePdf());
    assert.match(pdf, /^%PDF-1\.4/);
    assert.match(pdf, /Fieldstone Casework/);
    assert.match(pdf, /25%/);
    assert.match(pdf, /\$4,000/);
    assert.match(pdf, /Example only/);
    assert.equal(/term length|capped at/i.test(pdf), false);
  });
});
