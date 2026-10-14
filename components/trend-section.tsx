import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { percentChange, changeTone, type ChangeTone } from "@/lib/change";
import type { EarningsTrend } from "@/lib/trend";
import { TrendChart } from "@/components/trend-chart";

export const TREND_PERIODS = [7, 30, 90] as const;

const TONE_BADGE: Record<ChangeTone, string> = {
  up: "bg-ok-surface text-ok-ink border-ok-ink/20",
  down: "bg-bad-surface text-bad-ink border-bad-ink/20",
  flat: "bg-neutral-surface text-neutral-ink border-neutral-ink/20",
  none: "bg-surface-muted text-ink-subtle border-line",
};

export function TrendSection({
  trend,
  currency,
  programId,
}: {
  trend: EarningsTrend;
  currency: string;
  programId: string;
}) {
  const stats = [
    {
      label: "Commission",
      current: trend.totals.commission,
      value: formatMoney(trend.totals.commission, currency),
      change: percentChange(trend.totals.commission, trend.previous.commission),
    },
    {
      label: "Orders",
      current: trend.totals.orders,
      value: String(trend.totals.orders),
      change: percentChange(trend.totals.orders, trend.previous.orders),
    },
    {
      label: "Clicks",
      current: trend.totals.clicks,
      value: String(trend.totals.clicks),
      change: percentChange(trend.totals.clicks, trend.previous.clicks),
    },
  ];

  const hasPreviousActivity = stats.some((s) => s.change !== null);
  const hasActivity = stats.some((s) => s.current > 0);

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-ink">
            Activity trend
          </h2>
          <p className="text-xs text-ink-subtle mt-0.5">
            Performance over the last {trend.days} days
          </p>
        </div>
        <PeriodPicker active={trend.days} programId={programId} />
      </div>

      {/* Period summary figures (OV-3) */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => {
          const tone = changeTone(stat.change);
          // With no previous period there's no percentage. Something this
          // period is "New"; nothing at all gets no badge — "New" beside a 0
          // read as if something had happened.
          const formattedChange =
            stat.change !== null
              ? `${stat.change > 0 ? "+" : ""}${stat.change}%`
              : stat.current > 0
                ? "New"
                : null;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-line bg-surface-muted/30 p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink-muted">
                  {stat.label}
                </span>
                {formattedChange ? (
                  <span
                    className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${TONE_BADGE[tone]}`}
                  >
                    {formattedChange}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-xl font-bold tracking-tight tabular-nums text-ink">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Single shared comparison note instead of repeating 3 times (OV-3) */}
      <div className="mt-2 text-xs text-ink-subtle px-1">
        {hasPreviousActivity ? (
          <span>Comparison shown against the preceding {trend.days}-day period.</span>
        ) : hasActivity ? (
          <span>Nothing in the {trend.days} days before this to compare against.</span>
        ) : (
          <span>No clicks or orders in the last {trend.days} days yet.</span>
        )}
      </div>

      {/* Chart visualization */}
      <div className="mt-6 border-t border-line-soft pt-5">
        <TrendChart
          buckets={trend.buckets}
          currency={currency}
          bucketDays={trend.bucketDays}
        />
      </div>
    </section>
  );
}

function PeriodPicker({ active, programId }: { active: number; programId: string }) {
  return (
    <nav aria-label="Time period picker" className="flex items-center gap-1">
      {TREND_PERIODS.map((days) => {
        const params = new URLSearchParams({ program: programId });
        if (days !== 30) params.set("days", String(days));
        const isActive = days === active;

        return (
          <Link
            key={days}
            href={`/dashboard?${params.toString()}`}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold motion-safe:transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
              isActive
                ? "bg-brand text-brand-ink shadow-xs"
                : "border border-line bg-surface text-ink-muted hover:border-ink-subtle hover:text-ink hover:bg-surface-muted"
            }`}
          >
            {days}d
          </Link>
        );
      })}
    </nav>
  );
}
