import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSessionAccountId } from "@/lib/session";
import { pickMembership } from "@/lib/membership-choice";

/**
 * The signed-in account with every program it belongs to, or null.
 *
 * A cookie pointing at an account that no longer exists resolves to null rather
 * than throwing, so a stale session simply reads as signed out.
 *
 * Wrapped in `cache()` because the dashboard layout and the page inside it both
 * need this on the same request — without it every navigation runs the query
 * twice.
 */
export const getCreatorAccount = cache(async () => {
  const accountId = await getSessionAccountId();
  if (!accountId) return null;

  return prisma.creatorAccount.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      payoutMethod: true,
      payoutDetails: true,
      memberships: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          referralCode: true,
          status: true,
          statusReason: true,
          approvedAt: true,
          createdAt: true,
          program: {
            select: {
              id: true,
              name: true,
              status: true,
              commissionConfig: true,
              trackingConfig: true,
              store: {
                select: {
                  shop: true,
                  name: true,
                  primaryDomain: true,
                  currencyCode: true,
                  supportEmail: true,
                },
              },
            },
          },
        },
      },
    },
  });
});

export type CreatorAccountWithMemberships = NonNullable<
  Awaited<ReturnType<typeof getCreatorAccount>>
>;

export type Membership = CreatorAccountWithMemberships["memberships"][number];

export async function requireCreatorAccount(): Promise<CreatorAccountWithMemberships> {
  const account = await getCreatorAccount();
  if (!account) redirect("/login");
  return account;
}

/**
 * Resolve `?program=` to one of the account's own memberships.
 *
 * The lookup runs over `account.memberships`, so an id belonging to somebody
 * else cannot match — it falls through to the creator's own default instead of
 * erroring. That is the whole tenancy check for this parameter, which is why it
 * lives in one place rather than being re-typed in every page.
 *
 * Defaults to the first ACTIVE membership so a creator who has been approved
 * somewhere lands on earnings rather than on a pending application.
 */
export function selectMembership(
  account: CreatorAccountWithMemberships,
  requested: string | undefined,
): Membership | undefined {
  return pickMembership(account.memberships, requested);
}

/** Read `?program=` out of a page's searchParams, ignoring array/undefined forms. */
export function requestedProgramId(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
