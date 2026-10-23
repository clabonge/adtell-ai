import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";
import { bookingConfirmationLine, bookingUrl } from "../lib/booking";
import { prospectConfirmationText } from "../lib/deliver-audit";
import type { AuditSubmission } from "../lib/audit";

const submission: AuditSubmission = {
  name: "Ada Owner",
  email: "ada@example.com",
  company: "Northwind Goods",
  industry: "Retail",
  size: "11-50",
  drains: "People retype orders from email into the sheet.",
};

const original = process.env.NEXT_PUBLIC_BOOKING_URL;

afterEach(() => {
  if (original === undefined) delete process.env.NEXT_PUBLIC_BOOKING_URL;
  else process.env.NEXT_PUBLIC_BOOKING_URL = original;
});

describe("booking url", () => {
  it("hides the link when the variable is unset or not an http address", () => {
    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    assert.equal(bookingUrl(), null);
    process.env.NEXT_PUBLIC_BOOKING_URL = "   ";
    assert.equal(bookingUrl(), null);
    process.env.NEXT_PUBLIC_BOOKING_URL = "javascript:alert(1)";
    assert.equal(bookingUrl(), null);
  });

  it("returns an http or https scheduling link", () => {
    process.env.NEXT_PUBLIC_BOOKING_URL = "https://cal.example/audit";
    assert.equal(bookingUrl(), "https://cal.example/audit");
  });

  it("puts Prefer to pick a time beside the form and in the confirmation email only when set", () => {
    const form = readFileSync("components/ContactForm.tsx", "utf8");
    const prompt = readFileSync("components/BookingPrompt.tsx", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const blueprint = readFileSync("render.yaml", "utf8");
    assert.match(form, /<PickTimeLink \/>/);
    assert.match(prompt, /if \(!url\) return null/);
    assert.match(prompt, /\{bookingLinkLabel\}/);
    assert.match(readFileSync("lib/booking.ts", "utf8"), /Prefer to pick a time\?/);

    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    const hidden = prospectConfirmationText(submission);
    assert.equal(bookingConfirmationLine(), null);
    assert.equal(hidden.includes("Prefer to pick a time?"), false);
    assert.equal(hidden.includes("cal.example"), false);

    process.env.NEXT_PUBLIC_BOOKING_URL = "https://cal.example/audit";
    const shown = prospectConfirmationText(submission);
    assert.equal(bookingConfirmationLine(), "Prefer to pick a time? https://cal.example/audit");
    assert.match(shown, /Prefer to pick a time\? https:\/\/cal\.example\/audit/);

    assert.match(readme, /NEXT_PUBLIC_BOOKING_URL/);
    assert.match(readme, /Prefer to pick a time\?/);
    assert.match(blueprint, /key: NEXT_PUBLIC_BOOKING_URL/);
    assert.equal(blueprint.includes("https://cal."), false);
    assert.equal(/NEXT_PUBLIC_BOOKING_URL[\s\S]{0,80}value:/.test(blueprint), false);
  });
});
