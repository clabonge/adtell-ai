import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("contact confirmation copy", () => {
  it("says we save the request and email a confirmation", () => {
    const form = readFileSync("components/ContactForm.tsx", "utf8");
    assert.match(form, /We save your request and email you a confirmation/);
    assert.match(form, /We reply within one business day/);
    assert.equal(form.includes("A confirmation means we have the request"), false);
    assert.equal(form.includes("does not mean an email has already been sent"), false);
    assert.equal(form.includes("\u2014"), false);
  });
});
