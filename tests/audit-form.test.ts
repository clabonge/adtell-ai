import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { validateAudit } from "../lib/audit";

const complete = {
  name: "Ada Owner",
  email: "ada@example.com",
  company: "Northwind Goods",
  industry: "Retail",
  size: "11-50",
  drains: "People retype orders from email into the sheet.",
};

describe("audit form", () => {
  it("requires only name, email, company, and the work", () => {
    const blank = validateAudit({ ...complete, industry: "", size: "  " });
    assert.equal(blank.ok, true);
    if (blank.ok) {
      assert.equal(blank.value.industry, "");
      assert.equal(blank.value.size, "");
    }

    const missing = validateAudit({ ...complete, name: "", company: "", drains: "short" });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.equal(missing.errors.name, "Enter your name.");
      assert.equal(missing.errors.company, "Enter the company name.");
      assert.equal(missing.errors.drains, "Describe that work in a sentence or two.");
      assert.equal(missing.errors.industry, undefined);
      assert.equal(missing.errors.size, undefined);
    }

    const badSize = validateAudit({ ...complete, size: "huge" });
    assert.equal(badSize.ok, false);
    if (!badSize.ok) assert.equal(badSize.errors.size, "Select a company size.");
  });

  it("asks for the free audit and keeps the website field as the honeypot", () => {
    const form = readFileSync("components/ContactForm.tsx", "utf8");
    assert.match(form, /Request my free audit/);
    assert.match(form, /e\.g\. booking replies we write from scratch every day/);
    assert.match(
      form,
      /Free\. No obligation\. We reply within one business day with a time to talk\./,
    );
    assert.match(form, /Name, email, company, and the work that costs the most are required/);
    assert.match(form, /\(optional\)/);
    assert.match(form, /company_website/);
    assert.equal(form.includes("All fields are required"), false);
    assert.equal(form.includes("\u2014"), false);
  });
});