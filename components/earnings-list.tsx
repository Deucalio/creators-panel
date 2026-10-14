import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { formatDate, formatShortDate } from "@/lib/format-date";
import { deriveEarningStatus, describeAmountChange, formatPayoutNumber } from "@/lib/earning-status";
import type { EarningRow } from "@/lib/earnings";
import { Badge } from "@/components/badge";

/**
 * One entry per referred order, as cards on phones/tablets and a table on wider desktop screens.
 *
 * Creators are overwhelmingly mobile and tablet users. The card leads with "Your commission"
 * so the key figure is immediately legible without horizontal scrolling.
 *
 * Both presentations render from the same view model rather than from the raw
 * row, so the two layouts cannot drift into disagreeing about what an order
 * earned or why.
 */
type EarningView = {
  id: string;
  order: string;
  shortDate: string;
  fullDate: string;
  createdAt: Date;
  orderValue: string;
  commission: string;
  effectiveRate: string | null;
  amountNote: string | null;
  status: ReturnType<typeof deriveEarningStatus>;
  payoutNumber: number | null;
  /**
   * Declined or never credited: the amount is shown for the record, struck
   * through, so it can't be mistaken for money on its way.
   */
  voided: boolean;
};

function deriveEffectiveRate(
  commission: EarningRow["commission"],
  orderAmount: number,
  currency: string,
): string | null {
  if (!commission) return null;
  // If terms exist with frozen config
  const terms = commission.terms as { config?: { type: string; amount: number } } | null;
  if (terms?.config && typeof terms.config.amount === "number") {
    if (terms.config.type === "PERCENTAGE") return `${terms.config.amount}%`;
    if (terms.config.type === "FIXED_PER_ORDER") return `${formatMoney(terms.config.amount, currency)}`;
    if (terms.config.type === "FIXED_PER_ITEM") return `${formatMoney(terms.config.amount, currency)}/item`;
  }
  // Fallback to orderAmount ratio if positive
  if (orderAmount > 0) {
    const baseAmount = commission.originalAmount ?? commission.amount;
    if (baseAmount > 0) {
      const pct = Math.round((baseAmount / orderAmount) * 100);
      if (pct > 0 && pct <= 100) return `${pct}%`;
    }
  }
  return null;
}

function toView(row: EarningRow, currency: string, showDetail: boolean): EarningView {
  return {
    id: row.id,
    order: row.orderNumber ?? "—",
    shortDate: formatShortDate(row.createdAt),
    fullDate: formatDate(row.createdAt),
    createdAt: row.createdAt,
    orderValue: formatMoney(row.orderAmount, currency),
    commission: row.commission ? formatMoney(row.commission.amount, currency) : "—",
    effectiveRate: deriveEffectiveRate(row.commission, row.orderAmount, currency),
    amountNote: showDetail ? describeAmountChange(row.commission, currency) : null,
    status: deriveEarningStatus(row.status, row.commission),
    payoutNumber: row.commission?.payout?.number ?? null,
    voided: row.status === "REJECTED" || row.commission?.status === "REJECTED",
  };
}

const amountClass = (voided: boolean) =>
  voided ? "text-ink-subtle line-through decoration-1" : "text-ink";

function HintWithPayoutLink({
  hint,
  payoutNumber,
  programId,
}: {
  hint: string;
  payoutNumber: number | null;
  programId?: string;
}) {
  if (!payoutNumber || !programId) {
    return <span>{hint}</span>;
  }
  const code = formatPayoutNumber(payoutNumber);
  if (!hint.includes(code)) {
    return <span>{hint}</span>;
  }

  const parts = hint.split(code);
  const href = `/dashboard/payouts?program=${encodeURIComponent(programId)}#${code}`;

  return (
    <span>
      {parts[0]}
      <Link
        href={href}
        className="font-semibold text-brand underline decoration-brand/40 underline-offset-2 transition hover:text-brand-hover hover:decoration-brand"
      >
        {code}
      </Link>
      {parts.slice(1).join(code)}
    </span>
  );
}

