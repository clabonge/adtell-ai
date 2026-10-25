import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, it } from "node:test";
import { createElement, Fragment, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { ContactForm } from "../components/ContactForm";
import { MarkdownBody } from "../components/MarkdownBody";
import { OgCard } from "../lib/og-card";
import { SiteFooter } from "../components/SiteFooter";
import { JsonLd } from "../components/ui";
import { counties } from "../content/counties";
import type { AuditSubmission } from "../lib/audit";
import { auditFormUrl, publicContactLine } from "../lib/booking";
import { cfoBriefPdf } from "../lib/cfo-brief-pdf";
import {
  ownerAuditText,
  prospectConfirmationText,
  sendAuditConfirmation,
  sendAuditEmail,
  sendAuditWebhook,
} from "../lib/deliver-audit";
import { getPosts } from "../lib/posts";
import { sampleBaselinePdf } from "../lib/sample-baseline-pdf";
import { pdfText } from "../lib/simple-pdf";
import {
  countyServiceJsonLd,
  organizationJsonLd,
  servicesOfferJsonLd,
} from "../lib/structured-data";

const originalBooking = process.env.NEXT_PUBLIC_BOOKING_URL;
const originalResend = process.env.RESEND_API_KEY;
const originalConfirmation = process.env.AUDIT_CONFIRMATION_EMAIL;
const originalWebhook = process.env.AUDIT_WEBHOOK_URL;

afterEach(() => {
  restore("NEXT_PUBLIC_BOOKING_URL", originalBooking);
  restore("RESEND_API_KEY", originalResend);
  restore("AUDIT_CONFIRMATION_EMAIL", originalConfirmation);
  restore("AUDIT_WEBHOOK_URL", originalWebhook);
});

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function personalPhoneDigits(): string {
  return String.fromCharCode(50, 49, 53, 52, 57, 57, 56, 57, 53, 57);
}

function personalPhonePattern(): RegExp {
  const digits = personalPhoneDigits();
  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const line = digits.slice(6);
  const sep = "[\\s().\\-]*";
  return new RegExp(`(?:\\+?1${sep})?${area}${sep}${exchange}${sep}${line}`);
}

function containsPersonalPhone(text: string): boolean {
  return personalPhonePattern().test(text);
}

const submission: AuditSubmission = {
  name: "Ada Owner",
  email: "ada@example.com",
  company: "Northwind Goods",
  industry: "Retail",
  size: "11-50",
  drains: "People retype orders from email into the sheet.",
};

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "coverage", "dist"]);
const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".md",
  ".txt",
  ".json",
  ".yml",
  ".yaml",
  ".html",
  ".css",
  ".example",
  ".xml",
  ".svg",
]);

function textFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      textFiles(full, acc);
      continue;
    }
    if (entry === "package-lock.json") continue;
    if (TEXT_EXT.has(extname(entry))) acc.push(full);
  }
  return acc;
}

function pageFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "admin" || entry === "api") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) pageFiles(full, acc);
    else if (entry === "page.tsx" || entry === "not-found.tsx") acc.push(full);
  }
  return acc;
}

type PageModule = {
  default?: (props: {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }) => ReactNode | Promise<ReactNode>;
  generateStaticParams?: () => Promise<Record<string, string>[]> | Record<string, string>[];
  generateMetadata?: (props: {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }) => unknown | Promise<unknown>;
  metadata?: unknown;
};

function shell(node: ReactNode): ReactNode {
  return createElement(
    Fragment,
    null,
    node,
    createElement(SiteFooter),
    createElement(JsonLd, { data: organizationJsonLd() }),
  );
}

function renderNode(node: ReactNode): string {
  return renderToStaticMarkup(shell(node));
}

