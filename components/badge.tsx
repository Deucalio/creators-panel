import type { Tone } from "@/lib/earning-status";

const TONE_CLASSES: Record<Tone, { badge: string; dot: string }> = {
  warn: {
    badge: "bg-warn-surface text-warn-ink border-warn-ink/20",
    dot: "bg-warn-ink",
  },
  info: {
    badge: "bg-info-surface text-info-ink border-info-ink/20",
    dot: "bg-info-ink",
  },
  ok: {
    badge: "bg-ok-surface text-ok-ink border-ok-ink/20",
    dot: "bg-ok-ink",
  },
  bad: {
    badge: "bg-bad-surface text-bad-ink border-bad-ink/20",
    dot: "bg-bad-ink",
  },
  neutral: {
    badge: "bg-neutral-surface text-neutral-ink border-neutral-ink/20",
    dot: "bg-neutral-ink",
  },
};

export function Badge({
  tone,
  children,
  dot = true,
  className = "",
}: {
  tone: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const styling = TONE_CLASSES[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styling.badge} ${className}`}
    >
      {dot ? (
        <span
          className={`h-1.5 w-1.5 flex-none rounded-full ${styling.dot}`}
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
    </span>
  );
}
