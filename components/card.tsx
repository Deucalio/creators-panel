import * as React from "react";

export function Card({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface shadow-xs overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col gap-1 px-6 pt-5 pb-3 sm:px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base font-bold tracking-tight text-ink ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-ink-muted leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-t border-line-soft bg-surface-muted/50 px-6 py-3.5 flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-6 shadow-xs ${className}`}>
      {title || description ? (
        <div className="mb-5 flex flex-col gap-1">
          {title ? (
            <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