describe("personal phone number", () => {
  it("recognizes the published formats", () => {
    const digits = personalPhoneDigits();
    const area = digits.slice(0, 3);
    const exchange = digits.slice(3, 6);
    const line = digits.slice(6);
    const samples = [
      digits,
      `1${digits}`,
      `+1${digits}`,
      `tel:+1${digits}`,
      `${area}-${exchange}-${line}`,
      `${area}.${exchange}.${line}`,
      `(${area}) ${exchange}-${line}`,
      `+1 ${area} ${exchange} ${line}`,
      `1-${area}-${exchange}-${line}`,
    ];
    for (const sample of samples) {
      assert.equal(containsPersonalPhone(sample), true, sample);
    }
    assert.equal(containsPersonalPhone("email clabonge@adtell.ai"), false);
    assert.equal(containsPersonalPhone(`${area}-${exchange}-0000`), false);
  });

  it("is absent from rendered pages, PDFs, structured data, and outgoing email", async () => {
    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    const rendered = new Map<string, string>();

    for (const file of pageFiles(join(process.cwd(), "app"))) {
      const mod = (await import(pathToFileURL(file).href)) as PageModule;
      const paramsList = mod.generateStaticParams ? await mod.generateStaticParams() : [{}];
      const variants = paramsList.length > 0 ? paramsList : [{}];
      for (const params of variants) {
        const props = {
          params: Promise.resolve(params),
          searchParams: Promise.resolve({}),
        };
        const label = `${relative(process.cwd(), file)} ${JSON.stringify(params)}`;
        assert.equal(typeof mod.default, "function", label);
        const page = await mod.default!(props);
        rendered.set(label, renderNode(page));
        if (mod.metadata !== undefined) rendered.set(`${label} metadata`, JSON.stringify(mod.metadata));
        if (mod.generateMetadata) {
          rendered.set(`${label} generateMetadata`, JSON.stringify(await mod.generateMetadata(props)));
        }
      }
    }

    rendered.set("contact form", renderNode(createElement(ContactForm)));
    rendered.set("footer", renderToStaticMarkup(createElement(SiteFooter)));
    rendered.set("og card", renderToStaticMarkup(createElement(OgCard, { title: "Adtell.ai" })));
    for (const post of [...getPosts("blog"), ...getPosts("case-studies")]) {
      rendered.set(
        `markdown ${post.slug}`,
        renderToStaticMarkup(createElement(MarkdownBody, { source: post.body })),
      );
    }

    rendered.set("organization json-ld", JSON.stringify(organizationJsonLd()));
    rendered.set("services json-ld", JSON.stringify(servicesOfferJsonLd()));
    for (const county of counties) {
      rendered.set(`county json-ld ${county.slug}`, JSON.stringify(countyServiceJsonLd(county.areaServed)));
    }
    rendered.set("sitemap", JSON.stringify(sitemap()));
    rendered.set("robots", JSON.stringify(robots()));
    rendered.set("cfo pdf", pdfText(cfoBriefPdf()));
    rendered.set("baseline pdf", pdfText(sampleBaselinePdf()));
    rendered.set("owner email", ownerAuditText(submission));
    rendered.set("confirmation email", prospectConfirmationText(submission));
    rendered.set("contact line", publicContactLine());

    const schedule = "https://cal.example/audit";
    process.env.NEXT_PUBLIC_BOOKING_URL = schedule;
    rendered.set("footer with booking", renderToStaticMarkup(createElement(SiteFooter)));
    rendered.set("contact form with booking", renderNode(createElement(ContactForm)));
    rendered.set("confirmation email with booking", prospectConfirmationText(submission));
    rendered.set("owner email with booking", ownerAuditText(submission));
    rendered.set("cfo pdf with booking", pdfText(cfoBriefPdf()));
    rendered.set("baseline pdf with booking", pdfText(sampleBaselinePdf()));
    rendered.set("contact line with booking", publicContactLine());
    assert.match(prospectConfirmationText(submission), /Prefer to pick a time\? https:\/\/cal\.example\/audit/);
    assert.match(publicContactLine(), /Prefer to pick a time\? https:\/\/cal\.example\/audit/);
    assert.match(prospectConfirmationText(submission), new RegExp(auditFormUrl().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    assert.match(prospectConfirmationText(submission), /Request a free AI audit: https:\/\/adtell\.ai\/contact/);
    assert.equal(prospectConfirmationText(submission).includes("Prefer to pick a time?"), false);
    assert.match(publicContactLine(), /Request a free AI audit: https:\/\/adtell\.ai\/contact/);

    process.env.RESEND_API_KEY = "re_test";
    process.env.AUDIT_CONFIRMATION_EMAIL = "true";
    process.env.AUDIT_WEBHOOK_URL = "https://hooks.example/audit";
    const sent: string[] = [];
    const fetchImpl: typeof fetch = async (_input, init) => {
      sent.push(String(init?.body ?? ""));
      return new Response("ok", { status: 200 });
    };
    await sendAuditEmail(submission, { fetchImpl });
    await sendAuditConfirmation(submission, { fetchImpl });
    await sendAuditWebhook(submission, { fetchImpl });
    assert.equal(sent.length, 3);
    rendered.set("resend owner payload", sent[0] ?? "");
    rendered.set("resend confirmation payload", sent[1] ?? "");
    rendered.set("webhook payload", sent[2] ?? "");

    for (const file of textFiles(process.cwd())) {
      rendered.set(relative(process.cwd(), file), readFileSync(file, "utf8"));
    }

    const contact = [...rendered.entries()].find(([label]) => label.startsWith("app/contact/page.tsx"));
    assert.ok(contact);
    assert.match(contact[1], /audit form/);
    assert.match(contact[1], /clabonge@adtell\.ai/);
    assert.match(contact[1], /Request my free audit/);
    const home = [...rendered.entries()].find(([label]) => label.startsWith("app/page.tsx"));
    assert.ok(home);
    assert.match(home[1], /Book a free AI audit/);
    assert.match(home[1], /clabonge@adtell\.ai/);

    const hits: string[] = [];
    for (const [label, text] of rendered) {
      if (containsPersonalPhone(text)) hits.push(label);
    }
    assert.deepEqual(hits, []);
    assert.equal(rendered.size > 20, true);
  });
});
