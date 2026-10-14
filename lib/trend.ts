import "server-only";

import prisma from "@/lib/db";

/**
 * Earnings over time for one membership.
 *
 * The merchant dashboard has had a chart since Phase 1; the creator got seven
 * flat lifetime numbers and no sense of direction. Commission is bucketed by
 * `Commission.createdAt` — when it was earned — so a bar lines up with the day
 * the sale happened rather than the day a merchant got round to approving it.
 *
 * Rejected commissions are excluded, matching `commissionEarned` on the stats:
 * they were never earned, so they should not raise a bar.
 */
export async function getEarningsTrend(creatorId: string, days: number) {
  // Buckets are whole local days. `end` is tomorrow at 00:00 so today's
  // activity lands in the last bucket rather than being cut off mid-day.
  const end = startOfDay(new Date());
  end.setDate(end.getDate() + 1);

  const start = new Date(end);
  start.setDate(start.getDate() - days);

  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - days);

  const earned = { status: { not: "REJECTED" as const } };

  const [commissions, referralCount, clicks, prevCommissions, prevReferrals, prevClicks] =
    await Promise.all([
      prisma.commission.findMany({
        where: { creatorId, ...earned, createdAt: { gte: start, lt: end } },
        select: { amount: true, createdAt: true },
      }),
      prisma.referral.count({
        where: { creatorId, status: { not: "REJECTED" }, createdAt: { gte: start, lt: end } },
      }),
      prisma.click.findMany({
        where: { creatorId, createdAt: { gte: start, lt: end } },
        select: { createdAt: true },
      }),
      prisma.commission.aggregate({
        where: { creatorId, ...earned, createdAt: { gte: previousStart, lt: start } },
        _sum: { amount: true },
      }),
      prisma.referral.count({
        where: {
          creatorId,
          status: { not: "REJECTED" },
          createdAt: { gte: previousStart, lt: start },
        },
      }),
      prisma.click.count({ where: { creatorId, createdAt: { gte: previousStart, lt: start } } }),
    ]);

  // Above ~a month, daily bars stop being readable — especially on a phone,
  // which is where most creators open this.
  const bucketDays = days > 31 ? 7 : 1;
  const buckets = buildBuckets(start, end, bucketDays);

  for (const commission of commissions) {
    const bucket = bucketFor(buckets, commission.createdAt, start, bucketDays);
    if (bucket) bucket.commission += commission.amount;
  }
  for (const click of clicks) {
    const bucket = bucketFor(buckets, click.createdAt, start, bucketDays);
    if (bucket) bucket.clicks += 1;
  }

  const commissionTotal = commissions.reduce((sum, c) => sum + c.amount, 0);

  return {
    days,
    bucketDays,
    buckets: buckets.map((b) => ({ ...b, commission: round2(b.commission) })),
    totals: {
      commission: round2(commissionTotal),
      orders: referralCount,
      clicks: clicks.length,
    },
    previous: {
      commission: round2(prevCommissions._sum.amount ?? 0),
      orders: prevReferrals,
      clicks: prevClicks,
    },
  };
}

export type EarningsTrend = Awaited<ReturnType<typeof getEarningsTrend>>;
export type TrendBucket = EarningsTrend["buckets"][number];

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function buildBuckets(start: Date, end: Date, bucketDays: number) {
  const buckets: { start: Date; end: Date; commission: number; clicks: number }[] = [];

  for (let cursor = new Date(start); cursor < end; ) {
    const bucketEnd = new Date(cursor);
    bucketEnd.setDate(bucketEnd.getDate() + bucketDays);
    buckets.push({
      start: new Date(cursor),
      end: bucketEnd > end ? new Date(end) : bucketEnd,
      commission: 0,
      clicks: 0,
    });
    cursor = bucketEnd;
  }

  return buckets;
}

/**
 * Index arithmetic rather than a scan: with 90 days of clicks this runs once
 * per row, and a linear search per row would be quadratic for no reason.
 */
function bucketFor<T>(buckets: T[], at: Date, start: Date, bucketDays: number): T | undefined {
  const dayOffset = Math.floor((startOfDay(at).getTime() - start.getTime()) / 86_400_000);
  return buckets[Math.floor(dayOffset / bucketDays)];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
