import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { founderSection } from "../content/about";
import { bcleAbout, bcleDelivery, bcleHero, bcleShop, deliveredLead } from "../content/bcle";
import { furnitureShop } from "../content/industry-examples";

function read(file: string) {
  return readFileSync(file, "utf8");
}

describe("BCLE Furniture photographs", () => {
  it("names BCLE Furniture as the client and BespokeQuote.furniture as the deliverable", () => {
    const files = ["app", "components", "content"];
    const found: string[] = [];
    const banned = [
      "our own shop",
      "our own company",
      "our own companies",
      "own operating businesses",
    ];
    const retired = ["bcle-selexx-cnc", "bcle-cnc-vacuum-lift", "bcle-cnc-cut-cabinet"];
    function walk(dir: string) {
      for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(tsx?|md)$/.test(entry)) {
          const text = readFileSync(full, "utf8");
          const lower = text.toLowerCase();
          for (const phrase of banned) {
            if (lower.includes(phrase)) found.push(`${full}: ${phrase}`);
          }
          for (const name of retired) {
            if (text.includes(name)) found.push(`${full}: ${name}`);
          }
        }
      }
    }
    for (const root of files) walk(root);
    assert.deepEqual(found, []);
    assert.match(founderSection.paragraphs[1], /BCLE Furniture/);
    assert.equal(founderSection.paragraphs[1].includes("own"), false);
    assert.equal(furnitureShop.heading, "What we delivered for BCLE Furniture: BespokeQuote.furniture");
    assert.equal(furnitureShop.href, "https://bespokequote.furniture");
    assert.equal(furnitureShop.lead, deliveredLead);
    assert.match(deliveredLead, /automate their quoting and inventory management/);
  });

  it("places the BespokeQuote screenshots, webp picture, and lazy loading below the fold", () => {
    const home = read("app/page.tsx");
    const about = read("app/about/page.tsx");
    const industry = read("app/who-we-help/[slug]/page.tsx");
    const photo = read("components/BclePhoto.tsx");
    const sections = read("components/BcleSections.tsx");
    const copy = JSON.stringify({
      bcleHero,
      bcleShop,
      bcleAbout,
      bcleDelivery,
      deliveredLead,
      furnitureShop,
    });

    assert.equal(copy.includes("\u2014"), false);
    assert.equal(copy.includes("$"), false);
    assert.equal(copy.includes("%"), false);
    assert.equal(/proven|result/i.test(copy), false);

    assert.equal(
      bcleHero.caption,
      "BespokeQuote.furniture, the quoting and inventory system Adtell.ai delivered for BCLE Furniture",
    );
    assert.equal(bcleHero.name, "bespokequote-dashboard");
    assert.equal(bcleShop.heading, "Delivered for BCLE Furniture");
    assert.equal(bcleShop.lede, deliveredLead);
    assert.deepEqual(
      bcleShop.photos.map((item) => item.name),
      ["bespokequote-dashboard", "bespokequote-how-it-works", "bcle-ai-cut-sheet-receiving-tag"],
    );
    assert.deepEqual(
      bcleAbout.photos.map((item) => item.name),
      ["bcle-shop-floor", "bcle-thermwood-cnc", "bcle-burkle-operator"],
    );
    assert.equal(bcleAbout.photo.name, "bespokequote-dashboard");
    assert.equal(bcleAbout.heading, "Inside BCLE Furniture");
    assert.ok(bcleAbout.photos.length <= 3);
    assert.equal(furnitureShop.heading, "What we delivered for BCLE Furniture: BespokeQuote.furniture");
    assert.deepEqual(
      bcleDelivery.screenshots.map((item) => item.name),
      ["bespokequote-dashboard", "bespokequote-how-it-works"],
    );
    assert.equal(bcleDelivery.inventory, "AI-prepared cut sheets and receiving tags.");
    assert.deepEqual(
      bcleDelivery.sheets.map((item) => item.name),
      ["bcle-ai-cut-sheet-nesting", "bcle-ai-cut-sheet-receiving-tag"],
    );
    assert.equal(bcleDelivery.blurNote, "Client and job names are blurred.");

    const headline = home.indexOf("<h1");
    const heroPhoto = home.indexOf("<BclePhoto");
    const preview = home.indexOf("<WorkflowTry />");
    const strip = home.indexOf("<BcleShopStrip />");
    const offer = home.indexOf("<AuditOffer />");
    assert.ok(headline > 0 && heroPhoto > headline && preview > heroPhoto);
    assert.ok(strip > preview && offer > strip);
    assert.match(home, /priority/);

    assert.match(about, /bcleAbout\.photo/);
    assert.match(about, /<BcleAboutPractice \/>/);
    assert.equal(about.includes("chris-labonge"), false);
    assert.equal(about.includes("priority"), false);
    const bio = about.indexOf("founderSection.heading");
    const aboutPhoto = about.indexOf("bcleAbout.photo");
    const inside = about.indexOf("<BcleAboutPractice />");
    assert.ok(aboutPhoto > 0 && bio > aboutPhoto && inside > bio);

    assert.match(industry, /manufacturing-and-furniture/);
    assert.match(industry, /<BcleDelivery \/>/);
    assert.equal(industry.includes("FurnitureShop"), false);
    assert.equal(industry.includes("BcleInventoryStory"), false);
    assert.ok(industry.indexOf("<BcleDelivery />") < industry.indexOf("<AuditOffer />"));
    assert.match(industry, /<WorkflowTry /);

    assert.match(sections, /furnitureShop\.href/);
    assert.match(sections, /furnitureShop\.points/);
    assert.match(sections, /Request my free audit/);
    assert.match(sections, /bespokequote/);

    assert.match(photo, /<picture>/);
    assert.match(photo, /image\/webp/);
    assert.match(photo, /loading: priority \? "eager" : "lazy"/);
    assert.match(photo, /images\/\$\{shot\.dir\}/);
    assert.match(photo, /bespokequote/);
  });
});
