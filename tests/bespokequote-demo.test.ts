import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sitemap from "../app/sitemap";
import BespokeQuoteDemoPage from "../app/demo/bespokequote/page";
import { bespokeQuoteDemo } from "../content/bespokequote-demo";
import { site } from "../content/site";
import { getPost } from "../lib/posts";
import { videoObjectJsonLd } from "../lib/structured-data";

const originalBooking = process.env.NEXT_PUBLIC_BOOKING_URL;

afterEach(() => {
  if (originalBooking === undefined) delete process.env.NEXT_PUBLIC_BOOKING_URL;
  else process.env.NEXT_PUBLIC_BOOKING_URL = originalBooking;
});

function copy(): string {
  return [
    bespokeQuoteDemo.title,
    bespokeQuoteDemo.description,
    bespokeQuoteDemo.heading,
    bespokeQuoteDemo.lede,
    bespokeQuoteDemo.silentNote,
    bespokeQuoteDemo.seeingHeading,
    bespokeQuoteDemo.sampleNote,
    bespokeQuoteDemo.shopHeading,
    bespokeQuoteDemo.shopBody,
    bespokeQuoteDemo.videoName,
    bespokeQuoteDemo.videoDescription,
    ...bespokeQuoteDemo.seeing,
  ].join(" ");
}

