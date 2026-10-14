import { formatMoney } from "@/lib/money";
import { Icon } from "@/components/icon";
import type { MembershipStats } from "@/lib/creator-stats";

function unpaidBreakdown(stats: MembershipStats, currency: string): string {
  const reviewing = stats.commissionPending;
  const approved = stats.commissionApproved;
  if (reviewing > 0 && approved > 0) {
    return `${formatMoney(reviewing, currency)} in review · ${formatMoney(approved, currency)} approved`;
  }
  if (approved > 0) return "Approved — waiting to be paid";
  if (reviewing > 0) return "Waiting on merchant review";
  return "Nothing pending right now";
}

export function HeroEarningsPanel({
  stats,
  currency,
  storeName,
}: {
  stats: MembershipStats;
  currency: string;
  storeName: string;
}) {
  const notPaidYet = stats.commissionPending + stats.commissionApproved;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ok-surface text-ok-ink">
              <Icon name="commission" className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-ink-muted">
              Lifetime commission earned
            </span>
          </div>
          <span className="text-[11px] font-medium text-ink-subtle">
            All time
          </span>
        </div>

        {/* Hero prominent figure (OV-2) */}
        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight tabular-nums text-ink sm:text-4xl lg:text-5xl">
            {formatMoney(stats.commissionEarned, currency)}
          </p>
        </div>
      </div>

      {/* Split breakdown: Not paid yet + Paid out (OV-1, OV-2) */}
      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-line-soft pt-4 sm:grid-cols-2">
        <div className="rounded-xl border border-warn-ink/20 bg-warn-surface/40 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-warn-ink flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-warn-ink" aria-hidden="true" />
              Not paid yet
            </span>
            <Icon name="pending" className="h-3.5 w-3.5 text-warn-ink/70" />
          </div>
          <p className="mt-1.5 text-xl font-bold tracking-tight tabular-nums text-ink">
            {formatMoney(notPaidYet, currency)}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-subtle truncate" title={unpaidBreakdown(stats, currency)}>
            {unpaidBreakdown(stats, currency)}
          </p>
        </div>

        <div className="rounded-xl border border-ok-ink/20 bg-ok-surface/40 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ok-ink flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-ok-ink" aria-hidden="true" />
              Paid out
            </span>
            <Icon name="paid" className="h-3.5 w-3.5 text-ok-ink/70" />
          </div>
          <p className="mt-1.5 text-xl font-bold tracking-tight tabular-nums text-ink">
            {formatMoney(stats.commissionPaid, currency)}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-subtle">
            Sent to you by {storeName}
          </p>
        </div>
      </div>
    </div>
  );
}
