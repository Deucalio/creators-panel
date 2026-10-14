import Link from "next/link";

/**
 * Page-number pagination over the earnings history.
 *
 * Offset rather than cursor: a creator's history is small enough that the extra
 * count query is free, and "Page 2 of 4" answers "how much is there" in a way a
 * cursor cannot. Before this, history simply stopped at ten rows with nothing on
 * screen to say more existed.
 *
 * `basePath` and `programId` are threaded through because every link in the
 * portal has to preserve `?program=` — losing it drops a multi-program creator
 * back to their default program.
 */
export function Pagination({
  page,
  pageCount,
  basePath,
  programId,
  extraParams,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  programId: string;
  extraParams?: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams({ program: programId });
    if (extraParams) {
      for (const [key, value] of Object.entries(extraParams)) {
        if (value && value.trim()) {
          params.set(key, value.trim());
        }
      }
    }
    if (target > 1) params.set("page", String(target));
    return `${basePath}?${params.toString()}`;
  };

  const linkClass =
    "rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-ink-subtle";
  const disabledClass =
    "rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink-subtle opacity-50";

  return (
    <nav
      aria-label="Earnings pages"
      className="flex items-center justify-between gap-4 border-t border-line-soft px-6 py-4"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden="true">
          Previous
        </span>
      )}

      <span className="text-sm text-ink-muted">
        Page {page} of {pageCount}
      </span>

      {page < pageCount ? (
        <Link href={href(page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden="true">
          Next
        </span>
      )}
    </nav>
  );
}
