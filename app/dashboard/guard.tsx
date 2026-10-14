import Link from "next/link";
import {
  requireCreatorAccount,
  selectMembership,
  type CreatorAccountWithMemberships,
  type Membership,
} from "@/lib/auth";
import { Badge } from "@/components/badge";
import { membershipTone, titleCase } from "@/lib/earning-status";
import { EmptyState } from "@/components/empty-state";
import { NoProgramsArt, PausedProgramArt } from "@/components/illustration";
import { storeDisplayName } from "@/lib/store-name";

// Explicit `ok` discriminant rather than testing `screen` for truthiness:
// React.ReactNode legitimately includes null and "", so a truthiness check
// would not narrow this union reliably.
type Resolved =
  | { ok: false; screen: React.ReactNode; notice?: never }
  | {
      ok: true;
      account: CreatorAccountWithMemberships;
      membership: Membership;
      /**
       * Rendered above the page when the membership is fine but the *program*
       * is not. Not a blocking screen: everything already earned stays valid
       * and worth reading, so only the "keep sharing" story changes.
       */
      notice: React.ReactNode | null;
    };

/**
 * A membership that was approved at some point and has since been paused or
 * ended. Its earnings and payouts are still real — some may still be owed — so
 * the record pages stay open to it. One that was never approved has none.
 */
function hasHistory(membership: Membership): boolean {
  return (
    (membership.status === "INACTIVE" || membership.status === "REJECTED") &&
    membership.approvedAt != null
  );
}

/**
 * The guard every dashboard page runs before rendering anything.
 *
 * Kept in one place so Overview, Earnings and the pages phases 10-13 add cannot
 * drift apart on who is allowed to see what — a page that forgot the ACTIVE
 * check would show a pending applicant a referral link that earns them nothing.
 *
 * `allowHistory` is for the pages that are a record rather than a tool —
 * Earnings and Payouts. A creator the merchant has paused still has commissions
 * waiting to be paid and payouts to check; blocking those pages told them
 * "your existing earnings are unaffected" while hiding every one of them.
 */
export async function resolveMembership(
  requestedProgram: string | undefined,
  { allowHistory = false }: { allowHistory?: boolean } = {},
): Promise<Resolved> {
  const account = await requireCreatorAccount();
  const membership = selectMembership(account, requestedProgram);

  if (!membership) return { ok: false, screen: <NoPrograms /> };

  const storeName = storeDisplayName(membership.program.store);

  if (membership.status !== "ACTIVE" && allowHistory && hasHistory(membership)) {
    return {
      ok: true,
      account,
      membership,
      notice: (
        <MembershipEndedNotice
          status={membership.status}
          statusReason={membership.statusReason}
          storeName={storeName}
          programName={membership.program.name}
        />
      ),
    };
  }

  if (membership.status !== "ACTIVE") {
    return {
      ok: false,
      screen: (
        <NotActive
          status={membership.status}
          statusReason={membership.statusReason}
          storeName={storeName}
          programName={membership.program.name}
          firstName={account.firstName}
          supportEmail={membership.program.store.supportEmail}
          historyFor={hasHistory(membership) ? membership.id : null}
        />
      ),
    };
  }

  return {
    ok: true,
    account,
    membership,
    // The creator is active but their merchant has paused the whole program.
    // `attributeOrder` rejects those orders, so without this the portal keeps
    // telling them sales through their link are credited — which is false.
    notice:
      membership.program.status === "ACTIVE" ? null : (
        <ProgramPausedNotice storeName={storeName} programName={membership.program.name} />
      ),
  };
}

