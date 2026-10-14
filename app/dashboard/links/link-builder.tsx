"use client";

import { useState } from "react";
import { buildTrackedLink, linkHost, type Storefront } from "@/lib/share-links";
import { CopyField } from "@/components/copy-field";

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
        <label htmlFor="page" className="text-sm font-medium text-ink">
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
          className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:ring-2 ${
            error
              ? "border-danger-line focus:border-bad-ink focus:ring-danger-surface"
              : "border-line focus:border-brand focus:ring-ring"
          }`}
        />
        {error ? (
          <p id="page-error" className="text-xs font-medium text-bad-ink">
            {error}
          </p>
        ) : (
          <p id="page-hint" className="text-xs leading-relaxed text-ink-subtle">
            Paste a product or collection link from the store, or just its
            address like <code className="font-mono">/products/snowboard</code>. Leave it empty for
            the store&apos;s home page.
          </p>
        )}
      </div>

      {url ? (
        <>
          <CopyField
            label="Your tracked link"
            value={url}
            hint="Anyone who buys after clicking this is credited to you for 30 days."
          />
          <QrPanel membershipId={membershipId} path={input} />
        </>
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
        className="inline-flex w-fit items-center rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink-subtle"
      >
        Show QR code
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {/* The QR is rendered against a permanent white ground rather than the
          theme surface: a dark-mode inversion is unreadable to most scanners. */}
      <div className="rounded-xl border border-line bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="QR code for your tracked link" width={176} height={176} />
      </div>
      <p className="max-w-sm text-xs leading-relaxed text-ink-subtle">
        Right-click or long-press to save it. Works on a story, a slide, or anything printed.
      </p>
    </div>
  );
}
