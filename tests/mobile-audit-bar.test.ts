import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("mobile audit bar", () => {
  it("shows a mobile request bar and hides it on the contact page", () => {
    const bar = readFileSync("components/MobileAuditBar.tsx", "utf8");
    const layout = readFileSync("app/layout.tsx", "utf8");
    assert.match(bar, /Free AI audit · Request/);
    assert.match(bar, /md:hidden/);
    assert.match(bar, /pathname === "\/contact"/);
    assert.match(bar, /href=\{auditPath\}/);
    assert.match(bar, /fixed inset-x-0 bottom-0/);
    assert.match(bar, /aria-hidden="true"/);
    assert.match(layout, /<Suspense fallback=\{null\}>\s*<MobileAuditBar \/>/);
    assert.equal(bar.includes("\u2014"), false);
  });
});