/** Above Earnings and Payouts for a membership that has been paused or ended. */
function MembershipEndedNotice({
  status,
  statusReason,
  storeName,
  programName,
}: {
  status: string;
  statusReason: string | null;
  storeName: string;
  programName: string;
}) {
  const reason = statusReason?.trim();
  return (
    <div className="rounded-2xl border border-warn-line bg-warn-surface p-5 text-ink shadow-2xs">
      <p className="text-xs font-bold text-warn">
        {status === "INACTIVE"
          ? `${storeName} has paused your membership of ${programName}`
          : `Your membership of ${programName} has ended`}
      </p>
      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-muted">
        New orders aren&apos;t credited to you, but everything below stays yours: commissions
        already approved are still paid out as normal.
      </p>
      {reason ? (
        <p className="mt-2 max-w-2xl text-xs text-ink-muted">
          &ldquo;{reason}&rdquo; — {storeName}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A banner rather than a takeover.
 *
 * A paused program does not invalidate anything: past commissions, payouts and
 * the record of what was earned all stay true and worth looking at. The only
 * thing that stops being true is that sharing the link earns anything today, so
 * that is the only thing this corrects.
 */
function ProgramPausedNotice({
  storeName,
  programName,
}: {
  storeName: string;
  programName: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-warn-line bg-warn-surface px-6 py-5 text-ink shadow-xs">
      <div className="space-y-1 max-w-xl">
        <h2 className="text-sm font-bold text-warn">{programName} is paused</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          {storeName} has paused this program, so new orders through your link or code
          won&apos;t be credited to you until they turn it back on. Everything you&apos;ve already
          earned is unaffected.
        </p>
      </div>
      <PausedProgramArt className="h-16 w-auto shrink-0 select-none hidden sm:block" />
    </div>
  );
}

function NoPrograms() {
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-xs">
      <EmptyState
        art={<NoProgramsArt />}
        title="No programs yet"
        body="You aren't part of any creator program. Merchants invite creators with a signup link — ask the brand you want to work with for theirs."
      />
    </div>
  );
}

function NotActive({
  status,
  statusReason,
  storeName,
  programName,
  firstName,
  supportEmail,
  historyFor,
}: {
  status: string;
  statusReason: string | null;
  storeName: string;
  programName: string;
  firstName: string;
  supportEmail: string | null;
  /** The membership id, when there are past earnings worth routing to. */
  historyFor: string | null;
}) {
  const copy: Record<string, { title: string; body: string }> = {
    PENDING: {
      title: `Your application is under review, ${firstName}`,
      body: `${storeName} is reviewing your application to ${programName}. There's nothing else for you to do — when they approve it, your referral link and coupon code appear right here and you can start earning. Sign in any time to check.`,
    },
    REJECTED: {
      title: "This application wasn't approved",
      body: `${storeName} didn't approve your application to ${programName}.`,
    },
    INACTIVE: {
      title: "This membership is paused",
      body: `${storeName} has paused your membership of ${programName}. Your existing earnings are unaffected, but new referrals won't be tracked.`,
    },
  };

  const { title, body } = copy[status] ?? copy.PENDING;
  const reason = statusReason?.trim();

  return (
    <div className="rounded-2xl border border-line bg-surface p-8 shadow-xs">
      <div className="flex flex-col items-start gap-3">
        <Badge tone={membershipTone(status)}>{titleCase(status)}</Badge>
        <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="max-w-xl text-xs leading-relaxed text-ink-muted">{body}</p>

        {/* The merchant's own words, quoted rather than paraphrased */}
        {reason ? (
          <figure className="mt-2 max-w-xl border-l-2 border-line pl-4">
            <blockquote className="text-xs leading-relaxed text-ink">{reason}</blockquote>
            <figcaption className="mt-1 text-[11px] text-ink-subtle">— {storeName}</figcaption>
          </figure>
        ) : null}

        {/* "Your existing earnings are unaffected" has to be checkable */}
        {historyFor ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/earnings?program=${historyFor}`}
              className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover"
            >
              Your earnings
            </Link>
            <Link
              href={`/dashboard/payouts?program=${historyFor}`}
              className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-2xs transition hover:border-line-strong hover:bg-surface-muted"
            >
              Payouts
            </Link>
          </div>
        ) : null}

        {supportEmail ? (
          <p className="mt-2 text-xs text-ink-muted">
            Questions?{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="font-semibold text-brand hover:underline underline-offset-2"
            >
              {supportEmail}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
