import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { validateAudit } from "../lib/audit";
import {
  PREVIEW_FALLBACK,
  PREVIEW_LABEL,
  PREVIEW_MODEL,
  allowPreview,
  auditPreviewConfigured,
  draftAuditPreview,
  handleAuditPreview,
  previewHealth,
  previewSystemPrompt,
  previewTextAllowed,
  resetPreviewRateLimit,
  workflowsFromModel,
} from "../lib/audit-preview";
import { ownerAuditText, prospectConfirmationText } from "../lib/deliver-audit";

const cleanWorkflows = [
  {
    name: "Booking replies",
    handles: "A draft reply prepared from the notes the team already uses.",
    person: "A person reads the draft and sends it.",
    tools: "Email and the booking calendar.",
  },
  {
    name: "Follow-up after a visit",
    handles: "A follow-up note prepared from the last conversation.",
    person: "A person approves the note before it goes out.",
    tools: "Email and a shared spreadsheet.",
  },
];

function previewRequest(body: unknown, ip = "203.0.113.40") {
  return new Request("http://localhost/api/audit-preview", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

const readyBody = {
  industry: "Hospitality",
  drains: "We rewrite booking replies from scratch every day.",
  weekly_time: "The follow-up after a tasting.",
  company_website: "",
};

function modelResponse(workflows: unknown) {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: JSON.stringify({ workflows }) } }] }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("audit preview", { concurrency: 1 }, () => {
  it("rejects money, savings figures, guarantees, prices, and client names", () => {
    const prompt = previewSystemPrompt();
    assert.equal(prompt.includes("$"), false);
    assert.match(prompt, /dollar amounts/);
    assert.match(prompt, /hours saved/);
    assert.match(prompt, /Doan Distillery/);
    assert.equal(previewTextAllowed(cleanWorkflows.map((item) => item.handles).join(" ")), true);
    assert.equal(
      previewTextAllowed("A person reviews the draft before it reaches the drivers."),
      true,
    );
    assert.equal(previewTextAllowed("No dollar amount and no percent is stated."), true);
    assert.equal(previewTextAllowed("Built for Ivers Property Management."), false);
    assert.equal(previewTextAllowed("About 5 dollars a week."), false);
    assert.equal(previewTextAllowed("About 10 percent less work."), false);
    for (const sample of [
      "This saves $1,000.",
      "About 10% less work.",
      "A strong ROI.",
      "Results are guaranteed.",
      "The price is quoted here.",
      "It saves 12 hours a week.",
      "We did this for Doan Distillery.",
      "CapoVino already uses this.",
      "Linden Events is the example.",
    ]) {
      assert.equal(previewTextAllowed(sample), false, sample);
    }
    assert.equal(workflowsFromModel(JSON.stringify({ workflows: cleanWorkflows }))?.length, 2);
    assert.equal(
      workflowsFromModel(
        JSON.stringify({
          workflows: [{ ...cleanWorkflows[0], handles: "Saves $500 a month." }, cleanWorkflows[1]],
        }),
      ),
      null,
    );
    assert.equal(PREVIEW_LABEL.includes("\u2014"), false);
    assert.equal(PREVIEW_FALLBACK.includes("\u2014"), false);
  });

  it("allows five previews an hour for one address", () => {
    resetPreviewRateLimit();
    for (let index = 0; index < 5; index += 1) {
      assert.equal(allowPreview("203.0.113.50", 1_000), true);
    }
    assert.equal(allowPreview("203.0.113.50", 1_000), false);
    assert.equal(allowPreview("203.0.113.51", 1_000), true);
    assert.equal(allowPreview("203.0.113.50", 1_000 + 60 * 60 * 1000), true);
  });

  it("hides the preview when the key is missing and still accepts the form", () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    assert.equal(auditPreviewConfigured(), false);
    process.env.OPENAI_API_KEY = "sk-test";
    assert.equal(auditPreviewConfigured(), true);
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;

    const form = readFileSync("components/AuditPreview.tsx", "utf8");
    const contact = readFileSync("components/ContactForm.tsx", "utf8");
    assert.match(form, /if \(!enabled\) return null/);
    assert.match(form, /type="button"/);
    assert.match(form, /Preview my audit/);
    assert.match(form, /AI is drafting/);
    assert.match(form, /PREVIEW_LABEL/);
    assert.match(contact, /What eats the most time each week\?/);
    assert.match(contact, /Name, email, company, and the work that costs the most are required/);
    assert.match(contact, /Request my free audit/);
    const readme = readFileSync("README.md", "utf8");
    const blueprint = readFileSync("render.yaml", "utf8");
    assert.match(readme, /OPENAI_API_KEY/);
    assert.match(readme, new RegExp(PREVIEW_MODEL));
    assert.match(blueprint, /key: OPENAI_API_KEY/);
    assert.equal(blueprint.includes("sk-"), false);

    const saved = validateAudit({
      name: "Ada Owner",
      email: "ada@example.com",
      company: "Northwind Goods",
      industry: "",
      size: "",
      drains: "People retype orders from email into the sheet.",
      weeklyTime: "",
      auditPreview: "Saves $1,000 and 12 hours.",
    });
    assert.equal(saved.ok, true);
    if (saved.ok) assert.equal(saved.value.auditPreview, "");
  });

  it("calls the model only when the key is set, and drops a bad draft", async () => {
    resetPreviewRateLimit();
    let calls = 0;
    const fetchImpl: typeof fetch = async (_input, init) => {
      calls += 1;
      const body = JSON.parse(String(init?.body)) as { model?: string };
      assert.equal(body.model, PREVIEW_MODEL);
      assert.equal(String(init?.headers && (init.headers as Record<string, string>).Authorization).includes("sk-"), true);
      return modelResponse([{ ...cleanWorkflows[0], tools: "Costs $20 a month." }]);
    };
    const missing = await handleAuditPreview(previewRequest(readyBody, "203.0.113.60"), {
      env: { ...process.env, OPENAI_API_KEY: "" },
      fetchImpl,
    });
    assert.equal(missing.status, 200);
    assert.equal(calls, 0);
    const honeypot = await handleAuditPreview(
      previewRequest({ ...readyBody, company_website: "https://spam.example" }, "203.0.113.61"),
      { env: { ...process.env, OPENAI_API_KEY: "sk-test" }, fetchImpl },
    );
    assert.equal(honeypot.status, 200);
    assert.equal(calls, 0);

    const filtered = await handleAuditPreview(previewRequest(readyBody, "203.0.113.62"), {
      env: { ...process.env, OPENAI_API_KEY: "sk-test" },
      fetchImpl,
    });
    const filteredBody = (await filtered.json()) as { ok?: boolean; message?: string };
    assert.equal(filteredBody.ok, false);
    assert.equal(filteredBody.message, PREVIEW_FALLBACK);
    assert.equal(calls, 1);

    const accepted = await handleAuditPreview(previewRequest(readyBody, "203.0.113.63"), {
      env: { ...process.env, OPENAI_API_KEY: "sk-test" },
      fetchImpl: async () => modelResponse(cleanWorkflows),
    });
    const acceptedBody = (await accepted.json()) as { ok?: boolean; workflows?: { name: string }[] };
    assert.equal(acceptedBody.ok, true);
    assert.equal(acceptedBody.workflows?.length, 2);

    const hung = await draftAuditPreview(
      { industry: "Hospitality", drains: readyBody.drains, weeklyTime: "" },
      {
        apiKey: "sk-test",
        timeoutMs: 30,
        fetchImpl: (_input, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              const error = new Error("aborted");
              error.name = "AbortError";
              reject(error);
            });
          }),
      },
    );
    assert.equal(hung.ok, false);
    if (!hung.ok) assert.equal(hung.message, PREVIEW_FALLBACK);

    const submission = {
      name: "Ada Owner",
      email: "ada@example.com",
      company: "Northwind Goods",
      industry: "Hospitality",
      size: "" as const,
      drains: readyBody.drains,
      weeklyTime: readyBody.weekly_time,
      auditPreview: "Booking replies\nWhat the AI would handle: A draft reply.",
    };
    assert.match(ownerAuditText(submission), /Example AI preview:/);
    assert.match(ownerAuditText(submission), /What eats the most time each week:/);
    assert.equal(prospectConfirmationText(submission).includes("Example AI preview"), false);
    assert.equal(prospectConfirmationText(submission).includes(submission.auditPreview), false);
  });

  it("maps the form into the completion and returns the mocked workflows", async () => {
    resetPreviewRateLimit();
    const seen: {
      model?: string;
      max_completion_tokens?: number;
      max_tokens?: number;
      messages?: { role: string; content: string }[];
    }[] = [];
    const response = await handleAuditPreview(previewRequest(readyBody, "203.0.113.70"), {
      env: { ...process.env, OPENAI_API_KEY: "sk-test-preview-key-ok" },
      fetchImpl: async (_input, init) => {
        seen.push(JSON.parse(String(init?.body)));
        return modelResponse(cleanWorkflows);
      },
    });
    const body = (await response.json()) as {
      ok?: boolean;
      message?: string;
      workflows?: { name: string }[];
    };
    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.message, undefined);
    assert.equal(body.workflows?.length, 2);
    assert.equal(body.workflows?.[0]?.name, "Booking replies");
    assert.equal(seen[0]?.model, PREVIEW_MODEL);
    assert.equal(seen[0]?.max_completion_tokens, 450);
    assert.equal(seen[0]?.max_tokens, undefined);
    const user = seen[0]?.messages?.find((message) => message.role === "user")?.content ?? "";
    assert.match(user, /Industry: Hospitality/);
    assert.match(user, /rewrite booking replies from scratch every day/);
    assert.match(user, /follow-up after a tasting/);
  });

  it("records the OpenAI error code and keeps the key out of the log", async () => {
    resetPreviewRateLimit();
    const secret = "sk-SECRET-should-not-leak";
    const lines: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      lines.push(args);
    };
    try {
      const response = await handleAuditPreview(previewRequest(readyBody, "203.0.113.71"), {
        env: { ...process.env, OPENAI_API_KEY: secret },
        fetchImpl: async () =>
          new Response(
            JSON.stringify({
              error: {
                message: `Incorrect API key provided: ${secret}`,
                type: "invalid_request_error",
                code: "invalid_api_key",
              },
            }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          ),
      });
      const body = (await response.json()) as { ok?: boolean; message?: string };
      assert.equal(body.ok, false);
      assert.equal(body.message, PREVIEW_FALLBACK);
      const health = previewHealth({ ...process.env, OPENAI_API_KEY: secret });
      assert.equal(health.keyPresent, true);
      assert.equal(health.keyPrefixOk, true);
      assert.equal(health.lastErrorCode, "invalid_api_key");
      const logged = JSON.stringify(lines);
      assert.equal(logged.includes(secret), false);
      assert.equal(logged.includes("Incorrect API key"), false);
      assert.match(logged, /401/);
      assert.match(logged, /invalid_api_key/);
      assert.match(logged, /invalid_request_error/);
    } finally {
      console.error = original;
    }

    const missing = previewHealth({ ...process.env, OPENAI_API_KEY: "" });
    assert.equal(missing.keyPresent, false);
    assert.equal(missing.keyPrefixOk, false);
    const short = previewHealth({ ...process.env, OPENAI_API_KEY: "sk-test" });
    assert.equal(short.keyPresent, true);
    assert.equal(short.keyPrefixOk, false);
    const spaced = previewHealth({ ...process.env, OPENAI_API_KEY: "sk-test preview key value" });
    assert.equal(spaced.keyPresent, true);
    assert.equal(spaced.keyPrefixOk, false);
    const wrongPrefix = previewHealth({ ...process.env, OPENAI_API_KEY: "pk-test-preview-key-ok" });
    assert.equal(wrongPrefix.keyPresent, true);
    assert.equal(wrongPrefix.keyPrefixOk, false);
    assert.equal(readFileSync("app/api/audit-preview/health/route.ts", "utf8").includes("previewHealth"), true);
  });
});
