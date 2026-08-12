import "server-only";

import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSessionAccountId } from "@/lib/session";

/**
 * The signed-in account with every program it belongs to, or null.
 *
 * A cookie pointing at an account that no longer exists resolves to null rather
 * than throwing, so a stale session simply reads as signed out.
 */
export async function getCreatorAccount() {
  const accountId = await getSessionAccountId();
  if (!accountId) return null;

  return prisma.creatorAccount.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      memberships: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          referralCode: true,
          status: true,
          approvedAt: true,
          createdAt: true,
          program: {
            select: {
              id: true,
              name: true,
              status: true,
              commissionConfig: true,
              trackingConfig: true,
              store: { select: { shop: true, currencyCode: true } },
            },
          },
        },
      },
    },
  });
}

export type CreatorAccountWithMemberships = NonNullable<
  Awaited<ReturnType<typeof getCreatorAccount>>
>;

export type Membership = CreatorAccountWithMemberships["memberships"][number];

export async function requireCreatorAccount(): Promise<CreatorAccountWithMemberships> {
  const account = await getCreatorAccount();
  if (!account) redirect("/login");
  return account;
}
