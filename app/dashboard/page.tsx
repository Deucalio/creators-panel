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
import { describeShopperDiscount, membershipTone, titleCase } from "@/lib/earning-status";
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
import { matchPayoutMethod } from "@/lib/payout-methods";

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

  // A method no merchant pays through (an older "Wise") counts as missing.
  const hasPayoutDetails = Boolean(
    matchPayoutMethod(account.payoutMethod) && account.payoutDetails?.trim(),
  );
  const newcomer = stats.orders === 0;

  const shareSection = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-ink">Share and earn</h2>
          <p className="text-xs text-ink-subtle">
            Promote {storeName} with your custom link or checkout code
          </p>
        </div>
        <Link
          href={`/dashboard/links?program=${membership.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text hover:underline"
        >
          <span>Product links &amp; QR</span>
          <Icon name="arrow" className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
          <CopyField
            label="My referral link"
            value={referralLink}
            shareable
            hint={
              paused
                ? "Paused for now — clicks still work, but new orders won't be credited until the merchant reopens the program."
                : "Share this anywhere. Anyone who clicks is credited to you for 30 days."
            }
          />
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
          {couponEnabled ? (
            <CopyField
              label="My coupon code"
              value={referralCode}
              emphasis
              hint={
                shopperDiscount
                  ? `Your followers get ${shopperDiscount} with this code, and the sale is credited to you.`
                  : "For followers who won't click a link — they enter this at checkout instead."
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-ink-muted">
                My coupon code
              </label>
              <p className="text-xs leading-relaxed text-ink-subtle">
                {storeName} hasn&apos;t enabled coupon tracking for this program. Use your referral
                link above to earn commissions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {resolved.notice}

      {/* Page Header (OV-6) */}
      <PageHeader
        title={`Welcome back, ${account.firstName}`}
        description={`Track your referred orders, commissions, and performance in ${prog.name}.`}
        badge={
          <Badge tone={membershipTone(membership.status)}>
            {titleCase(membership.status)}
          </Badge>
        }
        actions={
          <Link
            href={`/dashboard/links?program=${membership.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-ink transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <Icon name="share" className="h-3.5 w-3.5" />
            <span>Share links</span>
          </Link>
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

      {/* For newcomers, put the sharing strip right under getting started */}
      {newcomer ? shareSection : null}

      {/* Row 1: Hero Earnings Panel (8 cols) + Next Action Card (4 cols) (OV-1, OV-2, OV-5) */}
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

      {/* Row 2: Balanced 4-Metric Grid (3 cols each = 12 cols, nothing stranded) (OV-1) */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
          Reach &amp; Conversion Metrics
        </h2>
        <PerformanceMetrics stats={stats} currency={currency} />
      </div>

      {/* Row 3: Trend Section (8 cols) + Recent Earnings (4 cols) (OV-3, OV-4, OV-8) */}
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

      {/* Row 4: Share strip for established creators */}
      {!newcomer ? shareSection : null}
    </div>
  );
}
