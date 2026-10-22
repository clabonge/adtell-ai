"use client";

import { useState } from "react";
import {
  PREVIEW_FALLBACK,
  PREVIEW_LABEL,
  canRequestPreview,
  previewPlainText,
  type PreviewWorkflow,
} from "@/lib/audit-preview";

export function AuditPreview({
  enabled,
  industry,
  drains,
  weeklyTime,
  companyWebsite,
  onText,
}: {
  enabled: boolean;
  industry: string;
  drains: string;
  weeklyTime: string;
  companyWebsite: string;
  onText: (text: string, key: string) => void;
}) {
  const inputKey = `${industry}\n${drains}\n${weeklyTime}`;
  const [draft, setDraft] = useState<{
    key: string;
    phase: "drafting" | "ready" | "fallback";
    workflows: PreviewWorkflow[];
    message: string;
  } | null>(null);
  const view = draft?.key === inputKey ? draft : null;
  const phase = view?.phase ?? "idle";
  const workflows = view?.workflows ?? [];
  const message = view?.message ?? "";

  if (!enabled) return null;
  if (!canRequestPreview({ industry, drains, weeklyTime })) return null;

  async function onPreview() {
    const key = inputKey;
    setDraft({ key, phase: "drafting", workflows: [], message: "" });
    onText("", key);
    try {
      const response = await fetch("/api/audit-preview", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          drains,
          weekly_time: weeklyTime,
          company_website: companyWebsite,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        workflows?: PreviewWorkflow[];
        message?: string;
      };
      if (!response.ok || !payload.ok || !payload.workflows?.length) {
        setDraft((current) =>
          current?.key === key
            ? { key, phase: "fallback", workflows: [], message: payload.message || PREVIEW_FALLBACK }
            : current,
        );
        onText("", key);
        return;
      }
      setDraft((current) =>
        current?.key === key ? { key, phase: "ready", workflows: payload.workflows ?? [], message: "" } : current,
      );
      onText(previewPlainText(payload.workflows), key);
    } catch {
      setDraft((current) =>
        current?.key === key ? { key, phase: "fallback", workflows: [], message: PREVIEW_FALLBACK } : current,
      );
      onText("", key);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onPreview}
        disabled={phase === "drafting"}
        aria-busy={phase === "drafting"}
        className="inline-flex min-h-11 items-center justify-center border border-ink px-5 text-sm font-semibold text-ink hover:bg-ivory-deep disabled:cursor-wait disabled:opacity-70"
      >
        Preview my audit
      </button>
      {phase === "idle" ? null : (
        <PreviewCard phase={phase} workflows={workflows} message={message} />
      )}
    </div>
  );
}

export function PreviewCard({
  phase,
  workflows,
  message,
}: {
  phase: "drafting" | "ready" | "fallback";
  workflows: readonly PreviewWorkflow[];
  message: string;
}) {
  return (
    <article aria-live="polite" className="mt-4 border border-line bg-ivory-deep p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood-ink">Preview</p>
      {phase === "drafting" ? (
        <p className="mt-3 animate-pulse text-sm text-quiet-ink">AI is drafting</p>
      ) : null}
      {phase === "ready" ? (
        <ol className="mt-4 grid gap-4">
          {workflows.map((workflow) => (
            <li key={workflow.name} className="border-t border-line pt-3">
              <h3 className="font-serif text-xl tracking-tight text-ink">{workflow.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-quiet-ink">
                <span className="font-semibold text-ink">What the AI would handle. </span>
                {workflow.handles}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-quiet-ink">
                <span className="font-semibold text-ink">Where a person reviews. </span>
                {workflow.person}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-quiet-ink">
                <span className="font-semibold text-ink">Likely tools. </span>
                {workflow.tools}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
      {phase === "fallback" ? (
        <p className="mt-3 text-sm leading-relaxed text-quiet-ink">{message}</p>
      ) : null}
      <p className="mt-4 text-sm leading-relaxed text-quiet-ink">{PREVIEW_LABEL}</p>
    </article>
  );
}
