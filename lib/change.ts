/**
 * Period-over-period change.
 *
 * Pure and deliberately NOT in a `server-only` module: a change indicator is
 * presentational and will eventually be wanted inside a client component. Every
 * previous instance of this leak compiled and typechecked fine and only failed
 * at runtime.
 */

/**
 * Null when the previous period was empty — there is no percentage change from
 * zero. "+100%" would be arithmetic nonsense and "0%" would be a lie, so the UI
 * says "no activity to compare" instead.
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export type ChangeTone = "up" | "down" | "flat" | "none";

export function changeTone(change: number | null): ChangeTone {
  if (change === null) return "none";
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

/** "+40% vs previous 30 days", or a plain statement when there's no baseline. */
export function describeChange(change: number | null, days: number): string {
  if (change === null) return `No activity in the previous ${days} days to compare`;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change}% vs previous ${days} days`;
}
