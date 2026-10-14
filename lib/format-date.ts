/** Shared date formatting. Pure — safe to import from client components. */

export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

/** "15 Sep" — for near-term dates where the year is noise. */
export function formatShortDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(value);
}
