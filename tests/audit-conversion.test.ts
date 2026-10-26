import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { auditOffer, auditRequests } from "../content/audit";
import { industries, industryAsk, industryLines } from "../content/industries";
import { sampleAudit } from "../content/sample-audit";
import { site } from "../content/site";
import sitemap from "../app/sitemap";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("audit conversion", () => {
  it("states what the free audit gives you, then asks for the audit", () => {
    const home = read("app/page.tsx");
    const services = read("app/services/page.tsx");
    const industry = read("app/who-we-help/[slug]/page.tsx");
    const offer = read("components/AuditConversion.tsx");

    assert.equal(auditOffer.title, "What the free audit gives you");
    assert.deepEqual(auditOffer.points, [
      "A conversation, on-site locally or by video.",
      "A written one-page ranked list of what to automate first, and what to leave alone.",
      "Free, and the recommendation can be to wait.",
    ]);
    assert.equal(auditOffer.cta, "Request my free audit");
    assert.equal(auditOffer.reply, "We reply within one business day.");
    assert.match(offer, /auditOffer\.points/);
    assert.match(offer, /href=\{auditPath\}/);

    for (const source of [home, services, industry]) {
      assert.match(source, /<AuditOffer \/>/);
      assert.equal(source.includes("\u2014"), false);
    }
    assert.equal(offer.includes("\u2014"), false);
  });

  it("previews the first Linden Events item and labels it fictional", () => {
    const preview = read("components/AuditConversion.tsx");
    const contact = read("app/contact/page.tsx");
    const home = read("app/page.tsx");
    const services = read("app/services/page.tsx");
    const industry = read("app/who-we-help/[slug]/page.tsx");
    const first = sampleAudit.items[0];

    assert.equal(sampleAudit.business, "Linden Events");
    assert.equal(first.title, "Booking replies");
    assert.match(preview, /Example only, fictional business/);
    assert.match(preview, /sampleAudit\.items\[0\]/);
    assert.match(preview, /See the full example list/);
    assert.match(preview, /Get your own list/);
    assert.match(preview, /sampleAudit\.path/);
    assert.match(preview, /auditPath/);

    for (const source of [home, industry]) {
      const offerAt = source.indexOf("<AuditOffer />");
      const previewAt = source.indexOf("<SampleAuditPreview />");
      assert.ok(previewAt >= 0, source.slice(0, 40));
      if (offerAt >= 0) assert.ok(previewAt > offerAt);
    }
    assert.equal(services.includes("<SampleAuditPreview />"), false);
    assert.equal(contact.includes("<SampleAuditPreview />"), false);
    assert.equal(contact.includes("<AuditOffer />"), false);
  });

  it("moves each industry's existing client lines near the top", () => {
    const industry = read("app/who-we-help/[slug]/page.tsx");
    const proofAt = industry.indexOf("Businesses we helped");
    const paragraphsAt = industry.indexOf("industry.paragraphs.map");
    const handoffAt = industry.indexOf("<HandoffList />");
    assert.ok(proofAt > 0);
    assert.ok(proofAt < paragraphsAt);
    assert.ok(proofAt < handoffAt);
    assert.match(industry, /industryLines\(industry\)/);
    assert.match(industry, /industryAsk\(industry\)/);
    assert.match(industry, /auditRequests\.handoff/);
    assert.equal(auditRequests.handoff, "Request my free audit");

    for (const item of industries) {
      const ask = industryAsk(item);
      assert.match(ask, /^Ask what we'd do for your .+ business$/);
      const lines = industryLines(item);
      assert.equal(lines.length, item.businesses.length);
      item.businesses.forEach((name, index) => {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        assert.match(lines[index], new RegExp(`We helped ${escaped}`));
        assert.equal(lines[index].includes("\u2014"), false);
      });
    }
    assert.equal(
      industryAsk(industries[0]),
      "Ask what we'd do for your hospitality and events business",
    );
  });

  it("adds a request after the cost block and the calculator", () => {
    const home = read("app/page.tsx");
    const services = read("app/services/page.tsx");
    const costsAt = home.indexOf("Where the money goes");
    const requestAt = home.indexOf("auditRequests.costs");
    assert.ok(costsAt > 0 && requestAt > costsAt);
    assert.equal(auditRequests.costs, "Find which of these costs you most");

    const calculatorAt = services.indexOf("<SavingsCalculator />");
    const checkAt = services.indexOf("auditRequests.calculator");
    assert.ok(calculatorAt > 0 && checkAt > calculatorAt);
    assert.equal(auditRequests.calculator, "Get these numbers checked for free");
    assert.equal(
      auditRequests.calculatorNote,
      "The audit writes the baseline down. Free, no obligation.",
    );
    assert.match(home, /ImplementationHighlights/);
    assert.match(home, /<FaqList/);
    assert.match(home, /<AuditBand \/>/);
  });

  it("leads the contact page with the list headline and the form", () => {
    const contact = read("app/contact/page.tsx");
    const headline = contact.indexOf("Contact us");
    const subhead = contact.indexOf("Request your free AI audit.");
    const form = contact.indexOf("<ContactForm");
    const aside = contact.indexOf("Write directly");
    assert.ok(headline > 0);
    assert.ok(subhead > headline);
    assert.ok(form > subhead);
    assert.ok(aside > form);
    assert.equal(contact.includes("What to expect"), false);
    assert.equal(contact.includes("AuditBand"), false);
    assert.equal(contact.includes("\u2014"), false);
    assert.equal(site.pageUpdated["/contact"], "2026-10-26");
    const entry = sitemap().find((item) => item.url === new URL("/contact", site.url).toString());
    assert.equal(entry?.lastModified, "2026-10-26");
  });
});