describe("BespokeQuote demo", () => {
  it("describes the BCLE Furniture recording without hype, a phone, or a booking URL", () => {
    const text = copy();
    assert.match(
      text,
      /BespokeQuote\.furniture is the quoting system Adtell\.ai delivered for BCLE Furniture/,
    );
    assert.equal(/Chris LaBonge|I built|we built/i.test(text), false);
    assert.match(text, /up to three days/);
    assert.match(text, /within 24 hours/);
    assert.match(text, /plans, elevations, and specs/);
    assert.match(text, /real materials and shop labor/);
    assert.match(text, /person reviews it before it goes out/);
    assert.match(text, /purchase order/);
    assert.match(text, /50% deposit/);
    assert.match(text, /until installation/);
    assert.equal(bespokeQuoteDemo.sampleNote, "The names and projects in this footage are sample data.");
    assert.equal(bespokeQuoteDemo.seeingHeading, "What you're seeing");
    assert.equal(bespokeQuoteDemo.seeing.length >= 4 && bespokeQuoteDemo.seeing.length <= 5, true);
    assert.match(text, /your shop's own materials, labor rates, and approval steps/);
    assert.match(text, /free 30-minute audit/);
    assert.equal(text.includes("\u2014"), false);
    assert.equal(/hubspot/i.test(text), false);
    assert.equal(text.includes("Adtell Integration"), false);
    assert.equal(/\bour own shop\b|\bour own company\b|\bmy shop\b/i.test(text), false);
    assert.equal(/street address|postalCode|\d{5}(?:-\d{4})?/i.test(text), false);
    assert.equal(bespokeQuoteDemo.liveHref, "https://bespokequote.furniture");
    assert.equal(bespokeQuoteDemo.caseStudyPath, "/case-studies/bcle-furniture-bespokequote");
    assert.equal(bespokeQuoteDemo.furniturePath, "/who-we-help/manufacturing-and-furniture");
    assert.equal(bespokeQuoteDemo.uploadDate, "2026-10-26");
    const nav = readFileSync("content/nav.ts", "utf8");
    const footer = readFileSync("components/SiteFooter.tsx", "utf8");
    assert.equal(nav.includes(bespokeQuoteDemo.path), false);
    assert.equal(footer.includes(bespokeQuoteDemo.path), false);

    const pageSource = readFileSync("app/demo/bespokequote/page.tsx", "utf8");
    assert.match(pageSource, /<video/);
    assert.match(pageSource, /controls/);
    assert.match(pageSource, /preload="metadata"/);
    assert.match(pageSource, /playsInline/);
    assert.match(pageSource, /muted/);
    assert.match(pageSource, /BookingPrompt/);
    assert.match(pageSource, /href=\{auditPath\}/);
    assert.equal(pageSource.includes("NEXT_PUBLIC_BOOKING_URL"), false);
    assert.equal(/https?:\/\/(?!bespokequote\.furniture)/.test(pageSource), false);

    assert.equal(existsSync(`public${bespokeQuoteDemo.video}`), true);
    const poster = readFileSync(`public${bespokeQuoteDemo.poster}`);
    assert.equal(poster[0], 0xff);
    assert.equal(poster[1], 0xd8);
  });

  it("renders the video, sample-data note, audit link, and VideoObject", () => {
    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    const html = renderToStaticMarkup(createElement(BespokeQuoteDemoPage));
    assert.match(html, /<video/);
    assert.match(html, /controls/);
    assert.match(html, /preload="metadata"/);
    assert.match(html, /playsinline/i);
    assert.match(html, /muted/);
    assert.match(html, new RegExp(`poster="${bespokeQuoteDemo.poster}"`));
    assert.match(html, new RegExp(`src="${bespokeQuoteDemo.video}"`));
    assert.match(html, /What you(?:'|&#x27;)re seeing/);
    assert.match(html, /The names and projects in this footage are sample data\./);
    assert.match(html, /href="\/contact"/);
    assert.match(html, /Book a free AI audit/);
    assert.equal(html.includes("Book a free 30-minute audit call"), false);
    assert.match(html, /href="https:\/\/bespokequote\.furniture"/);
    assert.match(html, new RegExp(`href="${bespokeQuoteDemo.caseStudyPath}"`));
    assert.match(html, new RegExp(`href="${bespokeQuoteDemo.furniturePath}"`));

    const data = videoObjectJsonLd({
      name: bespokeQuoteDemo.videoName,
      description: bespokeQuoteDemo.videoDescription,
      thumbnailPath: bespokeQuoteDemo.poster,
      uploadDate: bespokeQuoteDemo.uploadDate,
      contentPath: bespokeQuoteDemo.video,
    });
    assert.equal(data["@type"], "VideoObject");
    assert.equal(data.name, bespokeQuoteDemo.videoName);
    assert.equal(data.description, bespokeQuoteDemo.videoDescription);
    assert.equal(data.uploadDate, "2026-10-26");
    assert.equal(data.thumbnailUrl, new URL(bespokeQuoteDemo.poster, site.url).toString());
    assert.equal(data.contentUrl, new URL(bespokeQuoteDemo.video, site.url).toString());
    assert.match(html, /VideoObject/);
    assert.match(html, new RegExp(data.contentUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    const entry = sitemap().find(
      (item) => item.url === new URL(bespokeQuoteDemo.path, site.url).toString(),
    );
    assert.ok(entry);
    assert.equal(entry.lastModified, "2026-10-27");
    assert.equal(entry.videos?.[0]?.content_loc, data.contentUrl);
    assert.equal(entry.videos?.[0]?.thumbnail_loc, data.thumbnailUrl);
    assert.equal(entry.videos?.[0]?.publication_date, "2026-10-26");

    const study = getPost("case-studies", "bcle-furniture-bespokequote");
    assert.match(study?.body ?? "", /\/demo\/bespokequote/);
    const industry = readFileSync("app/who-we-help/[slug]/page.tsx", "utf8");
    assert.match(industry, /bespokeQuoteDemo\.path/);
    const shots = readFileSync("components/BcleSections.tsx", "utf8");
    assert.match(shots, /bespokeQuoteDemo\.path/);
  });

  it("shows the pick-a-time link from the booking helper when that URL is set", () => {
    process.env.NEXT_PUBLIC_BOOKING_URL = "https://cal.example/audit";
    const html = renderToStaticMarkup(createElement(BespokeQuoteDemoPage));
    assert.match(html, /href="https:\/\/cal\.example\/audit"/);
    assert.match(html, /Book a free 30-minute audit call/);
    assert.equal(html.includes("calendly.com"), false);
  });
});