import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WhatHappensNext } from "../components/WhatHappensNext";
import { auditNext, writtenListStep, writtenListTurnaround } from "../content/audit";

const original = process.env.NEXT_PUBLIC_BOOKING_URL;

afterEach(() => {
  if (original === undefined) delete process.env.NEXT_PUBLIC_BOOKING_URL;
  else process.env.NEXT_PUBLIC_BOOKING_URL = original;
});

describe("what happens next", () => {
  it("uses Chris's turnaround on the written list and keeps the other two steps", () => {
    assert.equal(writtenListTurnaround, "within 48 hours of your call");
    assert.equal(
      writtenListStep(),
      "A written one-page list of where AI would help, within 48 hours of your call.",
    );
    assert.equal(auditNext.reply, "We reply within one business day.");
    assert.equal(auditNext.conversation, "A 30-minute conversation.");
    assert.equal(writtenListStep().includes("\u2014"), false);
    assert.equal(/\b\d+\s+business days\b/i.test(writtenListStep()), false);

    const page = readFileSync("app/contact/page.tsx", "utf8");
    const component = readFileSync("components/WhatHappensNext.tsx", "utf8");
    assert.match(page, /<WhatHappensNext \/>/);
    assert.ok(page.indexOf("<WhatHappensNext") > page.indexOf("<ContactForm"));
    assert.ok(page.indexOf("Write directly") > page.indexOf("<WhatHappensNext"));
    assert.match(component, /bookingUrl/);
    assert.match(component, /if \(!url\)|index === 1 && url/);
    assert.equal(component.includes("\u2014"), false);
  });

  it("shows the booking link only when NEXT_PUBLIC_BOOKING_URL is set", () => {
    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    const hidden = renderToStaticMarkup(createElement(WhatHappensNext));
    assert.match(hidden, /What happens next/);
    assert.match(hidden, /We reply within one business day/);
    assert.match(hidden, /A 30-minute conversation/);
    assert.match(hidden, /within 48 hours of your call/);
    assert.equal(hidden.includes("Prefer to pick a time?"), false);
    assert.equal(hidden.includes("cal.example"), false);

    process.env.NEXT_PUBLIC_BOOKING_URL = "https://cal.example/audit";
    const shown = renderToStaticMarkup(createElement(WhatHappensNext));
    assert.match(shown, /href="https:\/\/cal\.example\/audit"/);
    assert.match(shown, /Prefer to pick a time\?/);
    assert.equal(shown.includes("\u2014"), false);
  });
});
