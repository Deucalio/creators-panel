import type { Metadata } from "next";
import Link from "next/link";
import { requireCreatorAccount, type Membership } from "@/lib/auth";
import { getMembershipStats, type MembershipStats } from "@/lib/creator-stats";
import { formatMoney } from "@/lib/money";
import { signOut } from "@/lib/auth-actions";
import { CopyField } from "@/components/copy-field";

// Earnings must never be served stale.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard · PartnerLoop",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  PAID: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  INACTIVE: "bg-zinc-100 text-zinc-700",
};

function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
        STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-700"
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(
    value,
  );
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const account = await requireCreatorAccount();
  const { program } = await searchParams;

  const requested = typeof program === "string" ? program : undefined;
  // Default to the first approved membership so an active creator lands on
  // something useful rather than a pending application.
  const selected =
    account.memberships.find((m) => m.id === requested) ??
    account.memberships.find((m) => m.status === "ACTIVE") ??
    account.memberships[0];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-blue-900 text-sm font-extrabold text-white">
              P
            </span>
            <span className="font-bold tracking-tight text-zinc-900">PartnerLoop</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-600 sm:inline">
              {account.firstName} {account.lastName}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        {!selected ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-6">
            {account.memberships.length > 1 ? (
              <ProgramSwitcher memberships={account.memberships} selectedId={selected.id} />
            ) : null}

            <MembershipView membership={selected} firstName={account.firstName} />
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
      <h1 className="text-xl font-bold tracking-tight text-zinc-900">No programs yet</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
        You aren&apos;t part of any creator program. Use the signup link a merchant shared with you
        to apply.
      </p>
    </div>
  );
}

function ProgramSwitcher({
  memberships,
  selectedId,
}: {
  memberships: Membership[];
  selectedId: string;
}) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Your programs">
      {memberships.map((membership) => {
        const active = membership.id === selectedId;
        return (
          <Link
            key={membership.id}
            href={`/dashboard?program=${membership.id}`}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              active
                ? "bg-blue-700 text-white"
                : "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
            }`}
          >
            {membership.program.name}
          </Link>
        );
      })}
    </nav>
  );
}

async function MembershipView({
  membership,
  firstName,
}: {
  membership: Membership;
  firstName: string;
}) {
  const { program, status, referralCode } = membership;
  const storeName = program.store.shop.replace(/\.myshopify\.com$/, "");

  if (status !== "ACTIVE") {
    return <NotActive status={status} storeName={storeName} programName={program.name} firstName={firstName} />;
  }

  const stats = await getMembershipStats(membership.id);
  const currency = program.store.currencyCode;
  const referralLink = `https://${program.store.shop}/?ref=${referralCode}`;
  const couponEnabled = program.trackingConfig?.couponTrackingEnabled ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-zinc-600">
          {program.name} · {storeName}
        </p>
      </div>

      <StatGrid stats={stats} currency={currency} />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <CopyField
            label="My referral link"
            value={referralLink}
            hint="Share this anywhere. Sales from people who click it are credited to you."
          />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {couponEnabled ? (
            <CopyField
              label="My coupon code"
              value={referralCode}
              emphasis
              hint="For followers who won't click a link — they enter this at checkout instead."
            />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                My coupon code
              </p>
              <p className="text-sm leading-relaxed text-zinc-600">
                {storeName} hasn&apos;t enabled coupon tracking for this program. Use your referral
                link to earn commission.
              </p>
            </div>
          )}
        </div>
      </section>

      <ReferralsTable stats={stats} currency={currency} />
      <CommissionsTable stats={stats} currency={currency} />
    </div>
  );
}

function NotActive({
  status,
  storeName,
  programName,
  firstName,
}: {
  status: string;
  storeName: string;
  programName: string;
  firstName: string;
}) {
  const copy: Record<string, { title: string; body: string }> = {
    PENDING: {
      title: `Your application is under review, ${firstName}`,
      body: `${storeName} is reviewing your application to ${programName}. Once it's approved, your referral link and coupon code appear here and you can start earning.`,
    },
    REJECTED: {
      title: "This application wasn't approved",
      body: `${storeName} didn't approve your application to ${programName}. If you think that's a mistake, contact them directly.`,
    },
    INACTIVE: {
      title: "This membership is paused",
      body: `${storeName} has paused your membership of ${programName}. Your existing earnings are unaffected, but new referrals won't be tracked.`,
    },
  };

  const { title, body } = copy[status] ?? copy.PENDING;

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-3">
        <Badge status={status} />
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">{title}</h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-600">{body}</p>
      </div>
    </div>
  );
}

