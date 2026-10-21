"use client";

import { useId, useState, type FormEvent } from "react";
import { ButtonLink, Container, Kicker } from "@/components/ui";
import { auditCta, auditPath } from "@/content/nav";
import { formatDollars, formatPayback, illustrateTask, type TaskIllustration } from "@/lib/illustration";

const noteId = "savings-illustration-note";

export function SavingsCalculator() {
  const hoursId = useId();
  const costId = useId();
  const [hours, setHours] = useState("");
  const [cost, setCost] = useState("");
  const [result, setResult] = useState<TaskIllustration | null>(null);
  const [attempted, setAttempted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setResult(illustrateTask(Number(hours), Number(cost)));
  }

  const showError = attempted && result === null;

  return (
    <section id="savings-calculator" className="scroll-mt-28 border-t border-line">
      <Container className="py-16 sm:py-24">
        <Kicker>Illustration</Kicker>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
          Savings and payback.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-quiet">
          Enter the hours a task takes each week and the loaded hourly cost. The figures below
          are an illustration of the annual cost, a 25% savings-share fee, and months to pay
          back an implementation from $10,000.
        </p>
        <p id={noteId} className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-oxblood">
          Illustration, not a promise.
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-8 max-w-xl border border-line bg-ivory p-6 text-ink sm:p-8"
          aria-describedby={noteId}
        >
          <div>
            <label htmlFor={hoursId} className="text-sm font-semibold">
              Hours per week on the task
            </label>
            <input
              id={hoursId}
              name="hours"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3 text-base text-ink"
            />
          </div>
          <div className="mt-5">
            <label htmlFor={costId} className="text-sm font-semibold">
              Loaded hourly cost
            </label>
            <input
              id={costId}
              name="cost"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3 text-base text-ink"
            />
          </div>
          <button
            type="submit"
            className="mt-6 inline-flex min-h-11 items-center justify-center bg-void px-5 text-sm font-semibold text-ivory hover:bg-raise"
          >
            Calculate
          </button>
          <div className="mt-4" aria-live="polite" aria-atomic="true">
          {showError ? (
            <p role="alert" className="text-sm text-oxblood-ink">
              Enter hours per week and a loaded hourly cost greater than zero.
            </p>
          ) : null}
          {result ? (
            <dl className="grid gap-4 border-t border-line pt-6">
              <div>
                <dt className="text-sm font-semibold">Annual cost</dt>
                <dd className="mt-1 font-serif text-3xl tracking-tight">{formatDollars(result.annualCost)}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold">Illustrative 25% savings-share fee</dt>
                <dd className="mt-1 font-serif text-3xl tracking-tight">{formatDollars(result.fee)}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold">
                  Months to payback on an implementation from $10,000
                </dt>
                <dd className="mt-1 font-serif text-3xl tracking-tight">
                  {formatPayback(result.paybackMonths)}
                </dd>
              </div>
            </dl>
          ) : null}
          </div>
        </form>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-quiet">
          This treats the annual cost of the task as the measured savings. The fee is 25% of that
          amount. Payback is how many months of that amount cover an implementation from $10,000.
          The baseline, the savings, and the price are set in writing after the audit.
        </p>
        <p className="mt-8">
          <ButtonLink href={auditPath}>{auditCta}</ButtonLink>
        </p>
      </Container>
    </section>
  );
}
