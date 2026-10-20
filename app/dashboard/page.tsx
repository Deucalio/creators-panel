import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { requestedProgramId } from "@/lib/auth";
import { getMembershipStats } from "@/lib/creator-stats";
import { getEarnings } from "@/lib/earnings";
import { getEarningsTrend } from "@/lib/trend";
import { CopyField } from "@/components/copy-field";
import { Icon } from "@/components/icon";
import { GettingStarted } from "@/components/getting-started";
import { describeShopperDiscount, membershipLabel, membershipTone } from "@/lib/earning-status";
import { storeLink } from "@/lib/share-links";
import { TrendSection, TREND_PERIODS } from "@/components/trend-section";
import { resolveMembership } from "./guard";
import { storeDisplayName } from "@/lib/store-name";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/badge";
import { HeroEarningsPanel } from "@/components/hero-earnings-panel";
import { NextActionCard } from "@/components/next-action-card";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { RecentEarningsPreview } from "@/components/recent-earnings-preview";
import { EmptyState } from "@/components/empty-state";
import {
  NoActivityArt,
  ReferralLinkArt,
  CouponCodeArt,
  WelcomeHeaderArt,
} from "@/components/illustration";
import { matchPayoutMethod } from "@/lib/payout-methods";
import { isPayoutDetailsConfigured } from "@/lib/pakistan-payouts";
import { formatMoney } from "@/lib/money";

// Earnings must never be served stale.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview",
};

/** How much of the earnings history the overview previews before handing off. */
const PREVIEW_LIMIT = 5;

