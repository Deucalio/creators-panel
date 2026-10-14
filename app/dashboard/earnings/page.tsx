import type { Metadata } from "next";
import { requestedProgramId } from "@/lib/auth";
import { getEarnings, getEarningsSummary, EARNINGS_PER_PAGE } from "@/lib/earnings";
import { EarningsList } from "@/components/earnings-list";
import { EarningsFilterBar } from "@/components/earnings-filter-bar";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { NoOrdersArt } from "@/components/illustration";
import { resolveMembership } from "../guard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Earnings",
};

/** Clamp `?page=` to a real page — the value comes straight from the URL. */
function parsePage(value: string | string[] | undefined, pageCount: number): number {
  const raw = Number(typeof value === "string" ? value : 1);
  if (!Number.isInteger(raw) || raw < 1) return 1;
  return Math.min(raw, pageCount);
}

export default async function EarningsPage({ searchParams }: PageProps<"/dashboard/earnings">) {
  const { program, page: pageParam, status, q } = (await searchParams) as {
    program?: string;
    page?: string;
    status?: string;
    q?: string;
  };

  // A record, not a tool: stays open to a creator the merchant has paused.
  const resolved = await resolveMembership(requestedProgramId(program), { allowHistory: true });

  if (!resolved.ok) return resolved.screen;

  const { membership } = resolved;
  const currency = membership.program.store.currencyCode;

  // Run summary query in parallel with initial earnings fetch
  const [summary, first] = await Promise.all([
    getEarningsSummary(membership.id),
    getEarnings(membership.id, { status, query: q }),
  ]);

  const page = parsePage(pageParam, first.pageCount);
  const { rows, total, pageCount } =
    page === 1 ? first : await getEarnings(membership.id, { page, status, query: q });

  const from = (page - 1) * EARNINGS_PER_PAGE + 1;
  const to = Math.min(page * EARNINGS_PER_PAGE, total);
  const isFiltered = Boolean(q || (status && status !== "all"));

  return (
    <div className="flex flex-col gap-6">
      {resolved.notice}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Earnings</h1>
        <p className="text-sm text-ink-muted">
          Every order credited to you in {membership.program.name}, and what you earned from it.
        </p>
      </div>

      {/* Filter and summary bar (EA-1, EA-2) */}
      <EarningsFilterBar
        summary={summary}
        currency={currency}
        programId={membership.id}
        currentStatus={status}
        currentQuery={q}
      />

      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
          <h2 className="text-sm font-bold tracking-tight text-ink">
            {total === 0
              ? isFiltered
                ? "No matching orders"
                : "No orders yet"
              : `${total} order${total === 1 ? "" : "s"}`}
          </h2>
          {total > 0 ? (
            <p className="text-xs text-ink-subtle">
              Showing {from}–{to}
            </p>
          ) : null}
        </div>

        {rows.length === 0 ? (
          isFiltered ? (
            <EmptyState
              art={<NoOrdersArt />}
              title="No orders found"
              body="No orders matched your active search or status filter. Try clearing filters to see all orders."
              action={{
                label: "Clear filters",
                href: `/dashboard/earnings?program=${membership.id}`,
              }}
            />
          ) : (
            <EmptyState
              art={<NoOrdersArt />}
              title="Nothing to show yet"
              body="Once someone buys through your link or coupon, the order and what you earned from it appear here within minutes."
              action={{ label: "Get your link", href: `/dashboard/links?program=${membership.id}` }}
            />
          )
        ) : (
          <EarningsList
            rows={rows}
            currency={currency}
            emptyMessage=""
            programId={membership.id}
          />
        )}

        <Pagination
          page={page}
          pageCount={pageCount}
          basePath="/dashboard/earnings"
          programId={membership.id}
          extraParams={{ status, q }}
        />
      </section>
    </div>
  );
}
