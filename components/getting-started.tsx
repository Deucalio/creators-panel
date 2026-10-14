import Link from "next/link";
import { Icon } from "@/components/icon";

/**
 * What to do on day one.
 *
 * A newly-approved creator's dashboard is seven zeros, an empty chart and an
 * empty table — all technically correct and completely silent about the fact
 * that sharing the link is the entire job. This says it once, in three steps,
 * and gets out of the way.
 *
 * No dismiss control and no stored state: it disappears on its own the moment a
 * first order lands, which is exactly when it stops being true. A dismissible
 * banner would need a column, a mutation and a decision about whether it ever
 * comes back.
 */
export function GettingStarted({
  programId,
  couponEnabled,
  referralCode,
}: {
  programId: string;
  couponEnabled: boolean;
  referralCode: string;
}) {
  const steps = [
    {
      title: "Grab your link",
      body: couponEnabled
        ? `Your link, or the code ${referralCode} for people who won't click one.`
        : "It's yours alone — every sale through it is credited to you.",
    },
    {
      title: "Share it anywhere",
      body: "A post, a story, a bio, a DM. Anyone who clicks stays credited to you for 30 days.",
    },
    {
      title: "Get paid",
      body: "Orders appear here within minutes. The merchant approves your commission, then pays it out.",
    },
  ];

  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface p-6">
      <h2 className="text-base font-bold tracking-tight text-ink">
        You&apos;re in. Here&apos;s how this works
      </h2>

      <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-ink">
              {index + 1}
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-ink">{step.title}</p>
              <p className="text-xs leading-relaxed text-ink-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/dashboard/links?program=${programId}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Get my link
          <Icon name="arrow" className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={`/dashboard/program?program=${programId}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line px-4 py-2 text-sm font-semibold text-brand-text transition hover:bg-surface"
        >
          What I earn
        </Link>
      </div>
    </section>
  );
}
