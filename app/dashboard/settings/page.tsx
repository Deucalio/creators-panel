import type { Metadata } from "next";
import { requireCreatorAccount } from "@/lib/auth";
import prisma from "@/lib/db";
import { SettingsClient } from "./settings-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account settings",
};

/**
 * Account settings, deliberately NOT behind `resolveMembership`.
 *
 * Everything here belongs to the account rather than to a program, so a creator
 * whose only application is still PENDING — or who was rejected — must still be
 * able to change their password and fix their name. Gating this on an ACTIVE
 * membership would lock exactly the people most likely to have made a typo
 * during signup out of correcting it.
 */
export default async function SettingsPage({ searchParams }: PageProps<"/dashboard/settings">) {
  const { program } = (await searchParams) as { program?: string };
  const account = await requireCreatorAccount();

  // The payout fields aren't in the shared account selection, since only this
  // page needs them and they shouldn't ride along on every dashboard render.
  const payout = await prisma.creatorAccount.findUnique({
    where: { id: account.id },
    select: { payoutMethod: true, payoutDetails: true },
  });

  const activeMembership =
    account.memberships.find((m) => m.id === program) ?? account.memberships[0];

  return (
    <SettingsClient
      account={{
        id: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
      }}
      payout={{
        method: payout?.payoutMethod ?? null,
        details: payout?.payoutDetails ?? null,
      }}
      programId={program}
      activeProgramName={activeMembership?.program.name ?? "Creator Program"}
    />
  );
}
