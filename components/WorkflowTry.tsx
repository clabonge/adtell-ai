"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { PreviewCard } from "@/components/AuditPreview";
import { industries } from "@/content/industries";
import {
  PREVIEW_FALLBACK,
  canRequestPreview,
  fullAuditHref,
  type PreviewWorkflow,
} from "@/lib/audit-preview";

type Phase = "idle" | "drafting" | "ready" | "fallback";

export function WorkflowTry({ presetIndustry = "" }: { presetIndustry?: string }) {
  const baseId = useId();
  const [allowed, setAllowed] = useState(false);
  const [industry, setIndustry] = useState(presetIndustry);
  const [weeklyTime, setWeeklyTime] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [workflows, setWorkflows] = useState<PreviewWorkflow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/audit-preview/health", { headers: { Accept: "application/json" } })
      .then((response) => response.json())
      .then((payload: { keyPresent?: boolean }) => {
        if (!cancelled && payload.keyPresent === true) setAllowed(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!allowed) return null;

  const ready = canRequestPreview({ industry, drains: "", weeklyTime });

  async function onPreview() {
    if (!ready || phase === "drafting") return;
    setPhase("drafting");
    setWorkflows([]);
    setMessage("");
    try {
      const response = await fetch("/api/audit-preview", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          drains: "",
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
        setPhase("fallback");
        setMessage(payload.message || PREVIEW_FALLBACK);
        return;
      }
      setWorkflows(payload.workflows);
      setPhase("ready");
    } catch {
      setPhase("fallback");
      setMessage(PREVIEW_FALLBACK);
    }
  }

  return (
    <div className="mt-8 sheet bg-ivory p-5 text-ink sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood-ink">Try it</p>
      <h2 className="mt-2 max-w-2xl font-serif text-3xl tracking-tight sm:text-4xl">
        See what AI could take off your plate.
      </h2>
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${baseId}-industry`} className="text-sm font-semibold">
              Industry
            </label>
            <select
              id={`${baseId}-industry`}
              name="industry"
              value={industry}
              onChange={(event) => {
                setIndustry(event.target.value);
                setPhase("idle");
              }}
              className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3 text-base text-ink"
            >
              <option value="">Select an industry</option>
              {industries.map((item) => (
                <option key={item.slug} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${baseId}-weekly`} className="text-sm font-semibold">
              What eats the most time each week?
            </label>
            <input
              id={`${baseId}-weekly`}
              name="weekly_time"
              value={weeklyTime}
              maxLength={500}
              onChange={(event) => {
                setWeeklyTime(event.target.value);
                setPhase("idle");
              }}
              placeholder="Writing the same follow-up after every visit"
              className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3 text-base text-ink"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onPreview}
          disabled={!ready || phase === "drafting"}
          aria-busy={phase === "drafting"}
          className="inline-flex min-h-11 w-full items-center justify-center bg-void px-5 text-sm font-semibold text-ivory hover:bg-raise disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
        >
          Preview my workflows
        </button>
      </div>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`${baseId}-website`}>
          Company website
          <input
            id={`${baseId}-website`}
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            value={companyWebsite}
            onChange={(event) => setCompanyWebsite(event.target.value)}
          />
        </label>
      </div>
      {phase === "idle" ? null : <PreviewCard phase={phase} workflows={workflows} message={message} />}
      {phase === "ready" ? (
        <p className="mt-4">
          <Link
            href={fullAuditHref(industry, weeklyTime)}
            className="text-sm font-semibold text-oxblood-ink underline underline-offset-4"
          >
            Get my full audit
          </Link>
        </p>
      ) : null}
    </div>
  );
}
