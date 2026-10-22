import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { primaryNav } from "../content/nav";
import { fullAuditHref } from "../lib/audit-preview";

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...sourceFiles(full));
    else if (/\.(tsx?|md)$/.test(entry)) found.push(full);
  }
  return found;
}

describe("try it preview", () => {
  it("places the block under the homepage headline and after each industry lede", () => {
    const home = readFileSync("app/page.tsx", "utf8");
    const industry = readFileSync("app/who-we-help/[slug]/page.tsx", "utf8");
    const block = readFileSync("components/WorkflowTry.tsx", "utf8");
    const contact = readFileSync("app/contact/page.tsx", "utf8");
    const form = readFileSync("components/ContactForm.tsx", "utf8");
    const preview = readFileSync("components/AuditPreview.tsx", "utf8");
    const header = readFileSync("components/SiteHeader.tsx", "utf8");
    const footer = readFileSync("components/SiteFooter.tsx", "utf8");

    assert.ok(home.indexOf("<h1") < home.indexOf("<WorkflowTry />"));
    assert.ok(home.indexOf("<WorkflowTry />") < home.indexOf("<AuditOffer />"));
    assert.ok(industry.indexOf("lede={industry.lede}") < industry.indexOf("<WorkflowTry"));
    assert.ok(industry.indexOf("<WorkflowTry") < industry.indexOf("<AuditOffer />"));
    assert.match(industry, /presetIndustry=\{industry\.name\}/);

    assert.match(block, /See what AI could take off your plate\./);
    assert.match(block, /Preview my workflows/);
    assert.match(block, /Get my full audit/);
    assert.match(block, /\/api\/audit-preview\/health/);
    assert.match(block, /keyPresent === true/);
    assert.match(block, /\/api\/audit-preview/);
    assert.match(block, /PREVIEW_LABEL|PreviewCard/);
    assert.match(block, /What eats the most time each week\?/);
    assert.equal(block.includes("\u2014"), false);

    assert.match(contact, /title="Contact us"/);
    assert.match(contact, /lede="Request your free AI audit\."/);
    assert.match(contact, /initialIndustry=\{industry\}/);
    assert.match(contact, /initialWeeklyTime=\{weeklyTime\}/);
    assert.match(form, /initialIndustry = ""/);
    assert.match(form, /initialWeeklyTime = ""/);
    assert.match(form, /<AuditPreview/);
    assert.match(preview, /Preview my audit/);

    assert.equal(
      primaryNav.some((item) => item.href === "/contact" && item.label === "Contact"),
      true,
    );
    assert.match(header, /primaryNav/);
    assert.match(footer, /primaryNav/);
    assert.equal(
      fullAuditHref("Hospitality and events", "Follow-up after every tasting."),
      "/contact?industry=Hospitality+and+events&weekly_time=Follow-up+after+every+tasting.",
    );
  });

  it("keeps the 25% share and leaves out a term length or a cap", () => {
    const share = readFileSync("content/services.ts", "utf8");
    const home = readFileSync("app/page.tsx", "utf8");
    assert.match(share, /25% of the measured savings/);
    assert.match(home, /\/services#savings-share/);
    const forbidden = [
      "term length",
      "any cap",
      "capped at",
      "savings-share term",
    ];
    const hits: string[] = [];
    for (const root of ["app", "components", "content"]) {
      for (const file of sourceFiles(root)) {
        const text = readFileSync(file, "utf8");
        for (const phrase of forbidden) {
          if (text.toLowerCase().includes(phrase)) hits.push(`${file}: ${phrase}`);
        }
      }
    }
    assert.deepEqual(hits, []);
  });
});
