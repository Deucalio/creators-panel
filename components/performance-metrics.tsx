import { formatMoney } from "@/lib/money";
import type { MembershipStats } from "@/lib/creator-stats";
import { Icon, type IconName } from "@/components/icon";

type Metric = {
  label: string;
  value: string;
  /** The portal's own icon set, not an emoji: one visual voice across the cards. */
  icon: IconName;
  note?: string;
};

export function PerformanceMetrics({
  stats,
  currency,
}: {
  stats: MembershipStats;
  currency: string;
}) {
  const metrics: Metric[] = [
    {
      label: "Total sales",
      value: formatMoney(stats.totalSales, currency),
      icon: "sales",
      note: "Gross referred revenue",
    },
    {
      label: "Referred orders",
      value: String(stats.orders),
      icon: "orders",
      note: stats.orders === 1 ? "1 order credited" : `${stats.orders} orders credited`,
    },
    {
      label: "Link clicks",
      value: String(stats.clicks),
      icon: "clicks",
      note: "Total storefront visits",
    },
    {
      label: "Conversion rate",
      value: stats.conversionRate === null ? "—" : `${stats.conversionRate}%`,
      icon: "conversion",
      note:
        stats.conversionRate === null
          ? "No link clicks yet"
          : `${stats.orders} of ${stats.clicks} visits bought`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-xs transition hover:border-line-strong hover:shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ink-muted truncate">
              {m.label}
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-surface text-brand-text">
              <Icon name={m.icon} className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-ink sm:text-3xl">
              {m.value}
            </p>
            {m.note ? (
              <p className="mt-1 text-[11px] text-ink-subtle truncate" title={m.note}>
                {m.note}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
