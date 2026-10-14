import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";
import { PausedNextActionArt } from "@/components/illustration";
import { formatMoney } from "@/lib/money";
import { formatPayoutNumber } from "@/lib/earning-status";

export type NextActionProps = {
  hasPayoutDetails: boolean;
  pendingPayout: { number: number; amount: number } | null;
  paused: boolean;
  newcomer: boolean;
  currency: string;
  programId: string;
  storeName: string;
};

export function NextActionCard({
  hasPayoutDetails,
  pendingPayout,
  paused,
  newcomer,
  currency,
  programId,
  storeName,
}: NextActionProps) {
  type ActionState = {
    title: string;
    body: React.ReactNode;
    actionLabel: string;
    actionHref: string;
    icon: IconName;
    badgeText: string;
    badgeStyle: string;
  };

  let state: ActionState;

  if (paused) {
    state = {
      title: "Program is paused",
      body: `${storeName} has paused this program. Clicks still work, but new orders won't be credited until it resumes. Everything you've earned is unaffected.`,
      actionLabel: "View program rules",
      actionHref: `/dashboard/program?program=${programId}`,
      icon: "pending",
      badgeText: "Notice",
      badgeStyle: "bg-warn-surface text-warn-ink border-warn-ink/20",
    };
  } else if (!hasPayoutDetails && !newcomer) {
    state = {
      title: "Add your payout details",
      body: `You've earned commissions, but haven't saved payout details yet. Add your Easypaisa, JazzCash or bank details so ${storeName} can pay you.`,
      actionLabel: "Add payout details",
      actionHref: "/dashboard/settings",
      icon: "settings",
      badgeText: "Action needed",
      badgeStyle: "bg-warn-surface text-warn-ink border-warn-ink/20",
    };
  } else if (pendingPayout) {
    state = {
      // A payout exists but hasn't been sent: the merchant pays by hand, so say
      // who sends it rather than implying it is already moving.
      title: "Payment being prepared",
      body: (
        <>
          {storeName} has put {formatMoney(pendingPayout.amount, currency)} into payout{" "}
          {/* Kept whole: "PL-" and "0004" otherwise wrap onto separate lines. */}
          <span className="whitespace-nowrap">{formatPayoutNumber(pendingPayout.number)}</span> and
          will send it to you. Once it&apos;s sent, the date and payment reference appear in Payouts.
        </>
      ),
      actionLabel: "View payout details",
      actionHref: `/dashboard/payouts?program=${programId}`,
      icon: "paid",
      badgeText: "Not sent yet",
      badgeStyle: "bg-info-surface text-info-ink border-info-ink/20",
    };
  } else if (newcomer) {
    state = {
      title: "Ready for your first sale?",
      body: `Share your referral link on social media, your bio, or in DMs. Orders and commissions appear on your dashboard within minutes.`,
      actionLabel: "Get my referral link",
      actionHref: `/dashboard/links?program=${programId}`,
      icon: "share",
      badgeText: "Get started",
      badgeStyle: "bg-brand-surface text-brand-text border-brand-line",
    };
  } else {
    state = {
      title: "Link straight to products",
      body: `A product link takes your followers to the exact item you're talking about, one step closer to buying than the home page. Pick the products you actually use.`,
      actionLabel: "Browse product links",
      actionHref: `/dashboard/links?program=${programId}`,
      icon: "sparkles",
      badgeText: "Next step",
      badgeStyle: "bg-brand-surface text-brand-text border-brand-line",
    };
  }

  return (
    <div
      className={`flex h-full flex-col justify-between rounded-2xl border ${
        paused
          ? "border-warn-line bg-warn-surface/25"
          : "border-line bg-surface"
      } p-6 shadow-xs transition hover:border-line-strong`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${state.badgeStyle}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            <span>{state.badgeText}</span>
          </span>
          {paused ? (
            <PausedNextActionArt className="h-14 w-auto select-none shrink-0" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-muted text-ink-muted">
              <Icon name={state.icon} className="h-4 w-4" />
            </span>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold tracking-tight text-ink">
            {state.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {state.body}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-line-soft">
        <Link
          href={state.actionHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <span>{state.actionLabel}</span>
          <Icon name="chevronRight" className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
