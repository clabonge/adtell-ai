/**
 * Illustration math for the services calculator.
 * The 25% share and the $10,000 starting price are the published terms
 * in content/services.ts. This is not a forecast of savings.
 */
export const WEEKS_PER_YEAR = 52;
export const FEE_SHARE = 0.25;
export const IMPLEMENTATION_FROM = 10_000;
/** Published starter range. Matches "$2,500–$7,500" in content/services.ts. */
export const STARTER_LOW = 2_500;
export const STARTER_HIGH = 7_500;
/** Published retainer start. Matches "From $1,500/mo" in content/services.ts. */
export const RETAINER_MONTHLY = 1_500;

export const illustrationOnlyLabel = "Illustration only, not a client result.";

export type PaybackRange = {
  low: number;
  high: number;
};

export type TaskIllustration = {
  annualCost: number;
  fee: number;
  /** Months to cover an implementation from the published start price. */
  paybackMonths: number;
  /** Months to cover the published starter range. Illustration only. */
  starterPaybackMonths: PaybackRange;
};

function monthsToCover(price: number, annualCost: number): number {
  return price / (annualCost / 12);
}

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
    paybackMonths: monthsToCover(IMPLEMENTATION_FROM, annualCost),
    starterPaybackMonths: {
      low: monthsToCover(STARTER_LOW, annualCost),
      high: monthsToCover(STARTER_HIGH, annualCost),
    },
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
  starterBuildLow: number;
  starterBuildHigh: number;
  retainerYear: number;
  toolsYear: number;
  firstYearTotal: number;
  starterFirstYearLow: number;
  starterFirstYearHigh: number;
  paybackMonths: number | null;
  starterPaybackMonths: PaybackRange | null;
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
  const starterFirstYearLow = roundCents(STARTER_LOW + retainerYear + toolsYear);
  const starterFirstYearHigh = roundCents(STARTER_HIGH + retainerYear + toolsYear);
  return {
    build,
    starterBuildLow: STARTER_LOW,
    starterBuildHigh: STARTER_HIGH,
    retainerYear,
    toolsYear,
    firstYearTotal,
    starterFirstYearLow,
    starterFirstYearHigh,
    paybackMonths: monthlySaving > 0 ? firstYearTotal / monthlySaving : null,
    starterPaybackMonths:
      monthlySaving > 0
        ? {
            low: starterFirstYearLow / monthlySaving,
            high: starterFirstYearHigh / monthlySaving,
          }
        : null,
  };
}

export function formatPayback(months: number): string {
  if (months < 1) return "Under 1 month";
  const rounded = Math.round(months * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return rounded === 1 ? "1 month" : `${text} months`;
}

/** Published dollar range, using the same en dash as the price table. */
export function formatDollarRange(low: number, high: number): string {
  return `${formatDollars(low)}\u2013${formatDollars(high)}`;
}

/** Illustrative payback across the starter range. Not a client result. */
export function formatPaybackRange(lowMonths: number, highMonths: number): string {
  const low = formatPayback(lowMonths);
  const high = formatPayback(highMonths);
  if (low === high) return low;
  const numeric = / months?$/;
  if (numeric.test(low) && numeric.test(high) && !low.startsWith("Under") && !high.startsWith("Under")) {
    return `${low.replace(numeric, "")}\u2013${high.replace(numeric, "")} months`;
  }
  return `${low} to ${high}`;
}
