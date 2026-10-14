import * as React from "react";

export function PageHeader({
  title,
  description,
  badge,
  actions,
  meta,
  className = "",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          {badge}
        </div>
        {description ? (
          <p className="text-sm text-ink-muted leading-relaxed max-w-2xl">
            {description}
          </p>
        ) : null}
        {meta ? <div className="mt-1">{meta}</div> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5 flex-none">{actions}</div>
      ) : null}
    </div>
  );
}
