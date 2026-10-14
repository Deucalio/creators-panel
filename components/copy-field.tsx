"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";

type Props = {
  label: string;
  value: string;
  hint?: string;
  /** Renders the value in a larger, code-like style — used for coupon codes. */
  emphasis?: boolean;
  /** Enables Web Share API on mobile devices with fallback to copy (SR-1). */
  shareable?: boolean;
};

export function CopyField({
  label,
  value,
  hint,
  emphasis = false,
  shareable = false,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const canShare =
    shareable &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // AX-5: Handle failed copy gracefully
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 4000);
    }
  };

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: label,
          text: `Check this out: ${value}`,
          url: value,
        });
      } catch (err: unknown) {
        // Fall back to copy if user cancels or share fails
        if ((err as Error)?.name !== "AbortError") {
          await copy();
        }
      }
    } else {
      await copy();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-ink-muted">{label}</label>
        {value.length > 45 ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium text-brand-text hover:underline focus-visible:outline-none"
          >
            {expanded ? "Collapse preview" : "View full link"}
          </button>
        ) : null}
      </div>

      <div className="flex items-stretch gap-2">
        <div
          className={`flex min-w-0 flex-1 items-center rounded-lg border border-brand-line bg-brand-surface px-3.5 text-ink transition ${
            expanded ? "break-all py-2.5 font-mono text-xs" : "overflow-hidden"
          } ${
            emphasis
              ? "py-2.5 font-mono text-base font-bold tracking-wider"
              : "py-2.5 font-mono text-sm"
          }`}
        >
          <span className={expanded ? "whitespace-normal" : "truncate"}>{value}</span>
        </div>

        {canShare ? (
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2.5 text-xs font-semibold text-brand-ink transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 cursor-pointer"
            aria-label={`Share ${label}`}
          >
            <Icon name="share" className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={copy}
          className={`inline-flex flex-none items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
            copied
              ? "bg-ok-surface text-ok-ink border border-ok-ink/20 font-bold"
              : canShare
              ? "border border-line bg-surface text-ink hover:bg-surface-muted"
              : "bg-brand text-brand-ink hover:bg-brand-hover"
          }`}
          aria-label={copied ? "Copied" : `Copy ${label}`}
        >
          {copied ? (
            <>
              <Icon name="check" className="h-3.5 w-3.5 text-ok-ink" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Icon name="copy" className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {copyFailed ? (
        <p className="text-xs text-bad-ink font-medium" role="alert">
          Could not copy to clipboard automatically. Please select the text above and copy manually.
        </p>
      ) : null}

      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${label} copied to clipboard` : ""}
      </span>

      {hint ? <p className="text-xs leading-relaxed text-ink-subtle">{hint}</p> : null}
    </div>
  );
}
