import "server-only";

import prisma from "@/lib/db";
import { owedBackOn } from "@/lib/earning-status";

/**
 * Payout history for one membership.
 *
 * The portal showed a single "Paid out" total and nothing else, so a creator
 * could not answer "did you pay me for October?" without asking the merchant.
 * Every field here — the PL-0001 number, the method, the merchant's own
 * reference — was recorded in Phase 6 and never surfaced.
 *
 * Commissions are included so a payout can show which orders it settled. That
 * is the whole point of a reference: being able to check it.
 */
export async function getPayouts(creatorId: string) {
  return prisma.payout.findMany({
    where: { creatorId },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      number: true,
      amount: true,
      status: true,
      method: true,
      reference: true,
      note: true,
      paidAt: true,
      createdAt: true,
      commissions: {
        select: {
          id: true,
          amount: true,
          referral: { select: { orderNumber: true } },
        },
      },
    },
  });
}

/**
 * What the creator owes back after a refund landed on already-paid commission.
 *
 * Mirrors `getCreatorBalances` on the merchant side deliberately, through the
 * same per-commission rule (`owedBackOn`): a PAID commission freezes its
 * `amount` because money that has left cannot be un-sent, so a refund after
 * payment lives in the ledger as a debt. A refund *before* payment is not one —
 * it already lowered what was sent.
 */
export async function getOwedBack(creatorId: string): Promise<number> {
  const commissions = await prisma.commission.findMany({
    where: { creatorId, status: "PAID", adjustments: { some: {} } },
    select: {
      status: true,
      amount: true,
      originalAmount: true,
      adjustments: { select: { amount: true } },
    },
  });

  const owed = commissions.reduce((sum, commission) => sum + owedBackOn(commission), 0);
  return Math.round(owed * 100) / 100;
}

export type Payout = Awaited<ReturnType<typeof getPayouts>>[number];
