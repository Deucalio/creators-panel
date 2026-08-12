import "server-only";

import prisma from "@/lib/db";

const RECENT_LIMIT = 10;

/**
 * Earnings for one program membership.
 *
 * Conversion rate is reported as null rather than 0: it needs attributed clicks
 * and there is no Click model yet, so any number here would be unsupported.
 * Once click tracking lands this becomes orders / clicks.
 */
export async function getMembershipStats(creatorId: string) {
  const [referralTotals, commissionsByStatus, recentReferrals, recentCommissions] =
    await Promise.all([
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
      prisma.referral.findMany({
        where: { creatorId },
        orderBy: { createdAt: "desc" },
        take: RECENT_LIMIT,
        select: {
          id: true,
          orderNumber: true,
          orderAmount: true,
          status: true,
          createdAt: true,
          commission: { select: { amount: true, status: true } },
        },
      }),
      prisma.commission.findMany({
        where: { creatorId },
        orderBy: { createdAt: "desc" },
        take: RECENT_LIMIT,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          referral: { select: { orderNumber: true } },
        },
      }),
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
    conversionRate: null as number | null,
    recentReferrals,
    recentCommissions,
  };
}

export type MembershipStats = Awaited<ReturnType<typeof getMembershipStats>>;
