import * as React from "react";
import { Icon, type IconName } from "@/components/icon";

export type StatTone = "money" | "pending" | "reach" | "neutral";

const TONE_STYLES: Record<StatTone, { surface: string; ink: string }> = {
  money: {
    surface: "bg-ok-surface text-ok-ink",
    ink: "text-ok-ink",
  },
  pending: {
    surface: "bg-warn-surface text-warn-ink",
    ink: "text-warn-ink",
  },
  reach: {
    surface: "bg-info-surface text-info-ink",
    ink: "text-info-ink",
  },
  neutral: {
    surface: "bg-neutral-surface text-neutral-ink",
    ink: "text-neutral-ink",
  },
};

export function Stat({
  label,
  value,
  icon,
  tone = "neutral",
  note,
  emphasis = false,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  icon?: IconName;
  tone?: StatTone;
  note?: React.ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <div
      className={`rounded-2xl border bg-surface p-5 shadow-xs transition ${
        emphasis
          ? "border-brand-line ring-1 ring-brand-line"
          : "border-line"
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {icon ? (
          <span
            className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg ${toneStyle.surface}`}
          >
            <Icon name={icon} className="h-4 w-4" />
          </span>
        ) : null}
        <span className="text-xs font-semibold text-ink-muted">
          {label}
        </span>
      </div>

      <div
        className={`mt-2.5 font-bold tracking-tight tabular-nums text-ink ${
          emphasis ? "text-3xl sm:text-4xl" : "text-2xl"
        }`}
      >
        {value}
      </div>

      {note ? (
        <div className="mt-1 text-xs text-ink-subtle leading-relaxed">{note}</div>
      ) : null}
    </div>
  );
}
