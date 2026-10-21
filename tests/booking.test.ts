import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { bookingUrl } from "../lib/booking";

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
});
