/**
 * Illustration math for the services calculator.
 * The $10,000 starting price is the published implementation price
 * in content/services.ts. This is not a forecast of savings.
 */
export const WEEKS_PER_YEAR = 52;
export const IMPLEMENTATION_FROM = 10_000;

export type TaskIllustration = {
  annualCost: number;
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

export function formatPayback(months: number): string {
  if (months < 1) return "Under 1 month";
  const rounded = Math.round(months * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return rounded === 1 ? "1 month" : `${text} months`;
}
