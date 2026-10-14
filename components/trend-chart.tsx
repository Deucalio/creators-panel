"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { formatShortDate } from "@/lib/format-date";
import type { TrendBucket } from "@/lib/trend";
import { NoActivityArt } from "@/components/illustration";

export function TrendChart({
  buckets,
  currency,
  bucketDays,
}: {
  buckets: TrendBucket[];
  currency: string;
  bucketDays: number;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const max = Math.max(...buckets.map((b) => b.commission), 0);

  if (max <= 0) {
    return (
      <div className="flex h-36 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-surface-muted/30">
        <NoActivityArt />
        <p className="px-6 text-center text-xs font-medium text-ink-subtle">
          No commission earned in this period.
        </p>
      </div>
    );
  }

  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  const activeBucket = activeIdx !== null ? buckets[activeIdx] : null;

  return (
    <figure className="flex flex-col gap-2.5">
      {/* Top scale reference line & active tooltip display (OV-4, AX-3) */}
      <div className="flex items-center justify-between text-xs">
        {activeBucket ? (
          <div className="flex items-center gap-2 font-medium">
            <span className="text-ink-muted">
              {describeBucketDate(activeBucket, bucketDays)}:
            </span>
            <span className="font-bold text-ink">
              {formatMoney(activeBucket.commission, currency)}
            </span>
            <span className="text-ink-subtle">
              ({activeBucket.clicks} click{activeBucket.clicks === 1 ? "" : "s"})
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-ink-subtle">
            Select or hover over a bar for details
          </span>
        )}

        <span className="font-mono text-[11px] text-ink-subtle">
          Peak: {formatMoney(max, currency)}
        </span>
      </div>

      {/* Chart container */}
      <div className="relative">
        {/* Peak reference guideline */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 border-t border-dashed border-line/60"
          aria-hidden="true"
        />

        <div
          className="flex h-36 items-end gap-[3px] pt-2"
          role="region"
          aria-label={`Commission chart per ${bucketDays === 1 ? "day" : `${bucketDays} days`}, peak ${formatMoney(max, currency)}`}
        >
          {buckets.map((bucket, i) => {
            const isSelected = activeIdx === i;
            const pct = (bucket.commission / max) * 100;
            const hasData = bucket.commission > 0;
            const label = describeBucket(bucket, bucketDays, currency);

            return (
              <div
                key={bucket.start.toISOString()}
                tabIndex={0}
                role="button"
                aria-label={label}
                aria-pressed={isSelected}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx((prev) => (prev === i ? null : prev))}
                onFocus={() => setActiveIdx(i)}
                onBlur={() => setActiveIdx((prev) => (prev === i ? null : prev))}
                onClick={() => setActiveIdx(isSelected ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveIdx(isSelected ? null : i);
                  }
                }}
                className={`group relative flex h-full flex-1 cursor-pointer items-end rounded-t-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand ${
                  isSelected
                    ? "bg-brand-surface ring-1 ring-brand-line"
                    : "bg-surface-muted/40 hover:bg-surface-muted"
                }`}
              >
                {hasData ? (
                  <div
                    className={`w-full rounded-t-sm transition ${
                      isSelected ? "bg-brand-hover" : "bg-brand group-hover:bg-brand-hover"
                    }`}
                    style={{ height: `${Math.max(4, pct)}%` }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Accessible data table for screen readers (AX-3) */}
      <table className="sr-only">
        <caption>Commission activity breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Commission</th>
            <th scope="col">Clicks</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.start.toISOString()}>
              <td>{describeBucketDate(b, bucketDays)}</td>
              <td>{formatMoney(b.commission, currency)}</td>
              <td>{b.clicks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption className="flex justify-between text-xs text-ink-subtle">
        <span>{formatShortDate(first.start)}</span>
        <span>{formatShortDate(last.start)}</span>
      </figcaption>
    </figure>
  );
}

function describeBucketDate(bucket: TrendBucket, bucketDays: number): string {
  return bucketDays === 1
    ? formatShortDate(bucket.start)
    : `${formatShortDate(bucket.start)} – ${formatShortDate(new Date(bucket.end.getTime() - 1))}`;
}

function describeBucket(bucket: TrendBucket, bucketDays: number, currency: string): string {
  const when = describeBucketDate(bucket, bucketDays);
  return `${when}: ${formatMoney(bucket.commission, currency)} from ${bucket.clicks} click${
    bucket.clicks === 1 ? "" : "s"
  }`;
}
