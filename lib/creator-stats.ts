import "server-only";

import prisma from "@/lib/db";

/**
 * Headline totals for one program membership.
 *
 * The recent-activity lists that used to live here moved to `lib/earnings.ts`:
 * they were two queries rendering the same 1:1 events, and the pages that show
 * them want different lengths of the same list.
 *
 * Conversion rate stays nullable, but only because a creator with no recorded
 * clicks has no rate — showing 0% would tell them their audience isn't buying,
 * when in fact nobody has visited yet. Those are very different messages to put
 * in front of someone whose income depends on the number.
 */
export async function getMembershipStats(creatorId: string) {
  const [referralTotals, commissionsByStatus, clicks] = await Promise.all([
    prisma.referral.aggregate({
      where: { creatorId, status: { not: "REJECTED" } },
      _sum: { orderAmount: true },
      _count: { _all: true },
    }),
    prisma.commission.groupBy({
      by: ["status"],
      where: { creatorId },
      _sum: { amount: true },
    }),
    prisma.click.count({ where: { creatorId } }),
  ]);

  const byStatus = Object.fromEntries(
    commissionsByStatus.map((row) => [row.status, row._sum.amount ?? 0]),
  ) as Partial<Record<"PENDING" | "APPROVED" | "PAID" | "REJECTED", number>>;

  const pending = byStatus.PENDING ?? 0;
  const approved = byStatus.APPROVED ?? 0;
  const paid = byStatus.PAID ?? 0;

  return {
    totalSales: referralTotals._sum.orderAmount ?? 0,
    orders: referralTotals._count._all,
    // Rejected commissions are excluded — they were never earned.
    commissionEarned: pending + approved + paid,
    commissionPending: pending,
    commissionApproved: approved,
    commissionPaid: paid,
    clicks,
    conversionRate:
      clicks > 0
        ? Number(((referralTotals._count._all / clicks) * 100).toFixed(1))
        : (null as number | null),
  };
}

export type MembershipStats = Awaited<ReturnType<typeof getMembershipStats>>;
