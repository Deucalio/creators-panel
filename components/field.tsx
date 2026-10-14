"use client";

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
};

/** Labelled input with inline validation messaging, shared across forms. */
export function Field({
  name,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  error,
  hint,
}: FieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-xs text-ink outline-none transition placeholder:text-ink-subtle shadow-2xs focus:ring-2 ${
          error
            ? "border-danger-line focus:border-danger-ink focus:ring-danger-surface"
            : "border-line focus:border-brand focus:ring-brand/30"
        }`}
      />
      {error ? (
        <p id={errorId} className="text-xs font-medium text-danger-ink">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
