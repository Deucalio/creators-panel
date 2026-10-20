"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icon";

// Whether this browser can open the native share sheet. Read through
// useSyncExternalStore rather than `typeof navigator` during render: the server
// has no navigator, so it renders no Share button, and checking during render
// made the browser's first pass disagree with the server's HTML — a hydration
// error on every Overview load. The server snapshot (false) is used while
// hydrating, then the real answer replaces it.
const noSubscription = () => () => {};
const browserCanShare = () => typeof navigator.share === "function";
const serverCanShare = () => false;

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

  const canShare =
    useSyncExternalStore(noSubscription, browserCanShare, serverCanShare) && shareable;

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
    <div className="flex flex-col gap-2.5">
      <label className="text-xs font-semibold text-ink-muted">{label}</label>

      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className={`flex min-w-0 flex-1 basis-60 items-center gap-2.5 rounded-xl border border-brand-line bg-brand-surface p-2.5 text-ink transition ${
            emphasis ? "py-2.5" : "py-2"
          }`}
        >
          {!emphasis ? (
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-line bg-surface text-brand-text shrink-0"
              aria-hidden="true"
            >
              <Icon name="link" className="h-3.5 w-3.5" />
            </span>
          ) : null}
          <code
            className={`flex-1 min-w-0 font-mono break-all select-all ${
              emphasis
                ? "text-base sm:text-lg font-bold tracking-wider px-1 text-ink"
                : "text-xs sm:text-[13px] leading-relaxed text-ink"
            }`}
            aria-label={label}
          >
            {value}
          </code>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canShare ? (
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2.5 text-xs font-semibold text-brand-ink transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 cursor-pointer shadow-2xs"
              aria-label={`Share ${label}`}
            >
              <Icon name="share" className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={copy}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 shadow-2xs ${
              copied
                ? "bg-ok-surface text-ok-ink border border-ok-ink/20 font-bold"
                : canShare
                ? "border border-line-strong bg-surface text-ink hover:bg-surface-muted"
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