function StatGrid({ stats, currency }: { stats: MembershipStats; currency: string }) {
  const tiles = [
    { label: "Total sales", value: formatMoney(stats.totalSales, currency) },
    { label: "Orders", value: String(stats.orders) },
    { label: "Commission earned", value: formatMoney(stats.commissionEarned, currency) },
    { label: "Pending", value: formatMoney(stats.commissionPending, currency) },
    { label: "Paid out", value: formatMoney(stats.commissionPaid, currency) },
    {
      label: "Conversion rate",
      value: stats.conversionRate === null ? "—" : `${stats.conversionRate}%`,
      note: stats.conversionRate === null ? "Not tracked yet" : undefined,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
            {tile.label}
          </p>
          <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-zinc-900">
            {tile.value}
          </p>
          {tile.note ? <p className="mt-1 text-xs text-zinc-500">{tile.note}</p> : null}
        </div>
      ))}
    </section>
  );
}

function ReferralsTable({ stats, currency }: { stats: MembershipStats; currency: string }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <h2 className="px-6 pt-5 pb-3 text-base font-bold tracking-tight text-zinc-900">
        Recent referrals
      </h2>

      {stats.recentReferrals.length === 0 ? (
        <p className="px-6 pb-8 pt-2 text-sm text-zinc-600">
          No referred orders yet. Share your link or coupon to get started — orders appear here
          within minutes of a sale.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-zinc-100 bg-zinc-50/70 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                <th className="px-6 py-2.5">Order</th>
                <th className="px-6 py-2.5">Date</th>
                <th className="px-6 py-2.5 text-right">Order value</th>
                <th className="px-6 py-2.5 text-right">Your commission</th>
                <th className="px-6 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentReferrals.map((referral) => (
                <tr key={referral.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-6 py-3.5 font-medium text-zinc-900">
                    {referral.orderNumber ?? "—"}
                  </td>
                  <td className="px-6 py-3.5 text-zinc-600">{formatDate(referral.createdAt)}</td>
                  <td className="px-6 py-3.5 text-right tabular-nums text-zinc-900">
                    {formatMoney(referral.orderAmount, currency)}
                  </td>
                  <td className="px-6 py-3.5 text-right tabular-nums text-zinc-900">
                    {referral.commission
                      ? formatMoney(referral.commission.amount, currency)
                      : "—"}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge status={referral.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CommissionsTable({ stats, currency }: { stats: MembershipStats; currency: string }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <h2 className="px-6 pt-5 pb-3 text-base font-bold tracking-tight text-zinc-900">
        Commission history
      </h2>

      {stats.recentCommissions.length === 0 ? (
        <p className="px-6 pb-8 pt-2 text-sm text-zinc-600">
          Nothing here yet. Commissions are created automatically when a referred order comes in.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-zinc-100 bg-zinc-50/70 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                <th className="px-6 py-2.5">Order</th>
                <th className="px-6 py-2.5">Date</th>
                <th className="px-6 py-2.5 text-right">Amount</th>
                <th className="px-6 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCommissions.map((commission) => (
                <tr key={commission.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-6 py-3.5 font-medium text-zinc-900">
                    {commission.referral?.orderNumber ?? "—"}
                  </td>
                  <td className="px-6 py-3.5 text-zinc-600">{formatDate(commission.createdAt)}</td>
                  <td className="px-6 py-3.5 text-right tabular-nums text-zinc-900">
                    {formatMoney(commission.amount, currency)}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge status={commission.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
