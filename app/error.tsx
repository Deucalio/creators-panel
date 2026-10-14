"use client";

import { useEffect } from "react";

/**
 * Root error boundary. Without this a database hiccup renders Next's raw error
 * page — no branding, no way back, and a stack trace in development.
 *
 * `retry` (not `reset`) is the Next 16 prop: it re-fetches and re-renders the
 * boundary's children, which is what a transient database error actually needs.
 * `reset` only clears the error state without re-fetching.
 */
export default function RootError({
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
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-ink">Something went wrong</h1>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-muted">
          We couldn&apos;t load this page. Your earnings are unaffected — this is a display problem,
          not a missing payment.
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
    </main>
  );
}
