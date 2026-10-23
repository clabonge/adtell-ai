"use client";

import { useId, useState } from "react";
import {
  formatDollars,
  formatPayback,
  illustrateFirstYear,
  illustrationOnlyLabel,
  RETAINER_MONTHLY,
} from "@/lib/illustration";

function optionalAmount(value: string): number | null {
  if (value.trim() === "") return 0;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
}

export function FirstYearCost() {
  const retainerId = useId();
  const toolsId = useId();
  const savingId = useId();
  const [includeRetainer, setIncludeRetainer] = useState(false);
  const [tools, setTools] = useState("");
  const [saving, setSaving] = useState("");

  const monthlyTools = optionalAmount(tools);
  const monthlySaving = optionalAmount(saving);
  const result =
    monthlyTools === null || monthlySaving === null
      ? null
      : illustrateFirstYear(includeRetainer, monthlyTools, monthlySaving);

  return (
    <form
      id="first-year-cost"
      className="mt-8 max-w-xl border border-line bg-ivory p-6 text-ink sm:p-8"
      onSubmit={(event) => event.preventDefault()}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-oxblood-ink">
        {illustrationOnlyLabel}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-quiet-ink">
        The build uses the published implementation price. The retainer, if you include it, uses
        the published retainer price. The tool line is yours to enter. Leave it blank, or type a
        hypothetical monthly amount.
      </p>
      <div className="mt-6">
        <p className="text-sm font-semibold">Build</p>
        <p className="mt-1 font-serif text-3xl tracking-tight">From $10,000</p>
      </div>
      <div className="mt-5">
        <label htmlFor={retainerId} className="flex items-start gap-3 text-sm font-semibold">
          <input
            id={retainerId}
            name="includeRetainer"
            type="checkbox"
            checked={includeRetainer}
            onChange={(event) => setIncludeRetainer(event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            Include the optional retainer at the published price, from ${RETAINER_MONTHLY.toLocaleString("en-US")} a
            month
          </span>
        </label>
      </div>
      <div className="mt-5">
        <label htmlFor={toolsId} className="text-sm font-semibold">
          Monthly tool subscription you pay
        </label>
        <input
          id={toolsId}
          name="tools"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={tools}
          placeholder="Blank, or a hypothetical amount"
          onChange={(event) => setTools(event.target.value)}
          className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3 text-base text-ink"
        />
      </div>
      <div className="mt-5">
        <label htmlFor={savingId} className="text-sm font-semibold">
          Monthly saving you enter
        </label>
        <input
          id={savingId}
          name="saving"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={saving}
          onChange={(event) => setSaving(event.target.value)}
          className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3 text-base text-ink"
        />
      </div>
      {result ? (
        <dl className="mt-6 grid gap-4 border-t border-line pt-6">
          <div>
            <dt className="text-sm font-semibold">Optional retainer for the year</dt>
            <dd className="mt-1 font-serif text-3xl tracking-tight">{formatDollars(result.retainerYear)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">Tool subscriptions for the year</dt>
            <dd className="mt-1 font-serif text-3xl tracking-tight">{formatDollars(result.toolsYear)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">First-year total</dt>
            <dd className="mt-1 font-serif text-3xl tracking-tight">{formatDollars(result.firstYearTotal)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">Payback month</dt>
            <dd className="mt-1 font-serif text-3xl tracking-tight">
              {result.paybackMonths === null
                ? "Enter a monthly saving"
                : formatPayback(result.paybackMonths)}
            </dd>
          </div>
        </dl>
      ) : (
        <p role="alert" className="mt-6 text-sm text-oxblood-ink">
          Enter a tool amount and a monthly saving of zero or more, or leave either blank.
        </p>
      )}
    </form>
  );
}