/** `?days=` comes from the URL, so only the offered periods are honoured. */
function parseDays(value: string | string[] | undefined): number {
  const raw = Number(typeof value === "string" ? value : 30);
  return (TREND_PERIODS as readonly number[]).includes(raw) ? raw : 30;
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { program, days } = await searchParams;
  const resolved = await resolveMembership(requestedProgramId(program));

  if (!resolved.ok) return resolved.screen;

  const { account, membership } = resolved;
  const { program: prog, referralCode } = membership;
  const storeName = storeDisplayName(prog.store);
  const currency = prog.store.currencyCode;

  const [stats, earnings, trend, pendingPayout] = await Promise.all([
    getMembershipStats(membership.id),
    getEarnings(membership.id, { perPage: PREVIEW_LIMIT }),
    getEarningsTrend(membership.id, parseDays(days)),
    prisma.payout.findFirst({
      where: {
        creatorId: membership.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
      select: { number: true, amount: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const referralLink = storeLink(prog.store, referralCode);
  const couponEnabled = prog.trackingConfig?.couponTrackingEnabled ?? false;
  const paused = prog.status !== "ACTIVE";
  const shopperDiscount = describeShopperDiscount(
    prog.trackingConfig?.couponDiscountType,
    prog.trackingConfig?.couponDiscountValue,
    currency,
  );

  // Validated against Pakistan payout methods: Easypaisa / JazzCash require a number; Bank transfer requires IBAN/Bank name.
  const hasPayoutDetails = isPayoutDetailsConfigured(
    account.payoutMethod,
    account.payoutDetails,
  );
  const newcomer = stats.orders === 0;
  // Day one: nothing referred yet and the program is running. The page then
  // shows how it works and the link, not a column of zeros under five buttons
  // that all say "get your link". Clicks still show once there are any — the
  // first sign the link works. (`orders` leaves out rejected ones, so the
  // earnings count decides whether there's any history at all.)
  const firstDay = newcomer && !paused && earnings.total === 0;

  const shareSection = (
    <section id="share" className="space-y-4 pt-1" aria-labelledby="share-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-10 w-10 rounded-xl grid place-items-center bg-brand-surface text-brand-text shrink-0">
            <Icon name="share" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="share-title" className="text-xl font-bold tracking-tight text-ink leading-tight">
              Share and earn
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">
              Promote {storeName} with your custom link or checkout code
            </p>
          </div>
        </div>
        <Link
          href={`/dashboard/links?program=${membership.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-line bg-brand-surface px-3.5 py-2 text-xs font-semibold text-brand-text hover:bg-surface transition shadow-2xs"
        >
          <span>Product links &amp; QR</span>
          <Icon name="arrow" className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5 items-stretch">
        {/* My referral link card (3 cols) */}
        <article className="rounded-2xl border border-line bg-surface p-6 shadow-xs lg:col-span-3 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-base text-ink">My referral link</h3>
              <p className="mt-1 text-xs text-ink-muted">
                Orders placed through this link are credited to you.
              </p>
            </div>
            <ReferralLinkArt className="h-20 sm:h-24 w-auto select-none shrink-0 hidden sm:block -mt-2 -mb-4" />
          </div>

          <div className="flex-1 flex flex-col justify-center my-1">
            <CopyField
              label=""
              value={referralLink}
              shareable
            />
          </div>

          <div className="mt-auto">
            {paused ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-warn-ink/20 bg-warn-surface px-3.5 py-2.5 text-xs text-ink leading-relaxed">
                <span className="h-5 w-5 rounded-md grid place-items-center bg-warn-ink/15 text-warn-ink shrink-0 font-bold text-[10px]">
                  ⏸
                </span>
                <p>
                  <strong className="font-semibold text-warn-ink">Paused for now.</strong> Clicks still work, but new orders won&apos;t be credited until the merchant reopens the program.
                </p>
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-ink-subtle">
                Share this anywhere. Anyone who clicks is credited to you for 30 days.
              </p>
            )}
          </div>
        </article>

        {/* My coupon code card (2 cols) */}
        <article className="rounded-2xl border border-line bg-surface p-6 shadow-xs lg:col-span-2 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-base text-ink">My coupon code</h3>
              {couponEnabled ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ok-surface text-ok-ink border border-ok-ink/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok-ink" aria-hidden="true" />
                  <span>Active discount</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-muted text-ink-muted border border-line">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-subtle" aria-hidden="true" />
                  <span>Not enabled</span>
                </span>
              )}
            </div>
            <CouponCodeArt enabled={couponEnabled} className="h-20 sm:h-24 w-auto select-none shrink-0 hidden sm:block -mt-2 -mb-4" />
          </div>

          <div className="flex-1 flex flex-col justify-center my-1">
            {couponEnabled ? (
              <CopyField
                label=""
                value={referralCode}
                emphasis
                hint={
                  shopperDiscount
                    ? `Your followers get ${shopperDiscount} with this code, and the sale is credited to you.`
                    : "For followers who won't click a link — they enter this at checkout instead."
                }
              />
            ) : (
              <p className="text-xs sm:text-sm leading-relaxed text-ink-muted">
                {storeName} hasn&apos;t enabled coupon tracking for this program. Use your referral link above to earn commissions.
              </p>
            )}
          </div>

          <div className="mt-auto pt-2">
            {!couponEnabled ? (
              <Link
                href={`/dashboard/links?program=${membership.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface hover:bg-surface-muted px-4 py-2.5 text-xs font-semibold text-ink transition shadow-2xs"
              >
                <span>Browse product links</span>
                <Icon name="arrow" className="h-3 w-3" />
              </Link>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );

  return (
    <div className="flex flex-col gap-6">
      {resolved.notice}

      {/* Missing Payout Method Banner */}
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
                {pendingPayout
                  ? `${storeName} has a payout of ${formatMoney(pendingPayout.amount, currency)} waiting to be sent to you. Add your payout details to receive it.`
                  : `Add your Easypaisa, JazzCash or bank details so ${storeName} can send your commissions.`}
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

      {/* Page Header (OV-6) */}
      <PageHeader
        title={`Welcome back, ${account.firstName}`}
        description={`Track your referred orders, commissions, and performance in ${prog.name}.`}
        badge={
          <Badge tone={membershipTone(membership.status, prog.status)}>
            {membershipLabel(membership.status, prog.status)}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-4">
            <WelcomeHeaderArt className="h-28 sm:h-32 w-auto select-none shrink-0 hidden xl:block" />
            <Link
              href={`/dashboard/links?program=${membership.id}`}
              // Desktop only: on a phone the top bar's Share button is right above.
              className="hidden items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-brand-ink transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 lg:inline-flex shadow-2xs"
            >
              <Icon name="share" className="h-3.5 w-3.5" />
              <span>Share links</span>
            </Link>
          </div>
        }
        meta={
          <p className="text-xs text-ink-subtle">
            Partner store: <span className="font-semibold text-ink">{storeName}</span> ·{" "}
            <Link
              href={`/dashboard/program?program=${membership.id}`}
              className="font-medium text-brand-text hover:underline"
            >
              View commission rules
            </Link>
          </p>
        }
      />

      {/* Day-one Onboarding checklist (OV-9) */}
      {newcomer && !paused ? (
        <GettingStarted
          programId={membership.id}
          couponEnabled={couponEnabled}
          referralCode={referralCode}
        />
      ) : null}

      {/* Share and earn section - Consistent top placement across both programs */}
      {shareSection}

      {/* Row 1: Hero Earnings Panel (8 cols) + Next Action Card (4 cols) (OV-1, OV-2, OV-5).
          Not on day one: every figure is 0, and the card repeats Getting started. */}
      {firstDay ? null : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <HeroEarningsPanel stats={stats} currency={currency} storeName={storeName} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <NextActionCard
              hasPayoutDetails={hasPayoutDetails}
              pendingPayout={pendingPayout}
              paused={paused}
              newcomer={newcomer}
              currency={currency}
              programId={membership.id}
              storeName={storeName}
            />
          </div>
        </div>
      )}

      {firstDay && stats.clicks === 0 ? (
        <div className="rounded-2xl border border-line bg-surface shadow-xs">
          <EmptyState
            art={<NoActivityArt />}
            title="Your numbers will show up here"
            body="Clicks, orders and what you've earned appear on this page as soon as people use your link. Orders usually show up within minutes."
          />
        </div>
      ) : (
        <>
          {/* Row 2: Balanced 4-Metric Grid (3 cols each = 12 cols, nothing stranded) (OV-1) */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Reach &amp; conversion metrics
            </h2>
            <PerformanceMetrics stats={stats} currency={currency} />
          </div>

          {/* Row 3: Trend Section (8 cols) + Recent Earnings (4 cols) (OV-3, OV-4, OV-8).
              Day one has no orders to list, so the trend takes the full width. */}
          {firstDay ? (
            <TrendSection trend={trend} currency={currency} programId={membership.id} />
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <TrendSection trend={trend} currency={currency} programId={membership.id} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <RecentEarningsPreview
                  rows={earnings.rows}
                  currency={currency}
                  total={earnings.total}
                  programId={membership.id}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
