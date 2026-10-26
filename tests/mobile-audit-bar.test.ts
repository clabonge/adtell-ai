import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("mobile audit bar", () => {
  it("shows a mobile request bar and hides it on the contact page", () => {
    const bar = readFileSync("components/MobileAuditBar.tsx", "utf8");
    const layout = readFileSync("app/layout.tsx", "utf8");
    assert.match(bar, /Request a free AI audit/);
    assert.equal(bar.includes("Free AI audit · Request"), false);
    assert.match(bar, /whitespace-nowrap/);
    assert.match(bar, /text-\[13px\]/);
    assert.match(bar, /min-\[380px\]:text-sm/);
    assert.match(bar, /md:hidden/);
    assert.match(bar, /pathname === "\/contact"/);
    assert.match(bar, /href=\{auditPath\}/);
    assert.match(bar, /fixed inset-x-0 bottom-0/);
    assert.match(bar, /aria-hidden="true"/);
    assert.match(layout, /<Suspense fallback=\{null\}>\s*<MobileAuditBar \/>/);
    assert.equal(bar.includes("\u2014"), false);
  });
});
