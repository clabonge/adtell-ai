import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("faq redirect", () => {
  it("sends /faq to the homepage FAQ with a permanent redirect", () => {
    const config = readFileSync("next.config.ts", "utf8");
    const home = readFileSync("app/page.tsx", "utf8");
    assert.match(config, /source:\s*"\/pricing",\s*destination:\s*"\/services",\s*statusCode:\s*301/);
    assert.match(config, /source:\s*"\/faq",\s*destination:\s*"\/#faq",\s*statusCode:\s*301/);
    assert.match(home, /id="faq"/);
  });
});
