import Link from "next/link";

/**
 * Branded 404. The most likely way a creator reaches this is a mistyped or
 * expired `/join/<programId>` link a merchant shared, so the copy addresses
 * that case rather than talking about pages.
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-xs">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
          Not found
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-ink">
          This link doesn&apos;t lead anywhere
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-muted">
          The program may have been removed, or the signup link may be incomplete. Ask the merchant
          for a fresh link — or sign in if you already have an account.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Go to my dashboard
        </Link>
      </div>
    </main>
  );
}
