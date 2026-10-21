import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { site } from "../content/site";

describe("logo name", () => {
  it("reads Adtell.ai with no space", () => {
    assert.equal(site.name, "Adtell.ai");
    assert.equal(site.name.includes(" "), false);
    const header = readFileSync("components/SiteHeader.tsx", "utf8");
    const footer = readFileSync("components/SiteFooter.tsx", "utf8");
    assert.match(header, /aria-label=\{site\.name\}/);
    assert.equal(header.includes("Adtell.ai home"), false);
    assert.equal(header.includes(`${site.name} home`), false);
    assert.match(footer, /sr-only">\{site\.name\}/);
  });
});
