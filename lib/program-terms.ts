import "server-only";

import prisma from "@/lib/db";

/**
 * The rules a creator is actually earning under.
 *
 * The join page promises "15% of every sale" and then that number vanishes the
 * moment they become a member — while the dashboard was fetching
 * `commissionConfig` on every load and throwing it away. Worse, a program can
 * carry per-product overrides, new-vs-returning rates and a minimum order value
 * that silently decide whether an order earns anything at all.
 *
 * Product rules keep `productTitle` denormalised, so naming the products costs
 * no Admin API call from here.
 */
export async function getProgramTerms(programId: string) {
  const [config, productRules, customerRules, tracking] = await Promise.all([
    prisma.commissionConfig.findUnique({
      where: { programId },
      select: { type: true, amount: true, minimumOrderValue: true, holdDays: true },
    }),
    prisma.productCommissionRule.findMany({
      where: { programId },
      orderBy: { productTitle: "asc" },
      select: { id: true, productTitle: true, productHandle: true, type: true, amount: true },
    }),
    prisma.customerCommissionRule.findMany({
      where: { programId },
      select: { id: true, customerType: true, type: true, amount: true },
    }),
    prisma.trackingConfig.findUnique({
      where: { programId },
      select: {
        linkTrackingEnabled: true,
        couponTrackingEnabled: true,
        couponDiscountType: true,
        couponDiscountValue: true,
      },
    }),
  ]);

  return { config, productRules, customerRules, tracking };
}

export type ProgramTerms = Awaited<ReturnType<typeof getProgramTerms>>;
