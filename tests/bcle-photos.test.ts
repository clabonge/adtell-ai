import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { bcleAbout, bcleHero, bcleInventory, bcleShop } from "../content/bcle";
import { founderSection } from "../content/about";
import { furnitureShop } from "../content/industry-examples";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("BCLE Furniture photographs", () => {
  it("names BCLE Furniture instead of an owned shop or company", () => {
    const files = ["app", "components", "content"];
    const found: string[] = [];
    const banned = [
      "our own shop",
      "our own company",
      "our own companies",
      "own operating businesses",
    ];
    function walk(dir: string) {
      for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(tsx?|md)$/.test(entry)) {
          const text = readFileSync(full, "utf8").toLowerCase();
          for (const phrase of banned) {
            if (text.includes(phrase)) found.push(`${full}: ${phrase}`);
          }
        }
      }
    }
    for (const root of files) walk(root);
    assert.deepEqual(found, []);
    assert.match(founderSection.paragraphs[1], /BCLE Furniture/);
    assert.equal(founderSection.paragraphs[1].includes("own"), false);
    assert.equal(furnitureShop.heading, "See what we built for BCLE Furniture");
  });

  it("places the approved photos, webp picture, and lazy loading below the fold", () => {
    const home = read("app/page.tsx");
    const about = read("app/about/page.tsx");
    const industry = read("app/who-we-help/[slug]/page.tsx");
    const photo = read("components/BclePhoto.tsx");
    const sections = read("components/BcleSections.tsx");
    const copy = JSON.stringify({ bcleHero, bcleShop, bcleAbout, bcleInventory });

    assert.equal(copy.includes("\u2014"), false);
    assert.equal(copy.includes("$"), false);
    assert.equal(copy.includes("%"), false);

    assert.equal(bcleHero.caption, "Anderson Selexx 510 FL CNC at BCLE Furniture");
    assert.equal(bcleShop.heading, "Built and proven at BCLE Furniture");
    assert.equal(bcleShop.lede, "These workflows run every day on the BCLE Furniture shop floor.");
    assert.deepEqual(
      bcleShop.photos.map((item) => item.name),
      ["bcle-shop-floor", "bcle-cnc-vacuum-lift", "bcle-burkle-operator"],
    );
    assert.deepEqual(
      bcleAbout.photos.map((item) => item.name),
      ["bcle-shop-floor", "bcle-thermwood-cnc", "bcle-burkle-finishing-line", "bcle-burkle-operator"],
    );
    assert.equal(bcleAbout.heading, "Inside BCLE Furniture");
    assert.equal(bcleInventory.heading, "How BCLE Furniture runs inventory with AI");
    assert.equal(bcleInventory.banner.name, "bcle-burkle-operator-racks");
    assert.match(sections, /objectPosition: "50% 12%"/);
    assert.equal(
      bcleInventory.piece,
      "Parts like these are cut on the CNC from the AI-prepared nesting sheets.",
    );
    assert.deepEqual(
      bcleInventory.sheets.map((item) => item.name),
      ["bcle-ai-cut-sheet-nesting", "bcle-ai-cut-sheet-receiving-tag"],
    );

    const headline = home.indexOf("<h1");
    const heroPhoto = home.indexOf("<BclePhoto");
    const preview = home.indexOf("<WorkflowTry />");
    const strip = home.indexOf("<BcleShopStrip />");
    const offer = home.indexOf("<AuditOffer />");
    assert.ok(headline > 0 && heroPhoto > headline && preview > heroPhoto);
    assert.ok(strip > preview && offer > strip);

    assert.match(about, /bcleAbout\.photo/);
    assert.match(about, /<BcleAboutPractice \/>/);
    assert.equal(about.includes("chris-labonge"), false);
    const bio = about.indexOf("founderSection.heading");
    const aboutPhoto = about.indexOf("bcleAbout.photo");
    const inside = about.indexOf("<BcleAboutPractice />");
    assert.ok(aboutPhoto > 0 && bio > aboutPhoto && inside > bio);

    assert.match(industry, /manufacturing-and-furniture/);
    assert.match(industry, /<BcleInventoryStory \/>/);
    assert.ok(industry.indexOf("<BcleInventoryStory />") < industry.indexOf("<AuditOffer />"));

    assert.match(photo, /<picture>/);
    assert.match(photo, /image\/webp/);
    assert.match(photo, /loading: priority \? "eager" : "lazy"/);
    assert.match(photo, /\.webp/);
    assert.match(photo, /\.jpg/);
  });
});
