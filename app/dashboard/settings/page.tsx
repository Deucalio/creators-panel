import type { Metadata } from "next";
import Link from "next/link";
import { requireCreatorAccount } from "@/lib/auth";
import prisma from "@/lib/db";
import { Badge } from "@/components/badge";
import { matchPayoutMethod } from "@/lib/payout-methods";
import {
  ProfileForm,
  EmailForm,
  PasswordForm,
  PayoutForm,
  RemovePayoutForm,
} from "./settings-forms";

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

  // Configured means a merchant could actually pay: a method they send through
  // (not an older "Wise") and the details for it. Removal is offered for
  // anything stored, payable or not.
  const hasPayoutConfigured = Boolean(
    matchPayoutMethod(payout?.payoutMethod) && payout?.payoutDetails,
  );
  const hasStoredPayout = Boolean(payout?.payoutMethod || payout?.payoutDetails);

  return (
    <div className="flex flex-col gap-6">
      {program ? (
        <div>
          <Link
            href={`/dashboard?program=${encodeURIComponent(program)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline underline-offset-2"
          >
            ← Back to Dashboard
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Account settings</h1>
        <p className="text-sm text-ink-muted">
          These apply to your PartnerLoop account across every program you belong to.
        </p>
      </div>

      {/* How you get paid - placed high or prominent since it's money-critical */}
      <Section
        title="How you get paid"
        description="Merchants pay you manually, so they need to know where to send your earnings."
        badge={
          hasPayoutConfigured ? (
            <Badge tone="ok">Configured</Badge>
          ) : (
            <Badge tone="warn">Action needed</Badge>
          )
        }
      >
        <PayoutForm
          payoutMethod={payout?.payoutMethod ?? ""}
          payoutDetails={payout?.payoutDetails ?? ""}
        />
        <RemovePayoutForm hasDetails={hasStoredPayout} />
      </Section>

      <Section
        title="Your name"
        description="Shown to the merchants whose programs you've joined."
      >
        <ProfileForm firstName={account.firstName} lastName={account.lastName} />
      </Section>

      <Section title="Email address" description="What you sign in with.">
        <EmailForm email={account.email} />
      </Section>

      <Section
        title="Password"
        description="You'll stay signed in here. Any other devices signed in to your account are signed out."
      >
        <PasswordForm />
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
            {badge}
          </div>
          <p className="text-xs text-ink-muted">{description}</p>
        </div>
      </div>
      <div className="max-w-md">{children}</div>
    </section>
  );
}