export function EarningsList({
  rows,
  currency,
  emptyMessage,
  showDetail = true,
  programId,
}: {
  rows: EarningRow[];
  currency: string;
  emptyMessage: string;
  showDetail?: boolean;
  programId?: string;
}) {
  if (rows.length === 0) {
    return <p className="px-6 pb-8 pt-2 text-sm text-ink-muted">{emptyMessage}</p>;
  }

  const views = rows.map((row) => toView(row, currency, showDetail));

  return (
    <>
      <ul className="flex flex-col gap-3 px-4 pb-4 lg:hidden">
        {views.map((view) => (
          <EarningCard
            key={view.id}
            view={view}
            showDetail={showDetail}
            programId={programId}
          />
        ))}
      </ul>

      <div className="hidden lg:block overflow-x-auto">
        <EarningTable
          views={views}
          showDetail={showDetail}
          programId={programId}
        />
      </div>
    </>
  );
}

function EarningCard({
  view,
  showDetail,
  programId,
}: {
  view: EarningView;
  showDetail: boolean;
  programId?: string;
}) {
  return (
    <li className="rounded-xl border border-line bg-surface p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{view.order}</p>
          <p className="mt-0.5 text-xs text-ink-subtle">
            <time dateTime={view.createdAt.toISOString()} title={view.fullDate}>
              {view.shortDate}
            </time>
          </p>
        </div>
        <Badge tone={view.status.tone}>{view.status.label}</Badge>
      </div>

      {/* Commission first and largest: it is the primary reason the page was opened */}
      <div className="mt-3 flex items-end justify-between gap-3 border-t border-line-soft pt-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-subtle">
            Your commission
          </span>
          {view.effectiveRate && !view.voided ? (
            <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-semibold text-ink-subtle">
              {view.effectiveRate}
            </span>
          ) : null}
        </div>
        <span className={`text-lg font-extrabold tabular-nums ${amountClass(view.voided)}`}>
          {view.commission}
        </span>
      </div>

      <div className="mt-1 flex items-baseline justify-between gap-3">
        <span className="text-xs text-ink-subtle">Order value</span>
        <span className="text-sm tabular-nums text-ink-muted">{view.orderValue}</span>
      </div>

      {showDetail && (view.amountNote || view.status.hint) ? (
        <div className="mt-3 flex flex-col gap-1 border-t border-line-soft pt-3">
          {view.amountNote ? (
            <p className="text-xs text-ink-subtle">{view.amountNote}</p>
          ) : null}
          <p className="text-xs text-ink-subtle">
            <HintWithPayoutLink
              hint={view.status.hint}
              payoutNumber={view.payoutNumber}
              programId={programId}
            />
          </p>
        </div>
      ) : null}
    </li>
  );
}

function EarningTable({
  views,
  showDetail,
  programId,
}: {
  views: EarningView[];
  showDetail: boolean;
  programId?: string;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-y border-line-soft bg-surface-muted text-left text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
          <th className="px-6 py-2.5">Order</th>
          <th className="px-6 py-2.5">Date</th>
          <th className="px-6 py-2.5 text-right">Order value</th>
          <th className="px-6 py-2.5 text-right">Your commission</th>
          <th className="px-6 py-2.5">Status</th>
        </tr>
      </thead>
      <tbody>
        {views.map((view) => (
          <tr key={view.id} className="border-b border-line-soft align-top last:border-0 hover:bg-surface-muted/40 transition-colors">
            <td className="px-6 py-3.5 font-medium text-ink">{view.order}</td>
            <td className="px-6 py-3.5 whitespace-nowrap text-ink-muted">
              <time dateTime={view.createdAt.toISOString()} title={view.fullDate}>
                {view.shortDate}
              </time>
            </td>
            <td className="px-6 py-3.5 text-right tabular-nums text-ink-muted">
              {view.orderValue}
            </td>
            <td className="px-6 py-3.5 text-right">
              <div className="flex items-baseline justify-end gap-1.5">
                <span className={`font-semibold tabular-nums ${amountClass(view.voided)}`}>
                  {view.commission}
                </span>
                {view.effectiveRate && !view.voided ? (
                  <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-subtle">
                    {view.effectiveRate}
                  </span>
                ) : null}
              </div>
              {view.amountNote ? (
                <span className="mt-0.5 block text-xs font-normal text-ink-subtle">
                  {view.amountNote}
                </span>
              ) : null}
            </td>
            <td className="px-6 py-3.5">
              <Badge tone={view.status.tone}>{view.status.label}</Badge>
              {showDetail ? (
                <span className="mt-1 block max-w-xs text-xs text-ink-subtle">
                  <HintWithPayoutLink
                    hint={view.status.hint}
                    payoutNumber={view.payoutNumber}
                    programId={programId}
                  />
                </span>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
