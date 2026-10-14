import { formatMoney } from "@/lib/money";
import type { MembershipStats } from "@/lib/creator-stats";
import {
  TotalSalesArt,
  ReferredOrdersArt,
  LinkClicksArt,
  ConversionRateArt,
} from "@/components/illustration";

type Metric = {
  label: string;
  value: string;
  badge: string;
  art: React.ReactNode;
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
      badge: "↗",
      art: <TotalSalesArt className="h-14 w-auto shrink-0 select-none opacity-90 transition group-hover:scale-105" />,
      note: "Gross referred revenue",
    },
    {
      label: "Referred orders",
      value: String(stats.orders),
      badge: "🛍️",
      art: <ReferredOrdersArt className="h-14 w-auto shrink-0 select-none opacity-90 transition group-hover:scale-105" />,
      note: stats.orders === 1 ? "1 order credited" : `${stats.orders} orders credited`,
    },
    {
      label: "Link clicks",
      value: String(stats.clicks),
      badge: "▷",
      art: <LinkClicksArt className="h-14 w-auto shrink-0 select-none opacity-90 transition group-hover:scale-105" />,
      note: "Total storefront visits",
    },
    {
      label: "Conversion rate",
      value: stats.conversionRate === null ? "—" : `${stats.conversionRate}%`,
      badge: "%",
      art: <ConversionRateArt className="h-14 w-auto shrink-0 select-none opacity-90 transition group-hover:scale-105" />,
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
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-surface text-xs font-bold text-brand-text">
              {m.badge}
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-extrabold tracking-tight tabular-nums text-ink sm:text-3xl">
                {m.value}
              </p>
              {m.note ? (
                <p className="mt-1 text-[11px] text-ink-subtle truncate" title={m.note}>
                  {m.note}
                </p>
              ) : null}
            </div>
            {m.art}
          </div>
        </div>
      ))}
    </div>
  );
}
