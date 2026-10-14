import Link from "next/link";
import { Icon } from "@/components/icon";

/**
 * The shape every "nothing here yet" screen shares.
 *
 * Previously each one was a grey sentence in a box, so "No payouts yet", "No
 * orders yet" and "No programs yet" were three different situations that looked
 * identical and none of them told a creator what to do about it.
 *
 * `action` is the important part: an empty state that only describes emptiness
 * is a dead end, and on day one a creator's whole screen is dead ends.
 */
export function EmptyState({
  art,
  title,
  body,
  action,
}: {
  art: React.ReactNode;
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      {art}
      <h3 className="text-base font-bold tracking-tight text-ink">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-ink-muted">{body}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {action.label}
          <Icon name="arrow" className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
