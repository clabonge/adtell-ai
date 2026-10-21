/**
 * A labeled example of the one-page ranked list. Linden Events is fictional.
 * Do not add prices, savings figures, quotes, or testimonials here.
 */
export const sampleAudit = {
  path: "/sample-audit",
  label: "Example only",
  title: "Example of the one-page audit list",
  description:
    "An example of the written one-page ranked list from the free AI savings audit. Linden Events is a fictional business. Example only. Not a client result.",
  updated: "2026-10-21",
  kicker: "Example only",
  heading: "What the one-page list looks like.",
  lede: "This is an example of the written list a prospect gets after the free audit. Linden Events is fictional. This is not a client, not a quote, and not a result.",
  business: "Linden Events",
  items: [
    {
      rank: "First",
      title: "Booking replies",
      observation:
        "A booking request still gets a reply written from scratch. The details are already in the request.",
      recommendation:
        "Start here. Draft the reply, and have a person at the business send it. Scope and price would be quoted in writing. This example does not name a price.",
    },
    {
      rank: "Second",
      title: "Follow-up after an event",
      observation:
        "The note after an event is written again each time, from the event record the business already keeps.",
      recommendation:
        "Do this after the booking reply is in use. A person still reviews the note before it is sent.",
    },
    {
      rank: "Third",
      title: "A standing marketing draft",
      observation:
        "Marketing notes would help, and the source material and the approval step are not named yet.",
      recommendation: "Wait. Do nothing on this until a person can check the first workflow.",
    },
  ],
  close: "On a real audit the recommendation is a roadmap, a build, training, a retainer, or waiting. This page only shows the shape of that one-page list.",
} as const;
