/**
 * Illustration math for the services calculator.
 * The 25% share and the $10,000 starting price are the published terms
 * in content/services.ts. This is not a forecast of savings.
 */
export const WEEKS_PER_YEAR = 52;
export const FEE_SHARE = 0.25;
export const IMPLEMENTATION_FROM = 10_000;
/** Published retainer start. Matches "From $1,500/mo" in content/services.ts. */
export const RETAINER_MONTHLY = 1_500;

export const illustrationOnlyLabel = "Illustration only, not a client result.";

export type TaskIllustration = {
  annualCost: number;
  fee: number;
  paybackMonths: number;
};

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function illustrateTask(
  hoursPerWeek: number,
  loadedHourlyCost: number,
): TaskIllustration | null {
  if (!Number.isFinite(hoursPerWeek) || !Number.isFinite(loadedHourlyCost)) return null;
  if (hoursPerWeek <= 0 || loadedHourlyCost <= 0) return null;
  const annualCost = roundCents(hoursPerWeek * loadedHourlyCost * WEEKS_PER_YEAR);
  if (annualCost <= 0) return null;
  return {
    annualCost,
    fee: roundCents(annualCost * FEE_SHARE),
    paybackMonths: IMPLEMENTATION_FROM / (annualCost / 12),
  };
}

export function formatDollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export type FirstYearIllustration = {
  build: number;
  retainerYear: number;
  toolsYear: number;
  firstYearTotal: number;
  paybackMonths: number | null;
};

/**
 * First-year cost from published prices plus a tool line the reader enters.
 * A blank tool amount is zero. Payback uses a monthly saving the reader enters.
 */
export function illustrateFirstYear(
  includeRetainer: boolean,
  monthlyTools: number,
  monthlySaving: number,
): FirstYearIllustration | null {
  if (!Number.isFinite(monthlyTools) || !Number.isFinite(monthlySaving)) return null;
  if (monthlyTools < 0 || monthlySaving < 0) return null;
  const build = IMPLEMENTATION_FROM;
  const retainerYear = includeRetainer ? roundCents(RETAINER_MONTHLY * 12) : 0;
  const toolsYear = roundCents(monthlyTools * 12);
  const firstYearTotal = roundCents(build + retainerYear + toolsYear);
  return {
    build,
    retainerYear,
    toolsYear,
    firstYearTotal,
    paybackMonths: monthlySaving > 0 ? firstYearTotal / monthlySaving : null,
  };
}

export function formatPayback(months: number): string {
  if (months < 1) return "Under 1 month";
  const rounded = Math.round(months * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return rounded === 1 ? "1 month" : `${text} months`;
}
