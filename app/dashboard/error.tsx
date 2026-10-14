"use client";

import { useEffect } from "react";

/**
 * Dashboard-scoped boundary. It sits inside the layout, so a failure here keeps
 * the header, tabs and program switcher on screen — the creator can navigate to
 * another program or section instead of hitting a dead end.
 */
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-danger-line bg-danger-surface p-8 shadow-xs">
      <h2 className="text-base font-bold tracking-tight text-ink">Couldn&apos;t load this section</h2>
      <p className="mt-2 max-w-lg text-xs leading-relaxed text-ink-muted">
        Something failed while fetching your data. Nothing has changed about what you&apos;ve earned
        — try again, or switch to another section using the navigation on the left.
      </p>

      {error.digest ? (
        <p className="mt-4 font-mono text-[11px] text-ink-subtle">Reference: {error.digest}</p>
      ) : null}

      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
