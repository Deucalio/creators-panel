/**
 * Shown while a dashboard route's data loads — most visibly when switching
 * program or tab, which until now was a server round trip with no feedback at
 * all.
 *
 * Deliberately mirrors the shape of the overview (tiles, then a table) so the
 * layout doesn't jump when the real content arrives.
 */
export default function DashboardLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      <div className="flex flex-col gap-2">
        <div className="h-7 w-56 rounded-md bg-surface-muted" />
        <div className="h-4 w-40 rounded-md bg-surface-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <div className="h-3 w-24 rounded bg-surface-muted" />
            <div className="mt-3 h-7 w-32 rounded bg-surface-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <div className="h-3 w-28 rounded bg-surface-muted" />
        <div className="mt-3 h-10 w-full rounded-lg bg-surface-muted" />
      </div>
    </div>
  );
}
