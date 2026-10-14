"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { Icon } from "@/components/icon";
import type { EarningsSummary } from "@/lib/earnings";

export function EarningsFilterBar({
  summary,
  currency,
  programId,
  currentStatus,
  currentQuery,
}: {
  summary: EarningsSummary;
  currency: string;
  programId: string;
  currentStatus?: string;
  currentQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeStatus = (currentStatus ?? "").toLowerCase();

  const setFilter = (status: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("program", programId);
    params.delete("page"); // Reset page when filtering

    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string)?.trim() ?? "";

    const params = new URLSearchParams(searchParams.toString());
    params.set("program", programId);
    params.delete("page");

    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("program", programId);
    params.delete("page");
    params.delete("q");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const filters = [
    {
      id: "all",
      label: "All",
      count: summary.totalOrders,
      amount: null,
      active: !activeStatus || activeStatus === "all",
      value: null,
    },
    {
      id: "in-review",
      label: "In review",
      count: summary.inReview.count,
      amount: summary.inReview.amount,
      active: activeStatus === "in-review" || activeStatus === "pending",
      value: "in-review",
    },
    {
      id: "approved",
      label: "Approved",
      count: summary.approved.count,
      amount: summary.approved.amount,
      active: activeStatus === "approved",
      value: "approved",
    },
    {
      id: "paid",
      label: "Paid",
      count: summary.paid.count,
      amount: summary.paid.amount,
      active: activeStatus === "paid",
      value: "paid",
    },
    {
      id: "declined",
      label: "Declined",
      count: summary.declined.count,
      amount: null,
      active: activeStatus === "declined" || activeStatus === "rejected",
      value: "declined",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Status Summary & Filter Chips (EA-1, EA-2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((filter) => {
          const isActive = filter.active;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setFilter(filter.value)}
              disabled={isPending}
              className={`group flex flex-none items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "border-brand bg-brand-surface text-brand-text shadow-xs ring-1 ring-brand/30"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong hover:bg-surface-muted/50 hover:text-ink"
              }`}
            >
              <span className={isActive ? "font-bold text-ink" : "text-ink"}>
                {filter.label}
              </span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums transition-colors ${
                  isActive
                    ? "bg-brand/15 text-brand-text"
                    : "bg-surface-muted text-ink-subtle group-hover:text-ink"
                }`}
              >
                {filter.count}
              </span>
              {filter.amount !== null && filter.amount > 0 ? (
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    isActive ? "text-brand-text" : "text-ink-muted"
                  }`}
                >
                  · {formatMoney(filter.amount, currency)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Search Input for Order Number (EA-2) */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-subtle">
            <Icon name="search" className="h-4 w-4" />
          </div>
          <input
            type="search"
            name="q"
            defaultValue={currentQuery ?? ""}
            placeholder="Search order number e.g. #1042"
            className="w-full rounded-xl border border-line bg-surface py-2 pr-9 pl-9 text-xs text-ink placeholder:text-ink-subtle shadow-2xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {currentQuery ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-subtle hover:text-ink"
              aria-label="Clear order search"
            >
              <Icon name="close" className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-2xs hover:border-line-strong hover:bg-surface-muted transition-colors disabled:opacity-50"
        >
          Search
        </button>
        {currentQuery || (activeStatus && activeStatus !== "all") ? (
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              params.set("program", programId);
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="text-xs font-semibold text-brand hover:underline underline-offset-2 ml-1"
          >
            Reset filters
          </button>
        ) : null}
      </form>
    </div>
  );
}
