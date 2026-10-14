import "server-only";

import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

export const EARNINGS_PER_PAGE = 25;

export type EarningsFilter = {
  page?: number;
  perPage?: number;
  status?: string;
  query?: string;
};

/**
 * One row per referred order with rich metadata for status, adjustments, and payout references.
 */
export async function getEarnings(
  creatorId: string,
  { page = 1, perPage = EARNINGS_PER_PAGE, status, query }: EarningsFilter = {},
) {
  const where: Prisma.ReferralWhereInput = { creatorId };

  if (query && query.trim()) {
    const cleanQ = query.trim();
    where.orderNumber = { contains: cleanQ, mode: "insensitive" };
  }

  if (status) {
    const normalized = status.toLowerCase();
    if (normalized === "in-review" || normalized === "pending") {
      where.status = { not: "REJECTED" };
      where.commission = { status: "PENDING" };
    } else if (normalized === "approved") {
      where.status = { not: "REJECTED" };
      where.commission = { status: "APPROVED" };
    } else if (normalized === "paid") {
      where.status = { not: "REJECTED" };
      where.commission = { status: "PAID" };
    } else if (normalized === "declined" || normalized === "rejected") {
      where.OR = [{ status: "REJECTED" }, { commission: { status: "REJECTED" } }];
    }
  }

  const [rows, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        orderNumber: true,
        orderAmount: true,
        status: true,
        createdAt: true,
        commission: {
          select: {
            amount: true,
            originalAmount: true,
            status: true,
            rejectionReason: true,
            eligibleAt: true,
            terms: true,
            payout: { select: { id: true, number: true, paidAt: true } },
            adjustments: {
              orderBy: { createdAt: "asc" },
              select: { amount: true, reason: true, createdAt: true },
            },
          },
        },
      },
    }),
    prisma.referral.count({ where }),
  ]);

  return {
    rows,
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

/**
 * Summary totals broken down by status for the top filter strip (EA-1).
 */
export async function getEarningsSummary(creatorId: string) {
  const [countsByReferralStatus, commissionsByStatus] = await Promise.all([
    prisma.referral.groupBy({
      by: ["status"],
      where: { creatorId },
      _count: { _all: true },
    }),
    prisma.commission.groupBy({
      by: ["status"],
      where: { creatorId },
      _count: { _all: true },
      _sum: { amount: true },
    }),
  ]);

  const commMap = Object.fromEntries(
    commissionsByStatus.map((c) => [
      c.status,
      { count: c._count._all, amount: c._sum.amount ?? 0 },
    ]),
  ) as Record<string, { count: number; amount: number }>;

  const refDeclinedCount =
    countsByReferralStatus.find((r) => r.status === "REJECTED")?._count._all ?? 0;

  const inReview = commMap["PENDING"] ?? { count: 0, amount: 0 };
  const approved = commMap["APPROVED"] ?? { count: 0, amount: 0 };
  const paid = commMap["PAID"] ?? { count: 0, amount: 0 };
  const declined = {
    count: (commMap["REJECTED"]?.count ?? 0) + refDeclinedCount,
    amount: commMap["REJECTED"]?.amount ?? 0,
  };

  const totalOrders = countsByReferralStatus.reduce(
    (acc, curr) => acc + curr._count._all,
    0,
  );

  return {
    totalOrders,
    inReview,
    approved,
    paid,
    declined,
  };
}

export type EarningsPage = Awaited<ReturnType<typeof getEarnings>>;
export type EarningRow = EarningsPage["rows"][number];
export type EarningCommission = NonNullable<EarningRow["commission"]>;
export type EarningsSummary = Awaited<ReturnType<typeof getEarningsSummary>>;
