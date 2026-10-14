"use client";

import { useState } from "react";
import { buildTrackedLink, linkHost, type Storefront } from "@/lib/share-links";
import { CopyField } from "@/components/copy-field";
import { Icon } from "@/components/icon";

/**
 * Paste any page from the store, get a tracked link back.
 *
 * Client-side because the result should appear as you type — a round trip per
 * keystroke to build a string would be absurd. `buildTrackedLink` is a pure
 * module for exactly this reason, and the QR image is still generated on the
 * server so no QR library ships to the browser.
 */
export function LinkBuilder({
  store,
  referralCode,
  membershipId,
}: {
  store: Storefront;
  referralCode: string;
  membershipId: string;
}) {
  const [input, setInput] = useState("");
  const built = buildTrackedLink(store, referralCode, input);
  const error = "error" in built ? built.error : null;
  const url = "error" in built ? null : built.url;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="page" className="text-sm font-semibold text-ink">
          Page you want to promote
        </label>
        <input
          id="page"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder={`https://${linkHost(store)}/products/…`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "page-error" : "page-hint"}
          className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-xs text-ink outline-none transition placeholder:text-ink-subtle shadow-2xs focus:ring-2 ${
            error
              ? "border-danger-line focus:border-bad-ink focus:ring-danger-surface"
              : "border-line focus:border-brand focus:ring-brand/30"
          }`}
        />
        {error ? (
          <p id="page-error" className="text-xs font-medium text-bad-ink">
            {error}
          </p>
        ) : (
          <p id="page-hint" className="text-xs leading-relaxed text-ink-subtle">
            Paste a product or collection link from the store, or just its address like{" "}
            <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-ink">
              /products/snowboard
            </code>
            . Leave it empty for the store&apos;s home page.
          </p>
        )}
      </div>

      {url ? (
        <div className="flex flex-col gap-4 rounded-xl border border-line-soft bg-surface-muted/20 p-4">
          <CopyField
            label="Your tracked link"
            value={url}
            shareable
            hint="Anyone who buys after clicking this link is credited to you for 30 days."
          />
          <QrPanel membershipId={membershipId} path={input} />
        </div>
      ) : null}
    </div>
  );
}

function QrPanel({ membershipId, path }: { membershipId: string; path: string }) {
  const [show, setShow] = useState(false);

  const src = `/dashboard/links/qr?program=${encodeURIComponent(membershipId)}&path=${encodeURIComponent(path)}`;

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-2xs transition hover:border-line-strong hover:bg-surface-muted"
      >
        <span>Generate QR code</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 border-t border-line-soft pt-4">
      {/* The QR is rendered against a permanent white ground rather than the
          theme surface: a dark-mode inversion is unreadable to most scanners. */}
      <div className="rounded-xl border border-line bg-white p-3 shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="QR code for your tracked link" width={160} height={160} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={src}
          download="partnerloop-qr.svg"
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs transition hover:border-line-strong hover:bg-surface-muted"
        >
          <Icon name="download" className="h-3.5 w-3.5" />
          <span>Download vector QR (SVG)</span>
        </a>
        <p className="text-xs text-ink-subtle">
          Works directly on stories, videos, and printed media.
        </p>
      </div>
    </div>
  );
}
