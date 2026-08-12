"use client";

import { useState } from "react";

type Props = {
  label: string;
  value: string;
  hint?: string;
  /** Renders the value in a larger, code-like style — used for coupon codes. */
  emphasis?: boolean;
};

export function CopyField({ label, value, hint, emphasis = false }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied (insecure origin, permissions). The value
      // is on screen and selectable, so failing quietly is acceptable here.
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="flex items-stretch gap-2">
        <div
          className={`flex min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-blue-100 bg-blue-50/60 px-3.5 text-zinc-900 ${
            emphasis ? "py-2.5 font-mono text-base font-bold tracking-wider" : "py-2.5 font-mono text-sm"
          }`}
        >
          <span className="truncate">{value}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          className={`inline-flex flex-none items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
            copied ? "bg-emerald-600" : "bg-blue-700 hover:bg-blue-800"
          }`}
          aria-live="polite"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {hint ? <p className="text-xs leading-relaxed text-zinc-500">{hint}</p> : null}
    </div>
  );
}
