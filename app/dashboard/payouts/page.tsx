import type { Metadata } from "next";
import Link from "next/link";
import { requestedProgramId } from "@/lib/auth";
import { getPayouts, getOwedBack, type Payout } from "@/lib/payouts";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format-date";
import { formatPayoutNumber, payoutTone, titleCase } from "@/lib/earning-status";
import { Badge } from "@/components/badge";
import { EmptyState } from "@/components/empty-state";
import { NoPayoutsArt } from "@/components/illustration";
import { Icon } from "@/components/icon";
import { resolveMembership } from "../guard";
import { storeDisplayName } from "@/lib/store-name";
import { isPayoutDetailsConfigured } from "@/lib/pakistan-payouts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payouts",
};

export default async function PayoutsPage({ searchParams }: PageProps<"/dashboard/payouts">) {
  const { program } = await searchParams;
  // A record, not a tool: stays open to a creator the merchant has paused.
  const resolved = await resolveMembership(requestedProgramId(program), { allowHistory: true });

  if (!resolved.ok) return resolved.screen;

  const { membership } = resolved;
  const currency = membership.program.store.currencyCode;
  const storeName = storeDisplayName(membership.program.store);

  const [payouts, owedBack] = await Promise.all([
    getPayouts(membership.id),
    getOwedBack(membership.id),
  ]);

  // Paid, or not sent yet. The merchant sends every payout by hand and marks it
  // paid, so there is no "processing" or "failed" in between: anything not
  // marked paid is still waiting on them.
  const paidPayouts = payouts.filter((p) => p.status === "PAID");
  const pendingPayouts = payouts.filter((p) => p.status !== "PAID");

  const totalPaid = paidPayouts.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  const hasPayoutDetails = isPayoutDetailsConfigured(
    resolved.account.payoutMethod,
    resolved.account.payoutDetails,
  );

  return (
    <div className="flex flex-col gap-6">
      {resolved.notice}

      {!hasPayoutDetails ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 p-4 sm:px-5 sm:py-3.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="size-8 rounded-xl flex items-center justify-center font-bold text-white bg-amber-500 shrink-0 shadow-2xs" aria-hidden="true">
              !
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs sm:text-sm font-bold text-ink">
                No payout method connected
              </p>
              <p className="text-xs text-ink-muted">
                {pendingPayouts.length > 0
                  ? `You have ${pendingPayouts.length} payout${pendingPayouts.length === 1 ? "" : "s"} (${formatMoney(totalPending, currency)}) waiting. Add your payout details so ${storeName} can send it.`
                  : `Add your Easypaisa, JazzCash or bank details so ${storeName} can pay your approved earnings.`}
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/settings?program=${encodeURIComponent(membership.id)}#payouts`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition shrink-0 cursor-pointer"
          >
            <span>Connect payout method</span>
            <Icon name="arrow" className="h-3 w-3" />
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Payouts</h1>
        <p className="text-sm text-ink-muted">
          Payments from {storeName}: what&apos;s been sent, what&apos;s still to come, and which orders
          each one covered.
        </p>
      </div>

      {/* Summary Cards: Paid to date vs Awaiting payment (PA-2) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              Paid to date
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ok-surface text-ok-ink">
              <Icon name="check" className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-ink">
              {formatMoney(totalPaid, currency)}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {paidPayouts.length === 0
                ? "No completed payments yet"
                : `${paidPayouts.length} payment${paidPayouts.length === 1 ? "" : "s"} completed`}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              Awaiting payment
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warn-surface text-warn-ink">
              <Icon name="pending" className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-ink">
              {formatMoney(totalPending, currency)}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {pendingPayouts.length === 0
                ? "Nothing waiting to be sent"
                : `${pendingPayouts.length} payout${pendingPayouts.length === 1 ? "" : "s"} not sent yet`}
            </p>
          </div>
        </div>
      </div>

      {/* Softened Owed Back Notice (PA-3) */}
      {owedBack > 0 ? (
        <OwedBackNotice amount={owedBack} currency={currency} storeName={storeName} />
      ) : null}

      {payouts.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface shadow-xs">
          <EmptyState
            art={<NoPayoutsArt />}
            title="No payouts yet"
            body="When the merchant approves your commissions and sends a payment, it appears here with the amount, method and their reference — so you can check it against what actually arrived."
            action={{
              label: "See what you've earned",
              href: `/dashboard/earnings?program=${membership.id}`,
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Section: Not sent yet (PA-1) */}
          {pendingPayouts.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-warn-ink" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                  Not sent yet ({pendingPayouts.length})
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {pendingPayouts.map((payout) => (
                  <PayoutCard
                    key={payout.id}
                    payout={payout}
                    currency={currency}
                    storeName={storeName}
                    programId={membership.id}
                    isPending
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Section: Completed payments (PA-1) */}
          {paidPayouts.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-ok-ink" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                  Completed payments ({paidPayouts.length})
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {paidPayouts.map((payout) => (
                  <PayoutCard
                    key={payout.id}
                    payout={payout}
                    currency={currency}
                    storeName={storeName}
                    programId={membership.id}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/**
 * Calm, informative warning notice for debt created by refunds after payment (PA-3).
 * Nothing deducts this automatically: the merchant settles it by hand, and the
 * copy must not promise otherwise.
 */
function OwedBackNotice({
  amount,
  currency,
  storeName,
}: {
  amount: number;
  currency: string;
  storeName: string;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-warn-line bg-warn-surface p-5 text-ink shadow-2xs">
      <div className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-warn-ink/15 text-warn-ink">
        <Icon name="info" className="h-4 w-4" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-warn-ink">
            Owed back from refunds
          </span>
          <span className="text-base font-extrabold tabular-nums text-ink">
            {formatMoney(amount, currency)}
          </span>
        </div>
        <p className="max-w-xl text-xs leading-relaxed text-ink-muted">
          An order you&apos;d already been paid for was later refunded or cancelled, so this much of an
          earlier payment is owed back. Money already sent can&apos;t be pulled back, so {storeName} decides
          how to settle it — usually by taking it off a future payout.
        </p>
      </div>
    </div>
  );
}

function PayoutCard({
  payout,
  currency,
  storeName,
  programId,
  isPending = false,
}: {
  payout: Payout;
  currency: string;
  storeName: string;
  programId: string;
  isPending?: boolean;
}) {
  const orders = payout.commissions
    .map((c) => c.referral?.orderNumber)
    .filter((n): n is string => Boolean(n));

  const payoutCode = formatPayoutNumber(payout.number);

  return (
    <section
      id={payoutCode}
      className={`scroll-mt-20 sm:scroll-mt-8 overflow-hidden rounded-2xl border bg-surface shadow-xs transition-shadow ${
        isPending
          ? "border-warn-line bg-linear-to-b from-warn-surface/20 to-surface"
          : "border-line"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 p-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h3 className="font-mono text-base font-bold tracking-tight text-ink">
              {payoutCode}
            </h3>
            {isPending ? (
              <Badge tone="warn">Not sent yet</Badge>
            ) : (
              <Badge tone={payoutTone(payout.status)}>{titleCase(payout.status)}</Badge>
            )}
          </div>
          <p className="text-xs text-ink-muted">
            {payout.paidAt
              ? `Paid on ${formatDate(payout.paidAt)}`
              : `Created on ${formatDate(payout.createdAt)}`}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-extrabold tracking-tight tabular-nums text-ink">
            {formatMoney(payout.amount, currency)}
          </p>
        </div>
      </div>

      {/* Details grid with linked covered orders (PA-4, PA-5) */}
      <dl className="grid grid-cols-1 divide-y divide-line-soft border-t border-line-soft sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
        <div className="bg-surface px-6 py-3.5">
          <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Method</dt>
          <dd className="mt-1 text-xs break-words text-ink">
            {payout.method ?? (isPending ? "Recorded when sent" : "Not recorded")}
          </dd>
        </div>

        <div className="bg-surface px-6 py-3.5">
          <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Reference</dt>
          <dd
            className={`mt-1 text-xs break-words ${
              payout.reference ? "font-mono font-medium text-ink" : "text-ink-subtle"
            }`}
          >
            {payout.reference ?? (isPending ? "Added when sent" : "None given")}
          </dd>
        </div>

        <div className="bg-surface px-6 py-3.5">
          <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Covers</dt>
          <dd className="mt-1 text-xs">
            {orders.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {orders.map((num) => (
                  <Link
                    key={num}
                    href={`/dashboard/earnings?program=${encodeURIComponent(programId)}&q=${encodeURIComponent(num)}`}
                    className="inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-xs font-semibold text-brand hover:bg-brand-surface hover:text-brand-text transition-colors"
                    title={`View order ${num} in Earnings`}
                  >
                    {num}
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-ink-subtle">
                {payout.commissions.length} commission{payout.commissions.length === 1 ? "" : "s"}
              </span>
            )}
          </dd>
        </div>
      </dl>

      {/* Note from store (PA-6) */}
      {payout.note ? (
        <div className="border-t border-line-soft bg-surface-muted/25 px-6 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
            Note from {storeName}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {payout.note}
          </p>
        </div>
      ) : null}
    </section>
  );
}
