import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";
import { site } from "../content/site";
import { getPost } from "../lib/posts";

describe("Doan Distillery case study", () => {
  it("stays qualitative and keeps a person in charge of event booking", () => {
    const post = getPost("case-studies", "doan-distillery-event-booking");
    assert.ok(post);
    if (!post) return;
    assert.equal(post.kind, "implementation");
    assert.match(post.body, /We helped Doan Distillery/);
    assert.match(post.body, /## Before/);
    assert.match(post.body, /## The workflow/);
    assert.match(post.body, /## A person stays in charge/);
    assert.match(post.body, /A person still confirms/);
    assert.equal(post.body.includes("\u2014"), false);
    assert.equal(post.body.includes("$"), false);
    assert.equal(post.body.includes("\""), false);
    assert.equal(/\d/.test(post.body), false);
    assert.equal(post.body.toLowerCase().includes("testimonial"), false);
    assert.equal(post.body.toLowerCase().includes("family"), false);
    const entry = sitemap().find(
      (item) => item.url === new URL(`/case-studies/${post.slug}`, site.url).toString(),
    );
    assert.equal(post.date, "2026-10-21");
    assert.equal(
      entry?.lastModified,
      site.pageUpdated["/case-studies/doan-distillery-event-booking"],
    );
    assert.equal(entry?.lastModified, "2026-10-23");
  });
});
