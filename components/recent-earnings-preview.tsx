import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format-date";
import { deriveEarningStatus } from "@/lib/earning-status";
import type { EarningRow } from "@/lib/earnings";
import { Badge } from "@/components/badge";
import { Icon } from "@/components/icon";

export function RecentEarningsPreview({
  rows,
  currency,
  total,
  programId,
}: {
  rows: EarningRow[];
  currency: string;
  total: number;
  programId: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-line-soft pb-4">
          <div>
            <h3 className="text-base font-bold tracking-tight text-ink">
              Recent activity
            </h3>
            <p className="text-xs text-ink-subtle mt-0.5">
              Latest referred orders
            </p>
          </div>
          {total > rows.length ? (
            <Link
              href={`/dashboard/earnings?program=${programId}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-text hover:underline"
            >
              <span>View all ({total})</span>
              <Icon name="arrow" className="h-3 w-3" />
            </Link>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-ink-subtle">
              <Icon name="orders" className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">No sales yet</p>
            <p className="mt-1 max-w-xs text-xs text-ink-muted leading-relaxed">
              When people buy through your link, referred orders appear here within minutes.
            </p>
            <Link
              href={`/dashboard/links?program=${programId}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-ink transition hover:bg-brand-hover"
            >
              <span>Get your link</span>
              <Icon name="arrow" className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line-soft">
            {rows.map((row) => {
              const status = deriveEarningStatus(row.status, row.commission);
              const isVoided = row.status === "REJECTED" || row.commission?.status === "REJECTED";
              const commissionFormatted = row.commission
                ? formatMoney(row.commission.amount, currency)
                : "—";

              return (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-0">
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-xs font-bold text-ink">
                      {row.orderNumber ?? "Order"}
                    </span>
                    <span className="truncate text-[11px] text-ink-subtle">
                      {formatDate(row.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-none">
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        isVoided ? "text-ink-subtle line-through" : "text-ink"
                      }`}
                    >
                      {commissionFormatted}
                    </span>
                    <Badge tone={status.tone} dot={false} className="py-0 px-2 text-[10px]">
                      {status.label}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {rows.length > 0 && total > rows.length ? (
        <div className="mt-4 border-t border-line-soft pt-3 text-center">
          <Link
            href={`/dashboard/earnings?program=${programId}`}
            className="text-xs font-semibold text-brand-text hover:underline"
          >
            See all {total} orders in Earnings &rarr;
          </Link>
        </div>
      ) : null}
    </div>
  );
}
